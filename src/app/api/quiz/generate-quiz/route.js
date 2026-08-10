import { GoogleGenAI } from "@google/genai";

// ======================================================
// GEMINI CLIENT
// Uses the SAME GEMINI_API_KEY from .env.local
// ======================================================

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_QUIZ_API_KEY,
});


// ======================================================
// POST - GENERATE QUIZ
// ======================================================

export async function POST(request) {
  try {

    // ==================================================
    // CHECK API KEY
    // ==================================================

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return Response.json(
        {
          success: false,
          message:
            "GEMINI_API_KEY is missing in .env.local",
        },
        {
          status: 500,
        }
      );
    }


    // ==================================================
    // READ REQUEST BODY
    // ==================================================

    const body = await request.json();


    // ==================================================
    // GET TOPIC
    // ==================================================

    const topic =
      typeof body?.topic === "string"
        ? body.topic.trim()
        : "";


    // ==================================================
    // VALIDATE TOPIC
    // ==================================================

    if (!topic) {
      return Response.json(
        {
          success: false,
          message: "Quiz topic is required.",
        },
        {
          status: 400,
        }
      );
    }


    console.log(
      "Generating quiz using Gemini:",
      topic
    );


    // ==================================================
    // GEMINI PROMPT
    // ==================================================

    const prompt = `
You are an expert educational quiz generator.

Create a quiz about:

"${topic}"

Generate EXACTLY 10 multiple-choice questions.

STRICT RULES:

1. Generate exactly 10 questions.
2. Every question must have exactly 4 options.
3. Only ONE option can be correct.
4. The "answer" must exactly match one of the four options.
5. Every question must be directly related to "${topic}".
6. Do not create unrelated questions.
7. Do not repeat questions.
8. Include a mixture of easy, medium, and slightly difficult questions.
9. Provide a short explanation for every correct answer.
10. Keep the questions suitable for students.
11. Return ONLY JSON.
12. Do not return Markdown.
13. Do not use code fences.
`;


    // ==================================================
    // JSON SCHEMA
    // ==================================================

    const responseSchema = {
      type: "object",

      properties: {
        questions: {
          type: "array",

          items: {
            type: "object",

            properties: {

              question: {
                type: "string",
              },

              options: {
                type: "array",

                items: {
                  type: "string",
                },
              },

              answer: {
                type: "string",
              },

              explanation: {
                type: "string",
              },

            },

            required: [
              "question",
              "options",
              "answer",
              "explanation",
            ],
          },
        },
      },

      required: [
        "questions",
      ],
    };


    // ==================================================
    // CALL GEMINI
    // ==================================================

    const response =
      await ai.models.generateContent({

      model: "gemini-2.5-flash",
        contents: prompt,

        config: {

          temperature: 0.5,

          maxOutputTokens: 6000,

          responseMimeType:
            "application/json",

          responseSchema,
        },

      });


    // ==================================================
    // GET GEMINI TEXT
    // ==================================================

    const content =
      response.text;


    if (
      typeof content !== "string" ||
      !content.trim()
    ) {

      console.error(
        "Gemini returned empty response."
      );

      throw new Error(
        "Gemini returned an empty response."
      );
    }


    console.log(
      "Gemini quiz response received."
    );


    // ==================================================
    // PARSE JSON
    // ==================================================

    let quizData;

    try {

      quizData =
        JSON.parse(content);

    } catch (error) {

      console.error(
        "Invalid JSON returned by Gemini:"
      );

      console.error(content);

      throw new Error(
        "Gemini returned invalid quiz JSON."
      );
    }


    // ==================================================
    // VALIDATE QUESTIONS
    // ==================================================

    if (
      !quizData ||
      !Array.isArray(
        quizData.questions
      )
    ) {

      throw new Error(
        "Gemini response does not contain a questions array."
      );
    }


    // ==================================================
    // CHECK QUESTION COUNT
    // ==================================================

    if (
      quizData.questions.length !== 10
    ) {

      throw new Error(
        `Expected 10 questions but received ${quizData.questions.length}.`
      );
    }


    // ==================================================
    // VALIDATE EACH QUESTION
    // ==================================================

    for (
      let i = 0;
      i < quizData.questions.length;
      i++
    ) {

      const question =
        quizData.questions[i];


      // ----------------------------------------------
      // QUESTION TEXT
      // ----------------------------------------------

      if (
        !question ||
        typeof question.question !==
          "string" ||
        !question.question.trim()
      ) {

        throw new Error(
          `Question ${i + 1} has no question text.`
        );
      }


      // ----------------------------------------------
      // OPTIONS
      // ----------------------------------------------

      if (
        !Array.isArray(
          question.options
        ) ||
        question.options.length !== 4
      ) {

        throw new Error(
          `Question ${i + 1} must have exactly 4 options.`
        );
      }


      // ----------------------------------------------
      // CHECK OPTIONS
      // ----------------------------------------------

      for (
        let j = 0;
        j < question.options.length;
        j++
      ) {

        if (
          typeof question.options[j] !==
            "string" ||
          !question.options[j].trim()
        ) {

          throw new Error(
            `Question ${i + 1} contains an invalid option.`
          );
        }
      }


      // ----------------------------------------------
      // CORRECT ANSWER
      // ----------------------------------------------

      if (
        typeof question.answer !==
          "string" ||
        !question.answer.trim()
      ) {

        throw new Error(
          `Question ${i + 1} has no correct answer.`
        );
      }


      // ----------------------------------------------
      // ANSWER MUST MATCH OPTION
      // ----------------------------------------------

      if (
        !question.options.includes(
          question.answer
        )
      ) {

        throw new Error(
          `Question ${i + 1} has an invalid correct answer.`
        );
      }


      // ----------------------------------------------
      // EXPLANATION
      // ----------------------------------------------

      if (
        typeof question.explanation !==
          "string" ||
        !question.explanation.trim()
      ) {

        question.explanation =
          "No explanation was provided.";
      }

    }


    // ==================================================
    // SUCCESS
    // ==================================================

    return Response.json(
      {
        success: true,

        topic,

        questions:
          quizData.questions,
      },
      {
        status: 200,
      }
    );


  } catch (error) {

    // ==================================================
    // ERROR HANDLING
    // ==================================================

    console.error(
      "GEMINI QUIZ API ERROR:",
      error
    );


    let message =
      "Failed to generate quiz.";


    if (
      error instanceof Error
    ) {

      message =
        error.message;
    }


    return Response.json(
      {
        success: false,
        message,
      },
      {
        status: 500,
      }
    );
  }
}