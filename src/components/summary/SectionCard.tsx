import { ReactNode } from "react";

interface SectionCardProps {
  title: string;
  children: ReactNode;
  className?: string;
}

export default function SectionCard({
  title,
  children,
  className = "",
}: SectionCardProps) {
  return (
    <section className={`py-10 ${className}`}>
      {/* Heading */}
      <h2 className="text-3xl font-bold tracking-tight text-slate-900">
        {title}
      </h2>

      {/* Divider */}
      <div className="mt-4 mb-8 h-px w-full bg-slate-200" />

      {/* Content */}
      <div className="prose prose-lg max-w-none text-slate-700 leading-8">
        {children}
      </div>
    </section>
  );
}