import { useMemo } from "react";
import { useSelector } from "react-redux";
import { getWidgetPositions } from "selectors/entitiesSelector";
// import { getSelectedWidgets } from "selectors/ui";

const FONT_SIZE = 14;
const VERTICAL_PADDING = 4;
const HORIZONTAL_PADDING = 6;

const HEIGHT = FONT_SIZE * 1.2 + VERTICAL_PADDING * 2;

//rgb(239, 117, 65)

export const useWidgetNameCanvas = () => {
  // const [widgetPositions, setWidgetPositions] = useState<any>({});
  const widgetPositions = useSelector(getWidgetPositions);

  const resetCanvas = () => {
    const canvas = document.getElementById(
      "widget-name-canvas",
    ) as HTMLCanvasElement;
    const context = canvas?.getContext("2d");
    context?.clearRect(0, 0, canvas.width, canvas.height);
  };

  function roundRect(
    context: any,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: any = 5,
    fill = false,
    stroke = true,
  ) {
    if (typeof radius === "number") {
      radius = { tl: radius, tr: radius, br: radius, bl: radius };
    } else {
      radius = { ...{ tl: 0, tr: 0, br: 0, bl: 0 }, ...radius };
    }

    context.beginPath();
    context.moveTo(x + radius.tl, y);
    context.lineTo(x + width - radius.tr, y);
    context.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
    context.lineTo(x + width, y + height - radius.br);
    context.quadraticCurveTo(
      x + width,
      y + height,
      x + width - radius.br,
      y + height,
    );
    context.lineTo(x + radius.bl, y + height);
    context.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
    context.lineTo(x, y + radius.tl);
    context.quadraticCurveTo(x, y, x + radius.tl, y);
    context.closePath();
    if (fill) {
      context.fill();
    }
    if (stroke) {
      context.stroke();
    }
  }

  const renderWidgetNameComponent = (widgets: any) => {
    const text =
      widgets && widgets.length > 0
        ? widgets[0]?.widgetName?.trim()
        : "Button1";
    const position = widgetPositions[widgets[0]?.widgetId];
    const canvas = document.getElementById(
      "widget-name-canvas",
    ) as HTMLCanvasElement;
    const context = canvas?.getContext("2d");
    console.log("####", {
      context,
      position,
      widgetPositions,
    });
    if (context && position) {
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.imageSmoothingEnabled = true;
      const pixelRatio = window.devicePixelRatio || 1;
      const ratio = 1 / pixelRatio;
      // context.scale(ratio, ratio);
      // context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

      context.font = `400 ${FONT_SIZE}px sans-serif`;
      const textWidth = context.measureText(text).width;

      const canvasWidth = HORIZONTAL_PADDING * 2 + textWidth;
      console.log("####", {
        width: canvas.width,
        height: canvas.height,
        ratio,
        canvasWidth,
      });
      // canvas.width = canvas.width * ratio;
      // canvas.height = canvas.height * ratio;
      // canvas.height = HEIGHT;

      const left: number = position.left + position.width - canvasWidth;
      const top: number = position.top;

      context.fillStyle = "rgb(239, 117, 65)";
      context.strokeStyle = "rgb(239, 117, 65)";
      context.roundRect(left, top, canvasWidth, HEIGHT, [6, 6, 0, 0]);
      context.stroke();
      context.fill();

      // canvas.style.left = `${left}px`;
      // canvas.style.top = `${top}px`;

      roundRect(context, left, top, canvasWidth, HEIGHT, 6, true);

      // context.textBaseline = "hanging";
      // context.font = `400 ${FONT_SIZE}px sans-serif`;
      // context.fillStyle = "#ffffff";
      // context.fillText(
      //   text,
      //   left + HORIZONTAL_PADDING,
      //   top + VERTICAL_PADDING * 1.4,
      // );
      context.scale(ratio, ratio);
      console.log("####", {
        position,
        left,
        top,
        width: canvas.width,
        height: canvas.height,
      });
    }
  };

  const returnValue = useMemo(() => {
    return { renderWidgetNameComponent, resetCanvas };
  }, []);

  return returnValue;
};
