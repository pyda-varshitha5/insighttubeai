"use client";

import { ReactNode, isValidElement } from "react";
import CopyButton from "./CopyButton";

interface CodeBlockProps {
  language: string;
  children: ReactNode;
}

/** Walks the highlighted React tree produced by rehype-highlight and flattens it back to plain text. */
function extractText(node: ReactNode): string {
  if (node === null || node === undefined || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (isValidElement<{ children?: ReactNode }>(node)) {
    return extractText(node.props.children);
  }
  return "";
}

export default function CodeBlock({ language, children }: CodeBlockProps) {
  const displayLanguage = language || "text";

  return (
    <div className="my-5 overflow-hidden rounded-xl border border-gray-200 bg-[#0d1117] shadow-sm">
      <div className="flex items-center justify-between border-b border-white/10 bg-white/5 px-4 py-2">
        <span className="font-mono text-xs font-medium uppercase tracking-wide text-gray-400">
          {displayLanguage}
        </span>
        <CopyButton
          getText={() => extractText(children)}
          className="text-gray-400 hover:text-white"
        />
      </div>
      <pre className="overflow-x-auto p-4 text-[13px] leading-relaxed">
        <code className={`hljs language-${displayLanguage}`}>{children}</code>
      </pre>
    </div>
  );
}