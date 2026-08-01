"use client";

import { Copy, Check } from "lucide-react";
import { useState } from "react";

interface Example {
  title: string;
  explanation: string;
  language: string;
  code: string;
  output?: string;
}

export default function ExampleCard({
  example,
}: {
  example: Example;
}) {
  const [copied, setCopied] = useState(false);

  async function copyCode() {
    if (!example.code) return;

    await navigator.clipboard.writeText(example.code);

    setCopied(true);

    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="mb-8 overflow-hidden rounded-2xl border border-slate-200 bg-white">

      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-3">

        <div>
          <h3 className="font-semibold text-slate-900">
            {example.title}
          </h3>

          <p className="text-sm text-slate-500">
            {example.language}
          </p>
        </div>

        {example.code && (
          <button
            onClick={copyCode}
            className="flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm hover:bg-slate-100"
          >
            {copied ? (
              <>
                <Check size={16} />
                Copied
              </>
            ) : (
              <>
                <Copy size={16} />
                Copy Code
              </>
            )}
          </button>
        )}
      </div>

      <div className="p-5">

        <p className="mb-5 leading-7 text-slate-700">
          {example.explanation}
        </p>

        {example.code && (
          <pre className="overflow-x-auto rounded-xl bg-slate-950 p-5 text-sm text-green-400">
            <code>{example.code}</code>
          </pre>
        )}

        {example.output && (
          <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <h4 className="mb-2 font-semibold text-emerald-700">
              Output
            </h4>

            <pre>{example.output}</pre>
          </div>
        )}

      </div>
    </div>
  );
}