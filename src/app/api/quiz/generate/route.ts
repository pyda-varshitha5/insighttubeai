import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

export async function POST(req: NextRequest) {
  try {
    const { topic, summary } = await req.json();

    if (!topic || typeof topic !== "string") {
      return NextResponse.json(
        {
          error: "Topic is required.",
        },
        { status: 400 }
      );
    }

    if (!summary || typeof summary !== "string") {
      return NextResponse.json(
        {
          error: "Summary is required.",
        },
        { status: 400 }
      );
    }

    const prompt = `
You are an expert college-level quiz creator.

Create a quiz based ONLY on the study material provided below.

TOPIC:
${topic}

STUDY MATERIAL:
${summary}

IMPORTANT:
The questions MUST be based on the study material above.

Do not create questions about information that is not present
in the study material.

Generate EXACTLY 10 multiple-choice questions.

The quiz should test whether the student understood the
generated AI summary.

Difficulty distribution:
- Questions 1-3: Beginner
- Questions 4-7: Intermediate
- Questions 8-10: Advanced

Every question must have exactly 4 options.

Only ONE option can be correct.

Each question must contain:

- id
- question
- options
- correctAnswer
- explanation
- difficulty

The correctAnswer must be exactly one of:

A
B
C
D

The explanation should clearly explain why the selected answer
is correct using the study material.

Rules:

- Do not repeat questions.
- Do not repeat the same question in different wording.
- Do not create trick questions.
- Do not create ambiguous questions.
- Do not create questions unrelated to the study material.
- Keep questions concise.
- Keep options concise.
- Use simple English.
- Do not use markdown.
- Do not use code fences.
- Return ONLY valid JSON.

Return exactly this structure:

{
  "topic": "${topic}",
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
      "explanation": "Explanation of why A is correct.",
      "difficulty": "Beginner"
    }
  ]
}

IMPORTANT:

Exactly 10 questions.
Exactly 4 options for every question.
Exactly one correct answer.
No additional fields.
No markdown.
Return JSON only.
`;

    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const text = result.text;

    if (!text) {
      throw new Error("Gemini returned an empty response.");
    }

    let cleaned = text.trim();

    if (cleaned.startsWith("```json")) {
      cleaned = cleaned.replace(/^```json\s*/i, "");
    }

    if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```\s*/i, "");
    }

    if (cleaned.endsWith("```")) {
      cleaned = cleaned.replace(/\s*```$/i, "");
    }

    cleaned = cleaned.trim();

    let quiz;

    try {
      quiz = JSON.parse(cleaned);
    } catch (parseError) {
      console.error("Gemini returned invalid JSON:");
      console.error(cleaned);

      throw new Error(
        "Gemini returned an invalid quiz response. Please try again."
      );
    }

    if (
      !quiz.questions ||
      !Array.isArray(quiz.questions)
    ) {
      throw new Error(
        "Invalid quiz response: questions are missing."
      );
    }

    if (quiz.questions.length !== 10) {
      throw new Error(
        `Gemini generated ${quiz.questions.length} questions instead of 10.`
      );
    }

    for (const question of quiz.questions) {
      if (
        !question.question ||
        !question.options ||
        !question.correctAnswer ||
        !question.explanation
      ) {
        throw new Error(
          "One or more generated questions are incomplete."
        );
      }

      const optionKeys = ["A", "B", "C", "D"];

      for (const key of optionKeys) {
        if (!question.options[key]) {
          throw new Error(
            "Every question must contain four options."
          );
        }
      }

      if (!optionKeys.includes(question.correctAnswer)) {
        throw new Error(
          "Invalid correct answer returned by Gemini."
        );
      }
    }

    return NextResponse.json({
      topic,
      questions: quiz.questions,
    });
  } catch (error: unknown) {
  console.error("QUIZ GENERATION ERROR:", error);

  const errorMessage =
    error instanceof Error
      ? error.message
      : "Failed to generate quiz.";

  return NextResponse.json(
    {
      error: errorMessage,
    },
    {
      status: 500,
    }
  );
}
}