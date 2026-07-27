import React, { useState, useEffect } from 'react';
import { ToolItem } from '../types';
import { Search, X, ChevronRight, Bookmark } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  allTools: ToolItem[];
  onSelectTool: (toolId: string) => void;
  favoriteIds: string[];
  toggleFavorite: (toolId: string) => void;
}

export const SearchModal: React.FC<Props> = ({
  isOpen,
  onClose,
  allTools,
  onSelectTool,
  favoriteIds,
  toggleFavorite,
}) => {
  const [query, setQuery] = useState<string>('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery('');
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredTools = allTools.filter((t) => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    return (
      t.name.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.keywords.some((k) => k.toLowerCase().includes(q))
    );
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-start justify-center pt-16 px-4">
      <div className="bg-[var(--bg-panel)] backdrop-blur-md rounded-2xl border border-[var(--border-panel)] shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Input Bar */}
        <div className="p-4 border-b border-[var(--border-panel)] flex items-center gap-3">
          <Search className="w-5 h-5 text-indigo-500 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search 50+ tools (e.g. mortgage, ti-84, bmi, tdee, paycheck, concrete)..."
            className="w-full text-sm font-semibold text-[var(--text-title)] bg-transparent focus:outline-none placeholder:text-[var(--text-muted)] placeholder:font-normal"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-[var(--text-muted)] hover:text-[var(--text-title)] p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-xs font-bold text-[var(--text-body)] hover:text-[var(--text-title)] bg-[var(--bg-well)] border border-[var(--border-panel)] px-2.5 py-1 rounded-lg"
          >
            ESC
          </button>
        </div>

        {/* Search Results List */}
        <div className="max-h-96 overflow-y-auto p-2 divide-y divide-[var(--border-panel)]">
          {filteredTools.length === 0 ? (
            <div className="p-8 text-center text-[var(--text-muted)] text-xs">
              No calculators found matching "<span className="font-bold text-[var(--text-title)]">{query}</span>".
            </div>
          ) : (
            filteredTools.map((tool) => {
              const isFav = favoriteIds.includes(tool.id);
              return (
                <div
                  key={tool.id}
                  className="p-3 hover:bg-[var(--bg-well)] rounded-xl flex items-center justify-between gap-3 cursor-pointer group transition"
                  onClick={() => {
                    onSelectTool(tool.id);
                    onClose();
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[var(--bg-well)] text-[var(--text-body)] border border-[var(--border-panel)] font-bold flex items-center justify-center shrink-0 group-hover:bg-indigo-500/20 group-hover:text-indigo-500 transition">
                      {tool.name.slice(0, 1)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[var(--text-title)] group-hover:text-indigo-500 transition">
                        {tool.name}
                      </h4>
                      <p className="text-xs text-[var(--text-muted)] line-clamp-1">{tool.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(tool.id);
                      }}
                      className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-amber-500 hover:bg-amber-500/10"
                      title="Bookmark Calculator"
                    >
                      <Bookmark
                        className={`w-4 h-4 ${
                          isFav ? 'text-amber-500 fill-amber-500' : ''
                        }`}
                      />
                    </button>
                    <ChevronRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--text-title)]" />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
