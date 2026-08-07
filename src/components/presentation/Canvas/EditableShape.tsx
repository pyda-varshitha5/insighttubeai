"use client";

import { ShapeElement } from "@/types/presentation";
import { usePresentation } from "@/hooks/usePresentation";

interface Props {
  element: ShapeElement;
}

export default function EditableShape({ element }: Props) {
  const {
    selectedElementId,
    selectElement,
  } = usePresentation();

  const getBorderRadius = () => {
    switch (element.shape) {
      case "circle":
        return "9999px";

      case "rectangle":
        return "12px";

      default:
        return "0px";
    }
  };

  const getClipPath = () => {
    switch (element.shape) {
      case "triangle":
        return "polygon(50% 0%,0% 100%,100% 100%)";

      default:
        return "none";
    }
  };

  // Special rendering for line
  if (element.shape === "line") {
    return (
      <div
        onClick={() => selectElement(element.id)}
        className={`w-full h-full cursor-pointer ${
          selectedElementId === element.id
            ? "ring-2 ring-violet-500"
            : ""
        }`}
      >
        <div
          style={{
            width: "100%",
            height: "3px",
            background: element.fill,
            marginTop: "50%",
          }}
        />
      </div>
    );
  }

  return (
    <div
      onClick={() => selectElement(element.id)}
      className={`w-full h-full cursor-pointer transition ${
        selectedElementId === element.id
          ? "ring-2 ring-violet-500"
          : ""
      }`}
      style={{
        background: element.fill,
        border: `${element.strokeWidth}px solid ${element.stroke}`,
        borderRadius: getBorderRadius(),
        clipPath: getClipPath(),
        opacity: element.opacity,
      }}
    />
  );
}