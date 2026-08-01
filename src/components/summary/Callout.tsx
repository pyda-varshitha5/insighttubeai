import { ReactNode } from "react";

export type CalloutType = "note" | "tip" | "important" | "warning" | "caution";

interface CalloutProps {
  type: CalloutType;
  children: ReactNode;
}

const CONFIG: Record<
  CalloutType,
  { label: string; border: string; bg: string; text: string; icon: ReactNode }
> = {
  note: {
    label: "Note",
    border: "border-blue-200",
    bg: "bg-blue-50",
    text: "text-blue-800",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    ),
  },
  tip: {
    label: "Tip",
    border: "border-purple-200",
    bg: "bg-purple-50",
    text: "text-purple-800",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
      />
    ),
  },
  important: {
    label: "Important",
    border: "border-indigo-200",
    bg: "bg-indigo-50",
    text: "text-indigo-800",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    ),
  },
  warning: {
    label: "Warning",
    border: "border-amber-200",
    bg: "bg-amber-50",
    text: "text-amber-800",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
      />
    ),
  },
  caution: {
    label: "Caution",
    border: "border-rose-200",
    bg: "bg-rose-50",
    text: "text-rose-800",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    ),
  },
};

export default function Callout({ type, children }: CalloutProps) {
  const config = CONFIG[type];

  return (
    <div className={`my-5 rounded-xl border ${config.border} ${config.bg} px-4 py-3.5`}>
      <div className={`mb-1.5 flex items-center gap-2 text-sm font-semibold ${config.text}`}>
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          {config.icon}
        </svg>
        {config.label}
      </div>
      <div className={`text-sm leading-relaxed ${config.text} opacity-90 [&>p]:m-0`}>{children}</div>
    </div>
  );
}