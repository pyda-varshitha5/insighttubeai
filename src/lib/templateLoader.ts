import { Presentation, Slide } from "@/types/presentation";

export interface PresentationTemplate {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  primaryColor: string;
  backgroundColor: string;
  fontFamily: string;
  theme: Presentation["theme"];
}

export const PRESENTATION_TEMPLATES: PresentationTemplate[] = [
  {
    id: "minimal",
    name: "Minimal",
    description: "Clean white presentation",
    thumbnail: "/templates/minimal.png",
    primaryColor: "#111827",
    backgroundColor: "#FFFFFF",
    fontFamily: "Inter",
    theme: "minimal",
  },

  {
    id: "modern",
    name: "Modern",
    description: "Modern blue gradient",
    thumbnail: "/templates/modern.png",
    primaryColor: "#2563EB",
    backgroundColor: "#EFF6FF",
    fontFamily: "Inter",
    theme: "modern",
  },

  {
    id: "corporate",
    name: "Corporate",
    description: "Professional business",
    thumbnail: "/templates/corporate.png",
    primaryColor: "#1E3A8A",
    backgroundColor: "#FFFFFF",
    fontFamily: "Roboto",
    theme: "corporate",
  },

  {
    id: "gradient",
    name: "Gradient",
    description: "Purple Gradient",
    thumbnail: "/templates/gradient.png",
    primaryColor: "#8B5CF6",
    backgroundColor: "#F5F3FF",
    fontFamily: "Poppins",
    theme: "gradient",
  },

  {
    id: "dark",
    name: "Dark",
    description: "Dark Theme",
    thumbnail: "/templates/dark.png",
    primaryColor: "#FFFFFF",
    backgroundColor: "#111827",
    fontFamily: "Inter",
    theme: "dark",
  },
];

export function getTemplate(id: string) {
  return PRESENTATION_TEMPLATES.find(
    (t) => t.id === id
  );
}

export function applyTemplate(
  presentation: Presentation,
  templateId: string
): Presentation {
  const template = getTemplate(templateId);

  if (!template) return presentation;

  const slides: Slide[] = presentation.slides.map((slide) => ({
    ...slide,

    background: {
      type: "color",
      value: template.backgroundColor,
    },

    elements: slide.elements.map((element) => {
      if (element.type === "text") {
        return {
          ...element,

          fontFamily: template.fontFamily,

          color: template.primaryColor,

          fontSize:
            element.fontSize >= 32
              ? 38
              : 22,
        };
      }

      if (element.type === "shape") {
        return {
          ...element,

          fill: template.primaryColor,

          stroke: template.primaryColor,
        };
      }

      if (element.type === "image") {
        return {
          ...element,

          borderRadius: 20,

          borderWidth: 4,

          borderColor: template.primaryColor,

          shadow: true,
        };
      }

      return element;
    }),
  }));

  return {
    ...presentation,

    theme: template.theme,

    updatedAt: new Date().toISOString(),

    slides,
  };
}