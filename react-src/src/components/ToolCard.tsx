import React from 'react';
import { ToolItem } from '../types';
import { Bookmark, ArrowUpRight } from 'lucide-react';
import { motion } from 'motion/react';

interface Props {
  tool: ToolItem;
  isSelected: boolean;
  onSelect: () => void;
  isFavorite: boolean;
  onToggleFavorite: (e: React.MouseEvent) => void;
}

export const ToolCard: React.FC<Props> = ({
  tool,
  isSelected,
  onSelect,
  isFavorite,
  onToggleFavorite,
}) => {
  const categoryBadgeMap = {
    finance: { bg: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20', label: 'Finance' },
    health: { bg: 'bg-sky-500/10 text-sky-500 border-sky-500/20', label: 'Health' },
    math: { bg: 'bg-violet-500/10 text-violet-500 border-violet-500/20', label: 'Math' },
    time: { bg: 'bg-amber-500/10 text-amber-500 border-amber-500/20', label: 'Time' },
    unit: { bg: 'bg-blue-500/10 text-blue-500 border-blue-500/20', label: 'Units' },
  };

  const badge = categoryBadgeMap[tool.category];

  return (
    <motion.div
      whileHover={{ y: -3, transition: { duration: 0.15 } }}
      whileTap={{ scale: 0.98 }}
      onClick={onSelect}
      className={`p-5 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between group relative overflow-hidden ${
        isSelected
          ? 'bg-black/30 border-indigo-600 text-white shadow-md ring-2 ring-indigo-500/40'
          : 'bg-[var(--bg-panel)] border-[var(--border-panel)] hover:border-indigo-500/40 hover:shadow-lg hover:shadow-indigo-500/5'
      }`}
    >
      {/* Accent gradient line on hover */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-sky-500 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <span
            className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-md border ${
              isSelected ? 'bg-slate-800 text-indigo-400 border-slate-700' : badge.bg
            }`}
          >
            {badge.label}
          </span>

          <motion.button
            whileTap={{ scale: 0.8 }}
            onClick={onToggleFavorite}
            className={`p-1 rounded-lg transition ${
              isSelected
                ? 'text-slate-500 hover:text-amber-400'
                : 'text-[var(--text-muted)] hover:text-amber-500 hover:bg-amber-500/10'
            }`}
            title="Pin Tool"
          >
            <Bookmark
              className={`w-4 h-4 ${
                isFavorite ? 'text-amber-500 fill-amber-500' : ''
              }`}
            />
          </motion.button>
        </div>

        <h3
          className={`text-sm font-extrabold tracking-tight mb-1 transition ${
            isSelected ? 'text-white' : 'text-[var(--text-title)] group-hover:text-indigo-500'
          }`}
        >
          {tool.name}
        </h3>

        <p
          className={`text-xs line-clamp-2 leading-relaxed ${
            isSelected ? 'text-slate-300' : 'text-[var(--text-muted)]'
          }`}
        >
          {tool.description}
        </p>
      </div>

      <div
        className={`pt-3 mt-3 border-t flex items-center justify-between text-xs font-bold ${
          isSelected
            ? 'border-slate-800 text-indigo-400'
            : 'border-[var(--border-panel)] text-[var(--text-body)] group-hover:text-indigo-500'
        }`}
      >
        <span>Launch Tool</span>
        <ArrowUpRight className="w-3.5 h-3.5 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </div>
    </motion.div>
  );
};
