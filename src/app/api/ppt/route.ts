import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { getSlideElements } from "@/lib/presentationLayouts";

/* =====================================================
   TYPES
   ===================================================== */

interface PresentationSlide {
  title: string;
  subtitle?: string;
  body: string;
  highlights: string[];
  imagePrompt: string;
  icon?: string;
  layout?: string;
  accentColor?: string;
}

interface PresentationData {
  slides: PresentationSlide[];
}

/* =====================================================
   GEMINI
   ===================================================== */

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

/* =====================================================
   GET IMAGE FROM UNSPLASH
   ===================================================== */

async function getImage(query: string): Promise<string> {
  const fallback =
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee";

  try {
    const accessKey = process.env.UNSPLASH_ACCESS_KEY;

    if (!accessKey) {
      return fallback;
    }

    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
        query
      )}&per_page=1&orientation=landscape`,
      {
        headers: {
          Authorization: `Client-ID ${accessKey}`,
        },
      }
    );

    if (!res.ok) {
      console.error(
        "Unsplash request failed:",
        res.status,
        res.statusText
      );

      return fallback;
    }

    const data: {
      results?: Array<{
        urls?: {
          regular?: string;
        };
      }>;
    } = await res.json();

    return (
      data.results?.[0]?.urls?.regular ||
      fallback
    );
  } catch (error: unknown) {
    console.error(
      "Unsplash image error:",
      error instanceof Error
        ? error.message
        : String(error)
    );

    return fallback;
  }
}

/* =====================================================
   CREATE PRESENTATION
   ===================================================== */

async function createPresentation(
  aiData: PresentationData,
  topic: string
) {
  if (
    !aiData ||
    !Array.isArray(aiData.slides)
  ) {
    throw new Error(
      "Gemini response does not contain a valid slides array."
    );
  }

  if (aiData.slides.length !== 10) {
    throw new Error(
      `Expected 10 slides but received ${aiData.slides.length}.`
    );
  }

  const slides = await Promise.all(
    aiData.slides.map(
      async (
        slide: PresentationSlide
      ) => {
        const imageUrl =
          await getImage(
            slide.imagePrompt ||
              slide.title ||
              topic
          );

        return {
          id: crypto.randomUUID(),

          title: slide.title,

          subtitle:
            slide.subtitle || "",

          background: {
            type: "color",
            value: "#ffffff",
          },

          elements: getSlideElements(
            slide,
            imageUrl
          ),
        };
      }
    )
  );

  return {
    id: crypto.randomUUID(),

    title: topic,

    theme: "modern",

    createdAt:
      new Date().toISOString(),

    updatedAt:
      new Date().toISOString(),

    slides,
  };
}

/* =====================================================
   POST
   ===================================================== */

export async function POST(
  req: NextRequest
) {
  try {
    /* =================================================
       CHECK API KEY
       ================================================= */

    const apiKey =
      process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "GEMINI_API_KEY is missing in .env.local",
        },
        {
          status: 500,
        }
      );
    }

    /* =================================================
       GET REQUEST DATA
       ================================================= */

    const body =
      await req.json();

    const title =
      typeof body?.title === "string"
        ? body.title.trim()
        : "";

    const markdown =
      typeof body?.markdown === "string"
        ? body.markdown.trim()
        : "";

    if (!title) {
      return NextResponse.json(
        {
          error:
            "Presentation title is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (!markdown) {
      return NextResponse.json(
        {
          error:
            "Study material is required.",
        },
        {
          status: 400,
        }
      );
    }

    /* =================================================
       PROMPT
       ================================================= */

    const prompt = `
You are Gamma AI's senior presentation designer
and educational content writer.

Create a premium, professional presentation.

TOPIC:
"${title}"

STUDY MATERIAL:
${markdown}

IMPORTANT:

Use ONLY the study material above as the source.

Do not introduce unrelated information.

Create EXACTLY 10 slides.

The presentation must flow naturally from beginning
to end.

Each slide must teach something new.

Do not repeat information.

=====================================================
SLIDE STRUCTURE
=====================================================

Slide 1:

layout = "hero-cover"

Slides 2-10:

layout = "content"

=====================================================
EVERY SLIDE
=====================================================

Each slide must contain:

title
subtitle
body
highlights
imagePrompt
icon
layout
accentColor

=====================================================
TITLE
=====================================================

Maximum 8 words.

Maximum 50 characters.

Keep it short and presentation-ready.

=====================================================
SUBTITLE
=====================================================

Maximum 10 words.

Keep it concise.

=====================================================
BODY
=====================================================

Write ONE paragraph.

Use simple English.

Suitable for college students.

Educational and informative.

Target 40-60 words.

Never use bullet points.

Never start with:

"This slide..."

Never repeat the title.

Never include numbering.

=====================================================
HIGHLIGHTS
=====================================================

Exactly 3 highlights.

Each highlight should:

- Be concise.
- Contain fewer than 7 words.
- Represent an important takeaway.
- Not repeat the body exactly.

Example:

[
  "Constant time lookup",
  "Memory efficient",
  "Supports recursion"
]

=====================================================
IMAGE PROMPT
=====================================================

Every slide must have an imagePrompt.

Describe ONE high-quality educational illustration.

Do NOT include text inside the image.

Use image prompts suitable for Unsplash.

Examples:

"modern software architecture visualization"

"computer memory blocks"

"artificial intelligence neural network"

"cloud infrastructure"

"developer coding workstation"

"cyber security shield"

Use a different relevant image for every slide.

=====================================================
ICON
=====================================================

Use exactly ONE icon per slide.

Allowed icons ONLY:

book
code
cpu
database
rocket
globe
lightbulb
chart
shield
settings

=====================================================
ACCENT COLOR
=====================================================

Use exactly ONE accent color per slide.

Allowed examples:

#7C3AED
#2563EB
#059669
#DC2626
#EA580C

=====================================================
LAYOUT
=====================================================

Slide 1 MUST use:

"hero-cover"

Slides 2-10 MUST use:

"content"

=====================================================
DESIGN RULES
=====================================================

Create clean professional Gamma-style slides.

Keep plenty of empty space.

Do not create long paragraphs.

Do not create essays.

Do not create more than 3 highlights.

Do not repeat information.

Content must fit comfortably inside a fixed-size slide.

=====================================================
OUTPUT
=====================================================

Return ONLY valid JSON.

Do NOT use markdown.

Do NOT use code fences.

Do NOT provide explanations.

Use exactly this structure:

{
  "slides": [
    {
      "title": "Short slide title",
      "subtitle": "Short supporting subtitle",
      "body": "A concise educational paragraph.",
      "highlights": [
        "Important point one",
        "Important point two",
        "Important point three"
      ],
      "imagePrompt": "Specific relevant educational image",
      "icon": "book",
      "layout": "hero-cover",
      "accentColor": "#7C3AED"
    }
  ]
}

There MUST be exactly 10 slide objects.

=====================================================
FINAL VALIDATION
=====================================================

Before returning the JSON:

1. Make sure there are exactly 10 slides.
2. Make sure every slide has a title.
3. Make sure every slide has a body.
4. Make sure every slide has exactly 3 highlights.
5. Make sure every slide has an imagePrompt.
6. Make sure Slide 1 uses "hero-cover".
7. Make sure Slides 2-10 use "content".
8. Make sure every slide has an allowed icon.
9. Make sure every slide has an accentColor.
10. Return valid JSON only.
`;

    /* =================================================
       GENERATE WITH GEMINI
       ================================================= */

    console.log(
      "Generating PPT for:",
      title
    );

    const result =
      await ai.models.generateContent({
        model: "gemini-3.6-flash",

        contents: prompt,

        config: {
          responseMimeType:
            "application/json",
        },
      });

    /* =================================================
       GET RESPONSE
       ================================================= */

    const text =
      result.text;

    if (!text) {
      throw new Error(
        "Gemini returned an empty response."
      );
    }

    console.log(
      "Gemini PPT response received."
    );

    /* =================================================
       CLEAN JSON
       ================================================= */

    const cleaned =
      text
        .replace(
          /^```json\s*/i,
          ""
        )
        .replace(
          /^```\s*/i,
          ""
        )
        .replace(
          /\s*```$/i,
          ""
        )
        .trim();

    /* =================================================
       PARSE JSON
       ================================================= */

    let aiSlides: PresentationData;

    try {
      const parsed: unknown =
        JSON.parse(cleaned);

      if (
        !parsed ||
        typeof parsed !== "object"
      ) {
        throw new Error(
          "Gemini returned an invalid JSON object."
        );
      }

      const candidate =
        parsed as {
          slides?: unknown;
        };

      if (
        !Array.isArray(
          candidate.slides
        )
      ) {
        throw new Error(
          "Gemini response does not contain a slides array."
        );
      }

      aiSlides = {
        slides:
          candidate.slides as PresentationSlide[],
      };
    } catch (error: unknown) {
      console.error(
        "Invalid Gemini PPT JSON:",
        cleaned
      );

      throw new Error(
        error instanceof Error
          ? error.message
          : "Gemini returned invalid presentation JSON."
      );
    }

    /* =================================================
       VALIDATE SLIDES ARRAY
       ================================================= */

    if (
      !aiSlides ||
      !Array.isArray(
        aiSlides.slides
      )
    ) {
      throw new Error(
        "Gemini response does not contain a valid slides array."
      );
    }

    if (
      aiSlides.slides.length !== 10
    ) {
      throw new Error(
        `Expected 10 slides but received ${aiSlides.slides.length}.`
      );
    }

    /* =================================================
       VALIDATE EACH SLIDE
       ================================================= */

    aiSlides.slides.forEach(
      (
        slide: PresentationSlide,
        index: number
      ) => {
        const slideNumber =
          index + 1;

        /* ---------------------------------------------
           TITLE
           --------------------------------------------- */

        if (
          !slide.title ||
          typeof slide.title !==
            "string"
        ) {
          throw new Error(
            `Slide ${slideNumber} has no title.`
          );
        }

        /* ---------------------------------------------
           BODY
           --------------------------------------------- */

        if (
          !slide.body ||
          typeof slide.body !==
            "string"
        ) {
          throw new Error(
            `Slide ${slideNumber} has no body.`
          );
        }

        /* ---------------------------------------------
           HIGHLIGHTS
           --------------------------------------------- */

        if (
          !Array.isArray(
            slide.highlights
          ) ||
          slide.highlights.length !== 3
        ) {
          throw new Error(
            `Slide ${slideNumber} must have exactly 3 highlights.`
          );
        }

        /* ---------------------------------------------
           IMAGE PROMPT
           --------------------------------------------- */

        if (
          !slide.imagePrompt ||
          typeof slide.imagePrompt !==
            "string"
        ) {
          throw new Error(
            `Slide ${slideNumber} has no imagePrompt.`
          );
        }

        /* ---------------------------------------------
           LAYOUT
           --------------------------------------------- */

        if (index === 0) {
          slide.layout =
            "hero-cover";
        } else {
          slide.layout =
            "content";
        }

        /* ---------------------------------------------
           SUBTITLE
           --------------------------------------------- */

        if (
          !slide.subtitle ||
          typeof slide.subtitle !==
            "string"
        ) {
          slide.subtitle = "";
        }

        /* ---------------------------------------------
           ICON
           --------------------------------------------- */

        const allowedIcons = [
          "book",
          "code",
          "cpu",
          "database",
          "rocket",
          "globe",
          "lightbulb",
          "chart",
          "shield",
          "settings",
        ];

        if (
          !slide.icon ||
          !allowedIcons.includes(
            slide.icon
          )
        ) {
          slide.icon = "book";
        }

        /* ---------------------------------------------
           ACCENT COLOR
           --------------------------------------------- */

        const allowedColors = [
          "#7C3AED",
          "#2563EB",
          "#059669",
          "#DC2626",
          "#EA580C",
        ];

        if (
          !slide.accentColor ||
          !allowedColors.includes(
            slide.accentColor
          )
        ) {
          slide.accentColor =
            "#7C3AED";
        }
      }
    );

    /* =================================================
       CREATE PRESENTATION
       ================================================= */

    const presentation =
      await createPresentation(
        aiSlides,
        title
      );

    console.log(
      "Presentation created successfully."
    );

    /* =================================================
       RETURN
       ================================================= */

    return NextResponse.json(
      presentation
    );
  } catch (error: unknown) {
    console.error(
      "PPT ERROR:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : String(error);

    return NextResponse.json(
      {
        error: message,
      },
      {
        status: 500,
      }
    );
  }
}