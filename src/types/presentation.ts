/* ===========================
   Presentation Types
=========================== */

export type ThemeType =
  | "minimal"
  | "modern"
  | "corporate"
  | "gradient"
  | "dark";

export type ElementType =
  | "text"
  | "image"
  | "shape"
  | "icon"
  | "chart";

export interface Presentation {
  id: string;
  title: string;
  theme: ThemeType;
  createdAt: string;
  updatedAt: string;
  slides: Slide[];
}

export interface Slide {
  id: string;
  title: string;
  background: Background;
  elements: PresentationElement[];
}

export interface Background {
  type: "color" | "image" | "gradient";
  value: string;
}

export type PresentationElement =
  | TextElement
  | ImageElement
  | ShapeElement
  | IconElement;

export interface BaseElement {
  id: string;
  type: ElementType;

  x: number;
  y: number;

  width: number;
  height: number;

  rotation: number;

  opacity: number;

  locked: boolean;

  visible: boolean;

  layer: number;
}

/* ===========================
   Text
=========================== */

export interface TextElement extends BaseElement {
  type: "text";

  text: string;

  fontFamily: string;

  fontSize: number;

  fontWeight:
    | "normal"
    | "bold";

  fontStyle:
    | "normal"
    | "italic";

  underline: boolean;

  align:
    | "left"
    | "center"
    | "right";

  color: string;

  lineHeight: number;

  letterSpacing: number;
}

/* ===========================
   Image
=========================== */

export interface ImageElement extends BaseElement {
  type: "image";

  src: string;

  alt: string;

  borderRadius: number;

  borderWidth: number;

  borderColor: string;

  shadow: boolean;
}

/* ===========================
   Shape
=========================== */

export interface ShapeElement extends BaseElement {
  type: "shape";

  shape:
    | "rectangle"
    | "rounded"
    | "circle"
    | "triangle"
    | "diamond"
    | "star"
    | "arrow"
    | "line";

  fill: string;
  stroke: string;
  strokeWidth: number;
}
/* ===========================
   Icons
=========================== */

export interface IconElement extends BaseElement {
  type: "icon";

  icon: string;

  color: string;

  size: number;
}

/* ===========================
   Selection
=========================== */

export interface SelectionState {
  slideId: string | null;

  elementId: string | null;
}

/* ===========================
   Clipboard
=========================== */

export interface ClipboardData {
  element: PresentationElement | null;
}

/* ===========================
   History
=========================== */

export interface HistoryState {
  past: Presentation[];

  future: Presentation[];
}