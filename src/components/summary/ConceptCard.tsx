import { CoreConcept } from "@/types/summary";

interface ConceptCardProps {
  concept: CoreConcept;
}

export default function ConceptCard({ concept }: ConceptCardProps) {
  return (
    <div className="rounded-xl border border-gray-100 bg-purple-50/40 p-5 transition-colors hover:border-purple-200 hover:bg-purple-50">
      <h3 className="mb-2 text-base font-semibold text-gray-900">{concept.title}</h3>
      <p className="text-sm leading-relaxed text-gray-600">{concept.description}</p>
    </div>
  );
}