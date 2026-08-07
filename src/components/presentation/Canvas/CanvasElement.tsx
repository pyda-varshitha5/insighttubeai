"use client";

import { useRef } from "react";

import {
  PresentationElement,
  TextElement,
  ImageElement,
  ShapeElement,
} from "@/types/presentation";

import { usePresentation } from "@/hooks/usePresentation";

import EditableText from "./EditableText";
import EditableImage from "./EditableImage";
import EditableShape from "./EditableShape";
import MoveableLayer from "./MoveableLayer";

interface Props {
  element: PresentationElement;
}

export default function CanvasElement({
  element,
}: Props) {
  const {
    selectedElementId,
    selectElement,
    updateElement,
  } = usePresentation();

  const ref = useRef<HTMLDivElement>(null);

  const selected =
    selectedElementId === element.id;

  return (
    <>
      {selected && (
        <MoveableLayer
          target={ref.current}
          x={element.x}
          y={element.y}
          width={element.width}
          height={element.height}
          rotation={element.rotation}
          onDrag={(x, y) =>
            updateElement(element.id, {
              x,
              y,
            })
          }
          onResize={(width, height, x, y) =>
            updateElement(element.id, {
              width,
              height,
              x,
              y,
            })
          }
          onRotate={(rotation) =>
            updateElement(element.id, {
              rotation,
            })
          }
        />
      )}

      <div
        ref={ref}
        className="canvas-element absolute select-none"
        onMouseDown={() =>
          selectElement(element.id)
        }
        style={{
          left: element.x,
          top: element.y,
          width: element.width,
          height: element.height,
          opacity: element.opacity,
          zIndex: element.layer,
          transform: `rotate(${element.rotation}deg)`,
          display: element.visible
            ? "block"
            : "none",
          pointerEvents: element.locked
            ? "none"
            : "auto",
        }}
      >
        {element.type === "text" && (
          <EditableText
            element={element as TextElement}
          />
        )}

        {element.type === "image" && (
          <EditableImage
            element={element as ImageElement}
          />
        )}

        {element.type === "shape" && (
          <EditableShape
            element={element as ShapeElement}
          />
        )}
      </div>
    </>
  );
}