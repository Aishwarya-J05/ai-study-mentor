import { motion } from "framer-motion";
import { BookOpen, Cloud, FileText, MessageCircle, Clipboard, BarChart } from "lucide-react";
import type { ComponentType, SVGProps } from "react";

type Props = {
  title: string;
  description?: string;
  onClick?: () => void;
  emphasis?: boolean;
};

type IconComponent = ComponentType<SVGProps<SVGSVGElement> & { size?: number | string }>;

const iconMap: Record<string, IconComponent> = {
  Cloud,
  MessageCircle,
  FileText,
  BookOpen,
  Clipboard,
  BarChart,
};

export default function FeatureCard({ title, description, onClick, emphasis = false }: Props) {
  // pick icon by title heuristics:
  const key = title.toLowerCase().split(" ")[0];
  const keyName = key[0]?.toUpperCase() + key.slice(1);
  const Icon = iconMap[keyName] ?? Cloud;

  return (
    <motion.div
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.99 }}
      className={`cursor-pointer rounded-2xl p-6 backdrop-blur-md bg-white/4 border border-white/6 transition-shadow ${
        emphasis ? "shadow-[0_12px_40px_rgba(0,208,255,0.12)]" : "hover:shadow-lg"
      }`}
      role="button"
    >
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-lg ${emphasis ? "bg-gradient-to-br from-[#00d0ff]/25 to-[#8b00ff]/25" : "bg-white/6"}`}>
          <Icon className="text-white" size={22} />
        </div>
        <div>
          <div className="text-lg font-semibold">{title}</div>
          {description && <div className="text-sm text-slate-300 mt-1">{description}</div>}
        </div>
      </div>
    </motion.div>
  );
}
