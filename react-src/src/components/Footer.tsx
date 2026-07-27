import React from 'react';
import { CategoryId } from '../types';
import { Calculator, ShieldCheck } from 'lucide-react';

interface Props {
  onSelectCategory: (cat: CategoryId | 'all') => void;
  onOpenBlog?: () => void;
}

export const Footer: React.FC<Props> = ({ onSelectCategory, onOpenBlog }) => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
                <Calculator className="w-5 h-5" />
              </div>
              <span className="text-base font-extrabold text-white">UrbanDigiStore</span>
            </div>
            <p className="text-slate-400 leading-relaxed max-w-sm">
              All-in-One Digital Store & Calculation Suite offering instantaneous, high-precision tools for mortgage amortization, auto loans, BMI health spectrums, TI-84 function graphing, step-by-step math solvers, and unit conversions.
            </p>
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-[11px]">
              <ShieldCheck className="w-4 h-4" /> 100% Client-Side Private & Free Calculation Engine
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold text-sm mb-3">Finance & Loans</h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <button onClick={() => onSelectCategory('finance')} className="hover:text-emerald-400">
                  Mortgage & Payment
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('finance')} className="hover:text-emerald-400">
                  Auto Loan & Trade-in
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('finance')} className="hover:text-emerald-400">
                  Personal Loan Savings
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('finance')} className="hover:text-emerald-400">
                  Paycheck Take-Home
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('finance')} className="hover:text-emerald-400">
                  401(k) & Roth IRA
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold text-sm mb-3">Health & Math</h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <button onClick={() => onSelectCategory('health')} className="hover:text-teal-400">
                  BMI & Category Chart
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('health')} className="hover:text-teal-400">
                  BMR & TDEE Metabolic
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('health')} className="hover:text-teal-400">
                  Calorie Deficit & Macros
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('math')} className="hover:text-indigo-400">
                  TI-84 & Desmos Grapher
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('math')} className="hover:text-indigo-400">
                  Quadratic & Slope Solver
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold text-sm mb-3">Time, Units & Blog</h4>
            <ul className="space-y-2 text-slate-400">
              {onOpenBlog && (
                <li>
                  <button onClick={onOpenBlog} className="text-emerald-400 font-bold hover:underline flex items-center gap-1">
                    <span>📚</span> Calculation Blog & Guides
                  </button>
                </li>
              )}
              <li>
                <button onClick={() => onSelectCategory('time')} className="hover:text-amber-400">
                  Timesheet Hours Clock
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('time')} className="hover:text-amber-400">
                  Date to Date Duration
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('unit')} className="hover:text-blue-400">
                  GBP to USD Currency
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('unit')} className="hover:text-blue-400">
                  Sq Ft & Concrete Volume
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800 text-center text-slate-500 text-[11px] flex flex-col sm:flex-row justify-between items-center gap-2">
          <span>© {new Date().getFullYear()} UrbanDigiStore (urbandigistore.com). All rights reserved.</span>
          <span>Fast, Accurate & Instant Digital Suite</span>
        </div>
      </div>
    </footer>
  );
};
