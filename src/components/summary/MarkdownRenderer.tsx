"use client";

import { Children, cloneElement, isValidElement, ReactNode, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import CodeBlock from "./CodeBlock";
import Callout, { CalloutType } from "./Callout";
import MermaidDiagram from "./MermaidDiagram";
import { slugify } from "@/lib/markdown";

interface MarkdownRendererProps {
  markdown: string;
}

const ALERT_REGEX = /^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*\n?/i;

function extractPlainText(node: ReactNode): string {
  if (node === null || node === undefined || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(extractPlainText).join("");
  if (isValidElement<{ children?: ReactNode }>(node)) {
    return extractPlainText(node.props.children);
  }
  return "";
}

/** Removes the leading "[!NOTE]" style marker from the first text leaf of a node tree. */
function stripLeadingMarker(node: ReactNode, state: { done: boolean }): ReactNode {
  if (state.done) return node;

  if (typeof node === "string") {
    const match = node.match(ALERT_REGEX);
    if (match) {
      state.done = true;
      return node.slice(match[0].length);
    }
    return node;
  }

  if (Array.isArray(node)) {
    return Children.map(node, (child) => stripLeadingMarker(child, state));
  }

  if (isValidElement<{ children?: ReactNode }>(node)) {
    const nextChildren = stripLeadingMarker(node.props.children, state);
    return cloneElement(node, { ...node.props }, nextChildren);
  }

  return node;
}

export default function MarkdownRenderer({ markdown }: MarkdownRendererProps) {
  const slugMap = useMemo(() => new Map<string, number>(), [markdown]);

  const headingRenderer = (level: 1 | 2 | 3 | 4) => {
  return function Heading({
    children,
  }: {
    children?: ReactNode;
  }) {
    const text = extractPlainText(children);
    const id = slugify(text, slugMap);

    const classes = {
      1: "mt-2 mb-6 text-4xl font-bold tracking-tight text-slate-900",
      2: "mt-12 mb-5 border-b border-slate-200 pb-2 text-3xl font-bold text-slate-900",
      3: "mt-10 mb-3 text-2xl font-semibold text-slate-900",
      4: "mt-8 mb-2 text-xl font-semibold text-slate-900",
    };

    switch (level) {
      case 1:
        return (
          <h1 id={id} className={classes[1]}>
            {children}
          </h1>
        );

      case 2:
        return (
          <h2 id={id} className={classes[2]}>
            {children}
          </h2>
        );

      case 3:
        return (
          <h3 id={id} className={classes[3]}>
            {children}
          </h3>
        );

      default:
        return (
          <h4 id={id} className={classes[4]}>
            {children}
          </h4>
        );
    }
  };
};

  return (
    <>
      <style jsx global>{`
        .hljs { color: #c9d1d9; }
        .hljs-keyword, .hljs-selector-tag, .hljs-literal, .hljs-tag { color: #ff7b72; }
        .hljs-string, .hljs-title, .hljs-name, .hljs-attribute { color: #a5d6ff; }
        .hljs-comment, .hljs-quote { color: #8b949e; font-style: italic; }
        .hljs-number, .hljs-built_in, .hljs-symbol { color: #79c0ff; }
        .hljs-function, .hljs-title.function_ { color: #d2a8ff; }
        .hljs-variable, .hljs-template-variable { color: #ffa657; }
      `}</style>

      <div className="max-w-none text-[15.5px] leading-[1.75] text-gray-700">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight]}
          components={{
            h1: headingRenderer(1),
            h2: headingRenderer(2),
            h3: headingRenderer(3),
            h4: headingRenderer(4),
            p: ({ children }) => <p className="mb-4 leading-relaxed">{children}</p>,
            a: ({ href, children }) => (
              <a
                href={href}
                target={href?.startsWith("http") ? "_blank" : undefined}
                rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
                className="font-medium text-purple-600 underline decoration-purple-200 underline-offset-2 hover:decoration-purple-500"
              >
                {children}
              </a>
            ),
            ul: ({ children }) => (
              <ul className="mb-4 ml-1 list-disc space-y-1.5 pl-5 marker:text-purple-400">{children}</ul>
            ),
            ol: ({ children }) => (
              <ol className="mb-4 ml-1 list-decimal space-y-1.5 pl-5 marker:font-medium marker:text-purple-500">
                {children}
              </ol>
            ),
            li: ({ children, className }) => {
              const isTask = className?.includes("task-list-item");
              return (
                <li className={isTask ? "flex items-start gap-2 pl-0 [&::marker]:content-none" : ""}>
                  {children}
                </li>
              );
            },
            input: ({ checked }) => (
              <input
                type="checkbox"
                checked={!!checked}
                disabled
                readOnly
                className="mt-1.5 h-4 w-4 flex-shrink-0 rounded border-gray-300 text-purple-600 accent-purple-600"
              />
            ),
            strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
            hr: () => <hr className="my-10 border-gray-100" />,
            img: ({ src, alt }) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={src} alt={alt ?? ""} className="my-5 w-full rounded-xl border border-gray-100" />
            ),
            table: ({ children }) => (
              <div className="my-5 overflow-x-auto rounded-xl border border-gray-200">
                <table className="w-full min-w-[480px] border-collapse text-sm">{children}</table>
              </div>
            ),
            thead: ({ children }) => <thead className="bg-gray-50">{children}</thead>,
            th: ({ children }) => (
              <th className="border-b border-gray-200 px-4 py-2.5 text-left font-semibold text-gray-900">
                {children}
              </th>
            ),
            td: ({ children }) => (
              <td className="border-b border-gray-100 px-4 py-2.5 align-top text-gray-600">{children}</td>
            ),
            blockquote: ({ children }) => {
              const text = extractPlainText(children);
              const match = text.match(ALERT_REGEX);

              if (match) {
                const type = match[1].toLowerCase() as CalloutType;
                const state = { done: false };
                const stripped = stripLeadingMarker(children, state);
                return <Callout type={type}>{stripped}</Callout>;
              }

              return (
                <blockquote className="my-5 border-l-4 border-purple-200 bg-purple-50/40 py-2 pl-4 italic text-gray-600">
                  {children}
                </blockquote>
              );
            },
            code: ({ className, children, ...props }) => {
              const match = /language-(\w+)/.exec(className || "");
              const isInline = !match && !String(children).includes("\n");

              if (isInline) {
                return (
                  <code
                    className="rounded-md border border-gray-200 bg-gray-50 px-1.5 py-0.5 font-mono text-[13px] text-purple-700"
                    {...props}
                  >
                    {children}
                  </code>
                );
              }

              const language = match?.[1] ?? "text";

              if (language === "mermaid") {
                return <MermaidDiagram definition={String(children).replace(/\n$/, "")} />;
              }

              return <CodeBlock language={language}>{children}</CodeBlock>;
            },
            pre: ({ children }) => <>{children}</>,
          }}
        >
          {markdown}
        </ReactMarkdown>
      </div>
    </>
  );
}