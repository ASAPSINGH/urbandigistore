import React, { useState, useEffect } from 'react';
import { SEO_DATA_MAP } from '../data/seoData';
import { HelpCircle, Sparkles, CheckCircle2, ChevronDown, BookOpen, Lightbulb, Calculator, Share2, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  toolId: string;
}

export const SEOSection: React.FC<Props> = ({ toolId }) => {
  const seoData = SEO_DATA_MAP[toolId] || SEO_DATA_MAP['mortgage'];
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  // Dynamic JSON-LD FAQ Schema injection for Google SERP Rich Snippets & AI Crawlers
  useEffect(() => {
    const existingScript = document.getElementById('dynamic-faq-jsonld');
    if (existingScript) {
      existingScript.remove();
    }

    if (seoData && seoData.faqs.length > 0) {
      const faqSchema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: seoData.faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer,
          },
        })),
      };

      const script = document.createElement('script');
      script.id = 'dynamic-faq-jsonld';
      script.type = 'application/ld+json';
      script.innerHTML = JSON.stringify(faqSchema);
      document.head.appendChild(script);
    }

    return () => {
      const scriptToRemove = document.getElementById('dynamic-faq-jsonld');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [toolId, seoData]);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <article className="space-y-4">
      {/* Header Toggle */}
      <div className="bg-[var(--bg-panel)] backdrop-blur-md border border-[var(--border-panel)] rounded-2xl p-5 shadow-sm flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold shrink-0 border border-indigo-500/20">
            <Info className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-500 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">
                Formula & Guide
              </span>
              <span className="text-xs text-[var(--text-muted)] hidden sm:inline">• Verified Math Model</span>
            </div>
            <h3 className="text-base font-bold text-[var(--text-title)] mt-0.5">{seoData.h1}</h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--bg-well)] hover:bg-[var(--bg-well)]/80 text-[var(--text-body)] border border-[var(--border-panel)] text-xs font-semibold transition"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{copied ? 'Copied!' : 'Share'}</span>
          </button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-xs"
          >
            <span>{isExpanded ? 'Hide Details' : 'View Formula & FAQs'}</span>
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Direct Answer Preview (Always visible micro snippet) */}
      {!isExpanded && (
        <div className="bg-[var(--bg-well)]/80 border border-[var(--border-panel)] rounded-2xl p-4 text-xs text-[var(--text-body)] leading-relaxed flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
          <p className="line-clamp-2">
            <strong className="text-[var(--text-title)] font-bold">Quick Overview:</strong> {seoData.directAnswer}
          </p>
        </div>
      )}

      {/* Expanded Deep Dive Section */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="space-y-6 overflow-hidden"
          >
            {/* Direct Answer Callout Box */}
            <div className="bg-gradient-to-br from-[var(--bg-panel)] to-indigo-950/20 border border-[var(--border-panel)] rounded-2xl p-6 shadow-xl relative overflow-hidden">
              <div className="relative z-10 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AEO & GEO Direct Answer</span>
                </div>

                <div className="bg-[var(--bg-well)] border border-[var(--border-panel)] rounded-xl p-4">
                  <p className="text-xs sm:text-sm text-[var(--text-body)] leading-relaxed">{seoData.directAnswer}</p>
                </div>

                {/* Key Takeaways */}
                <div className="pt-2">
                  <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Lightbulb className="w-4 h-4" /> Essential Key Takeaways
                  </h4>
                  <ul className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                    {seoData.keyTakeaways.map((item, idx) => (
                      <li
                        key={idx}
                        className="bg-[var(--bg-well)]/50 border border-[var(--border-panel)] rounded-lg p-2.5 text-xs text-[var(--text-body)] flex items-start gap-2"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Formula Breakdown */}
            <div className="bg-[var(--bg-panel)] backdrop-blur-md border border-[var(--border-panel)] rounded-2xl p-6 shadow-sm space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0 border border-indigo-500/20">
                  <Calculator className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider">
                    Mathematical Formula
                  </span>
                  <h4 className="text-sm font-bold text-[var(--text-title)]">{seoData.formula.title}</h4>
                </div>
              </div>

              <div className="bg-black/40 text-indigo-400 p-3.5 rounded-xl font-mono text-xs font-semibold overflow-x-auto border border-[var(--border-panel)]">
                <code>{seoData.formula.expression}</code>
              </div>

              <p className="text-xs text-[var(--text-body)] leading-relaxed bg-[var(--bg-well)] p-3 rounded-xl border border-[var(--border-panel)]">
                <strong className="text-[var(--text-title)]">Explanation:</strong> {seoData.formula.explanation}
              </p>
            </div>

            {/* FAQ Accordion */}
            <div className="bg-[var(--bg-panel)] backdrop-blur-md border border-[var(--border-panel)] rounded-2xl p-6 shadow-sm space-y-3">
              <div className="flex items-center gap-2.5 mb-1">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0 border border-indigo-500/20">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider">
                    Frequently Asked Questions
                  </span>
                  <h4 className="text-sm font-bold text-[var(--text-title)]">Expert Q&A</h4>
                </div>
              </div>

              <div className="divide-y divide-[var(--border-well)]">
                {seoData.faqs.map((faq, idx) => {
                  const isOpen = openFaqIndex === idx;
                  return (
                    <div key={idx} className="py-2.5">
                      <button
                        onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                        className="w-full text-left flex items-center justify-between gap-3 font-bold text-xs text-[var(--text-title)] hover:text-indigo-500 py-1 transition"
                      >
                        <span className="flex items-center gap-2">
                          <BookOpen className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                          {faq.question}
                        </span>
                        <ChevronDown
                          className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-200 ${
                            isOpen ? 'rotate-180 text-indigo-500' : ''
                          }`}
                        />
                      </button>

                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.15 }}
                            className="mt-2 text-xs text-[var(--text-body)] leading-relaxed pl-5 border-l-2 border-indigo-500 bg-[var(--bg-well)]/50 p-3 rounded-r-lg overflow-hidden"
                          >
                            {faq.answer}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </article>
  );
};
