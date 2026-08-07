"use client";

import {
  Plus,
  Copy,
  Trash2,
  GripVertical,
} from "lucide-react";

import { usePresentation } from "@/hooks/usePresentation";

export default function SlideSidebar() {
  const {
    slides,
    selectedSlideId,
    addSlide,
    selectSlide,
    duplicateSlide,
    deleteSlide,
  } = usePresentation();

  return (
<div className="w-56 bg-white border-r flex flex-col shrink-0">
      {/* Header */}

      <div className="flex items-center justify-between px-4 py-3 border-b">

        <h2 className="font-semibold text-lg">
          Slides
        </h2>

        <button
          onClick={addSlide}
          className="bg-violet-600 hover:bg-violet-700 text-white rounded-lg p-2"
        >
          <Plus size={18} />
        </button>

      </div>

      {/* Slides */}

      <div className="flex-1 overflow-y-auto p-3 space-y-3">

        {slides.map((slide, index) => (

          <div
            key={slide.id}
            onClick={() => selectSlide(slide.id)}
            className={`
              rounded-xl
              border
              cursor-pointer
              transition

              ${
                selectedSlideId === slide.id
                  ? "border-violet-600 bg-violet-50"
                  : "hover:bg-gray-50"
              }
            `}
          >

            {/* Toolbar */}

            <div className="flex justify-between items-center px-3 py-2 border-b">

              <div className="flex items-center gap-2">

                <GripVertical
                  size={16}
                  className="text-gray-400"
                />

                <span className="text-sm font-medium">

                  Slide {index + 1}

                </span>

              </div>

              <div className="flex gap-1">

                <button
                  onClick={(e) => {
                    e.stopPropagation();

                    duplicateSlide(slide.id);
                  }}
                  className="hover:bg-gray-200 rounded p-1"
                >
                  <Copy size={15} />
                </button>

                {slides.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();

                      deleteSlide(slide.id);
                    }}
                    className="hover:bg-red-100 text-red-600 rounded p-1"
                  >
                    <Trash2 size={15} />
                  </button>
                )}

              </div>

            </div>

            {/* Thumbnail */}

            <div className="p-3">

              <div className="aspect-video rounded-lg border bg-white shadow-sm flex items-center justify-center">

                <div className="text-center">

                  <div className="font-semibold text-gray-700">

                    {slide.title}

                  </div>

                  <div className="text-xs text-gray-400 mt-2">

                    {slide.elements.length} Elements

                  </div>

                </div>

              </div>

            </div>

          </div>

        ))}

      </div>

    </div>
  );
}