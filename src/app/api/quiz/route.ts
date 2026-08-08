import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

export async function POST(req: NextRequest) {
  try {
    const { topic } = await req.json();

    if (!topic || typeof topic !== "string" || !topic.trim()) {
      return NextResponse.json(
        { error: "Topic is required" },
        { status: 400 }
      );
    }

    const cleanTopic = topic.trim();

    const prompt = `
You are an expert college-level quiz creator.

Create a quiz about:

"${cleanTopic}"

The quiz must test the learner's actual understanding of the topic.

Generate EXACTLY 10 multiple-choice questions.

Each question must have:

- question
- exactly 4 options
- correctAnswer
- explanation

The correctAnswer must be the LETTER of the correct option:
A, B, C, or D.

Requirements:

1. Questions must be directly related to "${cleanTopic}".
2. Do not generate unrelated questions.
3. Questions should range from basic to intermediate difficulty.
4. Avoid duplicate questions.
5. Avoid duplicate options.
6. Only ONE option must be correct.
7. Explanations must clearly explain why the answer is correct.
8. Use simple English.
9. Make the quiz useful for college students.
10. Do not include markdown.
11. Return ONLY valid JSON.

Use this exact structure:

{
  "topic": "${cleanTopic}",
  "questions": [
    {
      "id": 1,
      "question": "Question text",
      "options": {
        "A": "Option A",
        "B": "Option B",
        "C": "Option C",
        "D": "Option D"
      },
      "correctAnswer": "A",
      "explanation": "Clear explanation of why option A is correct."
    }
  ]
}

IMPORTANT:

- Exactly 10 questions.
- Every question must have exactly 4 options.
- correctAnswer must be A, B, C, or D.
- Do not reveal the correct answer anywhere except correctAnswer.
- Do not add any fields.
- Return ONLY JSON.
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

    const quiz = JSON.parse(cleaned);

    if (
      !quiz.questions ||
      !Array.isArray(quiz.questions) ||
      quiz.questions.length !== 10
    ) {
      throw new Error("Gemini did not return exactly 10 questions.");
    }

    return NextResponse.json(quiz);
  } catch (error: any) {
    console.error("QUIZ GENERATION ERROR:", error);

    return NextResponse.json(
      {
        error: error?.message || "Failed to generate quiz",
      },
      { status: 500 }
    );
  }
}