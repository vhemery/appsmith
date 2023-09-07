import React, { useMemo } from "react";
import type { WidgetProps } from "widgets/BaseWidget";
import { FixedLayoutViewerWidgetOnion } from "./FixedLayoutViewerWidgetOnion";
import { FixedLayoutViewerModalOnion } from "./FixedLayoutViewerModalOnion";

export const FixedLayoutViewerWrapper = (props: WidgetProps) => {
  /**
   * @constant WidgetOnion
   *
   * Widget Onion here refers to the Layers surrounding a widget just like layers in an onion.
   */
  const WidgetOnion = useMemo(() => {
    return props.type === "MODAL_WIDGET"
      ? FixedLayoutViewerModalOnion
      : FixedLayoutViewerWidgetOnion;
  }, [props.type]);
  const canvasWidget = props.type === "CANVAS_WIDGET";
  if (canvasWidget) {
    return props.children;
  }
  return <WidgetOnion {...props}>{props.children}</WidgetOnion>;
};
