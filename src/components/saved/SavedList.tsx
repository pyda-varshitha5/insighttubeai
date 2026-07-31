import { Atom, Code2, Braces, BrainCircuit } from "lucide-react";
import SavedCard from "./SavedCard";

const SAVED_ITEMS = [
  {
    id: 1,
    icon: Atom,
    iconGradient: "from-violet-100 to-violet-50",
    iconColor: "text-violet-600",
    title: "React Hooks Tutorial – Full Course for Beginners",
    description:
      "Comprehensive summary of React Hooks with examples and best practices.",
    readTime: "12 min read",
    date: "May 28, 2025",
    time: "10:45 AM",
  },
  {
    id: 2,
    icon: Code2,
    iconGradient: "from-blue-100 to-blue-50",
    iconColor: "text-blue-600",
    title: "Python Full Course – Learn Python in 4 Hours",
    description:
      "Complete Python crash course covering basics to advanced concepts.",
    readTime: "18 min read",
    date: "May 26, 2025",
    time: "08:30 PM",
  },
  {
    id: 3,
    icon: Braces,
    iconGradient: "from-yellow-100 to-yellow-50",
    iconColor: "text-yellow-600",
    title: "JavaScript Crash Course for Beginners",
    description:
      "Detailed overview of JavaScript fundamentals and key concepts.",
    readTime: "15 min read",
    date: "May 24, 2025",
    time: "06:15 PM",
  },
  {
    id: 4,
    icon: BrainCircuit,
    iconGradient: "from-indigo-100 to-indigo-50",
    iconColor: "text-indigo-600",
    title: "What is Artificial Intelligence? | Full Explanation",
    description:
      "In-depth explanation of AI, its types, applications, and future scope.",
    readTime: "10 min read",
    date: "May 22, 2025",
    time: "11:20 AM",
  },
];

export default function SavedList() {
  return (
    <div className="w-full rounded-2xl border border-slate-100 bg-white shadow-sm transition-all duration-200 hover:shadow-md">
      {SAVED_ITEMS.map((item, index) => (
        <SavedCard
          key={item.id}
          icon={item.icon}
          iconGradient={item.iconGradient}
          iconColor={item.iconColor}
          title={item.title}
          description={item.description}
          readTime={item.readTime}
          date={item.date}
          time={item.time}
          isLast={index === SAVED_ITEMS.length - 1}
        />
      ))}
    </div>
  );
}