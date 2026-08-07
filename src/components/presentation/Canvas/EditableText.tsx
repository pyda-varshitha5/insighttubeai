"use client";

import { useEffect, useRef, useState } from "react";
import { TextElement } from "@/types/presentation";
import { usePresentation } from "@/hooks/usePresentation";

interface Props {
  element: TextElement;
}

export default function EditableText({
  element,
}: Props) {
  const {
    updateElement,
    selectElement,
    selectedElementId,
  } = usePresentation();

  const [editing, setEditing] = useState(false);

  const textareaRef =
    useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (editing) {
      textareaRef.current?.focus();
    }
  }, [editing]);

  const save = () => {
    if (!textareaRef.current) return;

    updateElement(element.id, {
      text: textareaRef.current.value,
    });

    setEditing(false);
  };

  if (editing) {
    return (
      <textarea
        ref={textareaRef}
        defaultValue={element.text}
        onBlur={save}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            save();
          }
        }}
        className="w-full h-full resize-none bg-transparent outline-none"
        style={{
          fontFamily: element.fontFamily,
          fontSize: element.fontSize,
          color: element.color,
          fontWeight: element.fontWeight,
          textAlign: element.align,
          lineHeight: element.lineHeight,
          letterSpacing: element.letterSpacing,
        }}
      />
    );
  }

  return (
    <div
      onClick={() => selectElement(element.id)}
      onDoubleClick={() => setEditing(true)}
      className={`
        w-full
        h-full
        p-1
        cursor-text
        whitespace-pre-wrap
        break-words
        transition

        ${
          selectedElementId === element.id
            ? "ring-2 ring-violet-500"
            : ""
        }
      `}
      style={{
        fontFamily: element.fontFamily,
        fontSize: element.fontSize,
        color: element.color,
        fontWeight: element.fontWeight,
        textAlign: element.align,
        lineHeight: element.lineHeight,
        letterSpacing: element.letterSpacing,
        textDecoration: element.underline
          ? "underline"
          : "none",
        fontStyle: element.fontStyle,
      }}
    >
      {element.text}
    </div>
  );
}