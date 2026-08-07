"use client";

import { usePresentationStore } from "@/store/presentationStore";

export function usePresentation() {
  const presentation = usePresentationStore(
    (state) => state.presentation
  );

  const selectedSlideId = usePresentationStore(
    (state) => state.selectedSlideId
  );

  const selectedElementId = usePresentationStore(
    (state) => state.selectedElementId
  );

  const setPresentation = usePresentationStore(
    (state) => state.setPresentation
  );

  const addSlide = usePresentationStore(
    (state) => state.addSlide
  );

  const deleteSlide = usePresentationStore(
    (state) => state.deleteSlide
  );

  const duplicateSlide = usePresentationStore(
    (state) => state.duplicateSlide
  );

  const selectSlide = usePresentationStore(
    (state) => state.selectSlide
  );

  const updateSlide = usePresentationStore(
    (state) => state.updateSlide
  );

  const addText = usePresentationStore(
    (state) => state.addText
  );

  const addImage = usePresentationStore(
    (state) => state.addImage
  );

  const addShape = usePresentationStore(
    (state) => state.addShape
  );

  const updateElement = usePresentationStore(
    (state) => state.updateElement
  );

  const deleteElement = usePresentationStore(
    (state) => state.deleteElement
  );

  const selectElement = usePresentationStore(
    (state) => state.selectElement
  );

  const currentSlide =
    presentation.slides.find(
      (slide) => slide.id === selectedSlideId
    ) || null;

  const selectedElement =
    currentSlide?.elements.find(
      (element) => element.id === selectedElementId
    ) || null;

  return {
    presentation,

    slides: presentation.slides,

    currentSlide,

    selectedSlideId,

    selectedElement,

    selectedElementId,

    /* Presentation */

    setPresentation,

    /* Slides */

    addSlide,

    deleteSlide,

    duplicateSlide,

    selectSlide,

    updateSlide,

    /* Elements */

    addText,

    addImage,

    addShape,

    updateElement,

    deleteElement,

    selectElement,
  };
}