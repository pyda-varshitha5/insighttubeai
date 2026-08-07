"use client";

import {
  Type,
  ImageIcon,
  Square,
  Trash2,
  Lock,
  Unlock,
} from "lucide-react";

import { usePresentation } from "@/hooks/usePresentation";

export default function PropertiesPanel() {
  const {
    selectedElement,
    updateElement,
    deleteElement,
  } = usePresentation();

  if (!selectedElement) {
    return (
      <div className="w-80 border-l bg-white flex items-center justify-center">
        <div className="text-center">
          <Type className="mx-auto mb-3 text-gray-300" size={42} />
          <p className="text-gray-500">
            Select an element
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Text, image or shape
          </p>
        </div>
      </div>
    );
  }

  const update = (field: string, value: any) => {
    updateElement(selectedElement.id, {
      [field]: value,
    });
  };

  return (
    <div className="w-80 border-l bg-white overflow-y-auto">

      {/* Header */}

      <div className="border-b px-5 py-4">

        <h2 className="font-semibold text-lg">
          Properties
        </h2>

      </div>

      <div className="p-5 space-y-6">

        {/* Position */}

        <div>

          <h3 className="font-medium mb-3">
            Position
          </h3>

          <div className="grid grid-cols-2 gap-3">

            <input
              type="number"
              value={selectedElement.x}
              onChange={(e)=>
                update("x",Number(e.target.value))
              }
              className="border rounded-lg p-2"
            />

            <input
              type="number"
              value={selectedElement.y}
              onChange={(e)=>
                update("y",Number(e.target.value))
              }
              className="border rounded-lg p-2"
            />

          </div>

        </div>

        {/* Size */}

        <div>

          <h3 className="font-medium mb-3">
            Size
          </h3>

          <div className="grid grid-cols-2 gap-3">

            <input
              type="number"
              value={selectedElement.width}
              onChange={(e)=>
                update("width",Number(e.target.value))
              }
              className="border rounded-lg p-2"
            />

            <input
              type="number"
              value={selectedElement.height}
              onChange={(e)=>
                update("height",Number(e.target.value))
              }
              className="border rounded-lg p-2"
            />

          </div>

        </div>

        {/* Rotation */}

        <div>

          <h3 className="font-medium mb-2">

            Rotation

          </h3>

          <input
            type="range"
            min={0}
            max={360}
            value={selectedElement.rotation}
            onChange={(e)=>
              update(
                "rotation",
                Number(e.target.value)
              )
            }
            className="w-full"
          />

        </div>

        {/* Opacity */}

        <div>

          <h3 className="font-medium mb-2">

            Opacity

          </h3>

          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={selectedElement.opacity}
            onChange={(e)=>
              update(
                "opacity",
                Number(e.target.value)
              )
            }
            className="w-full"
          />

        </div>

        {/* Text */}

        {selectedElement.type==="text" && (

          <>

            <div>

              <h3 className="font-medium mb-3">

                Text

              </h3>

              <textarea
                rows={5}
                value={selectedElement.text}
                onChange={(e)=>
                  update("text",e.target.value)
                }
                className="w-full border rounded-lg p-3"
              />

            </div>

            <div>

              <label className="text-sm">

                Font Size

              </label>

              <input
                type="number"
                value={selectedElement.fontSize}
                onChange={(e)=>
                  update(
                    "fontSize",
                    Number(e.target.value)
                  )
                }
                className="border rounded-lg p-2 mt-2 w-full"
              />

            </div>

            <div>

              <label className="text-sm">

                Text Color

              </label>

              <input
                type="color"
                value={selectedElement.color}
                onChange={(e)=>
                  update("color",e.target.value)
                }
                className="mt-2 w-full h-12"
              />

            </div>

          </>

        )}

        {/* Shape */}

        {selectedElement.type==="shape" && (

          <div>

            <label>

              Fill Color

            </label>

            <input
              type="color"
              value={selectedElement.fill}
              onChange={(e)=>
                update("fill",e.target.value)
              }
              className="mt-2 w-full h-12"
            />

          </div>

        )}

        {/* Image */}

        {selectedElement.type==="image" && (

          <div className="space-y-3">

            <button className="w-full border rounded-lg py-2 flex items-center justify-center gap-2">

              <ImageIcon size={18}/>

              Replace Image

            </button>

          </div>

        )}

        {/* Lock */}

        <button
          onClick={()=>
            update(
              "locked",
              !selectedElement.locked
            )
          }
          className="w-full border rounded-lg py-3 flex items-center justify-center gap-2"
        >

          {selectedElement.locked
            ? <Lock size={18}/>
            : <Unlock size={18}/>
          }

          {selectedElement.locked
            ? "Unlock"
            : "Lock"
          }

        </button>

        {/* Delete */}

        <button
          onClick={()=>
            deleteElement(selectedElement.id)
          }
          className="w-full bg-red-600 hover:bg-red-700 text-white rounded-lg py-3 flex items-center justify-center gap-2"
        >

          <Trash2 size={18}/>

          Delete Element

        </button>

      </div>

    </div>
  );
}