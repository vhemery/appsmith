import type { LayoutElementPositions } from "layoutSystems/common/types";
import React from "react";
import type {
  DraggedWidget,
  HighlightPayload,
  LayoutComponentTypes,
} from "../utils/anvilTypes";
import { AnvilHighlightingCanvas } from "./AnvilHighlightingCanvas";
import { useAnvilDnDStates } from "./hooks/useAnvilDnDStates";
import { useAnvilWidgetDrop } from "./hooks/useAnvilWidgetDrop";

interface AnvilCanvasDraggingArenaProps {
  canvasId: string;
  layoutId: string;
  layoutType: LayoutComponentTypes;
  allowedWidgetTypes: string[];
  deriveAllHighlightsFn: (
    layoutElementPositions: LayoutElementPositions,
    draggedWidgets: DraggedWidget[],
  ) => HighlightPayload;
}

export const AnvilCanvasDraggingArena = (
  props: AnvilCanvasDraggingArenaProps,
) => {
  const {
    allowedWidgetTypes,
    canvasId,
    deriveAllHighlightsFn,
    layoutId,
    layoutType,
  } = props;
  // useAnvilDnDStates to fetch all states used in Anvil DnD
  const anvilDragStates = useAnvilDnDStates({
    allowedWidgetTypes,
    canvasId,
    layoutId,
    layoutType,
  });
  const onDrop = useAnvilWidgetDrop(canvasId, anvilDragStates);

  return (
    <AnvilHighlightingCanvas
      anvilDragStates={anvilDragStates}
      deriveAllHighlightsFn={deriveAllHighlightsFn}
      layoutId={layoutId}
      onDrop={onDrop}
    />
  );
};
