package com.appsmith.server.domains;

import com.appsmith.external.models.BaseDomain;
import com.appsmith.external.views.Views;
import com.appsmith.server.constants.Url;
import com.fasterxml.jackson.annotation.JsonView;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;
import java.util.Set;


@Getter
@Setter
@ToString
@NoArgsConstructor
@Document
public class Workspace extends BaseDomain {

    @JsonView(Views.Public.class)
    private String domain;

    @NotBlank(message = "Name is mandatory")
    @JsonView(Views.Public.class)
    private String name;

    @JsonView(Views.Public.class)
    private String website;

    @JsonView(Views.Public.class)
    private String email;

    @JsonView(Views.Public.class)
    private Set<WorkspacePlugin> plugins;

    @JsonView(Views.Public.class)
    private String slug;

    //Organizations migrated to workspaces, kept the field as deprecated to support the old migration
    @Deprecated
    @JsonView(Views.Public.class)
    private Boolean isAutoGeneratedOrganization;

    @JsonView(Views.Public.class)
    private Boolean isAutoGeneratedWorkspace;

    @JsonView(Views.Internal.class)
    @Deprecated
    private List<UserRole> userRoles;

    @JsonView(Views.Internal.class)
    private String logoAssetId;

    @JsonView(Views.Public.class)
    private String tenantId;

    @JsonView(Views.Internal.class)
    private Set<String> defaultPermissionGroups;

    public String makeSlug() {
        return toSlug(name);
    }

    public static String toSlug(String text) {
        return text == null ? null : text.replaceAll("[^\\w\\d]+", "-").toLowerCase();
    }

    @JsonView(Views.Public.class)
    public String getLogoUrl() {
        return Url.ASSET_URL + "/" + logoAssetId;
    }

}
