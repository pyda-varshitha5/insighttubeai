"use client";

import {
  Square,
  Circle,
  Triangle,
  Minus,
} from "lucide-react";

type ShapeType =
  | "rectangle"
  | "circle"
  | "triangle"
  | "line";

interface ShapePickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (shape: ShapeType) => void;
}

const shapes: {
  id: ShapeType;
  name: string;
  icon: React.ReactNode;
}[] = [
  {
    id: "rectangle",
    name: "Rectangle",
    icon: <Square size={34} />,
  },
  {
    id: "circle",
    name: "Circle",
    icon: <Circle size={34} />,
  },
  {
    id: "triangle",
    name: "Triangle",
    icon: <Triangle size={34} />,
  },
  {
    id: "line",
    name: "Line",
    icon: <Minus size={34} />,
  },
];

export default function ShapePicker({
  open,
  onClose,
  onSelect,
}: ShapePickerProps) {
  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-40"
        onClick={onClose}
      />

      {/* Popup */}
      <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 w-[520px] bg-white rounded-2xl shadow-2xl p-6">
        <h2 className="text-xl font-bold mb-5">
          Choose a Shape
        </h2>

        <div className="grid grid-cols-2 gap-4">
          {shapes.map((shape) => (
            <button
              key={shape.id}
              onClick={() => {
                onSelect(shape.id);
                onClose();
              }}
              className="border rounded-xl p-5 hover:bg-violet-50 hover:border-violet-500 transition flex flex-col items-center gap-3"
            >
              {shape.icon}

              <span className="text-sm font-medium">
                {shape.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}