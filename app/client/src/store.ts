import { reduxBatch } from "@manaflair/redux-batch";
import { createStore, applyMiddleware, compose } from "redux";
import type { AppState } from "@appsmith/reducers";
import appReducer from "@appsmith/reducers";
import createSagaMiddleware from "redux-saga";
import { rootSaga } from "@appsmith/sagas";
import { composeWithDevTools } from "redux-devtools-extension/logOnlyInProduction";
import * as Sentry from "@sentry/react";
import { ReduxActionTypes } from "@appsmith/constants/ReduxActionConstants";
import routeParamsMiddleware from "@appsmith/RouteParamsMiddleware";

const sagaMiddleware = createSagaMiddleware();
const ignoredSentryActionTypes = [
  ReduxActionTypes.SET_EVALUATED_TREE,
  ReduxActionTypes.EXECUTE_PLUGIN_ACTION_SUCCESS,
  ReduxActionTypes.SET_LINT_ERRORS,
];
const sentryReduxEnhancer = Sentry.createReduxEnhancer({
  actionTransformer: (action) => {
    if (ignoredSentryActionTypes.includes(action.type)) {
      // Return null to not log the action to Sentry
      action.payload = null;
    }
    return action;
  },
});

const cypressSpy = (actionType: keyof typeof ReduxActionTypes) => {
  return ReduxActionTypes[actionType];
};

const cypressSpyMiddleWare = () => (next: any) => (action: any) => {
  cypressSpy(action.type);
  return next(action);
};

const middlewares = [sagaMiddleware, routeParamsMiddleware];

if ((window as any).Cypress) {
  middlewares.push(cypressSpyMiddleWare);
  (window as any).cypressSpy = cypressSpy;
}

export default createStore(
  appReducer,
  composeWithDevTools(
    reduxBatch,
    applyMiddleware(...middlewares),
    reduxBatch,
    sentryReduxEnhancer,
  ),
);

export const testStore = (initialState: Partial<AppState>) =>
  createStore(
    appReducer,
    initialState,
    compose(reduxBatch, applyMiddleware(...middlewares), reduxBatch),
  );

// We don't want to run the saga middleware in tests, so exporting it from here
// And running it only when the app runs
export const runSagaMiddleware = () => sagaMiddleware.run(rootSaga);
