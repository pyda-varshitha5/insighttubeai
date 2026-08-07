"use client";

import { useEffect } from "react";
import { usePresentation } from "@/hooks/usePresentation";

export default function KeyboardManager() {
  const {
    selectedElement,
    updateElement,
    deleteElement,
    selectElement,
  } = usePresentation();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedElement) return;

      switch (e.key) {
        case "Delete":
        case "Backspace":
          e.preventDefault();
          deleteElement(selectedElement.id);
          break;

        case "Escape":
          e.preventDefault();
          selectElement(null);
          break;

        case "ArrowUp":
          e.preventDefault();

          updateElement(selectedElement.id, {
            y: selectedElement.y - (e.shiftKey ? 10 : 1),
          });

          break;

        case "ArrowDown":
          e.preventDefault();

          updateElement(selectedElement.id, {
            y: selectedElement.y + (e.shiftKey ? 10 : 1),
          });

          break;

        case "ArrowLeft":
          e.preventDefault();

          updateElement(selectedElement.id, {
            x: selectedElement.x - (e.shiftKey ? 10 : 1),
          });

          break;

        case "ArrowRight":
          e.preventDefault();

          updateElement(selectedElement.id, {
            x: selectedElement.x + (e.shiftKey ? 10 : 1),
          });

          break;

        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () =>
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
  }, [
    selectedElement,
    updateElement,
    deleteElement,
    selectElement,
  ]);

  return null;
}