import type { EditorViewMode } from "@appsmith/entities/IDE/constants";
import { ReduxActionTypes } from "@appsmith/constants/ReduxActionConstants";

export const setIdeEditorViewMode = (mode: EditorViewMode) => {
  return {
    type: ReduxActionTypes.SET_IDE_EDITOR_VIEW_MODE,
    payload: {
      view: mode,
    },
  };
};

export const restoreIDEEditorViewMode = () => {
  return {
    type: ReduxActionTypes.RESTORE_IDE_EDITOR_VIEW_MODE,
  };
};

export const setJSTabs = (tabs: string[], parentId: string) => {
  return {
    type: ReduxActionTypes.SET_IDE_JS_TABS,
    payload: { tabs, parentId },
  };
};

export const setQueryTabs = (tabs: string[], parentId: string) => {
  return {
    type: ReduxActionTypes.SET_IDE_QUERIES_TABS,
    payload: { tabs, parentId },
  };
};
export const setShowQueryCreateNewModal = (payload: boolean) => {
  return {
    type: ReduxActionTypes.SET_SHOW_QUERY_CREATE_NEW_MODAL,
    payload,
  };
};
export const closeJSActionTab = (payload: { id: string; parentId: string }) => {
  return {
    type: ReduxActionTypes.CLOSE_JS_ACTION_TAB,
    payload,
  };
};
export const closeJsActionTabSuccess = (payload: {
  id: string;
  parentId: string;
}) => {
  return {
    type: ReduxActionTypes.CLOSE_JS_ACTION_TAB_SUCCESS,
    payload,
  };
};

export const closeQueryActionTab = (payload: {
  id: string;
  parentId: string;
}) => {
  return {
    type: ReduxActionTypes.CLOSE_QUERY_ACTION_TAB,
    payload,
  };
};
export const closeQueryActionTabSuccess = (payload: {
  id: string;
  parentId: string;
}) => {
  return {
    type: ReduxActionTypes.CLOSE_QUERY_ACTION_TAB_SUCCESS,
    payload,
  };
};
