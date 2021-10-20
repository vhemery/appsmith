package com.appsmith.server.services;

import com.appsmith.external.dtos.GitLogDTO;
import com.appsmith.server.domains.Application;
import com.appsmith.server.domains.GitApplicationMetadata;
import com.appsmith.server.domains.GitProfile;
import com.appsmith.server.dtos.GitBranchDTO;
import com.appsmith.server.dtos.GitCommitDTO;
import com.appsmith.server.dtos.GitConnectDTO;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Map;

public interface GitService {

    Mono<Map<String, GitProfile>> updateOrCreateGitProfileForCurrentUser(GitProfile gitProfile);

    Mono<Map<String, GitProfile>> updateOrCreateGitProfileForCurrentUser(GitProfile gitProfile, Boolean isDefault, String defaultApplicationId);

    Mono<GitProfile> getGitProfileForUser();

    Mono<GitProfile> getGitProfileForUser(String defaultApplicationId);

    Mono<Application> connectApplicationToGit(String defaultApplicationId, GitConnectDTO gitConnectDTO, String origin);

    Mono<Application> updateGitMetadata(String applicationId, GitApplicationMetadata gitApplicationMetadata);

    Mono<String> commitApplication(GitCommitDTO commitDTO, String defaultApplicationId, String branchName);

    Mono<List<GitLogDTO>> getCommitHistory(String defaultApplicationId, String params);

    Mono<String> pushApplication(String defaultApplicationId, String branchName);

    Mono<Application> detachRemote(String applicationId);

    Mono<Application> createBranch(String defaultApplicationId, GitBranchDTO branchDTO, String srcBranch);

    Mono<Application> checkoutBranch(String defaultApplicationId, String branchName);

    Mono<Object> pullApplication(String defaultApplicationId, String branchName);

    Mono<List<String>> listBranchForApplication(String defaultApplicationId);

    Mono<GitApplicationMetadata> getGitApplicationMetadata(String defaultApplicationId);

    Mono<Map<String, Object>> getStatus(String defaultApplicationId, String branchName);

    Mono<String> mergeBranch(String applicationId, String sourceBranch, String destinationBranch);
}
