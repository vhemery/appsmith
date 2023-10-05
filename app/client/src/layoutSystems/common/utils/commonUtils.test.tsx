/* eslint-disable no-console */
import type {
  AutoDimensionOptions,
  AutoDimensionValues,
  AutoLayoutConfig,
} from "WidgetProvider/constants";
import {
  getAutoDimensionsConfig,
  restructureWidgetSizeConfig,
} from "./commonUtils";
import InputWidget from "widgets/InputWidgetV2/widget";
import ButtonWidget from "widgets/ButtonWidget/widget";
import { InputFactory } from "test/factories/Widgets/InputFactory";
import { ButtonFactory } from "test/factories/Widgets/ButtonFactory";

describe("Common Utils tests", () => {
  describe("getAutoDimensionsConfig", () => {
    it("autoDimension.height for InputWidgetV2 should be true", () => {
      const config: AutoLayoutConfig | undefined =
        InputWidget.getAutoLayoutConfig();
      const autoDimension: AutoDimensionOptions | undefined =
        getAutoDimensionsConfig(config || {}, InputFactory.build());
      expect((autoDimension as AutoDimensionValues)?.height).toBeTruthy();
    });
    it("autoDimension.width for button widget should be true", () => {
      const config: AutoLayoutConfig | undefined =
        ButtonWidget.getAutoLayoutConfig();
      const autoDimension: AutoDimensionOptions | undefined =
        getAutoDimensionsConfig(config || {}, ButtonFactory.build());
      expect((autoDimension as AutoDimensionValues)?.width).toBeTruthy();
      expect((autoDimension as AutoDimensionValues)?.height).toBeFalsy();
    });
  });
  describe("restructureWidgetSizeConfig", () => {
    it("should return widget size config in the structure accepted by WDS Flex component - BUTTON widget", () => {
      const config: AutoLayoutConfig | undefined =
        ButtonWidget.getAutoLayoutConfig();
      const sizeConfig: {
        maxHeight: Record<string, string | number>;
        maxWidth: Record<string, string | number>;
        minHeight: Record<string, string | number>;
        minWidth: Record<string, string | number>;
      } = restructureWidgetSizeConfig(
        config?.widgetSize || [],
        ButtonFactory.build(),
      );

      expect(sizeConfig.minWidth.base).toEqual("120px");
      expect(sizeConfig.minHeight.base).toEqual("40px");
      expect(sizeConfig.maxWidth.base).toEqual("360px");
      expect(sizeConfig.maxHeight.base).toBeFalsy();
    });
    it("should return widget size config in the structure accepted by WDS Flex component - INPUT widget", () => {
      const config: AutoLayoutConfig | undefined =
        InputWidget.getAutoLayoutConfig();
      const sizeConfig: {
        maxHeight: Record<string, string | number>;
        maxWidth: Record<string, string | number>;
        minHeight: Record<string, string | number>;
        minWidth: Record<string, string | number>;
      } = restructureWidgetSizeConfig(
        config?.widgetSize || [],
        InputFactory.build(),
      );

      expect(sizeConfig.minWidth.base).toEqual("120px");
      expect(sizeConfig.minHeight.base).toBeFalsy();
      expect(sizeConfig.maxWidth.base).toBeFalsy();
      expect(sizeConfig.maxHeight.base).toBeFalsy();
    });
  });
});
