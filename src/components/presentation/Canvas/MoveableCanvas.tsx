"use client";

import Moveable from "react-moveable";
import { useRef, useState } from "react";

interface Props {
  children: React.ReactNode;
}

export default function MoveableCanvas({
  children,
}: Props) {

  const targetRef = useRef<HTMLDivElement>(null);

  const [frame, setFrame] = useState({
    translate: [0, 0],
    rotate: 0,
  });

  return (
    <>
      <div
        ref={targetRef}
        className="relative w-full h-full"
      >
        {children}
      </div>

      <Moveable
        target={targetRef}

        draggable

        resizable

        rotatable

        scalable

        keepRatio={false}

        origin={false}

        throttleDrag={0}

        throttleResize={0}

        throttleRotate={0}

        onDrag={({ target, beforeTranslate }) => {

          frame.translate = beforeTranslate;

          target.style.transform =
            `translate(${beforeTranslate[0]}px,
                       ${beforeTranslate[1]}px)
             rotate(${frame.rotate}deg)`;
        }}

        onRotate={({ target, beforeRotate }) => {

          frame.rotate = beforeRotate;

          target.style.transform =
            `translate(${frame.translate[0]}px,
                       ${frame.translate[1]}px)
             rotate(${beforeRotate}deg)`;
        }}

        onResize={({ target, width, height, drag }) => {

          frame.translate = drag.beforeTranslate;

          target.style.width = `${width}px`;

          target.style.height = `${height}px`;

          target.style.transform =
            `translate(${frame.translate[0]}px,
                       ${frame.translate[1]}px)
             rotate(${frame.rotate}deg)`;
        }}
      />
    </>
  );
}