import {
  PresentationElement,
  TextElement,
  ImageElement,
  ShapeElement,
} from "@/types/presentation";

/* =====================================================
   DESIGN SYSTEM
===================================================== */

const COLORS = {
  background: "#FFFFFF",
  title: "#111827",
  text: "#4B5563",
  muted: "#6B7280",
  accent: "#7C3AED",
  border: "#E5E7EB",
  card: "#F9FAFB",
};

const FONT = "Inter";

/* =====================================================
   HELPERS
===================================================== */

function createBackground(): ShapeElement {
  return {
    id: crypto.randomUUID(),
    type: "shape",
    shape: "rectangle",

    x: 0,
    y: 0,

    width: 960,
    height: 540,

    rotation: 0,
    opacity: 1,

    visible: true,
    locked: true,

    layer: 0,

    fill: COLORS.background,
    stroke: COLORS.background,
    strokeWidth: 0,
  };
}

function createAccentBar(): ShapeElement {
  return {
    id: crypto.randomUUID(),
    type: "shape",
    shape: "rectangle",

    x: 0,
    y: 0,

    width: 12,
    height: 540,

    rotation: 0,
    opacity: 1,

    visible: true,
    locked: true,

    layer: 1,

    fill: COLORS.accent,
    stroke: COLORS.accent,
    strokeWidth: 0,
  };
}

function createCard(
  x: number,
  y: number,
  width: number,
  height: number
): ShapeElement {
  return {
    id: crypto.randomUUID(),
    type: "shape",
    shape: "rounded",

    x,
    y,

    width,
    height,

    rotation: 0,
    opacity: 1,

    visible: true,
    locked: false,

    layer: 2,

    fill: COLORS.card,
    stroke: COLORS.border,
    strokeWidth: 1,
  };
}

function createTitle(
  text: string,
  x: number,
  y: number,
  width = 430,
  size = 38
): TextElement {
  return {
    id: crypto.randomUUID(),
    type: "text",

    text,

    x,
    y,

    width,
    height: 90,

    rotation: 0,
    opacity: 1,

    visible: true,
    locked: false,

    layer: 10,

    fontFamily: FONT,
    fontSize: size,
    fontWeight: "bold",
    fontStyle: "normal",
    underline: false,

    align: "left",

    color: COLORS.title,

    lineHeight: 1.2,
    letterSpacing: 0,
  };
}

function createSubtitle(
  text: string,
  x: number,
  y: number,
  width = 430
): TextElement {
  return {
    id: crypto.randomUUID(),
    type: "text",

    text,

    x,
    y,

    width,
    height: 60,

    rotation: 0,
    opacity: 1,

    visible: true,
    locked: false,

    layer: 10,

    fontFamily: FONT,
    fontSize: 20,
    fontWeight: "normal",
    fontStyle: "normal",
    underline: false,

    align: "left",

    color: COLORS.muted,

    lineHeight: 1.4,
    letterSpacing: 0,
  };
}

function createBody(
  text: string,
  x: number,
  y: number,
  width = 430,
  height = 150
): TextElement {
  return {
    id: crypto.randomUUID(),
    type: "text",

    text,

    x,
    y,

    width,
    height,

    rotation: 0,
    opacity: 1,

    visible: true,
    locked: false,

    layer: 10,

    fontFamily: FONT,
    fontSize: 18,
    fontWeight: "normal",
    fontStyle: "normal",
    underline: false,

    align: "left",

    color: COLORS.text,

    lineHeight: 1.6,
    letterSpacing: 0,
  };
}
/* =====================================================
   HERO SLIDE
===================================================== */

function createHeroSlide(
  slide: any,
  imageUrl: string
): PresentationElement[] {
 

   

   const titleLines = Math.ceil((slide.title || "").length / 20);
const subtitleY = 80 + titleLines * 48 + 10;

return [

  createBackground(),

  createAccentBar(),

  createTitle(
    slide.title,
    70,
    80,
    480,
    42
  ),

  createSubtitle(
    slide.subtitle || "",
    70,
    subtitleY,
    480
  ),


   

    {
      id: crypto.randomUUID(),
      type: "image",

      src: imageUrl,
      alt: slide.title,

      x: 585,
      y: 70,

      width: 300,
      height: 300,

      rotation: 0,
      opacity: 1,

      visible: true,
      locked: false,

      layer: 5,

      borderRadius: 24,
      borderWidth: 1,
      borderColor: "#E5E7EB",

      shadow: true,
    },

    {
      id: crypto.randomUUID(),
      type: "text",

      text: "Generated with InsightTube AI",

      x: 70,
      y: 485,

      width: 240,
      height: 20,

      rotation: 0,
      opacity: 1,

      visible: true,
      locked: false,

      layer: 10,

      fontFamily: FONT,
      fontSize: 14,
      fontWeight: "normal",
      fontStyle: "normal",
      underline: false,

      align: "left",

      color: COLORS.muted,

      lineHeight: 1.2,
      letterSpacing: 0,
    },

  ];
}
/* =====================================================
   CONTENT SLIDE
===================================================== */

function createContentSlide(
  slide: any,
  imageUrl: string
): PresentationElement[] {
  return [

    createBackground(),

    createAccentBar(),

    // Title
    createTitle(
      slide.title,
      70,
      70,
      430,
      34
    ),

    // Body Card
   createCard(
  60,
  180,
  440,
  180
),

    // Body Text
   createBody(
  slide.body || "",
  85,
  205,
  390,
  145
),

    // Image
    {
      id: crypto.randomUUID(),
      type: "image",

      src: imageUrl,
      alt: slide.title,

      x: 585,
      y: 80,

      width: 300,
      height: 300,

      rotation: 0,
      opacity: 1,

      visible: true,
      locked: false,

      layer: 5,

      borderRadius: 24,
      borderWidth: 1,
      borderColor: "#E5E7EB",

      shadow: true,
    },

    // Footer
    {
      id: crypto.randomUUID(),
      type: "text",

      text: "Generated with InsightTube AI",

      x: 70,
      y: 485,

      width: 250,
      height: 20,

      rotation: 0,
      opacity: 1,

      visible: true,
      locked: false,

      layer: 10,

      fontFamily: FONT,
      fontSize: 14,
      fontWeight: "normal",
      fontStyle: "normal",
      underline: false,

      align: "left",

      color: COLORS.muted,

      lineHeight: 1.2,
      letterSpacing: 0,
    },

  ];
}
/* =====================================================
   MAIN EXPORT
===================================================== */

export function getSlideElements(
  slide: any,
  imageUrl: string
): PresentationElement[] {

  if (
    slide.layout === "hero-cover" ||
    slide.layout === "cover"
  ) {
    return createHeroSlide(
      slide,
      imageUrl
    );
  }

  return createContentSlide(
    slide,
    imageUrl
  );
}