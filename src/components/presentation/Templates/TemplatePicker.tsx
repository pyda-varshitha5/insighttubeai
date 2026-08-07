"use client";

import { Check } from "lucide-react";
import {
  PRESENTATION_TEMPLATES,
  applyTemplate,
} from "@/lib/templateLoader";
import { usePresentation } from "@/hooks/usePresentation";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function TemplatePicker({
  open,
  onClose,
}: Props) {
  const {
    presentation,
    setPresentation,
  } = usePresentation();

  if (!open) return null;

  const handleSelect = (id: string) => {
    const updated = applyTemplate(
      presentation,
      id
    );

    setPresentation(updated);

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">

      <div className="bg-white rounded-2xl shadow-xl w-[900px] max-h-[80vh] overflow-auto">

        <div className="flex justify-between items-center p-6 border-b">

          <h2 className="text-2xl font-bold">
            Choose Template
          </h2>

          <button
            onClick={onClose}
            className="text-gray-500 hover:text-black text-2xl"
          >
            ×
          </button>

        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 p-6">

          {PRESENTATION_TEMPLATES.map((template) => (

            <button
              key={template.id}
              onClick={() => handleSelect(template.id)}
              className="group border rounded-xl overflow-hidden hover:shadow-xl transition text-left"
            >

              {/* Preview */}

              <div
                className="h-44"
                style={{
                  background: template.backgroundColor,
                }}
              >

                <div
                  className="h-full flex flex-col justify-center items-center"
                >

                  <div
                    className="text-2xl font-bold"
                    style={{
                      color: template.primaryColor,
                      fontFamily:
                        template.fontFamily,
                    }}
                  >
                    Title
                  </div>

                  <div
                    className="mt-4 w-32 h-2 rounded-full"
                    style={{
                      background:
                        template.primaryColor,
                    }}
                  />

                  <div
                    className="mt-2 w-24 h-2 rounded-full opacity-50"
                    style={{
                      background:
                        template.primaryColor,
                    }}
                  />

                </div>

              </div>

              {/* Info */}

              <div className="p-4">

                <div className="flex justify-between">

                  <div>

                    <h3 className="font-semibold">

                      {template.name}

                    </h3>

                    <p className="text-sm text-gray-500 mt-1">

                      {template.description}

                    </p>

                  </div>

                  {presentation.theme ===
                    template.theme && (

                    <Check
                      className="text-green-600"
                      size={20}
                    />

                  )}

                </div>

              </div>

            </button>

          ))}

        </div>

      </div>

    </div>
  );
}