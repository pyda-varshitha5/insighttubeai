export interface DocMeta {
  title: string;
  subtitle: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  lastUpdated: string;
}

export interface ParsedDocument {
  meta: DocMeta;
  body: string;
}

export interface Heading {
  id: string;
  text: string;
  level: 2 | 3;
}

export interface InterviewItem {
  level: "Beginner" | "Intermediate" | "Advanced" | "General";
  question: string;
  answer: string;
}

/**
 * Turns arbitrary heading text into a URL-safe, stable slug.
 * Duplicate headings get a numeric suffix so anchor links never collide.
 */
export function slugify(text: string, seen?: Map<string, number>): string {
  const base = text
    .toLowerCase()
    .trim()
    .replace(/[`*_~[\]()]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  if (!seen) return base || "section";

  const count = seen.get(base) ?? 0;
  seen.set(base, count + 1);
  return count === 0 ? base || "section" : `${base}-${count}`;
}

/**
 * Splits a raw AI response into a metadata frontmatter block and the
 * markdown body. Frontmatter is a simple `key: value` block wrapped in
 * `---` lines at the very top of the document. Falls back to sane
 * defaults if the model did not include one.
 */
export function parseFrontmatter(raw: string, fallbackTitle: string): ParsedDocument {
  const trimmed = raw.trim();
  const frontmatterMatch = trimmed.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/);

  const defaults: DocMeta = {
    title: fallbackTitle,
    subtitle: "Generated using AI",
    difficulty: "Intermediate",
    lastUpdated: new Date().toISOString(),
  };

  if (!frontmatterMatch) {
    return { meta: defaults, body: trimmed };
  }

  const [, frontmatterBlock, body] = frontmatterMatch;
  const meta: DocMeta = { ...defaults };

  frontmatterBlock.split("\n").forEach((line) => {
    const separatorIndex = line.indexOf(":");
    if (separatorIndex === -1) return;

    const key = line.slice(0, separatorIndex).trim().toLowerCase();
    const value = line.slice(separatorIndex + 1).trim();
    if (!value) return;

    if (key === "title") meta.title = value;
    if (key === "subtitle") meta.subtitle = value;
    if (key === "lastupdated" || key === "last_updated") meta.lastUpdated = value;
    if (key === "difficulty") {
      const normalized = value.toLowerCase();
      if (normalized.startsWith("beg")) meta.difficulty = "Beginner";
      else if (normalized.startsWith("adv")) meta.difficulty = "Advanced";
      else meta.difficulty = "Intermediate";
    }
  });

  return { meta, body: body.trim() };
}

/** Extracts h2/h3 headings (excluding code fences) for the table of contents. */
export function extractHeadings(markdown: string): Heading[] {
  const lines = markdown.split("\n");
  const headings: Heading[] = [];
  const seen = new Map<string, number>();
  let insideCodeFence = false;

  for (const line of lines) {
    if (line.trim().startsWith("```")) {
      insideCodeFence = !insideCodeFence;
      continue;
    }
    if (insideCodeFence) continue;

    const match = line.match(/^(#{2,3})\s+(.*)$/);
    if (!match) continue;

    const level = match[1].length as 2 | 3;
    const text = match[2].replace(/[`*_~]/g, "").trim();
    headings.push({ id: slugify(text, seen), text, level });
  }

  return headings;
}

/** ~200 words per minute, rounded up to the nearest minute (minimum 1). */
export function estimateReadingTime(markdown: string): number {
  const wordCount = markdown
    .replace(/```[\s\S]*?```/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.ceil(wordCount / 200));
}

/**
 * Pulls the "Interview Questions" section out of the document and parses
 * its `### Q...` subheadings into structured question/answer pairs so it
 * can be rendered as a collapsible accordion instead of raw markdown.
 */
export function parseInterviewQuestions(markdown: string): InterviewItem[] {
  const sectionMatch = markdown.match(
    /^##\s+Interview Questions\s*\n([\s\S]*?)(?=\n##\s+|$)/m
  );
  if (!sectionMatch) return [];

  const sectionBody = sectionMatch[1];
  const parts = sectionBody.split(/\n(?=###\s+)/g).filter((part) => part.trim().startsWith("###"));

  return parts.map((part) => {
    const lines = part.split("\n");
    const heading = lines[0].replace(/^###\s+/, "").trim();
    const answer = lines.slice(1).join("\n").trim();

    let level: InterviewItem["level"] = "General";
    const lower = heading.toLowerCase();
    if (lower.includes("beginner")) level = "Beginner";
    else if (lower.includes("intermediate")) level = "Intermediate";
    else if (lower.includes("advanced")) level = "Advanced";

    const question = heading.replace(/^(Q\d+\.?\s*)/i, "").trim();

    return { level, question, answer };
  });
}

/** Removes the Interview Questions section from the body so it isn't rendered twice. */
export function stripInterviewSection(markdown: string): string {
  return markdown.replace(/^##\s+Interview Questions\s*\n[\s\S]*?(?=\n##\s+|$)/m, "");
}