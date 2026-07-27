import React from 'react';
import { motion } from 'motion/react';
import { Calculator, Divide, Home, Car, Banknote, DollarSign, Activity, Clock, ArrowLeftRight, Box, ChevronRight, Sparkles, Check } from 'lucide-react';

interface PopularItem {
  id: string;
  name: string;
  categoryLabel: 'MATH' | 'FINANCIAL' | 'HEALTH' | 'EVERYDAY' | 'CONVERTER';
  categoryColor: {
    bg: string;
    text: string;
    border: string;
    activeBorder: string;
  };
  visualGraphic: React.ReactNode;
  shortDesc: string;
}

interface Props {
  activeToolId: string;
  onSelectTool: (id: string) => void;
}

export const POPULAR_ITEMS: PopularItem[] = [
  {
    id: 'scientific-graphing',
    name: 'Standard Calculator',
    categoryLabel: 'MATH',
    categoryColor: {
      bg: 'bg-indigo-500/10',
      text: 'text-indigo-500',
      border: 'border-indigo-500/20',
      activeBorder: 'border-indigo-500',
    },
    visualGraphic: (
      <div className="flex items-center justify-center gap-1.5 font-mono text-xl font-black text-indigo-500 bg-indigo-500/5 py-2.5 px-3 rounded-xl border border-indigo-500/20 w-full group-hover:scale-105 transition-transform duration-200">
        <span className="text-indigo-400">+</span>
        <span className="text-indigo-500">−</span>
        <span className="text-indigo-600">×</span>
        <span className="text-indigo-700">÷</span>
        <span className="text-indigo-500 font-extrabold">=</span>
      </div>
    ),
    shortDesc: 'Basic math, TI-84 & scientific functions',
  },
  {
    id: 'fraction-percentage',
    name: 'Fractions Calculator',
    categoryLabel: 'MATH',
    categoryColor: {
      bg: 'bg-indigo-500/10',
      text: 'text-indigo-500',
      border: 'border-indigo-500/20',
      activeBorder: 'border-indigo-500',
    },
    visualGraphic: (
      <div className="flex items-center justify-center gap-2 font-mono text-sm font-black text-indigo-500 bg-indigo-500/5 py-2 px-3 rounded-xl border border-indigo-500/20 w-full group-hover:scale-105 transition-transform duration-200">
        <div className="flex flex-col items-center leading-none text-xs">
          <span>1¾</span>
          <span className="w-full h-0.5 bg-indigo-400 my-0.5"></span>
          <span>½</span>
        </div>
        <span className="text-indigo-400 text-xs font-bold">or</span>
        <span className="text-base font-extrabold text-indigo-500">0.5</span>
      </div>
    ),
    shortDesc: 'Simplify fractions, mixed numbers & %',
  },
  {
    id: 'mortgage',
    name: 'Mortgage Payment',
    categoryLabel: 'FINANCIAL',
    categoryColor: {
      bg: 'bg-sky-500/10',
      text: 'text-sky-500',
      border: 'border-sky-500/20',
      activeBorder: 'border-sky-500',
    },
    visualGraphic: (
      <div className="flex items-center justify-center gap-2 bg-sky-500/5 py-2 px-3 rounded-xl border border-sky-500/20 w-full group-hover:scale-105 transition-transform duration-200">
        <div className="p-1.5 rounded-lg bg-indigo-600 text-white shadow-xs">
          <Home className="w-5 h-5" />
        </div>
        <div className="flex flex-col text-left font-mono leading-none">
          <span className="text-xs font-black text-sky-500">$ / mo</span>
          <span className="text-[10px] font-bold text-sky-400">% Interest</span>
        </div>
      </div>
    ),
    shortDesc: 'Monthly payments, PMI & amortization',
  },
  {
    id: 'auto-loan',
    name: 'Car Lease & Auto Loan',
    categoryLabel: 'FINANCIAL',
    categoryColor: {
      bg: 'bg-sky-500/10',
      text: 'text-sky-500',
      border: 'border-sky-500/20',
      activeBorder: 'border-sky-500',
    },
    visualGraphic: (
      <div className="flex items-center justify-center gap-2 bg-sky-500/5 py-2 px-3 rounded-xl border border-sky-500/20 w-full group-hover:scale-105 transition-transform duration-200">
        <div className="p-1.5 rounded-lg bg-indigo-600 text-white shadow-xs">
          <Car className="w-5 h-5" />
        </div>
        <div className="flex flex-col text-left font-mono leading-none">
          <span className="text-xs font-black text-sky-500">Auto %</span>
          <span className="text-[10px] font-bold text-sky-400">Lease vs Buy</span>
        </div>
      </div>
    ),
    shortDesc: 'Monthly car payments & interest saved',
  },
  {
    id: 'personal-loan',
    name: 'Loan Calculator',
    categoryLabel: 'FINANCIAL',
    categoryColor: {
      bg: 'bg-sky-500/10',
      text: 'text-sky-500',
      border: 'border-sky-500/20',
      activeBorder: 'border-sky-500',
    },
    visualGraphic: (
      <div className="flex items-center justify-center gap-2 bg-sky-500/5 py-2 px-3 rounded-xl border border-sky-500/20 w-full group-hover:scale-105 transition-transform duration-200">
        <div className="p-1.5 rounded-lg bg-indigo-600 text-white shadow-xs">
          <Banknote className="w-5 h-5" />
        </div>
        <div className="flex flex-col text-left font-mono leading-none">
          <span className="text-xs font-black text-sky-500">$ Bank</span>
          <span className="text-[10px] font-bold text-sky-400">% Amort</span>
        </div>
      </div>
    ),
    shortDesc: 'Personal loan schedules & cumulative interest',
  },
  {
    id: 'paycheck-salary',
    name: 'Paycheck & Salary',
    categoryLabel: 'FINANCIAL',
    categoryColor: {
      bg: 'bg-sky-500/10',
      text: 'text-sky-500',
      border: 'border-sky-500/20',
      activeBorder: 'border-sky-500',
    },
    visualGraphic: (
      <div className="flex items-center justify-center gap-2 bg-sky-500/5 py-2 px-3 rounded-xl border border-sky-500/20 w-full group-hover:scale-105 transition-transform duration-200">
        <div className="p-1.5 rounded-lg bg-indigo-600 text-white shadow-xs">
          <DollarSign className="w-5 h-5" />
        </div>
        <div className="flex flex-col text-left font-mono leading-none">
          <span className="text-xs font-black text-sky-500">Net Pay</span>
          <span className="text-[10px] font-bold text-sky-400">Tax Withhold</span>
        </div>
      </div>
    ),
    shortDesc: 'Gross salary to net take-home pay',
  },
  {
    id: 'bmi',
    name: 'BMI & Body Health',
    categoryLabel: 'HEALTH',
    categoryColor: {
      bg: 'bg-sky-500/10',
      text: 'text-sky-500',
      border: 'border-sky-500/20',
      activeBorder: 'border-sky-500',
    },
    visualGraphic: (
      <div className="flex items-center justify-center gap-2 bg-sky-500/5 py-2 px-3 rounded-xl border border-sky-500/20 w-full group-hover:scale-105 transition-transform duration-200">
        <div className="p-1.5 rounded-lg bg-indigo-600 text-white shadow-xs">
          <Activity className="w-5 h-5" />
        </div>
        <div className="flex flex-col text-left font-mono leading-none">
          <span className="text-xs font-black text-sky-500">BMI Scale</span>
          <span className="text-[10px] font-bold text-sky-400">Ideal Weight</span>
        </div>
      </div>
    ),
    shortDesc: 'Body Mass Index & target health ranges',
  },
  {
    id: 'time-clock',
    name: 'Work Hours Calculator',
    categoryLabel: 'EVERYDAY',
    categoryColor: {
      bg: 'bg-indigo-500/10',
      text: 'text-indigo-500',
      border: 'border-indigo-500/20',
      activeBorder: 'border-indigo-500',
    },
    visualGraphic: (
      <div className="flex items-center justify-center gap-2 bg-indigo-500/5 py-2 px-3 rounded-xl border border-indigo-500/20 w-full group-hover:scale-105 transition-transform duration-200">
        <div className="p-1.5 rounded-lg bg-indigo-600 text-white shadow-xs">
          <Clock className="w-5 h-5" />
        </div>
        <div className="flex flex-col text-left font-mono leading-none">
          <span className="text-xs font-black text-indigo-500">40 hrs / wk</span>
          <span className="text-[10px] font-bold text-indigo-400">Overtime Pay</span>
        </div>
      </div>
    ),
    shortDesc: 'Timesheet hours, breaks & overtime pay',
  },
  {
    id: 'unit-converter',
    name: 'Length & Unit Converter',
    categoryLabel: 'CONVERTER',
    categoryColor: {
      bg: 'bg-indigo-500/10',
      text: 'text-indigo-500',
      border: 'border-indigo-500/20',
      activeBorder: 'border-indigo-500',
    },
    visualGraphic: (
      <div className="flex items-center justify-center gap-2 bg-indigo-500/5 py-2 px-3 rounded-xl border border-indigo-500/20 w-full group-hover:scale-105 transition-transform duration-200">
        <div className="p-1.5 rounded-lg bg-indigo-600 text-white shadow-xs">
          <ArrowLeftRight className="w-5 h-5" />
        </div>
        <div className="flex flex-col text-left font-mono leading-none">
          <span className="text-xs font-black text-indigo-500">in ⇄ cm</span>
          <span className="text-[10px] font-bold text-indigo-400">ft ⇄ m</span>
        </div>
      </div>
    ),
    shortDesc: 'Metric, imperial & currency conversion',
  },
  {
    id: 'area-concrete',
    name: 'Square Feet & Concrete',
    categoryLabel: 'CONVERTER',
    categoryColor: {
      bg: 'bg-indigo-500/10',
      text: 'text-indigo-500',
      border: 'border-indigo-500/20',
      activeBorder: 'border-indigo-500',
    },
    visualGraphic: (
      <div className="flex items-center justify-center gap-2 bg-indigo-500/5 py-2 px-3 rounded-xl border border-indigo-500/20 w-full group-hover:scale-105 transition-transform duration-200">
        <div className="p-1.5 rounded-lg bg-indigo-600 text-white shadow-xs">
          <Box className="w-5 h-5" />
        </div>
        <div className="flex flex-col text-left font-mono leading-none">
          <span className="text-xs font-black text-indigo-500">sq ft / m²</span>
          <span className="text-[10px] font-bold text-indigo-400">Yards / Bags</span>
        </div>
      </div>
    ),
    shortDesc: 'Room area & concrete slab yardage',
  },
];

export const PopularCalculators: React.FC<Props> = ({ activeToolId, onSelectTool }) => {
  return (
    <section className="bg-[var(--bg-panel)] backdrop-blur-md rounded-3xl border border-[var(--border-panel)] shadow-sm p-5 sm:p-7 space-y-6">
      {/* Slogan Banner & Header */}
      <div className="space-y-2 text-left">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-indigo-500 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20 flex items-center gap-1.5 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
            <span>Instant Precision Suite</span>
          </span>
          <span className="text-xs font-semibold text-[var(--text-muted)] hidden sm:inline">
            • 30+ Free Verified Tools
          </span>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-2">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-title)] tracking-tight">
              ...calculate anything, anytime, anywhere.
            </h2>
            <p className="text-[var(--text-muted)] text-xs sm:text-sm font-medium mt-1">
              Select any calculator below to open the interactive engine instantly.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-muted)] shrink-0">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping inline-block"></span>
            <span className="text-[var(--text-title)]">Most Popular Calculators</span>
          </div>
        </div>
      </div>

      {/* Popular Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {POPULAR_ITEMS.map((item) => {
          const isSelected = activeToolId === item.id;
          return (
            <motion.div
              key={item.id}
              whileHover={{ y: -4, transition: { duration: 0.15 } }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onSelectTool(item.id)}
              className={`p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between group relative overflow-hidden select-none ${
                isSelected
                  ? 'bg-black/30 border-indigo-600 text-white shadow-xl ring-2 ring-indigo-500/80'
                  : 'bg-[var(--bg-panel)] border-[var(--border-panel)] hover:border-indigo-500/40 hover:shadow-lg hover:shadow-indigo-500/5'
              }`}
            >
              {/* Selected Glow Accent */}
              {isSelected && (
                <div className="absolute top-0 right-0 bg-indigo-600 text-white font-black text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-bl-xl flex items-center gap-1 shadow-xs">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                  <span>Active</span>
                </div>
              )}

              <div className="space-y-3">
                {/* Visual Graphic Representation */}
                <div className="w-full flex justify-center">
                  {item.visualGraphic}
                </div>

                {/* Card Title & Description */}
                <div>
                  <h3
                    className={`text-xs sm:text-sm font-black tracking-tight leading-snug transition ${
                      isSelected ? 'text-white' : 'text-[var(--text-title)] group-hover:text-indigo-500'
                    }`}
                  >
                    {item.name}
                  </h3>
                  <p
                    className={`text-[11px] font-medium leading-tight mt-1 line-clamp-2 ${
                      isSelected ? 'text-slate-400' : 'text-[var(--text-muted)]'
                    }`}
                  >
                    {item.shortDesc}
                  </p>
                </div>
              </div>

              {/* Bottom Badge Tag */}
              <div className="pt-3 mt-3 border-t border-[var(--border-panel)] flex items-center justify-between">
                <span
                  className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                    isSelected
                      ? 'bg-slate-800 text-indigo-400 border-slate-700'
                      : `${item.categoryColor.bg} ${item.categoryColor.text} ${item.categoryColor.border}`
                  }`}
                >
                  {item.categoryLabel}
                </span>

                <ChevronRight
                  className={`w-3.5 h-3.5 transition group-hover:translate-x-1 ${
                    isSelected ? 'text-indigo-400' : 'text-[var(--text-muted)] group-hover:text-indigo-500'
                  }`}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};
