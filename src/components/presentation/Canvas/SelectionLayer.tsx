"use client";

import Selecto from "react-selecto";
import { useState } from "react";

interface Props {
  container: HTMLElement | null;
  onSelectionChange?: (targets: HTMLElement[]) => void;
}

export default function SelectionLayer({
  container,
  onSelectionChange,
}: Props) {
  const [selectedTargets, setSelectedTargets] = useState<HTMLElement[]>([]);

  if (!container) return null;

  return (
    <Selecto
      dragContainer={container}
      selectableTargets={[".canvas-element"]}
      hitRate={0}
      selectByClick={true}
      selectFromInside={true}
      continueSelect={true}
      toggleContinueSelect={["shift"]}
      ratio={0}
      onSelect={(e) => {
        const targets = e.selected as HTMLElement[];

        setSelectedTargets(targets);

        onSelectionChange?.(targets);
      }}
      onSelectEnd={(e) => {
        const targets = e.selected as HTMLElement[];

        setSelectedTargets(targets);

        onSelectionChange?.(targets);
      }}
    />
  );
}