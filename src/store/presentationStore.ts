"use client";

import { create } from "zustand";
import {
  Presentation,
  Slide,
  PresentationElement,
  TextElement,
  ImageElement,
  ShapeElement,
} from "@/types/presentation";
type ShapeType = ShapeElement["shape"];
interface PresentationStore {
  presentation: Presentation;

  selectedSlideId: string;

  selectedElementId: string | null;

  setPresentation: (presentation: Presentation) => void;

  /* Slide */

  addSlide: () => void;

  deleteSlide: (id: string) => void;

  duplicateSlide: (id: string) => void;

  selectSlide: (id: string) => void;

  updateSlide: (slide: Slide) => void;

  /* Elements */

  addText: () => void;

  addImage: (src: string) => void;

addShape: (shape?: ShapeType) => void;
  deleteElement: (id: string) => void;

  updateElement: (
    id: string,
    updates: Partial<PresentationElement>
  ) => void;

  selectElement: (id: string | null) => void;
}

const createSlide = (index: number): Slide => ({
  id: crypto.randomUUID(),
  title: `Slide ${index}`,
  background: {
    type: "color",
    value: "#ffffff",
  },
  elements: [],
});

const firstSlide = createSlide(1);

export const usePresentationStore =
create<PresentationStore>((set, get) => ({ 
    presentation: {
      id: crypto.randomUUID(),
      title: "Untitled Presentation",
      theme: "minimal",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      slides: [firstSlide],
    },

    selectedSlideId: firstSlide.id,

    selectedElementId: null,

    setPresentation: (presentation) =>
      set({
        presentation,
        selectedSlideId:
          presentation.slides[0]?.id ?? "",
      }),

    /* -------------------- */

    addSlide: () => {
      const state = get();

      const slide = createSlide(
        state.presentation.slides.length + 1
      );

      set({
        presentation: {
          ...state.presentation,
          slides: [
            ...state.presentation.slides,
            slide,
          ],
        },

        selectedSlideId: slide.id,
      });
    },

    deleteSlide: (id) => {
      const state = get();

      const slides =
        state.presentation.slides.filter(
          (slide) => slide.id !== id
        );

      set({
        presentation: {
          ...state.presentation,
          slides,
        },

        selectedSlideId:
          slides[0]?.id ?? "",
      });
    },

    duplicateSlide: (id) => {
      const state = get();

      const slide =
        state.presentation.slides.find(
          (s) => s.id === id
        );

      if (!slide) return;

      const duplicate: Slide = {
        ...structuredClone(slide),
        id: crypto.randomUUID(),
        title: `${slide.title} Copy`,
      };

      set({
        presentation: {
          ...state.presentation,
          slides: [
            ...state.presentation.slides,
            duplicate,
          ],
        },
      });
    },

    selectSlide: (id) =>
      set({
        selectedSlideId: id,
      }),

    updateSlide: (slide) => {
      const state = get();

      set({
        presentation: {
          ...state.presentation,
          slides:
            state.presentation.slides.map(
              (s) =>
                s.id === slide.id
                  ? slide
                  : s
            ),
        },
      });
    },

    /* -------------------- */

    addText: () => {
      const state = get();

      const slide =
        state.presentation.slides.find(
          (s) =>
            s.id ===
            state.selectedSlideId
        );

      if (!slide) return;

      const text: TextElement = {
        id: crypto.randomUUID(),

        type: "text",

        text: "Double click to edit",

        x: 120,
        y: 100,

        width: 300,
        height: 50,

        rotation: 0,

        opacity: 1,

        visible: true,

        locked: false,

        layer: slide.elements.length,

        fontFamily: "Inter",

        fontSize: 28,

        fontWeight: "bold",

        fontStyle: "normal",

        underline: false,

        align: "left",

        color: "#111827",

        lineHeight: 1.4,

        letterSpacing: 0,
      };

      slide.elements.push(text);

      get().updateSlide({
        ...slide,
      });

      set({
        selectedElementId: text.id,
      });
    },

    addImage: (src) => {
      const state = get();

      const slide =
        state.presentation.slides.find(
          (s) =>
            s.id ===
            state.selectedSlideId
        );

      if (!slide) return;

      const image: ImageElement = {
        id: crypto.randomUUID(),

        type: "image",

        src,

        alt: "",

        x: 200,

        y: 120,

        width: 300,

        height: 200,

        rotation: 0,

        opacity: 1,

        visible: true,

        locked: false,

        layer: slide.elements.length,

        borderRadius: 0,

        borderWidth: 0,

        borderColor: "#000000",

        shadow: false,
      };

      slide.elements.push(image);

      get().updateSlide({
        ...slide,
      });
    },

   addShape: (shapeType: ShapeType = "rectangle") => {
      const state = get();

      const slide =
        state.presentation.slides.find(
          (s) =>
            s.id ===
            state.selectedSlideId
        );

      if (!slide) return;

      const shape: ShapeElement = {
        id: crypto.randomUUID(),

        type: "shape",

       shape: shapeType,

        x: 150,

        y: 150,

        width: 200,

        height: 120,

        rotation: 0,

        opacity: 1,

        visible: true,

        locked: false,

        layer: slide.elements.length,

        fill: "#8b5cf6",

        stroke: "#6d28d9",

        strokeWidth: 2,
      };

      slide.elements.push(shape);

      get().updateSlide({
        ...slide,
      });
    },

    deleteElement: (id) => {
      const state = get();

      const slide =
        state.presentation.slides.find(
          (s) =>
            s.id ===
            state.selectedSlideId
        );

      if (!slide) return;

      slide.elements =
        slide.elements.filter(
          (e) => e.id !== id
        );

      get().updateSlide({
        ...slide,
      });

      set({
        selectedElementId: null,
      });
    },

    updateElement: (id, updates) => {
  const state = get();

  const slide = state.presentation.slides.find(
    (s) => s.id === state.selectedSlideId
  );

  if (!slide) return;

  const elements = slide.elements.map((element) => {
    if (element.id !== id) return element;

    return {
      ...element,
      ...(updates as Partial<typeof element>),
    } as PresentationElement;
  });

  get().updateSlide({
    ...slide,
    elements,
  });
},

    selectElement: (id) =>
      set({
        selectedElementId: id,
      }),
  }));