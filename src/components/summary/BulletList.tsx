interface BulletListProps {
  items: string[];
  variant?: "default" | "positive" | "negative";
}

const variantStyles: Record<NonNullable<BulletListProps["variant"]>, string> = {
  default: "bg-purple-500",
  positive: "bg-emerald-500",
  negative: "bg-rose-500",
};

export default function BulletList({ items, variant = "default" }: BulletListProps) {
  if (!items || items.length === 0) {
    return <p className="text-sm text-gray-400">No items available.</p>;
  }

  return (
    <ul className="space-y-3">
      {items.map((item, index) => (
        <li key={index} className="flex items-start gap-3">
          <span
            className={`mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full ${variantStyles[variant]}`}
          />
          <span className="text-[15px] leading-relaxed text-gray-600">{item}</span>
        </li>
      ))}
    </ul>
  );
}