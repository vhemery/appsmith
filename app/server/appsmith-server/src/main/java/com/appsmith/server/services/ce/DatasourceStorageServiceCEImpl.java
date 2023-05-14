package com.appsmith.server.services.ce;

import com.appsmith.external.models.ActionDTO;
import com.appsmith.external.models.Datasource;
import com.appsmith.external.models.DatasourceConfiguration;
import com.appsmith.external.models.DatasourceStorage;
import com.appsmith.external.models.DatasourceStorageDTO;
import com.appsmith.external.models.Endpoint;
import com.appsmith.external.models.OAuth2;
import com.appsmith.external.plugins.PluginExecutor;
import com.appsmith.server.acl.AclPermission;
import com.appsmith.server.constants.FieldName;
import com.appsmith.server.domains.Plugin;
import com.appsmith.server.exceptions.AppsmithError;
import com.appsmith.server.exceptions.AppsmithException;
import com.appsmith.server.helpers.PluginExecutorHelper;
import com.appsmith.server.repositories.DatasourceStorageRepository;
import com.appsmith.server.services.AnalyticsService;
import com.appsmith.server.services.PluginService;
import com.appsmith.server.services.WorkspaceService;
import com.appsmith.server.solutions.DatasourcePermission;
import com.appsmith.server.solutions.DatasourceStorageTransferSolution;
import lombok.extern.slf4j.Slf4j;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

import static com.appsmith.external.helpers.AppsmithBeanUtils.copyNestedNonNullProperties;

@Slf4j
public class DatasourceStorageServiceCEImpl implements DatasourceStorageServiceCE {

    private final DatasourceStorageRepository repository;
    private final DatasourceStorageTransferSolution datasourceStorageTransferSolution;
    private final DatasourcePermission datasourcePermission;
    private final PluginService pluginService;
    private final PluginExecutorHelper pluginExecutorHelper;
    private final AnalyticsService analyticsService;

    public DatasourceStorageServiceCEImpl(DatasourceStorageRepository repository,
                                          DatasourceStorageTransferSolution datasourceStorageTransferSolution,
                                          DatasourcePermission datasourcePermission,
                                          PluginService pluginService,
                                          PluginExecutorHelper pluginExecutorHelper,
                                          AnalyticsService analyticsService) {
        this.repository = repository;
        this.datasourceStorageTransferSolution = datasourceStorageTransferSolution;
        this.datasourcePermission = datasourcePermission;
        this.pluginService = pluginService;
        this.pluginExecutorHelper = pluginExecutorHelper;
        this.analyticsService = analyticsService;
    }

    @Override
    public Mono<DatasourceStorage> create(DatasourceStorage datasourceStorage) {
        return this.validateAndSaveDatasourceStorageToRepository(datasourceStorage)
                .flatMap(this::populateHintMessages)  // For REST API datasource create flow.
                .flatMap(savedDatasourceStorage ->
                        analyticsService.sendCreateEvent(
                                savedDatasourceStorage,
                                getAnalyticsProperties(savedDatasourceStorage))
                );
    }

    @Override
    public Mono<DatasourceStorage> save(DatasourceStorage datasourceStorage) {
        return repository.save(datasourceStorage);
    }

    @Override
    public Mono<DatasourceStorage> archive(DatasourceStorage datasourceStorage) {
        return repository.archive(datasourceStorage);
    }

    @Override
    public Mono<DatasourceStorage> getDatasourceStorageForExecution(ActionDTO actionDTO, String environmentId) {
        Datasource datasource = actionDTO.getDatasource();
        if (datasource != null && datasource.getId() != null) {
            // This is an action with a global datasource,
            // we need to find the entry from db and populate storage
            return this.findByDatasourceIdAndEnvironmentId(
                    datasource.getId(), environmentId, datasourcePermission.getExecutePermission());
        }

        if (datasource == null) {
            return Mono.empty();
        } else {
            // For embedded datasources, we are simply relying on datasource configuration property
            return Mono.just(datasourceStorageTransferSolution.initializeDatasourceStorage(datasource, environmentId));
        }
    }

    @Override
    public Mono<DatasourceStorage> findByDatasourceIdAndEnvironmentId(String datasourceId,
                                                                      String environmentId,
                                                                      AclPermission aclPermission) {
        return this.findByDatasourceIdAndEnvironmentId(datasourceId, environmentId)
                // TODO: This is a temporary call being made till storage transfer migrations are done
                .switchIfEmpty(datasourceStorageTransferSolution
                        .transferAndGetDatasourceStorage(datasourceId, environmentId, aclPermission))
                .switchIfEmpty(Mono.error(new AppsmithException(AppsmithError.NO_RESOURCE_FOUND,
                        FieldName.DATASOURCE, datasourceId)));
    }

    @Override
    public Mono<DatasourceStorage> findByDatasourceAndEnvironmentId(Datasource datasource,
                                                                    String environmentId) {
        return this.findByDatasourceIdAndEnvironmentId(datasource.getId(), environmentId)
                // TODO: This is a temporary call being made till storage transfer migrations are done
                .switchIfEmpty(datasourceStorageTransferSolution
                        .transferAndGetDatasourceStorage(datasource, environmentId));
    }

    @Override
    public Flux<DatasourceStorage> findByDatasource(Datasource datasource) {
        return this.findByDatasourceId(datasource.getId())
                // TODO: This is a temporary call being made till storage transfer migrations are done
                .switchIfEmpty(datasourceStorageTransferSolution
                        .transferToFallbackEnvironmentAndGetDatasourceStorage(datasource));
    }

    @Override
    public Mono<DatasourceStorage> findByDatasourceIdAndEnvironmentId(String datasourceId, String environmentId) {
        return repository.findByDatasourceIdAndEnvironmentId(datasourceId, FieldName.UNUSED_ENVIRONMENT_ID);
    }

    protected Flux<DatasourceStorage> findByDatasourceId(String datasourceId) {
        return repository.findByDatasourceId(datasourceId);
    }

    @Override
    public Flux<DatasourceStorage> findStrictlyByDatasourceId(String datasourceId) {
        return repository.findByDatasourceId(datasourceId);
    }

    @Override
    public Mono<DatasourceStorage> updateByDatasourceAndEnvironmentId(Datasource datasource, String environmentId, Boolean isUserRefreshedUpdate) {
        return this.findByDatasourceAndEnvironmentId(datasource, environmentId)
                .map(dbStorage -> {
                    DatasourceStorageDTO datasourceStorageDTO = getDatasourceStorageDTOFromDatasource(datasource, environmentId);
                    DatasourceStorage datasourceStorage = new DatasourceStorage(datasourceStorageDTO);
                    copyNestedNonNullProperties(datasourceStorage, dbStorage);
                    if (datasourceStorage.getDatasourceConfiguration() != null && datasourceStorage.getDatasourceConfiguration().getAuthentication() == null) {
                        if (dbStorage.getDatasourceConfiguration() != null) {
                            dbStorage.getDatasourceConfiguration().setAuthentication(null);
                        }
                    }
                    return dbStorage;
                })
                .flatMap(this::validateAndSaveDatasourceStorageToRepository)
                .flatMap(datasourceStorage -> {
                    Map<String, Object> analyticsProperties = getAnalyticsProperties(datasourceStorage);
                    if (isUserRefreshedUpdate.equals(Boolean.TRUE)) {
                        analyticsProperties.put(FieldName.IS_DATASOURCE_UPDATE_USER_INVOKED_KEY, Boolean.TRUE);
                    } else {
                        analyticsProperties.put(FieldName.IS_DATASOURCE_UPDATE_USER_INVOKED_KEY, Boolean.FALSE);
                    }
                    return analyticsService.sendUpdateEvent(datasourceStorage, analyticsProperties);
                })
                .flatMap(this::populateHintMessages);
    }

    @Override
    public Mono<DatasourceStorage> validateDatasourceStorage(DatasourceStorage datasourceStorage) {
        Set<String> invalids = new HashSet<>();
        datasourceStorage.setInvalids(invalids);

        if (!StringUtils.hasText(datasourceStorage.getDatasourceId())) {
            return Mono.error(new AppsmithException(AppsmithError.INVALID_PARAMETER, FieldName.DATASOURCE));
        }

        if (!StringUtils.hasText(datasourceStorage.getDatasourceId())) {
            return Mono.error(new AppsmithException(AppsmithError.INVALID_PARAMETER, FieldName.ENVIRONMENT));
        }

        if (datasourceStorage.getDatasourceConfiguration() == null) {
            invalids.add(AppsmithError.NO_CONFIGURATION_FOUND_IN_DATASOURCE.getMessage());
        }

        final Mono<Plugin> pluginMono = pluginService.findById(datasourceStorage.getPluginId());
        Mono<PluginExecutor> pluginExecutorMono = pluginExecutorHelper.getPluginExecutor(pluginMono)
                .switchIfEmpty(Mono.error(new AppsmithException(AppsmithError.NO_RESOURCE_FOUND,
                        FieldName.PLUGIN, datasourceStorage.getPluginId())));

        return pluginExecutorMono
                .map(pluginExecutor -> {
                    DatasourceConfiguration datasourceConfiguration = datasourceStorage.getDatasourceConfiguration();
                    if (datasourceConfiguration != null && !pluginExecutor.isDatasourceValid(datasourceConfiguration)) {
                        invalids.addAll(pluginExecutor.validateDatasource(datasourceConfiguration));
                    }

                    return datasourceStorage;
                });
    }

    private Mono<DatasourceStorage> validateAndSaveDatasourceStorageToRepository(DatasourceStorage datasourceStorage) {

        return Mono.just(datasourceStorage)
                .map(this::checkEnvironment)
                .map(this::sanitizeDatasourceStorage)
                .flatMap(this::validateDatasourceStorage)
                .flatMap(unsavedDatasource -> {
                    return repository.save(unsavedDatasource)
                            .map(savedDatasource -> {
                                // datasourceStorage.pluginName is a transient field. It was set by validateDatasource method
                                // object from db will have pluginName=null so set it manually from the unsaved datasourceStorage obj
                                savedDatasource.setPluginName(unsavedDatasource.getPluginName());
                                return savedDatasource;
                            });
                })
                .flatMap(repository::setUserPermissionsInObject);
    }

    protected DatasourceStorage checkEnvironment(DatasourceStorage datasourceStorage) {
        datasourceStorage.setEnvironmentId(FieldName.UNUSED_ENVIRONMENT_ID);
        return datasourceStorage;
    }

    private DatasourceStorage sanitizeDatasourceStorage(DatasourceStorage datasourceStorage) {
        if (datasourceStorage.getDatasourceConfiguration() != null
                && !CollectionUtils.isEmpty(datasourceStorage.getDatasourceConfiguration().getEndpoints())) {
            for (final Endpoint endpoint : datasourceStorage.getDatasourceConfiguration().getEndpoints()) {
                if (endpoint != null && endpoint.getHost() != null) {
                    endpoint.setHost(endpoint.getHost().trim());
                }
            }
        }

        return datasourceStorage;
    }

    @Override
    public Mono<DatasourceStorage> populateHintMessages(DatasourceStorage datasourceStorage) {

        if (datasourceStorage == null) {
            /*
             * - Not throwing an exception here because we do not throw an error in case of missing datasourceStorage.
             *   We try not to fail as much as possible during create and update actions.
             */
            return Mono.just(new DatasourceStorage());
        }

        if (datasourceStorage.getPluginId() == null) {
            /*
             * - Not throwing an exception here because we try not to fail as much as possible during datasourceStorage create
             * and update events.
             */
            return Mono.just(datasourceStorage);
        }

        final Mono<Plugin> pluginMono = pluginService.findById(datasourceStorage.getPluginId());
        Mono<PluginExecutor> pluginExecutorMono = pluginExecutorHelper.getPluginExecutor(pluginMono)
                .switchIfEmpty(Mono.error(new AppsmithException(AppsmithError.NO_RESOURCE_FOUND, FieldName.PLUGIN,
                        datasourceStorage.getPluginId())));

        /**
         * Delegate the task of generating hint messages to the concerned plugin, since only the
         * concerned plugin can correctly interpret their configuration.
         */
        return pluginExecutorMono
                .flatMap(pluginExecutor -> ((PluginExecutor<Object>) pluginExecutor)
                        .getHintMessages(null, datasourceStorage.getDatasourceConfiguration()))
                .flatMap(tuple -> {
                    Set<String> datasourceHintMessages = tuple.getT1();
                    datasourceStorage.getMessages().addAll(datasourceHintMessages);
                    return Mono.just(datasourceStorage);
                });
    }

    @Override
    public Map<String, Object> getAnalyticsProperties(DatasourceStorage datasourceStorage) {
        Map<String, Object> analyticsProperties = new HashMap<>();
        analyticsProperties.put("pluginName", datasourceStorage.getPluginName());
        analyticsProperties.put("dsName", datasourceStorage.getName());
        analyticsProperties.put("envId", datasourceStorage.getEnvironmentId());
        DatasourceConfiguration dsConfig = datasourceStorage.getDatasourceConfiguration();
        if (dsConfig != null && dsConfig.getAuthentication() != null && dsConfig.getAuthentication() instanceof OAuth2) {
            analyticsProperties.put("oAuthStatus", dsConfig.getAuthentication().getAuthenticationStatus());
        }
        return analyticsProperties;
    }

    @Override
    public DatasourceStorage initializeDatasourceStorage(Datasource datasource, String environmentId) {
        return datasourceStorageTransferSolution.initializeDatasourceStorage(datasource, environmentId);
    }

    protected DatasourceStorageDTO getDatasourceStorageDTOFromDatasource(Datasource datasource, String environmentId) {
        if (datasource == null || datasource.getDatasourceStorages() == null) {
            return null;
        }
        return datasource.getDatasourceStorages().get(FieldName.UNUSED_ENVIRONMENT_ID);
    }

}
