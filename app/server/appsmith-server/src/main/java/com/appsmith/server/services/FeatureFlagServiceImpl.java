package com.appsmith.server.services;

import com.appsmith.server.configurations.CloudServicesConfig;
import com.appsmith.server.domains.User;
import com.appsmith.server.dtos.ResponseDTO;
import com.appsmith.server.exceptions.AppsmithError;
import com.appsmith.server.exceptions.AppsmithException;
import com.appsmith.server.featureflags.FeatureFlagEnum;
import com.appsmith.server.featureflags.FeatureFlagIdentities;
import com.appsmith.server.services.ce.FeatureFlagServiceCEImpl;
import com.appsmith.util.WebClientUtils;
import lombok.extern.slf4j.Slf4j;
import org.ff4j.FF4j;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.BodyInserters;
import reactor.core.publisher.Mono;

import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Component
public class FeatureFlagServiceImpl extends FeatureFlagServiceCEImpl implements FeatureFlagService {

    private final SessionUserService sessionUserService;

    private final TenantService tenantService;

    private final ConfigService configService;

    private final CloudServicesConfig cloudServicesConfig;

    // TODO: Rewrite this entire concept for handling tenants
    private final Map<String, Map<String, Boolean>> featureFlagCache;

    public FeatureFlagServiceImpl(SessionUserService sessionUserService,
                                  FF4j ff4j,
                                  TenantService tenantService,
                                  ConfigService configService,
                                  CloudServicesConfig cloudServicesConfig) {

        super(sessionUserService, ff4j);
        this.sessionUserService = sessionUserService;
        this.tenantService = tenantService;
        this.configService = configService;
        this.cloudServicesConfig = cloudServicesConfig;
        featureFlagCache = new ConcurrentHashMap<>();
    }

    @Override
    public Mono<Map<String, Boolean>> getAllFeatureFlagsForUser() {
        return Mono.zip(super.getAllFeatureFlagsForUser(), this.getAllRemoteFeatureFlagsForUser())
                .map(tuple -> {
                    tuple.getT1().putAll(tuple.getT2());
                    return tuple.getT1();
                });
    }

    private Mono<Map<String, Boolean>> getAllRemoteFeatureFlagsForUser() {
        Mono<User> userMono = sessionUserService.getCurrentUser().cache();
        return userMono
                .flatMap(user -> {
                    if (this.featureFlagCache.containsKey(user.getEmail())) {
                        return Mono.just(this.featureFlagCache.get(user.getEmail()));
                    } else {
                        return this.forceAllRemoteFeatureFlagsForUser(user);
                    }
                });
    }

    private Mono<Map<String, Boolean>> forceAllRemoteFeatureFlagsForUser(User user) {
        Mono<String> instanceIdMono = configService.getInstanceId();
        // TODO: Convert to current tenant when the feature is enabled
        Mono<String> defaultTenantIdMono = tenantService.getDefaultTenantId();
        return Mono.zip(instanceIdMono, defaultTenantIdMono)
                .flatMap(tuple2 -> {
                    return this.getRemoteFeatureFlagsByIdentity(
                            new FeatureFlagIdentities(
                                    tuple2.getT1(),
                                    tuple2.getT2(),
                                    Set.of(user.getEmail())));
                })
                .map(newValue -> {
                    this.featureFlagCache.putAll(newValue);
                    return newValue.getOrDefault(user.getEmail(), Map.of());
                });
    }

    @Override
    public Mono<Void> refreshFeatureFlagsForAllUsers() {
        if (this.featureFlagCache.isEmpty()) {
            return Mono.empty();
        }

        Mono<String> instanceIdMono = configService.getInstanceId();
        // TODO: Convert to current tenant when the feature is enabled
        Mono<String> defaultTenantIdMono = tenantService.getDefaultTenantId();

        return Mono.zip(instanceIdMono, defaultTenantIdMono)
                .flatMap(tuple -> {
                    return this.getRemoteFeatureFlagsByIdentity(
                            new FeatureFlagIdentities(
                                    tuple.getT1(),
                                    tuple.getT2(),
                                    this.featureFlagCache.keySet()));
                })
                .map(newCache -> {
                    this.featureFlagCache.putAll(newCache);
                    return newCache;
                })
                .then();
    }

    private Mono<Map<String, Map<String, Boolean>>> getRemoteFeatureFlagsByIdentity(FeatureFlagIdentities identity) {
        return WebClientUtils.create(cloudServicesConfig.getBaseUrl())
                .post()
                .uri("/api/v1/feature-flags")
                .body(BodyInserters.fromValue(identity))
                .exchangeToMono(clientResponse -> {
                    if (clientResponse.statusCode().is2xxSuccessful()) {
                        return clientResponse.bodyToMono(new ParameterizedTypeReference<ResponseDTO<Map<String, Map<String, Boolean>>>>() {
                        });
                    } else {
                        return clientResponse.createError();
                    }
                })
                .map(ResponseDTO::getData)
                // TODO: Better error handling
                .onErrorMap(
                        // Only map errors if we haven't already wrapped them into an AppsmithException
                        e -> !(e instanceof AppsmithException),
                        e -> new AppsmithException(AppsmithError.CLOUD_SERVICES_ERROR, e.getMessage())
                )
                .onErrorResume(error -> {
                    // We're gobbling up errors here so that all feature flags are turned off by default
                    // This will be problematic if we do not maintain code to reflect validity of flags
                    log.debug("Received error from CS for feature flags: {}", error.getMessage());
                    return Mono.just(Map.of());
                });
    }

    @Override
    public Mono<Boolean> check(FeatureFlagEnum featureEnum, User user) {
        if (featureEnum == null) {
            return Mono.just(false);
        }
        return checkAll(featureEnum.toString(), user);
    }

    private Mono<Boolean> checkAll(String featureName, User user) {
        Boolean check = super.check(featureName, user);

        if (Boolean.TRUE.equals(check)) {
            return Mono.just(check);
        }

        if (this.featureFlagCache.containsKey(user.getEmail()) &&
                this.featureFlagCache.get(user.getEmail()).containsKey(featureName)) {
            return Mono.just(this.featureFlagCache.get(user.getEmail()).get(featureName));
        } else {
            return this.forceAllRemoteFeatureFlagsForUser(user)
                    .flatMap(featureMap -> Mono.justOrEmpty(featureMap.get(featureName)))
                    .switchIfEmpty(Mono.just(false));
        }
    }
}
