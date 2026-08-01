"use client";

interface ActionButtonsProps {
  onExportPdf?: () => void;
  onShare?: () => void;
  onSave?: () => void;
  onGeneratePpt?: () => void;
}

export default function ActionButtons({
  onExportPdf,
  onShare,
  onSave,
  onGeneratePpt,
}: ActionButtonsProps) {
  const buttons = [
    { label: "Export PDF", onClick: onExportPdf, variant: "outline" as const },
    { label: "Share", onClick: onShare, variant: "outline" as const },
    { label: "Save", onClick: onSave, variant: "outline" as const },
    { label: "Generate PPT", onClick: onGeneratePpt, variant: "solid" as const },
  ];

  return (
    <div className="flex flex-wrap items-center gap-3">
      {buttons.map((btn) => (
        <button
          key={btn.label}
          type="button"
          onClick={btn.onClick}
          className={
            btn.variant === "solid"
              ? "rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-purple-700"
              : "rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:border-purple-200 hover:bg-purple-50 hover:text-purple-700"
          }
        >
          {btn.label}
        </button>
      ))}
    </div>
  );
}