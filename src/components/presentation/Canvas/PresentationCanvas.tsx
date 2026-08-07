"use client";

import { useRef, useState } from "react";

import { usePresentation } from "@/hooks/usePresentation";

import CanvasGrid from "./CanvasGrid";
import CanvasElement from "./CanvasElement";
import SelectionLayer from "./SelectionLayer";
import KeyboardManager from "./KeyboardManager";

export default function PresentationCanvas() {
  const {
    currentSlide,
    selectElement,
  } = usePresentation();

  const canvasRef =
    useRef<HTMLDivElement>(null);

  const [zoom, setZoom] = useState(1);

  if (!currentSlide)
    return (
<div className="flex-1 flex justify-center items-center overflow-hidden p-6 bg-gray-100">
        No Slide Selected

      </div>
    );

  return (
    <div className="flex flex-col w-full h-full bg-gray-200">

      {/* Zoom Toolbar */}

      <div className="h-12 border-b bg-white flex items-center justify-end px-5">

        <div className="flex items-center gap-2">

          <button
            className="border rounded-lg px-3 py-1"
            onClick={() =>
              setZoom((z) =>
                Math.max(0.5, z - 0.1)
              )
            }
          >
            -
          </button>

          <span className="text-sm w-14 text-center">

            {Math.round(zoom * 100)}%

          </span>

          <button
            className="border rounded-lg px-3 py-1"
            onClick={() =>
              setZoom((z) =>
                Math.min(2, z + 0.1)
              )
            }
          >
            +
          </button>

        </div>

      </div>

      {/* Canvas */}

      <div className="flex-1 flex justify-center items-center bg-[#eef1f6] p-4 overflow-hidden">

     <div
  ref={canvasRef}
  className="relative rounded-2xl shadow-xl"
  style={{
    width: "100%",
    maxWidth: "1400px",
    aspectRatio: "16 / 9",

    background:
      currentSlide.background.value,

    overflow: "hidden",

    transform: `scale(${zoom})`,

    transformOrigin: "center",
  }}
>
          <CanvasGrid />

          {currentSlide.elements.map(
            (element) => (
              <CanvasElement
                key={element.id}
                element={element}
              />
            )
          )}

          <SelectionLayer
            container={canvasRef.current}
          />

          <KeyboardManager />

        </div>

      </div>

    </div>
  );
}