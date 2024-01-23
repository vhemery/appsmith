/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  ReduxActionErrorTypes,
  ReduxActionTypes,
} from "@appsmith/constants/ReduxActionConstants";
import type { DependentFeatureFlags } from "@appsmith/selectors/engineSelectors";
import { fetchDatasources } from "actions/datasourceActions";
import { fetchPageDSLs } from "actions/pageActions";
import { fetchPlugins } from "actions/pluginActions";
import type { Plugin } from "api/PluginApi";

export const CreateNewActionKey = {
  PAGE: "pageId",
} as const;

export const ActionParentEntityType = {
  PAGE: "PAGE",
} as const;

export const getPageDependencyActions = (
  currentWorkspaceId: string = "",
  featureFlags: DependentFeatureFlags = {},
) => {
  const initActions = [fetchPlugins(), fetchDatasources(), fetchPageDSLs()];

  const successActions = [
    ReduxActionTypes.FETCH_PLUGINS_SUCCESS,
    ReduxActionTypes.FETCH_DATASOURCES_SUCCESS,
    ReduxActionTypes.FETCH_PAGE_DSLS_SUCCESS,
  ];

  const errorActions = [
    ReduxActionErrorTypes.FETCH_PLUGINS_ERROR,
    ReduxActionErrorTypes.FETCH_DATASOURCES_ERROR,
    ReduxActionErrorTypes.POPULATE_PAGEDSLS_ERROR,
  ];

  return {
    initActions,
    successActions,
    errorActions,
  };
};

export const doesPluginRequireDatasource = (plugin: Plugin | undefined) => {
  return !!plugin && plugin.hasOwnProperty("requiresDatasource")
    ? plugin.requiresDatasource
    : true;
};
