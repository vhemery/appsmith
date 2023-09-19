package com.appsmith.server.solutions.ce;

import com.appsmith.server.dtos.ApplicationImportDTO;
import com.appsmith.server.dtos.ApplicationJson;
import com.appsmith.server.dtos.ExportFileDTO;
import com.appsmith.server.dtos.PartialImportExportDTO;
import org.springframework.http.codec.multipart.Part;
import reactor.core.publisher.Mono;

public interface PartialImportExportServiceCE {
    Mono<ApplicationJson> exportPartialApplicationById(String applicationId, PartialImportExportDTO entities);

    Mono<ExportFileDTO> getPartialApplicationFile(String applicationId, PartialImportExportDTO entities);

    Mono<ApplicationImportDTO> importPartialApplicationFromFile(
            String applicationId, String workspaceId, String pageId, Part importedDoc);

    Mono<ApplicationImportDTO> importPartialApplicationFromJson(
            String applicationId, String workspaceId, ApplicationJson applicationJson);
}
