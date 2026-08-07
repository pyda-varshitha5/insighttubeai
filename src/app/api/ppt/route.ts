import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { getSlideElements } from "@/lib/presentationLayouts";
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});
async function getImage(query: string) {
  try {
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
        query
      )}&per_page=1&orientation=landscape`,
      {
        headers: {
          Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`,
        },
      }
    );

    const data = await res.json();

    return (
      data.results?.[0]?.urls?.regular ||
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee"
    );
  } catch {
    return "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee";
  }
}
async function createPresentation(aiData: any, topic: string) {
  return {
    id: crypto.randomUUID(),
    title: topic,
    theme: "modern",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),

    slides: await Promise.all(
      aiData.slides.map(async (slide: any) => {
        const imageUrl = await getImage(
          slide.imagePrompt || slide.title || topic
        );

        return {
          id: crypto.randomUUID(),

          title: slide.title,

          background: {
            type: "color",
            value: "#ffffff",
          },

          elements: getSlideElements(slide, imageUrl),
        };
      })
    ),
  };
}
export async function POST(req: NextRequest) {
  try {
    const { title, markdown } = await req.json();

 const prompt = `
You are Gamma AI's senior presentation designer and content writer.

Create a PREMIUM presentation that looks like it was designed by Gamma AI.

Topic:
"${title}"

Use ONLY the study material below as the source.

Study Material:
${markdown}

==========================
GOAL
==========================

Generate a professional, visually balanced, highly informative presentation.

Each slide must contain meaningful explanations while remaining suitable for presentation design.

The presentation must flow naturally from beginning to end.

Never repeat the same information.

Each slide should teach something new.

==========================
SLIDES
==========================

Generate EXACTLY 10 slides.

Slide 1
Layout: hero-cover

- title
- subtitle
- imagePrompt

No body.
No highlights.

--------------------------------

Slide 2
Layout: introduction

- title
- subtitle
- body
- highlights
- imagePrompt

--------------------------------

Slide 3
Layout: overview

- title
- subtitle
- body
- highlights
- imagePrompt

--------------------------------

Slide 4
Layout: image-right

- title
- subtitle
- body
- highlights
- imagePrompt

--------------------------------

Slide 5
Layout: image-left

- title
- subtitle
- body
- highlights
- imagePrompt

--------------------------------

Slide 6
Layout: two-column

- title
- subtitle
- body
- highlights
- imagePrompt

--------------------------------

Slide 7
Layout: statistics

- title
- subtitle
- body
- highlights
- imagePrompt

--------------------------------

Slide 8
Layout: timeline

- title
- subtitle
- body
- highlights
- imagePrompt

--------------------------------

Slide 9
Layout: applications

- title
- subtitle
- body
- highlights
- imagePrompt

--------------------------------

Slide 10
Layout: conclusion

- title
- subtitle
- body
- highlights
- imagePrompt

==========================
BODY RULES
==========================

Each slide MUST contain:

title

subtitle

Rules:
- Maximum 8 words.
- Must fit on ONE line.
- Maximum 50 characters.

body

Write ONE short paragraph.

Maximum 30 words.

Exactly 2 sentences.

highlights

Exactly 3 bullet points.

Each bullet:
- 3–5 words only.
- Never a complete sentence.

Example:

Fast search

Easy insertion

Low memory usage

imagePrompt

layout

icon

accentColor

==========================
BODY
==========================

The "body" should:

• Explain the concept clearly.
• Be educational.
• Be suitable for college students.
• Be written in simple English.
• Be exactly ONE paragraph.
• Contain between 55 and 75 words.
• Never exceed 75 words.
• Never use bullet points.
• Never repeat the title.
• Never start with "This slide..."
• Never include numbering.

==========================
HIGHLIGHTS
==========================

Provide EXACTLY 3 highlights.

Each highlight must:

• Be less than 8 words.
• Be unique.
• Represent the most important takeaway.
• Never repeat the body.

Example:

[
"Constant time lookup",
"Memory efficient",
"Supports recursion"
]

==========================
IMAGES
==========================

For every slide generate an imagePrompt.

The prompt should describe ONE high-quality illustration.

Use prompts suitable for Unsplash.

Examples:

"modern software architecture visualization"

"computer memory blocks"

"artificial intelligence neural network"

"cloud infrastructure"

"developer coding workstation"

"cyber security shield"

Do NOT include text inside imagePrompt.

==========================
LAYOUTS
==========================

Allowed layouts ONLY:

Create exactly 10 slides.

Slide 1:
layout = hero-cover

Slides 2-10:
layout = content

Each content slide must contain:

- title
- body (maximum 70 words)
- highlights (exactly 3 bullet points)
- imagePrompt

Do NOT generate subtitles.
Do NOT generate icons.
Do NOT generate accent colors.
Use concise professional language.

==========================
ICONS
==========================

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

==========================
ACCENT COLOR
==========================

Choose ONE accent color per slide.

Examples:

#7C3AED
#2563EB
#059669
#DC2626
#EA580C

==========================
IMPORTANT
==========================

The presentation should feel like a professionally designed Gamma AI presentation.

Content must be concise enough to fit inside the slide layout without overlapping.

Do NOT produce long paragraphs.

Do NOT produce essays.

Do NOT repeat information across slides.

==========================
OUTPUT
==========================

Return ONLY valid JSON.

No markdown.

No explanation.
IMPORTANT PRESENTATION RULES

Create clean, professional slides like Gamma AI.

Each slide must contain:

- title (maximum 8 words)
- subtitle (maximum 10 words)
- body (40–60 words only)
- highlights (exactly 3 bullet points)

Rules:

- Never write long paragraphs.
- Never exceed 60 words in body.
- Every bullet must contain less than 7 words.
- Never repeat the same information.
- Use only the most important points.
- Keep plenty of empty space on every slide.
- Generate only presentation-ready content.
- Use a different relevant image for every slide.
- Body and highlights must fit comfortably on one slide.
{
  "slides": [
    {
      "title": "Short slide title",
      "subtitle": "Short supporting subtitle",
      "body": "A concise 40 to 60 word explanation containing only the most important information about this slide.",
      "highlights": [
        "Important point one",
        "Important point two",
        "Important point three"
      ],
      "imagePrompt": "specific relevant educational image for this exact slide topic",
      "icon": "book",
      "layout": "introduction",
      "accentColor": "#7C3AED"
    }
  ]
}
  IMPORTANT

The presentation is displayed on a fixed-size slide.

Keep every slide clean and readable.

Never generate:
- long titles
- long subtitles
- long paragraphs
- more than 3 bullets

Summarize instead of writing extra text.
`;

    const result = await ai.models.generateContent({
      model: "models/gemini-flash-latest",
      contents: prompt,
    });

    const text = result.text;

    if (!text) {
      throw new Error("Gemini returned an empty response.");
    }

    const cleaned = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const aiSlides = JSON.parse(cleaned);
    console.log(JSON.stringify(aiSlides, null, 2));
   

const presentation = await createPresentation(aiSlides, title);

return NextResponse.json(presentation);
 } catch (error: any) {
  console.error("PPT ERROR:", error);

  return NextResponse.json(
    {
      error: error?.message || String(error),
      stack: error?.stack,
    },
    { status: 500 }
  );
}
}