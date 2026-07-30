import React, { useState, useEffect } from 'react';
import { TOOLS_LIST } from './data/toolsList';
import { BLOG_POSTS } from './data/blogPosts';
import { CategoryId } from './types';
import { Header as WorkspaceToolbar } from './components/Header';
import { SearchModal } from './components/SearchModal';
import { ToolCard } from './components/ToolCard';
import { SEOSection } from './components/SEOSection';
import { PopularCalculators } from './components/PopularCalculators';
import { useSEOMeta } from './hooks/useSEOMeta';
import { FinanceCalculators } from './components/calculators/FinanceCalculators';
import { HealthCalculators } from './components/calculators/HealthCalculators';
import { MathGraphingCalculators } from './components/calculators/MathGraphingCalculators';
import { TimeCalculators } from './components/calculators/TimeCalculators';
import { UnitCalculators } from './components/calculators/UnitCalculators';
import { Bookmark, ChevronRight, LayoutGrid, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [activeCategory, setActiveCategory] = useState<CategoryId | 'all'>('all');
  const [viewMode, setViewMode] = useState<'workspace' | 'grid'>('workspace');

  // Read initial tool from pathname or query parameter for clean URLs
  const [selectedToolId, setSelectedToolId] = useState<string>(() => {
    try {
      const pathname = window.location.pathname.toLowerCase().replace(/\/$/, '');
      if (pathname.startsWith('/calculators/')) {
        const toolId = pathname.replace('/calculators/', '');
        if (TOOLS_LIST.some((t) => t.id === toolId)) return toolId;
      } else if (pathname.length > 1) {
        const pathTool = pathname.replace('/', '');
        if (TOOLS_LIST.some((t) => t.id === pathTool)) return pathTool;
      }
      const params = new URLSearchParams(window.location.search);
      const toolParam = params.get('tool');
      if (toolParam && TOOLS_LIST.some((t) => t.id === toolParam)) {
        return toolParam;
      }
    } catch {
      // Fallback
    }
    return 'mortgage';
  });

  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('omni_fav_tools');
      return saved ? JSON.parse(saved) : ['mortgage', 'bmi', 'scientific-graphing'];
    } catch {
      return ['mortgage', 'bmi', 'scientific-graphing'];
    }
  });

  // Dynamically update document title, description, and canonical URL
  useSEOMeta(selectedToolId);

  // Sync selectedToolId with URL parameter for clean routes
  useEffect(() => {
    try {
      const targetPath = `/calculators/${selectedToolId}`;
      if (window.location.pathname !== targetPath) {
        window.history.replaceState({}, '', targetPath);
      }
    } catch {
      // URL manipulation restricted in sandboxes
    }
  }, [selectedToolId]);

  useEffect(() => {
    try {
      localStorage.setItem('omni_fav_tools', JSON.stringify(favoriteIds));
    } catch (e) {
      // Storage unavailable
    }
  }, [favoriteIds]);

  const toggleFavorite = (toolId: string) => {
    setFavoriteIds((prev) =>
      prev.includes(toolId) ? prev.filter((id) => id !== toolId) : [...prev, toolId]
    );
  };

  const activeTool = TOOLS_LIST.find((t) => t.id === selectedToolId) || TOOLS_LIST[0];

  const categoryFilteredTools = TOOLS_LIST.filter((t) => {
    if (activeCategory === 'all') return true;
    return t.category === activeCategory;
  });

  // Curated list of related calculators in the same category
  const relatedTools = TOOLS_LIST.filter(
    (t) => t.category === activeTool.category && t.id !== activeTool.id
  ).slice(0, 4);

  const handleSelectTool = (id: string) => {
    setSelectedToolId(id);
    setViewMode('workspace');
    const tool = TOOLS_LIST.find((t) => t.id === id);
    if (tool) {
      setActiveCategory(tool.category);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="w-full text-[var(--text-body)] font-sans flex flex-col justify-between selection:bg-indigo-600 selection:text-white transition-colors duration-300">
      <div>
        {/* Workspace Toolbar */}
        <WorkspaceToolbar
          activeCategory={activeCategory}
          setActiveCategory={(cat) => {
            setActiveCategory(cat);
            if (cat !== 'all') {
              const firstCatTool = TOOLS_LIST.find((t) => t.category === cat);
              if (firstCatTool) handleSelectTool(firstCatTool.id);
            }
          }}
          openSearchModal={() => setIsSearchOpen(true)}
          favoriteIds={favoriteIds}
          allTools={TOOLS_LIST}
          onSelectTool={(id) => handleSelectTool(id)}
          viewMode={viewMode}
          setViewMode={setViewMode}
        />

        {/* Search Modal */}
        <SearchModal
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
          allTools={TOOLS_LIST}
          onSelectTool={(id) => handleSelectTool(id)}
          favoriteIds={favoriteIds}
          toggleFavorite={toggleFavorite}
        />

        {/* Main Content Area */}
        <div className="space-y-6">
          {viewMode === 'workspace' ? (
            <>
              {/* Featured Most Popular Calculators Showcase */}
              <PopularCalculators
                activeToolId={activeTool.id}
                onSelectTool={handleSelectTool}
              />

              {/* Workspace Active Calculator Container */}
              <section id="active-calculator" className="space-y-6">
                {/* Active Tool Breadcrumb & Control Bar */}
                <div className="bg-[var(--bg-panel)] backdrop-blur-md rounded-2xl border border-[var(--border-panel)] p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-muted)]">
                    <span className="capitalize text-indigo-500 font-extrabold bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">
                      {activeTool.category}
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-[var(--text-muted)] opacity-50" />
                    <span className="text-[var(--text-title)] font-bold">{activeTool.name}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleFavorite(activeTool.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition ${
                        favoriteIds.includes(activeTool.id)
                          ? 'bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-3xs'
                          : 'bg-[var(--bg-well)] text-[var(--text-body)] border-[var(--border-panel)] hover:bg-[var(--bg-well)]/80'
                      }`}
                    >
                      <Bookmark
                        className={`w-3.5 h-3.5 ${
                          favoriteIds.includes(activeTool.id) ? 'text-amber-500 fill-amber-500' : ''
                        }`}
                      />
                      <span>{favoriteIds.includes(activeTool.id) ? 'Pinned' : 'Pin Tool'}</span>
                    </button>

                    <button
                      onClick={() => setViewMode('grid')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--border-panel)] bg-indigo-600 text-white hover:bg-indigo-500 text-xs font-bold transition shadow-xs"
                    >
                      <LayoutGrid className="w-3.5 h-3.5" />
                      <span>Browse Catalog</span>
                    </button>
                  </div>
                </div>

                {/* Active Tool Dynamic Two-Column Workspace (Omni Calculator Style) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  {/* Left Column: Interactive Calculator Widget (sticky on desktop) */}
                  <div className="lg:col-span-5 lg:sticky lg:top-20 space-y-6">
                    <div className="bg-[var(--bg-panel)] backdrop-blur-md rounded-3xl border border-[var(--border-panel)] shadow-xl p-4 sm:p-6 overflow-hidden">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={activeTool.id}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -12 }}
                          transition={{ duration: 0.2, ease: 'easeOut' }}
                        >
                          {activeTool.category === 'finance' && (
                            <FinanceCalculators subToolId={activeTool.id} />
                          )}
                          {activeTool.category === 'health' && (
                            <HealthCalculators subToolId={activeTool.id} />
                          )}
                          {activeTool.category === 'math' && (
                            <MathGraphingCalculators subToolId={activeTool.id} />
                          )}
                          {activeTool.category === 'time' && (
                            <TimeCalculators subToolId={activeTool.id} />
                          )}
                          {activeTool.category === 'unit' && (
                            <UnitCalculators subToolId={activeTool.id} />
                          )}
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Right Column: Rich Theoretical Content & Formula Guideline */}
                  <div className="lg:col-span-7">
                    <SEOSection toolId={selectedToolId} />
                  </div>
                </div>

                {/* Related Calculators Ribbon */}
                {relatedTools.length > 0 && (
                  <div className="pt-6 border-t border-[var(--border-panel)] space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-2">
                        <span>💡</span> Related Calculators in {activeTool.category}
                      </h3>
                      <button
                        onClick={() => setViewMode('grid')}
                        className="text-xs font-bold text-indigo-500 hover:text-indigo-600 flex items-center gap-1"
                      >
                        <span>View All {categoryFilteredTools.length} Tools</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      {relatedTools.map((tool) => (
                        <div
                          key={tool.id}
                          onClick={() => handleSelectTool(tool.id)}
                          className="p-3.5 rounded-xl border border-[var(--border-panel)] bg-[var(--bg-panel)] hover:bg-[var(--bg-well)] hover:border-indigo-500/30 transition cursor-pointer flex flex-col justify-between group shadow-3xs"
                        >
                          <div>
                            <h4 className="text-xs font-bold text-[var(--text-title)] group-hover:text-indigo-500 transition truncate">
                              {tool.name}
                            </h4>
                            <p className="text-[11px] text-[var(--text-muted)] line-clamp-2 mt-1">
                              {tool.description}
                            </p>
                          </div>
                          <div className="mt-2 text-[11px] font-bold text-indigo-500 flex items-center gap-1">
                            <span>Open Tool</span>
                            <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Featured Calculation Guides & Blog Articles Showcase */}
                <div className="pt-8 border-t border-[var(--border-panel)] space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-500 bg-indigo-500/10 px-2.5 py-0.5 rounded-md border border-indigo-500/20">
                        Knowledge Base & Guides
                      </span>
                      <h3 className="text-lg font-black text-[var(--text-title)] mt-1">
                        Featured Calculation Guides & Articles
                      </h3>
                    </div>

                    <button
                      onClick={() => {
                        window.location.href = '/blog';
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition"
                    >
                      <span>📚 Explore All Guides</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {BLOG_POSTS.slice(0, 4).map((post) => (
                      <motion.div
                        key={post.id}
                        whileHover={{ y: -3, transition: { duration: 0.15 } }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => {
                          window.location.href = `/blog/${post.slug}`;
                        }}
                        className="bg-[var(--bg-panel)] backdrop-blur-md rounded-2xl border border-[var(--border-panel)] hover:border-indigo-500/40 hover:shadow-lg hover:shadow-indigo-500/5 transition cursor-pointer overflow-hidden group flex flex-col justify-between"
                      >
                        <div>
                          <div className="h-32 overflow-hidden relative">
                            <img
                              src={post.featuredImage}
                              alt={post.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                            />
                            <span className="absolute top-2 left-2 bg-slate-900/90 text-white font-extrabold text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-md">
                              {post.category}
                            </span>
                          </div>

                          <div className="p-3.5 space-y-1.5">
                            <span className="text-[10px] text-[var(--text-muted)] font-semibold block">
                              {post.readTime} • {post.publishDate}
                            </span>
                            <h4 className="text-xs font-bold text-[var(--text-title)] group-hover:text-indigo-500 transition line-clamp-2 leading-snug">
                              {post.title}
                            </h4>
                            <p className="text-[11px] text-[var(--text-muted)] line-clamp-2 leading-normal">
                              {post.description}
                            </p>
                          </div>
                        </div>

                        <div className="p-3.5 pt-0">
                          <div className="pt-2 border-t border-[var(--border-panel)] flex items-center justify-between text-[11px] font-bold text-indigo-500">
                            <span>Read Guide</span>
                            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </section>
            </>
          ) : (
            /* Full Calculator Suite Catalog Grid View */
            <section className="space-y-4 animate-in fade-in duration-150">
              <div className="flex flex-wrap items-center justify-between gap-3 bg-[var(--bg-panel)] backdrop-blur-md p-4 rounded-2xl border border-[var(--border-panel)] shadow-2xs">
                <div>
                  <h3 className="text-lg font-bold text-[var(--text-title)]">
                    Explore Calculator Catalog ({categoryFilteredTools.length})
                  </h3>
                  <p className="text-xs text-[var(--text-muted)]">
                    Click any tool below to load it immediately in the workspace.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setViewMode('workspace')}
                    className="px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-xs hover:bg-indigo-500 transition flex items-center gap-1.5"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Return to Active Workspace</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryFilteredTools.map((tool) => (
                  <ToolCard
                    key={tool.id}
                    tool={tool}
                    isSelected={tool.id === selectedToolId}
                    onSelect={() => handleSelectTool(tool.id)}
                    isFavorite={favoriteIds.includes(tool.id)}
                    onToggleFavorite={(e) => {
                      e.stopPropagation();
                      toggleFavorite(tool.id);
                    }}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
