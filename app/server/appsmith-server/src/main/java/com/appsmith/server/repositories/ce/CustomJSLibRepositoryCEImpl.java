package com.appsmith.server.repositories.ce;

import com.appsmith.server.domains.CustomJSLib;
import com.appsmith.server.repositories.BaseAppsmithRepositoryImpl;
import com.appsmith.server.repositories.CacheableRepositoryHelper;
import org.springframework.data.mongodb.core.ReactiveMongoOperations;
import org.springframework.data.mongodb.core.convert.MongoConverter;
import org.springframework.data.mongodb.core.query.Criteria;
import reactor.core.publisher.Mono;

import java.util.List;

import static com.appsmith.server.acl.AclPermission.MANAGE_PAGES;
import static org.springframework.data.mongodb.core.query.Criteria.where;

public class CustomJSLibRepositoryCEImpl extends BaseAppsmithRepositoryImpl<CustomJSLib> implements CustomJSLibRepositoryCE {
    public CustomJSLibRepositoryCEImpl(ReactiveMongoOperations mongoOperations, MongoConverter mongoConverter,
                                       CacheableRepositoryHelper cacheableRepositoryHelper) {
        super(mongoOperations, mongoConverter, cacheableRepositoryHelper);
    }

    // TODO: add comment also mention why no branch
    @Override
    public Mono<CustomJSLib> findByAccessorString(String accessorString) {
        Criteria accessorNameMatchCriteria = where("installedCustomJSLibs.accessorString").is(accessorString);
        return queryOne(List.of(accessorNameMatchCriteria), MANAGE_PAGES);
    }
}
