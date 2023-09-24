import React, { lazy, Suspense } from "react";
import { get, set } from "lodash"
import type { WidgetProps, WidgetState } from "widgets/BaseWidget";
import BaseWidget from "widgets/BaseWidget";
import Skeleton from "components/utils/Skeleton";
import { retryPromise } from "utils/AppsmithUtils";
import { EventType } from "constants/AppsmithActionConstants/ActionConstants";
import { contentConfig, styleConfig } from "./propertyConfig";
import {
  CUSTOM_ECHART_FEATURE_FLAG,
  DefaultEChartConfig,
  DefaultEChartsBasicChartsData,
  DefaultFusionChartConfig,
  DefaultEChartAdvancedConfig,
  FUSION_CHART_DEPRECATION_FLAG,
  messages,
} from "../constants";
import type { ChartSelectedDataPoint } from "../constants";
import type { ChartComponentProps } from "../component";
import { Colors } from "constants/Colors";
import type { Stylesheet } from "entities/AppTheming";
import { DefaultAutocompleteDefinitions } from "widgets/WidgetUtils";
import type {
  AutocompletionDefinitions,
  WidgetCallout,
} from "WidgetProvider/constants";
import { ChartErrorComponent } from "../component/ChartErrorComponent";
import { syntaxErrorsFromProps } from "./SyntaxErrorsEvaluation";
import { EmptyChartData } from "../component/EmptyChartData";
import { FILL_WIDGET_MIN_WIDTH } from "constants/minWidthConstants";
import { ResponsiveBehavior } from "layoutSystems/autolayout/utils/constants";
import { generateReactKey } from "widgets/WidgetUtils";
import { LabelOrientation } from "../constants";
import IconSVG from "../icon.svg";
import { WIDGET_TAGS } from "constants/WidgetConstants";
import { EChartsDatasetBuilder } from "../component/EChartsDatasetBuilder";
import { isFunctionPresent } from "@shared/ast";

const ChartComponent = lazy(() =>
  retryPromise(() => import(/* webpackChunkName: "charts" */ "../component")),
);

export const emptyChartData = (props: ChartWidgetProps) => {
  if (props.chartType == "CUSTOM_FUSION_CHART") {
    return Object.keys(props.customFusionChartConfig).length == 0;
  } else if (props.chartType == "CUSTOM_ECHART") {
    return Object.keys(props.customEChartConfig).length == 0;
  } else {
    const builder = new EChartsDatasetBuilder(props.chartType, props.chartData);

    for (const seriesID in builder.filteredChartData) {
      if (Object.keys(props.chartData[seriesID].data).length > 0) {
        return false;
      }
    }
    return true;
  }
};

class ChartWidget extends BaseWidget<ChartWidgetProps, WidgetState> {
  static type = "CHART_WIDGET";

  static getConfig() {
    return {
      name: "Chart",
      iconSVG: IconSVG,
      tags: [WIDGET_TAGS.DISPLAY],
      needsMeta: true,
      searchTags: ["graph", "visuals", "visualisations"],
    };
  }

  static getDefaults() {
    return {
      rows: 32,
      columns: 24,
      widgetName: "Chart",
      chartType: "COLUMN_CHART",
      chartName: "Sales Report",
      allowScroll: false,
      version: 1,
      animateLoading: true,
      responsiveBehavior: ResponsiveBehavior.Fill,
      minWidth: FILL_WIDGET_MIN_WIDTH,
      showDataPointLabel: false,
      customEChartsAdvanceConfigurations : DefaultEChartAdvancedConfig,
      // customEChartsAdvanceConfigurations: `{{\n${JSON.stringify(
      //   DefaultEChartAdvancedConfig,
      //   null,
      //   2,
      // )}\n}}`,
      customEChartConfig: DefaultEChartConfig,
      //  `{{\n${JSON.stringify(
      //   DefaultEChartConfig,
      //   null,
      //   2,
      // )}\n}}`,
      chartData: {
        [generateReactKey()]: DefaultEChartsBasicChartsData,
      },
      xAxisName: "Product Line",
      yAxisName: "Revenue($)",
      labelOrientation: LabelOrientation.AUTO,
      customFusionChartConfig: DefaultFusionChartConfig,

      /**
       * TODO, @sbalaji92
       * need to remove this once widget properties get added to dynamic binding path list
       * in WidgetAdditionSagas/dynamicBindingPathList function
       * */
      dynamicBindingPathList: [{ key: "customEChartConfig" }],
    };
  }

  static getAutoLayoutConfig() {
    return {
      widgetSize: [
        {
          viewportMinWidth: 0,
          configuration: () => {
            return {
              minWidth: "280px",
              minHeight: "300px",
            };
          },
        },
      ],
    };
  }

  static getMethods() {
    return {
      getEditorCallouts(props: WidgetProps): WidgetCallout[] {
        const callouts: WidgetCallout[] = [];
        if (
          ChartWidget.showCustomFusionChartDeprecationMessages() &&
          props.chartType == "CUSTOM_FUSION_CHART"
        ) {
          callouts.push({
            message: messages.customFusionChartDeprecationMessage,
            links: [
              {
                text: "Learn More",
                url: "https://docs.appsmith.com",
              },
            ],
          });
        }
        return callouts;
      },
    };
  }

  static getAutocompleteDefinitions(): AutocompletionDefinitions {
    return {
      "!doc":
        "Chart widget is used to view the graphical representation of your data. Chart is the go-to widget for your data visualisation needs.",
      "!url": "https://docs.appsmith.com/widget-reference/chart",
      isVisible: DefaultAutocompleteDefinitions.isVisible,
      chartData: {
        seriesName: "string",
        data: "[$__chartDataPoint__$]",
      },
      xAxisName: "string",
      yAxisName: "string",
      selectedDataPoint: "$__chartDataPoint__$",
    };
  }

  static getMetaPropertiesMap(): Record<string, any> {
    return {
      selectedDataPoint: undefined,
    };
  }

  static getPropertyPaneContentConfig() {
    return contentConfig(
      this.getFeatureFlag(CUSTOM_ECHART_FEATURE_FLAG),
      this.showCustomFusionChartDeprecationMessages(),
    );
  }

  static getPropertyPaneStyleConfig() {
    return styleConfig;
  }

  static showCustomFusionChartDeprecationMessages() {
    return this.getFeatureFlag(FUSION_CHART_DEPRECATION_FLAG);
  }

  static getStylesheetConfig(): Stylesheet {
    return {
      borderRadius: "{{appsmith.theme.borderRadius.appBorderRadius}}",
      boxShadow: "{{appsmith.theme.boxShadow.appBoxShadow}}",
      accentColor: "{{appsmith.theme.colors.primaryColor}}",
      fontFamily: "{{appsmith.theme.fontFamily.appFont}}",
    };
  }

  onDataPointClick = (selectedDataPoint: ChartSelectedDataPoint) => {
    this.props.updateWidgetMetaProperty(
      "selectedDataPoint",
      selectedDataPoint,
      {
        triggerPropertyName: "onDataPointClick",
        dynamicString: this.props.onDataPointClick,
        event: {
          type: EventType.ON_DATA_POINT_CLICK,
        },
      },
    );
  };

  customFn(str : string) {
    var x = new Function("a", "b", "")
    try {
      const fn = new Function("return " + str)
    const result = fn()
    const type = typeof(result)
    console.log("***", "type of variable is ", type)
    return typeof(result) == "function"
    } catch(error) {
      console.log("***", "error in catch is ", error)
    }
     
  }

  functionPlayground() {
    // const result = isFunctionPresent("", 2)
    const fnString = JSON.stringify(DefaultEChartConfig)
    console.log("***", "is function present ", isFunctionPresent(fnString, 2), fnString, this.customFn(fnString))
  }

  parseFunctions(configuration: Record<string, unknown>) {
    const newConfiguration = JSON.parse(JSON.stringify(configuration))
    let fnKeys = configuration['__fn_keys__'] as string[] ?? []
    // fnKeys = ['series.symbolSize']
    
    console.log("***", "configuration is ",configuration, " fn keys is ", fnKeys)

    for (const fnKey of fnKeys) {
      const fnString = get(configuration, fnKey)
      console.log("widgetlog", "fn string is ", fnString, " configuration is ", configuration)
      const fn = (new Function("return " + fnString))()
      console.log("widgetlog", "fn is ", fn)

      
      set(newConfiguration, fnKey, fn)
    }
    console.log("***", "CONFIGURATION AFTER OVERRIDE IS  ", newConfiguration)
    return newConfiguration
  }

  getWidgetView() {
    // const myconfig = {}
    //   const key = "rajat.agrawal.agrawal"
    //   const val = () => {}
      
    //   set(myconfig, key, val)
    //   console.log("widgetlog", "MYCONFIG IS ", myconfig)
    // console.log("proppane", "props in get page view are ", this.props.customEChartsAdvanceConfigurations)
    // const result = checkObjectHasValidFunctions({
    //   "rajat" : "agrawal",
    //   "agrawal": () => {
    //     console.log("Hey!!")
    //   },
    //   "testvalue" : {
    //     "rajat" : ( ) => {
          
    //     }
    //   }
    // })
    // console.log("proppane", "result from validating function is ", result)
    // const start = performance.now()
    // this.functionPlayground()
    // const end = performance.now()

    // const jsonStart = performance.now()
    // JSON.stringify(DefaultEChartConfig)
    // const jsonEnd = performance.now()

    // console.log("***", "ast start is ", start, " end is ", end, end - start)
    // console.log("***", "JSON parse performance is ", jsonStart, " end is ", jsonEnd, jsonEnd - jsonStart)

    // const a : string = "[0].rajat"
    // const b = [{'rajat' : "agrawal" }]
    // const result = get(b, a)
    // console.log("proppane", "result of get is ", result)


    const errors = syntaxErrorsFromProps(this.props);
    
    

    if (errors.length == 0) {
      if (emptyChartData(this.props)) {
        return <EmptyChartData />;
      } else {
        console.log("proppane", "value received in chart widget index is ", this.props.customEChartConfig)
        
        console.log("******", "configuration BEFORE parsing is ", this.props.customEChartConfig)
        const newConfig = this.parseFunctions(this.props.customEChartConfig)
        console.log("******", "new config is ", newConfig)

        return (
          <Suspense fallback={<Skeleton />}>
            <ChartComponent
              allowScroll={this.props.allowScroll}
              borderRadius={this.props.borderRadius}
              boxShadow={this.props.boxShadow}
              chartData={this.props.chartData}
              chartName={this.props.chartName}
              chartType={this.props.chartType}
              customEChartConfig={this.props.customEChartConfig}
              customFusionChartConfig={this.props.customFusionChartConfig}
              dimensions={this.props}
              fontFamily={this.props.fontFamily ?? "Nunito Sans"}
              hasOnDataPointClick={Boolean(this.props.onDataPointClick)}
              isLoading={this.props.isLoading}
              isVisible={this.props.isVisible}
              key={this.props.widgetId}
              labelOrientation={this.props.labelOrientation}
              onDataPointClick={this.onDataPointClick}
              primaryColor={this.props.accentColor ?? Colors.ROYAL_BLUE_2}
              rightColumn={this.props.rightColumn}
              customEChartsAdvanceConfigurations={this.props.customEChartsAdvanceConfigurations}
              setAdaptiveYMin={this.props.setAdaptiveYMin}
              showDataPointLabel={this.props.showDataPointLabel}
              widgetId={this.props.widgetId}
              xAxisName={this.props.xAxisName}
              yAxisName={this.props.yAxisName}
            />
          </Suspense>
        );
      }
    } else {
      return <ChartErrorComponent error={errors[0]} />;
    }
  }
}

type ChartComponentPartialProps = Omit<ChartComponentProps, "onDataPointClick">;
export interface ChartWidgetProps
  extends WidgetProps,
    ChartComponentPartialProps {
  onDataPointClick?: string;
}

export default ChartWidget;
