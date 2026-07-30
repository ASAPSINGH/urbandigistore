import React from 'react';
import { CategoryId, ToolItem } from '../types';
import { Search, Bookmark, LayoutGrid, Sliders } from 'lucide-react';
import { motion } from 'motion/react';

interface Props {
  activeCategory: CategoryId | 'all';
  setActiveCategory: (cat: CategoryId | 'all') => void;
  openSearchModal: () => void;
  favoriteIds: string[];
  allTools: ToolItem[];
  onSelectTool: (toolId: string) => void;
  viewMode: 'workspace' | 'grid';
  setViewMode: (mode: 'workspace' | 'grid') => void;
}

export const Header: React.FC<Props> = ({
  activeCategory,
  setActiveCategory,
  openSearchModal,
  favoriteIds,
  allTools,
  onSelectTool,
  viewMode,
  setViewMode,
}) => {
  const favoriteTools = allTools.filter((t) => favoriteIds.includes(t.id));

  const categories: { id: CategoryId | 'all'; name: string; icon: string; count: number }[] = [
    { id: 'all', name: 'All Calculators', icon: '⚡', count: allTools.length },
    { id: 'finance', name: 'Finance & Loans', icon: '💰', count: allTools.filter((t) => t.category === 'finance').length },
    { id: 'health', name: 'Health & Body', icon: '🏋️', count: allTools.filter((t) => t.category === 'health').length },
    { id: 'math', name: 'Math & Graphing', icon: '📐', count: allTools.filter((t) => t.category === 'math').length },
    { id: 'time', name: 'Time & Hours', icon: '⏱️', count: allTools.filter((t) => t.category === 'time').length },
    { id: 'unit', name: 'Unit & Materials', icon: '📦', count: allTools.filter((t) => t.category === 'unit').length },
    { id: 'biology', name: 'Biology', icon: '🧬', count: allTools.filter((t) => t.category === 'biology').length },
    { id: 'chemistry', name: 'Chemistry', icon: '🧪', count: allTools.filter((t) => t.category === 'chemistry').length },
    { id: 'physics', name: 'Physics', icon: '🌌', count: allTools.filter((t) => t.category === 'physics').length },
    { id: 'sports', name: 'Sports', icon: '🏃', count: allTools.filter((t) => t.category === 'sports').length },
    { id: 'everyday', name: 'Everyday Life', icon: '🗓️', count: allTools.filter((t) => t.category === 'everyday').length },
  ];

  return (
    <div className="bg-[var(--bg-panel)] backdrop-blur-md border border-[var(--border-panel)] rounded-3xl p-4 sm:p-5 space-y-4 shadow-xl mb-6">
      {/* Top Row: Search Box & View Switcher */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Trigger Input */}
        <div className="w-full md:flex-1">
          <motion.button
            whileTap={{ scale: 0.99 }}
            onClick={openSearchModal}
            className="w-full bg-[var(--bg-well)] hover:bg-[var(--bg-well)]/80 text-[var(--text-muted)] hover:text-[var(--text-title)] px-4 py-2.5 rounded-2xl text-xs font-semibold flex items-center justify-between transition border border-[var(--border-panel)] focus:ring-2 focus:ring-indigo-500/20 shadow-2xs"
          >
            <div className="flex items-center gap-2.5 truncate">
              <Search className="w-4 h-4 text-indigo-500 shrink-0" />
              <span className="truncate">Search 30+ calculators (mortgage, bmi, tax, algebra...)</span>
            </div>
            <kbd className="hidden sm:inline-block px-2.5 py-0.5 text-[9px] bg-[var(--bg-panel)] border border-[var(--border-panel)] rounded-lg text-[var(--text-muted)] font-mono shadow-2xs">
              ⌘K
            </kbd>
          </motion.button>
        </div>

        {/* Workspace / Catalog Toggles */}
        <div className="flex items-center gap-2 w-full md:w-auto shrink-0 justify-end">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setViewMode('workspace')}
            className={`flex-1 md:flex-initial px-4 py-2 rounded-xl text-xs font-extrabold transition flex items-center justify-center gap-1.5 shadow-2xs ${
              viewMode === 'workspace'
                ? 'bg-indigo-600 text-white'
                : 'bg-[var(--bg-well)] text-[var(--text-body)] hover:bg-[var(--bg-well)]/80'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Active Workspace</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setViewMode('grid')}
            className={`flex-1 md:flex-initial px-4 py-2 rounded-xl text-xs font-extrabold transition flex items-center justify-center gap-1.5 shadow-2xs ${
              viewMode === 'grid'
                ? 'bg-indigo-600 text-white'
                : 'bg-[var(--bg-well)] text-[var(--text-body)] hover:bg-[var(--bg-well)]/80'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Catalog Grid</span>
          </motion.button>
        </div>
      </div>

      {/* Favorite Pinned Pills Bar */}
      {favoriteTools.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto py-0.5 no-scrollbar text-xs">
          <span className="text-[10px] font-extrabold text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-1 shrink-0">
            <Bookmark className="w-3 h-3 text-amber-500 fill-amber-500" /> Pinned:
          </span>
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {favoriteTools.map((tool) => (
              <motion.button
                key={tool.id}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => {
                  setViewMode('workspace');
                  onSelectTool(tool.id);
                }}
                className="px-3 py-1 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-500 font-bold rounded-xl shrink-0 transition text-[11px] flex items-center gap-1 shadow-3xs"
              >
                <span>{tool.name}</span>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Divider */}
      <div className="h-px bg-[var(--border-well)]" />

      {/* Category Navigation Pills */}
      <nav className="flex items-center gap-1.5 overflow-x-auto pt-1 no-scrollbar text-xs font-bold">
        {categories.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <motion.button
              key={cat.id}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                setViewMode('workspace');
                setActiveCategory(cat.id);
              }}
              className={`relative px-3.5 py-2 rounded-xl shrink-0 transition flex items-center gap-1.5 text-xs ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                  : 'bg-[var(--bg-well)] hover:bg-[var(--bg-well)]/80 text-[var(--text-body)] border border-[var(--border-panel)]'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[9px] ${
                  isActive ? 'bg-indigo-800 text-indigo-200' : 'bg-[var(--bg-panel)] text-[var(--text-muted)]'
                }`}
              >
                {cat.count}
              </span>
            </motion.button>
          );
        })}

        <div className="h-4 w-px bg-[var(--border-well)] mx-1 shrink-0" />

        {/* Dedicated Blog & Guides Category Pill */}
        <motion.button
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => {
            window.location.href = '/blog';
          }}
          className="px-3.5 py-2 rounded-xl shrink-0 transition flex items-center gap-1.5 text-xs font-extrabold bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20 border border-indigo-500/20"
        >
          <span>📚</span>
          <span>Blog & Guides</span>
        </motion.button>
      </nav>
    </div>
  );
};
