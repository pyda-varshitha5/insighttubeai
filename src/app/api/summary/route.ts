import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
});

export async function POST(req: NextRequest) {
  try {
    const { topic } = await req.json();

    if (!topic) {
      return NextResponse.json(
        { error: "Topic is required." },
        { status: 400 }
      );
    }

    const prompt = `
You are an expert technical educator.

Generate a COMPLETE study guide about:

"${topic}"

Return ONLY GitHub Markdown.

Rules:

- Never return JSON.
- Never wrap the response in markdown fences.
- Use proper Markdown headings.

Structure:

Return ONLY GitHub Markdown.

DO NOT generate the document title.

DO NOT generate:

# ${topic}

The page already displays the title.

Start immediately with:

## Introduction

Then continue with

## Overview

## Why it Matters

## Working

...

---

## Overview

Explain the topic from beginner to advanced.

---

## Why it Matters

---

## How it Works

Explain step-by-step using numbered lists.

---

## Core Concepts

Create a separate ### heading for EVERY important concept.

Example:

If topic is React Hooks cover:

- useState
- useEffect
- useMemo
- useCallback
- useRef
- useContext
- useReducer
- useLayoutEffect
- useImperativeHandle
- useTransition
- useDeferredValue
- useId
- useSyncExternalStore
- useInsertionEffect
- Custom Hooks
- Rules of Hooks

Each must have:

- Definition
- Why it exists
- Syntax
- Example
- Best practices

---

## Syntax

Use fenced code blocks.

---

## Examples

Provide at least 8 examples.

Each example must include:

### Example X

Explanation

\`\`\`javascript
code
\`\`\`

Output

Real-world use

---

## Best Practices

Checklist

---

## Common Mistakes

Wrong example

Correct example

Explanation

---

## Interview Questions

At least 20 questions with answers.

---

## Cheat Sheet

---

## FAQs

---

## Conclusion

Write beautiful documentation similar to ChatGPT, MDN and React Docs.

Return ONLY markdown.
`;

    const completion = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
      temperature: 0.3,
      max_tokens: 5000,
      messages: [
        {
          role: "system",
          content: `
You are a principal software engineer,
technical educator,
React expert,
system architect,
and documentation writer.

Write documentation identical in quality to:

- ChatGPT
- Gemini
- React Official Docs
- MDN
- Microsoft Learn

Always produce professional documentation.

Never shorten sections.

Never skip important concepts.

Always explain every topic in depth.

Output ONLY Markdown.
`,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const markdown = completion.choices[0]?.message?.content ?? "";
console.log("Markdown Length:", markdown.length);
console.log("Words:", markdown.split(/\s+/).length);
    return NextResponse.json({
      title: topic,
      subtitle: "AI Generated Study Guide",
      difficulty: "Beginner",
      lastUpdated: new Date().toLocaleDateString(),
      readingTime: Math.max(1, Math.ceil(markdown.split(/\s+/).length / 200)),
      markdown,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Failed to generate summary.",
      },
      {
        status: 500,
      }
    );
  }
}