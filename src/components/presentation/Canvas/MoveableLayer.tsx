"use client";

import Moveable from "react-moveable";
import { useEffect, useState } from "react";

interface Props {
  target: HTMLElement | null;

  x: number;
  y: number;

  width: number;
  height: number;

  rotation: number;

  onDrag: (x: number, y: number) => void;

  onResize: (
    width: number,
    height: number,
    x: number,
    y: number
  ) => void;

  onRotate: (rotation: number) => void;
}

export default function MoveableLayer({
  target,

  x,
  y,

  width,
  height,

  rotation,

  onDrag,

  onResize,

  onRotate,
}: Props) {

  const [frame, setFrame] = useState({
    translate: [x, y],
    rotate: rotation,
  });

  useEffect(() => {
    setFrame({
      translate: [x, y],
      rotate: rotation,
    });
  }, [x, y, rotation]);

  if (!target) return null;

  return (
    <Moveable
      target={target}

      draggable

      resizable

      rotatable

      snappable

      origin={false}

      keepRatio={false}

      throttleDrag={0}

      throttleResize={0}

      throttleRotate={0}

      renderDirections={[
        "nw",
        "n",
        "ne",
        "w",
        "e",
        "sw",
        "s",
        "se",
      ]}

      onDrag={({ target, beforeTranslate }) => {

        const [tx, ty] = beforeTranslate;

        setFrame((prev) => ({
          ...prev,
          translate: [tx, ty],
        }));

        target.style.transform = `
          translate(${tx}px, ${ty}px)
          rotate(${frame.rotate}deg)
        `;

        onDrag(tx, ty);
      }}

      onResize={({
        target,
        width,
        height,
        drag,
      }) => {

        const [tx, ty] =
          drag.beforeTranslate;

        target.style.width =
          `${width}px`;

        target.style.height =
          `${height}px`;

        target.style.transform = `
          translate(${tx}px, ${ty}px)
          rotate(${frame.rotate}deg)
        `;

        setFrame((prev)=>({

          ...prev,

          translate:[tx,ty]

        }));

        onResize(
          width,
          height,
          tx,
          ty
        );

      }}

      onRotate={({ target, beforeRotate }) => {

        target.style.transform = `
          translate(${frame.translate[0]}px,
          ${frame.translate[1]}px)
          rotate(${beforeRotate}deg)
        `;

        setFrame((prev)=>({

          ...prev,

          rotate:beforeRotate

        }));

        onRotate(beforeRotate);

      }}
    />
  );
}