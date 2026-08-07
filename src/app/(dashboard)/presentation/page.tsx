"use client";

import { useEffect } from "react";

import { usePresentationStore } from "@/store/presentationStore";

import Toolbar from "@/components/presentation/Toolbar/Toolbar";
import SlideSidebar from "@/components/presentation/Sidebar/SlideSidebar";
import PresentationCanvas from "@/components/presentation/Canvas/PresentationCanvas";
import PropertiesPanel from "@/components/presentation/Properties/PropertiesPanel";

export default function PresentationPage() {
  const setPresentation = usePresentationStore(
    (state) => state.setPresentation
  );

  useEffect(() => {
    const saved = sessionStorage.getItem(
      "generatedPresentation"
    );

    if (!saved) return;

    try {
      const presentation = JSON.parse(saved);

      setPresentation(presentation);

      console.log(
        "AI Presentation Loaded:",
        presentation
      );
    } catch (err) {
      console.error(
        "Failed to load presentation",
        err
      );
    }
  }, [setPresentation]);

 return (
  <div className="h-screen flex flex-col overflow-hidden bg-gray-100">

    {/* Top Toolbar */}
    <Toolbar />

    {/* Editor */}
    <div className="flex flex-1 overflow-hidden">

      {/* Left Sidebar */}
      <SlideSidebar />

      {/* Canvas */}
      <main className="flex-1 flex items-center justify-center overflow-hidden bg-gray-200">

        <PresentationCanvas />

      </main>

      {/* Right Properties */}
      {false && <PropertiesPanel />}

    </div>

  </div>
);
}