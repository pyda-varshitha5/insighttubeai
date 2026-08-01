"use client";

import { useEffect, useId, useRef, useState } from "react";

interface MermaidDiagramProps {
  definition: string;
}

export default function MermaidDiagram({
  definition,
}: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState("");

  const reactId = useId();
  const diagramId = `diagram-${reactId.replace(/:/g, "")}`;

  useEffect(() => {
    let mounted = true;

    async function renderDiagram() {
      try {
        setError("");

        const mermaid = (await import("mermaid")).default;

        mermaid.initialize({
          startOnLoad: false,
          theme: "default",
          securityLevel: "loose",
        });

        const { svg } = await mermaid.render(
          diagramId,
          definition
        );

        if (mounted && containerRef.current) {
          containerRef.current.innerHTML = svg;
        }
      } catch (err) {
        console.error(err);

        if (mounted) {
          setError("Unable to render Mermaid diagram.");
        }
      }
    }

    renderDiagram();

    return () => {
      mounted = false;
    };
  }, [definition, diagramId]);

  if (error) {
    return (
      <div className="my-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="my-8 overflow-x-auto rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div ref={containerRef} />
    </div>
  );
}