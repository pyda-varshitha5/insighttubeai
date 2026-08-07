"use client";
import ShapePicker from "../Shapes/ShapePicker";
import { useState } from "react";
import TemplatePicker from "../Templates/TemplatePicker";
import {
  Type,
  Image,
  Square,
  Palette,
  Download,
  Undo2,
  Redo2,
  Play,
  Copy,
  Trash2,
  Layers,
} from "lucide-react";

import { usePresentation } from "@/hooks/usePresentation";

interface ToolbarButtonProps {
  icon: React.ReactNode;
  title: string;
  onClick?: () => void;
  variant?: "default" | "primary";
}

function ToolbarButton({
  icon,
  title,
  onClick,
  variant = "default",
}: ToolbarButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-2
        px-3 py-2
        rounded-lg
        transition
        border
        text-sm

        ${
          variant === "primary"
            ? "bg-violet-600 text-white border-violet-600 hover:bg-violet-700"
            : "bg-white hover:bg-gray-100 border-gray-200"
        }
      `}
    >
      {icon}
      <span>{title}</span>
    </button>
  );
}

export default function Toolbar() {
  const {
    addText,
    addShape,
    addImage,
    deleteElement,
    selectedElementId,
} = usePresentation();
      const [showTemplates, setShowTemplates] = useState(false);
const [showShapes, setShowShapes] = useState(false);

  const uploadImage = () => {
    const input = document.createElement("input");

    input.type = "file";

    input.accept = "image/*";

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];

      if (!file) return;

      const reader = new FileReader();

      reader.onload = () => {
        if (reader.result) {
          // TODO:
          // connect with addImage(reader.result as string)
         addImage(reader.result as string);
        }
      };

      reader.readAsDataURL(file);
    };

    input.click();
  };

  return (
    <div className="h-16 bg-white border-b flex items-center justify-between px-5">

      {/* Left */}

      <div className="flex gap-2">

        <ToolbarButton
          icon={<Undo2 size={18} />}
          title="Undo"
        />

        <ToolbarButton
          icon={<Redo2 size={18} />}
          title="Redo"
        />

      </div>

      {/* Center */}

      <div className="flex gap-2">

        <ToolbarButton
          icon={<Type size={18} />}
          title="Text"
          onClick={addText}
        />

       <ToolbarButton
    icon={<Image size={18}/>}
    title="Image"
    onClick={uploadImage}
/>

       <ToolbarButton
  icon={<Square size={18} />}
  title="Shape"
  onClick={() => setShowShapes(true)}
/>

      <ToolbarButton
    icon={<Layers size={18} />}
    title="Templates"
    onClick={() => setShowTemplates(true)}
/>

      </div>

      {/* Right */}

      <div className="flex gap-2">

        <ToolbarButton
          icon={<Copy size={18} />}
          title="Duplicate"
        />

        <ToolbarButton
          icon={<Trash2 size={18} />}
          title="Delete"
          onClick={() => {
            if (selectedElementId) {
              deleteElement(selectedElementId);
            }
          }}
        />

        <ToolbarButton
          icon={<Play size={18} />}
          title="Present"
        />

        <ToolbarButton
          icon={<Download size={18} />}
          title="Export"
          variant="primary"
        />
       

      </div>
 <TemplatePicker
    open={showTemplates}
    onClose={() => setShowTemplates(false)}
/>
<ShapePicker
  open={showShapes}
  onClose={() => setShowShapes(false)}
  onSelect={(shape) => {
    addShape(shape);
  }}
/>
    </div>
    
  );
}