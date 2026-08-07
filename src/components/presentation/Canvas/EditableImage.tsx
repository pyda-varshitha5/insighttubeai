"use client";

import { ImageElement } from "@/types/presentation";
import { usePresentation } from "@/hooks/usePresentation";

interface Props {
  element: ImageElement;
}

export default function EditableImage({
  element,
}: Props) {
  const {
    selectedElementId,
    selectElement,
    updateElement,
  } = usePresentation();

  const replaceImage = () => {
    const input = document.createElement("input");

    input.type = "file";
    input.accept = "image/*";

    input.onchange = () => {
      const file = input.files?.[0];

      if (!file) return;

      const reader = new FileReader();

      reader.onload = () => {
        updateElement(element.id, {
          src: reader.result as string,
        });
      };

      reader.readAsDataURL(file);
    };

    input.click();
  };

  return (
    <div
      className={`
        w-full
        h-full
        relative
        overflow-hidden
        rounded-lg
        cursor-pointer
        transition

        ${
          selectedElementId === element.id
            ? "ring-2 ring-violet-500"
            : ""
        }
      `}
      onClick={() => selectElement(element.id)}
      onDoubleClick={replaceImage}
    >
      <img
        src={element.src}
        alt={element.alt}
        draggable={false}
        className="w-full h-full object-cover select-none"
        style={{
          borderRadius: element.borderRadius,
          border: `${element.borderWidth}px solid ${element.borderColor}`,
          opacity: element.opacity,
          boxShadow: element.shadow
            ? "0 8px 20px rgba(0,0,0,.18)"
            : "none",
        }}
      />

      {selectedElementId === element.id && (
        <div className="absolute top-2 right-2 rounded bg-violet-600 px-2 py-1 text-xs text-white shadow">
          Double-click to replace
        </div>
      )}
    </div>
  );
}