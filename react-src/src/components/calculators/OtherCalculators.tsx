import React, { useState } from 'react';
import { Sparkles, Calendar, Droplet, Zap, Activity, Award } from 'lucide-react';

interface Props {
  subToolId: string;
}

export const OtherCalculators: React.FC<Props> = ({ subToolId }) => {
  // --- 1. PREGNANCY DUE DATE ---
  const [lmp, setLmp] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [cycleLength, setCycleLength] = useState<number>(28);

  const calculatePregnancy = () => {
    if (!lmp) return null;
    const lmpDate = new Date(lmp);
    if (isNaN(lmpDate.getTime())) return null;

    // Due Date = LMP + 280 days + (cycleLength - 28)
    const dueDate = new Date(lmpDate.getTime());
    dueDate.setDate(dueDate.getDate() + 280 + (cycleLength - 28));

    const today = new Date();
    const diffTime = today.getTime() - lmpDate.getTime();
    const diffDays = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
    
    const gestWeeks = Math.floor(diffDays / 7);
    const gestDays = diffDays % 7;

    let trimester = 'First';
    if (gestWeeks >= 27) trimester = 'Third';
    else if (gestWeeks >= 13) trimester = 'Second';

    const daysRemaining = Math.max(0, Math.floor((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));

    return {
      dueDate: dueDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      gestWeeks,
      gestDays,
      trimester,
      daysRemaining
    };
  };

  const pregResult = calculatePregnancy();

  // --- 2. MOLARITY CALCULATOR ---
  const [soluteMass, setSoluteMass] = useState<number>(5.84); // g of NaCl
  const [soluteMw, setSoluteMw] = useState<number>(58.44); // g/mol of NaCl
  const [solutionVolume, setSolutionVolume] = useState<number>(500); // ml

  const molarity = soluteMw > 0 && solutionVolume > 0 
    ? (soluteMass / soluteMw) / (solutionVolume / 1000) 
    : 0;

  // --- 3. VELOCITY & ACCELERATION ---
  const [v0, setV0] = useState<number>(0);
  const [accel, setAccel] = useState<number>(9.8);
  const [timeSec, setTimeSec] = useState<number>(5);

  const finalVelocity = v0 + accel * timeSec;
  const distanceTraveled = v0 * timeSec + 0.5 * accel * Math.pow(timeSec, 2);

  // --- 4. CALORIE BURN ---
  const [weightKg, setWeightKg] = useState<number>(70);
  const [durationMin, setDurationMin] = useState<number>(30);
  const [activityMet, setActivityMet] = useState<number>(11.5); // Running default

  // MET values: Running=11.5, Walking=4.0, Cycling=8.0, Swimming=9.8
  const caloriesBurned = durationMin * activityMet * weightKg * 0.0175;

  // --- 5. DOG AGE ---
  const [dogAge, setDogAge] = useState<number>(5);
  const [dogSize, setDogSize] = useState<'small' | 'medium' | 'large'>('medium');

  const calculateDogAge = () => {
    let traditional = dogAge * 7;
    let scientific = 0;
    if (dogAge > 0) {
      scientific = 16 * Math.log(dogAge) + 31;
    }

    let sizeAware = 0;
    if (dogAge === 1) sizeAware = 15;
    else if (dogAge === 2) sizeAware = 24;
    else if (dogAge > 2) {
      const factor = dogSize === 'small' ? 4 : dogSize === 'medium' ? 5 : 6;
      sizeAware = 24 + (dogAge - 2) * factor;
    }

    return {
      traditional,
      scientific: Math.round(scientific),
      sizeAware
    };
  };

  const dogResult = calculateDogAge();

  return (
    <div className="space-y-8">
      {/* 1. PREGNANCY DUE DATE */}
      {subToolId === 'pregnancy-due-date' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-pink-100 text-pink-700 flex items-center justify-center font-bold">
                  🧬
                </span>
                Pregnancy Due Date & Gestational Age
              </h2>
              <p class="text-xs text-slate-500 mt-1">Estimate due milestones and baby delivery timeline.</p>
            </div>
            <span className="text-xs font-semibold px-3 py-1 bg-pink-50 text-pink-700 rounded-full border border-pink-200">
              Biology
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Last Period First Day (LMP)</label>
              <input
                type="date"
                value={lmp}
                onChange={(e) => setLmp(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:outline-none font-semibold text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Average Cycle Length (Days)</label>
              <input
                type="number"
                value={cycleLength}
                onChange={(e) => setCycleLength(Math.max(20, Number(e.target.value)))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:outline-none font-semibold text-slate-800"
              />
            </div>
          </div>

          {pregResult && (
            <div className="bg-pink-50 border border-pink-100 rounded-xl p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <span className="text-[10px] uppercase font-bold text-pink-700">Estimated Due Date</span>
                  <div className="text-sm sm:text-base font-extrabold text-pink-900 mt-1">{pregResult.dueDate}</div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-pink-700">Gestational Age</span>
                  <div className="text-sm sm:text-base font-extrabold text-pink-900 mt-1">
                    {pregResult.gestWeeks} Weeks, {pregResult.gestDays} Days
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-center border-t border-pink-200/50 pt-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-pink-700">Trimester</span>
                  <div className="text-sm sm:text-base font-bold text-pink-955 mt-1">{pregResult.trimester} Trimester</div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-pink-700">Days to Delivery</span>
                  <div className="text-sm sm:text-base font-bold text-pink-955 mt-1">{pregResult.daysRemaining} Days</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. MOLARITY CALCULATOR */}
      {subToolId === 'molarity' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
                  🧪
                </span>
                Chemical Molarity Calculator
              </h2>
              <p class="text-xs text-slate-500 mt-1">Calculate molar concentration of solutions.</p>
            </div>
            <span className="text-xs font-semibold px-3 py-1 bg-teal-50 text-teal-700 rounded-full border border-teal-200">
              Chemistry
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Mass of Solute (g)</label>
              <input
                type="number"
                value={soluteMass}
                onChange={(e) => setSoluteMass(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none font-semibold text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Formula Weight (g/mol)</label>
              <input
                type="number"
                value={soluteMw}
                onChange={(e) => setSoluteMw(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none font-semibold text-slate-800"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">Solution Volume (ml)</label>
              <input
                type="number"
                value={solutionVolume}
                onChange={(e) => setSolutionVolume(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none font-semibold text-slate-800"
              />
            </div>
          </div>

          <div className="bg-teal-50 border border-teal-100 rounded-xl p-5 text-center">
            <span className="text-[10px] uppercase font-bold text-teal-700">Molar Concentration (Molarity)</span>
            <div className="text-3xl font-extrabold text-teal-900 mt-1">
              {molarity.toFixed(4)} <span className="text-lg font-bold text-teal-700">mol/L</span>
            </div>
          </div>
        </div>
      )}

      {/* 3. VELOCITY & ACCELERATION */}
      {subToolId === 'velocity-acceleration' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  🌌
                </span>
                Velocity & Acceleration
              </h2>
              <p class="text-xs text-slate-500 mt-1">Solve kinematics motion displacement and speed variables.</p>
            </div>
            <span className="text-xs font-semibold px-3 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-200">
              Physics
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Initial Velocity (m/s)</label>
              <input
                type="number"
                value={v0}
                onChange={(e) => setV0(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-semibold text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Acceleration (m/s²)</label>
              <input
                type="number"
                value={accel}
                onChange={(e) => setAccel(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-semibold text-slate-800"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">Time Elapsed (seconds)</label>
              <input
                type="number"
                value={timeSec}
                onChange={(e) => setTimeSec(Math.max(0, Number(e.target.value)))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-semibold text-slate-800"
              />
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 space-y-4">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <span className="text-[10px] uppercase font-bold text-blue-700">Final Velocity</span>
                <div className="text-xl font-extrabold text-blue-900 mt-1">{finalVelocity.toFixed(2)} m/s</div>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-blue-700">Distance Traveled</span>
                <div className="text-xl font-extrabold text-blue-900 mt-1">{distanceTraveled.toFixed(2)} meters</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. CALORIE BURN */}
      {subToolId === 'calorie-burn' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center font-bold">
                  🏃
                </span>
                Activity Calorie Burn
              </h2>
              <p class="text-xs text-slate-500 mt-1">Estimate metabolic calorie burn based on exercise types.</p>
            </div>
            <span className="text-xs font-semibold px-3 py-1 bg-orange-50 text-orange-700 rounded-full border border-orange-200">
              Sports
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Body Weight (kg)</label>
              <input
                type="number"
                value={weightKg}
                onChange={(e) => setWeightKg(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none font-semibold text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Duration (minutes)</label>
              <input
                type="number"
                value={durationMin}
                onChange={(e) => setDurationMin(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none font-semibold text-slate-800"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">Exercise Activity Type</label>
              <select
                value={activityMet}
                onChange={(e) => setActivityMet(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none font-semibold text-slate-800"
              >
                <option value={11.5}>Running (Moderate Speed)</option>
                <option value={4.0}>Walking (Brisk)</option>
                <option value={8.0}>Cycling (Moderate Pace)</option>
                <option value={9.8}>Swimming (Laps)</option>
              </select>
            </div>
          </div>

          <div className="bg-orange-50 border border-orange-100 rounded-xl p-5 text-center">
            <span className="text-[10px] uppercase font-bold text-orange-700">Estimated Burned Energy</span>
            <div className="text-3xl font-extrabold text-orange-900 mt-1">
              {Math.round(caloriesBurned)} <span className="text-lg font-bold text-orange-700">kcal</span>
            </div>
          </div>
        </div>
      )}

      {/* 5. DOG AGE */}
      {subToolId === 'dog-age' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
                  🗓️
                </span>
                Dog Age Converter
              </h2>
              <p class="text-xs text-slate-500 mt-1">Convert dog age to human age using size-aware scientific models.</p>
            </div>
            <span className="text-xs font-semibold px-3 py-1 bg-rose-50 text-rose-700 rounded-full border border-rose-200">
              Everyday Life
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Dog Age (Years)</label>
              <input
                type="number"
                value={dogAge}
                onChange={(e) => setDogAge(Math.max(0.5, Number(e.target.value)))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-none font-semibold text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Breed Size Class</label>
              <select
                value={dogSize}
                onChange={(e) => setDogSize(e.target.value as 'small' | 'medium' | 'large')}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-none font-semibold text-slate-800"
              >
                <option value="small">Small Breed (&lt; 20 lbs)</option>
                <option value="medium">Medium Breed (20 - 50 lbs)</option>
                <option value="large">Large Breed (&gt; 50 lbs)</option>
              </select>
            </div>
          </div>

          <div className="bg-rose-50 border border-rose-100 rounded-xl p-5 space-y-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <span className="text-[10px] uppercase font-bold text-rose-700">Size-Aware Model</span>
                <div className="text-xl font-extrabold text-rose-900 mt-1">{dogResult.sizeAware} Years</div>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-rose-700">Scientific Model</span>
                <div className="text-xl font-extrabold text-rose-900 mt-1">{dogResult.scientific} Years</div>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-rose-700">Traditional (×7)</span>
                <div className="text-xl font-extrabold text-rose-900 mt-1">{dogResult.traditional} Years</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
