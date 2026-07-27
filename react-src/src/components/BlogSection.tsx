import React, { useState, useEffect } from 'react';
import { BLOG_POSTS, BlogPost } from '../data/blogPosts';
import { TOOLS_LIST } from '../data/toolsList';
import { BookOpen, Clock, User, ArrowRight, ChevronLeft, Sparkles, CheckCircle2, HelpCircle, ChevronDown, Calculator, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  onSelectTool: (toolId: string) => void;
  selectedArticleId?: string | null;
  onSelectArticle: (articleId: string | null) => void;
}

function parseInlineFormatting(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      const boldText = part.slice(2, -2);
      return (
        <strong key={i} className="font-bold text-slate-900">
          {boldText}
        </strong>
      );
    }
    return part;
  });
}

const RichTextContent: React.FC<{ content: string }> = ({ content }) => {
  const blocks = content.split(/\n+/).map((b) => b.trim()).filter(Boolean);

  return (
    <div className="space-y-3 text-slate-700 leading-relaxed text-sm">
      {blocks.map((block, idx) => {
        const cleanBlock = block.replace(/\*/g, '').trim();
        const isFormula =
          /^(A\s*=\s*P|BMR\s*=|TDEE\s*=|PITI\s*=|Δ\s*=|°F\s*=|Depreciation\s*Fee:|Finance\s*Fee:|Sales\s*Tax:|\(1\s*\+\s*r\/n\))/i.test(
            cleanBlock
          ) ||
          block.includes('^(nt)') ||
          (cleanBlock.includes('=') && (cleanBlock.includes('×') || cleanBlock.includes('÷') || cleanBlock.includes('+') || cleanBlock.includes('-')) && (cleanBlock.includes('BMR') || cleanBlock.includes('P') || cleanBlock.includes('A')));

        if (isFormula) {
          const cleanFormula = block.replace(/\*\*/g, '').trim();
          return (
            <div
              key={idx}
              className="my-3 p-4 rounded-xl bg-slate-900 text-white border border-emerald-500/40 font-mono text-sm shadow-md flex flex-col gap-1.5"
            >
              <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-emerald-400 font-sans">
                <Sparkles className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                <span>Formula / Math Equation</span>
              </div>
              <div className="text-emerald-300 font-bold tracking-wide text-base leading-snug font-mono overflow-x-auto">
                {cleanFormula}
              </div>
            </div>
          );
        }

        const isUnorderedList = /^[-*]\s+/.test(block);
        const isOrderedList = /^\d+\.\s+/.test(block);

        if (isUnorderedList) {
          const itemText = block.replace(/^[-*]\s+/, '');
          return (
            <div key={idx} className="flex items-start gap-2.5 my-1.5 pl-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0 mt-2" />
              <div className="text-slate-700 text-sm leading-relaxed">
                {parseInlineFormatting(itemText)}
              </div>
            </div>
          );
        }

        if (isOrderedList) {
          const match = block.match(/^(\d+)\.\s+(.*)$/);
          if (match) {
            const num = match[1];
            const itemText = match[2];
            return (
              <div key={idx} className="flex items-start gap-3 my-2 pl-1">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  {num}
                </span>
                <div className="text-slate-700 text-sm leading-relaxed">
                  {parseInlineFormatting(itemText)}
                </div>
              </div>
            );
          }
        }

        return (
          <p key={idx} className="text-slate-700 text-sm leading-relaxed">
            {parseInlineFormatting(block)}
          </p>
        );
      })}
    </div>
  );
};

export const BlogSection: React.FC<Props> = ({
  onSelectTool,
  selectedArticleId,
  onSelectArticle,
}) => {
  const [activeBlogCategory, setActiveBlogCategory] = useState<string>('all');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [copied, setCopied] = useState<boolean>(false);

  const activeArticle = BLOG_POSTS.find((p) => p.id === selectedArticleId);

  // Dynamic JSON-LD Article Schema for Google & AI Search Indexing
  useEffect(() => {
    const existingScript = document.getElementById('dynamic-article-jsonld');
    if (existingScript) existingScript.remove();

    if (activeArticle) {
      const articleSchema = {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: activeArticle.title,
        description: activeArticle.description,
        author: {
          '@type': 'Organization',
          name: activeArticle.author,
        },
        datePublished: '2026-07-24',
        image: activeArticle.featuredImage,
        publisher: {
          '@type': 'Organization',
          name: 'UrbanDigiStore',
          logo: {
            '@type': 'ImageObject',
            url: 'https://urbandigistore.com/og-image.png',
          },
        },
        mainEntityOfPage: `https://urbandigistore.com/blog/${activeArticle.slug || activeArticle.id}`,
      };

      const script = document.createElement('script');
      script.id = 'dynamic-article-jsonld';
      script.type = 'application/ld+json';
      script.innerHTML = JSON.stringify(articleSchema);
      document.head.appendChild(script);
    }

    return () => {
      const scriptToRemove = document.getElementById('dynamic-article-jsonld');
      if (scriptToRemove) scriptToRemove.remove();
    };
  }, [activeArticle]);

  const filteredPosts = BLOG_POSTS.filter((post) => {
    if (activeBlogCategory === 'all') return true;
    return post.category === activeBlogCategory;
  });

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // --- 1. FULL ARTICLE VIEW ---
  if (activeArticle) {
    const relatedTools = TOOLS_LIST.filter((t) =>
      activeArticle.relatedToolIds.includes(t.id)
    );

    return (
      <article className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-200">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={() => onSelectArticle(null)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Articles List
          </button>

          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition"
          >
            <Share2 className="w-3.5 h-3.5" />
            {copied ? 'Link Copied!' : 'Share Article'}
          </button>
        </div>

        {/* Hero Metadata Header */}
        <header className="space-y-4">
          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-emerald-700">
            <span className="px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-full font-bold uppercase tracking-wider">
              {activeArticle.category} Guide
            </span>
            <span className="flex items-center gap-1 text-slate-500">
              <Clock className="w-3.5 h-3.5 text-slate-400" /> {activeArticle.readTime}
            </span>
            <span className="flex items-center gap-1 text-slate-500">
              <User className="w-3.5 h-3.5 text-slate-400" /> {activeArticle.author}
            </span>
            <span className="text-slate-400">• {activeArticle.publishDate}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
            {activeArticle.title}
          </h1>

          <p className="text-base text-slate-600 leading-relaxed font-medium">
            {activeArticle.description}
          </p>

          <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm max-h-96">
            <img
              src={activeArticle.featuredImage}
              alt={activeArticle.title}
              className="w-full h-full object-cover"
            />
          </div>
        </header>

        {/* Executive Summary & Key Takeaways */}
        <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white rounded-2xl p-6 sm:p-8 space-y-4 shadow-xl">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4" /> Executive Summary
          </div>
          <p className="text-sm text-slate-200 leading-relaxed font-normal">
            {activeArticle.summary}
          </p>

          <div className="pt-2 border-t border-slate-800/80">
            <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-3">
              Core Takeaways
            </h3>
            <ul className="space-y-2">
              {activeArticle.keyTakeaways.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Article Body Sections with Interlinked Tools */}
        <div className="space-y-8">
          {activeArticle.sections.map((sec, idx) => {
            const linkedTool = sec.calloutToolId
              ? TOOLS_LIST.find((t) => t.id === sec.calloutToolId)
              : null;

            return (
              <section key={idx} className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-4">
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  {sec.heading}
                </h2>

                <RichTextContent content={sec.content} />

                {/* Interlinked Calculator Banner (SEO Internal Link Engine) */}
                {linkedTool && (
                  <div className="mt-4 p-4 rounded-xl bg-emerald-50/80 border border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0">
                        <Calculator className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
                          Interactive Calculator Tool
                        </h4>
                        <p className="text-sm font-bold text-emerald-900">{linkedTool.name}</p>
                        <p className="text-xs text-emerald-700">{sec.calloutText || linkedTool.description}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => onSelectTool(linkedTool.id)}
                      className="w-full sm:w-auto px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shrink-0 transition shadow-xs"
                    >
                      <span>Open {linkedTool.name}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </section>
            );
          })}
        </div>

        {/* Interlinked Related Calculators Suite */}
        {relatedTools.length > 0 && (
          <section className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 space-y-4 shadow-lg">
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-emerald-400" />
              <h3 className="text-lg font-bold text-white">
                Interactive Calculators Mentioned in This Guide
              </h3>
            </div>
            <p className="text-xs text-slate-400">
              Run real-time calculations directly using our free, private online calculation tools:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {relatedTools.map((tool) => (
                <div
                  key={tool.id}
                  onClick={() => onSelectTool(tool.id)}
                  className="bg-slate-800 hover:bg-slate-700/80 border border-slate-700 rounded-xl p-4 cursor-pointer transition group flex flex-col justify-between"
                >
                  <div>
                    <h4 className="text-sm font-bold text-white group-hover:text-emerald-400 transition">
                      {tool.name}
                    </h4>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1">{tool.description}</p>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-700/60 flex items-center justify-between text-xs font-bold text-emerald-400">
                    <span>Calculate Now</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* FAQs */}
        {activeArticle.faqs.length > 0 && (
          <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-2.5">
              <HelpCircle className="w-5 h-5 text-emerald-600" />
              <h3 className="text-lg font-bold text-slate-900">
                Frequently Asked Questions
              </h3>
            </div>

            <div className="divide-y divide-slate-100">
              {activeArticle.faqs.map((faq, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div key={idx} className="py-3">
                    <button
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      className="w-full text-left flex items-center justify-between gap-4 font-bold text-sm text-slate-900 hover:text-emerald-700 py-2 transition"
                    >
                      <span>{faq.question}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${
                          isOpen ? 'rotate-180 text-emerald-600' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <p className="mt-2 text-xs text-slate-600 leading-relaxed pl-4 border-l-2 border-emerald-500 bg-slate-50 p-3 rounded-r-lg">
                        {faq.answer}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </article>
    );
  }

  // --- 2. BLOG LIST CATALOG VIEW ---
  return (
    <section className="space-y-8 animate-in fade-in duration-200">
      {/* Hero Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-10 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-3">
          <span className="text-xs font-extrabold uppercase text-emerald-400 tracking-widest px-3 py-1 bg-emerald-500/20 rounded-full border border-emerald-500/30 inline-block">
            Calculation Knowledge Hub
          </span>

          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Financial & Technical Calculation Guides
          </h2>

          <p className="text-sm text-slate-300 leading-relaxed">
            In-depth guides on mortgage amortization, take-home tax withholdings, BMR metabolic equations, TI-84 function graphing, and unit formulas.
          </p>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-2 pt-2 text-xs font-bold">
            <button
              onClick={() => setActiveBlogCategory('all')}
              className={`px-3.5 py-1.5 rounded-xl transition ${
                activeBlogCategory === 'all'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              All Articles
            </button>
            <button
              onClick={() => setActiveBlogCategory('finance')}
              className={`px-3.5 py-1.5 rounded-xl transition ${
                activeBlogCategory === 'finance'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              💰 Finance & Mortgage
            </button>
            <button
              onClick={() => setActiveBlogCategory('health')}
              className={`px-3.5 py-1.5 rounded-xl transition ${
                activeBlogCategory === 'health'
                  ? 'bg-teal-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              🏋️ Health & Nutrition
            </button>
            <button
              onClick={() => setActiveBlogCategory('math')}
              className={`px-3.5 py-1.5 rounded-xl transition ${
                activeBlogCategory === 'math'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              📐 STEM & Graphing
            </button>
          </div>
        </div>
      </div>

      {/* Blog Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredPosts.map((post) => (
          <motion.div
            key={post.id}
            whileHover={{ y: -4, transition: { duration: 0.15 } }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelectArticle(post.id)}
            className="bg-white rounded-2xl border border-slate-200/80 hover:border-emerald-400 shadow-xs hover:shadow-xl hover:shadow-emerald-500/5 transition duration-200 cursor-pointer overflow-hidden group flex flex-col justify-between"
          >
            <div>
              <div className="h-48 overflow-hidden relative">
                <img
                  src={post.featuredImage}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
                <span className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-xs text-emerald-400 font-bold text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-lg shadow-xs">
                  {post.category}
                </span>
              </div>

              <div className="p-5 space-y-2">
                <div className="flex items-center gap-3 text-[11px] text-slate-400 font-semibold">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" /> {post.readTime}
                  </span>
                  <span>•</span>
                  <span>{post.publishDate}</span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition leading-snug">
                  {post.title}
                </h3>

                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {post.description}
                </p>
              </div>
            </div>

            <div className="p-5 pt-0">
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-600 group-hover:text-emerald-700">
                <span className="flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4" /> Read Article Guide
                </span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
