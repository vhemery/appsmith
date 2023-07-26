/* eslint-disable no-console */
import AlignedRow from "components/designSystems/appsmith/autoLayout/layoutComponents/AlignedRow";
import Column from "components/designSystems/appsmith/autoLayout/layoutComponents/Column";
import Row from "components/designSystems/appsmith/autoLayout/layoutComponents/Row";
import type { HighlightInfo, LayoutComponentProps } from "./autoLayoutTypes";
import { DEFAULT_HIGHLIGHT_SIZE } from "components/designSystems/appsmith/autoLayout/FlexBoxComponent";
import type { CanvasWidgetsReduxState } from "reducers/entityReducers/canvasWidgetsReducer";
import type { WidgetPositions } from "reducers/entityReducers/widgetPositionsReducer";
import { FlexLayerAlignment } from "./constants";

export function getLayoutComponent(type: string): any {
  const map: { [id: string]: any } = {
    ALIGNED_ROW: AlignedRow,
    COLUMN: Column,
    ROW: Row,
  };
  return map[type];
}

export function getLayoutFromId(
  layout: LayoutComponentProps[],
  id: string,
): LayoutComponentProps | null {
  if (!layout || !layout.length || !id) return null;
  for (const each of layout) {
    if (each.layoutId === id) return each;
    if (each.layout && each.layout.length) {
      const layout = getLayoutFromId(each.layout as LayoutComponentProps[], id);
      if (layout) return layout;
    }
  }
  return null;
}

export function updateLayoutById(
  parentLayout: LayoutComponentProps,
  updatedLayout: LayoutComponentProps,
): LayoutComponentProps {
  let currentLayout: LayoutComponentProps = { ...parentLayout };
  if (currentLayout.layoutId === updatedLayout.layoutId) return updatedLayout;
  if (currentLayout.rendersWidgets) return parentLayout;
  let index = 0;
  const layout = [...(currentLayout.layout as LayoutComponentProps[])];
  for (const each of layout) {
    layout[index] = updateLayoutById(
      each as LayoutComponentProps,
      updatedLayout,
    );
    index += 1;
  }
  currentLayout = { ...currentLayout, layout };
  return currentLayout;
}

export function updateVerticalDropZoneAndHeight(
  highlights: HighlightInfo[],
  height: number,
  layoutWidth: number,
): HighlightInfo[] {
  const zoneSize = 0.35;
  for (const [index, each] of highlights.entries()) {
    const previousHighlight: HighlightInfo | undefined = highlights[index - 1];
    const nextHighlight: HighlightInfo | undefined = highlights[index + 1];
    const left: number = Math.max(
      previousHighlight
        ? (each.posX -
            (each.posY < previousHighlight.posY + previousHighlight.height
              ? previousHighlight.posX
              : 0)) *
            zoneSize
        : each.posX + DEFAULT_HIGHLIGHT_SIZE,
      DEFAULT_HIGHLIGHT_SIZE,
    );
    const right: number = Math.max(
      nextHighlight
        ? ((each.posY + each.height > nextHighlight.posY
            ? nextHighlight.posX
            : layoutWidth) -
            each.posX) *
            zoneSize
        : layoutWidth - each.posX,
      DEFAULT_HIGHLIGHT_SIZE,
    );
    highlights[index] = {
      ...each,
      dropZone: {
        left,
        right,
      },
      height,
    };
  }
  return highlights;
}

export function generateHighlightsForRow(data: {
  layoutProps: LayoutComponentProps;
  widgets: CanvasWidgetsReduxState;
  widgetPositions: WidgetPositions;
  rect: DOMRect | undefined;
  alignment?: FlexLayerAlignment;
  childIndex?: number;
  offsetTop?: number;
}): HighlightInfo[] {
  const {
    layoutProps,
    widgets,
    widgetPositions,
    rect,
    alignment = FlexLayerAlignment.Start,
    offsetTop = 0,
    childIndex = 0,
  } = data;
  const { isDropTarget, layout, layoutId, rendersWidgets } = layoutProps;
  const offsetY = isDropTarget && false ? 4 : rect?.top || 0 + 4;
  const offsetX = isDropTarget && false ? 4 : rect?.left || 0 + 4;
  if (rendersWidgets) {
    const base = {
      alignment,
      isNewLayer: false,
      isVertical: true,
      layerIndex: 0,
      canvasId: layoutProps.containerProps?.widgetId || "0",
      dropZone: {},
      layoutId,
    };
    if (!layout?.length)
      return [
        {
          ...base,
          index: childIndex,
          rowIndex: 0,
          posX: offsetX, // TODO: remove hard coding.
          posY: offsetY + offsetTop,
          width: 4,
          height: 40,
        },
      ];
    let maxHeight = 0;
    const highlights: HighlightInfo[] = (layout as string[]).map(
      (id: string, index: number) => {
        const { height, left, top } = widgetPositions[id];
        maxHeight = Math.max(maxHeight, height);
        return {
          ...base,
          index: childIndex + index,
          rowIndex: index,
          posX: Math.max(left - offsetX, 2),
          posY: top - offsetY + offsetTop,
          width: 4,
          height: height,
        };
      },
    );
    // Add a final highlight after the last widget.
    const { left, top, width } =
      widgetPositions[(layout as string[])[layout.length - 1]];
    highlights.push({
      ...base,
      index: childIndex + layout.length,
      rowIndex: layout.length,
      posX: left - offsetX + width,
      posY: top - offsetY + offsetTop,
      width: 4,
      height: maxHeight,
    });
    return updateVerticalDropZoneAndHeight(
      highlights,
      maxHeight,
      rect?.width || 0,
    );
  }
  const highlights: HighlightInfo[] = [];
  for (const each of layout as LayoutComponentProps[]) {
    const layoutComp = getLayoutComponent(each.layoutType);
    highlights.push(
      layoutComp.deriveHighlights({
        layoutProps: each,
        widgets,
        widgetPositions,
        rect: layoutComp.getDOMRect(each),
      }),
    );
  }
  return highlights;
}

export function generateHighlightsForColumn(data: {
  layoutProps: LayoutComponentProps;
  widgets: CanvasWidgetsReduxState;
  widgetPositions: WidgetPositions;
  rect: DOMRect | undefined;
}): HighlightInfo[] {
  const { layoutProps, rect, widgetPositions, widgets } = data;
  const { isDropTarget, layout, layoutId, rendersWidgets } = layoutProps;
  const base = {
    alignment: FlexLayerAlignment.Start,
    isNewLayer: true,
    isVertical: false,
    layerIndex: 0,
    canvasId: layoutProps.containerProps?.widgetId || "0",
    dropZone: {},
    layoutId,
  };
  const offsetTop = isDropTarget && false ? 4 : rect?.top || 0 + 4;
  const offsetLeft = isDropTarget && false ? 4 : rect?.left || 0 + 4;
  if (rendersWidgets) {
    const highlights: HighlightInfo[] = [];
    if (!layout?.length)
      return [
        {
          ...base,
          index: 0,
          rowIndex: 0,
          posX: 2, // TODO: remove hard coding.
          posY: 2,
          width: (rect?.width || 0) - 4,
          height: 4,
        },
      ];
    let maxWidth = 0;
    let index = 0;
    for (const id of layout as string[]) {
      const widget = widgets[id];
      if (!widget) continue;
      const { left, top, width } = widgetPositions[id];
      console.log("!!!! widget", {
        top,
        left,
        width,
        id,
        offsetLeft,
        offsetTop,
      });
      maxWidth = Math.max(maxWidth, width);
      highlights.push({
        ...base,
        index,
        rowIndex: index,
        posX: left - offsetLeft,
        posY: Math.max(top - offsetTop, 2),
        width: (rect?.width || 0) - 4,
        height: 4,
      });
      index += 1;
    }
    // Add a final highlight after the last widget.
    const { height, left, top } =
      widgetPositions[(layout as string[])[layout.length - 1]];
    highlights.push({
      ...base,
      index: layout.length,
      rowIndex: layout.length,
      posX: left - offsetLeft,
      posY: top + height - offsetTop,
      width: (rect?.width || 0) - 4,
      height: 4,
    });
    console.log("!!!! highlights", highlights);
    return updateHorizontalDropZone(highlights);
  } else {
    const highlights: HighlightInfo[] = [];
    let childHeight = 0;
    let index = 0;
    for (const each of layout as LayoutComponentProps[]) {
      if (each.isDropTarget) continue;
      highlights.push({
        ...base,
        index: index,
        rowIndex: index,
        posX: offsetLeft,
        posY: offsetTop + childHeight + (index > 1 ? 12 : 0),
        width: (rect?.width || 0) - 4,
        height: 4,
      });
      const layoutComp = getLayoutComponent(each.layoutType);
      const layoutRect: DOMRect | undefined = layoutComp.getDOMRect(each);
      highlights.push(
        ...layoutComp.deriveHighlights({
          layoutProps: each,
          widgets,
          widgetPositions,
          rect: layoutRect,
          offsetTop: offsetTop + childHeight + (index > 1 ? 20 : 0), // rowGap (12) + padding (8)
        }),
      );
      childHeight += layoutRect?.height || 0;
      index += 1;
    }
    highlights.push({
      ...base,
      index: index,
      rowIndex: index,
      posX: offsetLeft,
      posY: offsetTop + childHeight + 8,
      width: (rect?.width || 0) - 4,
      height: 4,
    });
    return updateHorizontalDropZone(highlights);
  }
}

// TODO: handle case of aligned horizontal highlights.
export function updateHorizontalDropZone(
  highlights: HighlightInfo[],
): HighlightInfo[] {
  const arr: { index: number; highlight: HighlightInfo }[] = [];
  highlights.forEach((each: HighlightInfo, index: number) => {
    if (!each.isVertical) {
      arr.push({ index, highlight: each });
    }
  });
  arr.forEach((each, index: number) => {
    const curr: HighlightInfo = each.highlight;
    const prev: HighlightInfo | undefined = arr[index - 1]?.highlight;
    const next: HighlightInfo | undefined = arr[index + 1]?.highlight;
    const dropZone = {
      top: prev ? (curr.posY - prev.posY) / 2 : curr.posY,
      bottom: next ? (next.posY - curr.posY) / 2 : 10000,
    };
    highlights[each.index] = {
      ...highlights[each.index],
      dropZone,
    };
  });
  return highlights;
}
