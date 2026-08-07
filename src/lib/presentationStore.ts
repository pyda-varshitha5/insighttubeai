import { Presentation } from "@/types/presentation";

const KEY = "presentation";

export function savePresentation(presentation: Presentation) {
  if (typeof window === "undefined") return;

  localStorage.setItem(KEY, JSON.stringify(presentation));
}

export function getPresentation(): Presentation | null {
  if (typeof window === "undefined") return null;

  const data = localStorage.getItem(KEY);

  if (!data) return null;

  return JSON.parse(data);
}

export function clearPresentation() {
  if (typeof window === "undefined") return;

  localStorage.removeItem(KEY);
}

export function updatePresentation(
  updater: (presentation: Presentation) => Presentation
) {
  const current = getPresentation();

  if (!current) return;

  const updated = updater(current);

  savePresentation(updated);
}