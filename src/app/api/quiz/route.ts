import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_QUIZ_API_KEY || ""
);

export async function POST(request: Request) {
  try {
    // =========================================
    // CHECK GEMINI API KEY
    // =========================================

    const apiKey = process.env.GEMINI_QUIZ_API_KEY;

    if (!apiKey) {
      return Response.json(
        {
          success: false,
          message:
            "GEMINI_QUIZ_API_KEY is missing in .env.local",
        },
        { status: 500 }
      );
    }

    // =========================================
    // GET REQUEST BODY
    // =========================================

    const body = await request.json();

    const topic =
      typeof body?.topic === "string"
        ? body.topic.trim()
        : "";

    if (!topic) {
      return Response.json(
        {
          success: false,
          message: "Quiz topic is required.",
        },
        { status: 400 }
      );
    }

    console.log(
      "Generating Gemini quiz for topic:",
      topic
    );

    // =========================================
    // GEMINI MODEL
    // =========================================

   const model = genAI.getGenerativeModel({
 model: "gemini-3.1-flash-lite",
});

    // =========================================
    // QUIZ PROMPT
    // =========================================

    const prompt = `
You are an expert educational quiz generator.

Create a quiz about "${topic}".

Generate exactly 10 multiple-choice questions.

STRICT RULES:

1. Generate exactly 10 questions.
2. Every question must have exactly 4 options.
3. Only one option must be correct.
4. The answer must exactly match one of the 4 options.
5. Every question must be directly related to "${topic}".
6. Use a mixture of easy, medium, and slightly difficult questions.
7. Do not repeat questions.
8. Do not create unrelated questions.
9. Give a short explanation for every answer.
10. Return ONLY valid JSON.
11. Do not use markdown.
12. Do not use code fences.

Return this exact JSON structure:

{
  "questions": [
    {
      "question": "Question text",
      "options": [
        "Option 1",
        "Option 2",
        "Option 3",
        "Option 4"
      ],
      "answer": "Correct option",
      "explanation": "Short explanation"
    }
  ]
}
`;

    // =========================================
    // CALL GEMINI
    // =========================================

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.5,
        responseMimeType: "application/json",
      },
    });

    // =========================================
    // GET GEMINI RESPONSE
    // =========================================

    const response = result.response;

    const content = response.text();

    if (!content) {
      throw new Error(
        "Gemini returned an empty response."
      );
    }

    console.log(
      "Gemini quiz response received successfully."
    );

    // =========================================
    // CLEAN RESPONSE
    // =========================================

    let cleanedContent = content.trim();

    if (cleanedContent.startsWith("```json")) {
      cleanedContent = cleanedContent.replace(
        /^```json\s*/i,
        ""
      );

      cleanedContent = cleanedContent.replace(
        /\s*```$/i,
        ""
      );
    } else if (cleanedContent.startsWith("```")) {
      cleanedContent = cleanedContent.replace(
        /^```\s*/i,
        ""
      );

      cleanedContent = cleanedContent.replace(
        /\s*```$/i,
        ""
      );
    }

    // =========================================
    // PARSE JSON
    // =========================================

    let quizData: {
      questions?: Array<{
        question?: string;
        options?: string[];
        answer?: string;
        explanation?: string;
      }>;
    };

    try {
      quizData = JSON.parse(cleanedContent);
    } catch (error) {
      console.error(
        "Invalid JSON from Gemini:",
        cleanedContent
      );

      throw new Error(
        "Gemini returned invalid quiz JSON."
      );
    }

    // =========================================
    // VALIDATE QUESTIONS
    // =========================================

    if (
      !quizData.questions ||
      !Array.isArray(quizData.questions)
    ) {
      throw new Error(
        "Gemini response does not contain questions."
      );
    }

    if (quizData.questions.length !== 10) {
      throw new Error(
        `Expected 10 questions but received ${quizData.questions.length}.`
      );
    }

    // =========================================
    // VALIDATE EACH QUESTION
    // =========================================

    for (
      let i = 0;
      i < quizData.questions.length;
      i++
    ) {
      const question =
        quizData.questions[i];

      if (
        !question.question ||
        typeof question.question !== "string"
      ) {
        throw new Error(
          `Question ${i + 1} has no question text.`
        );
      }

      if (
        !Array.isArray(question.options) ||
        question.options.length !== 4
      ) {
        throw new Error(
          `Question ${i + 1} must have exactly 4 options.`
        );
      }

      if (
        question.options.some(
          (option) =>
            typeof option !== "string" ||
            !option.trim()
        )
      ) {
        throw new Error(
          `Question ${i + 1} contains an invalid option.`
        );
      }

      if (
        !question.answer ||
        typeof question.answer !== "string"
      ) {
        throw new Error(
          `Question ${i + 1} has no correct answer.`
        );
      }

      if (
        !question.options.includes(
          question.answer
        )
      ) {
        throw new Error(
          `Question ${i + 1} has an invalid correct answer.`
        );
      }

      if (
        !question.explanation ||
        typeof question.explanation !== "string"
      ) {
        question.explanation =
          "No explanation was provided.";
      }
    }

    // =========================================
    // RETURN QUIZ
    // =========================================

    return Response.json({
      success: true,
      topic,
      questions: quizData.questions,
    });
  } catch (error: unknown) {
    console.error(
      "QUIZ API ERROR:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Failed to generate quiz.";

    return Response.json(
      {
        success: false,
        message,
      },
      { status: 500 }
    );
  }
}