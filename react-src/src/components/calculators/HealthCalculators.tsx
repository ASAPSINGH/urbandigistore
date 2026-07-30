import React, { useState } from 'react';
import { Activity, Flame, Utensils, Apple, Heart, Ruler, CheckCircle } from 'lucide-react';

interface Props {
  subToolId: string;
}

export const HealthCalculators: React.FC<Props> = ({ subToolId }) => {
  // --- 1. BMI CALCULATOR ---
  const [bmiUnitSystem, setBmiUnitSystem] = useState<'us' | 'metric'>('us');
  const [bmiGender, setBmiGender] = useState<'women' | 'men'>('women');
  const [heightFeet, setHeightFeet] = useState<number>(5);
  const [heightInches, setHeightInches] = useState<number>(6);
  const [heightCm, setHeightCm] = useState<number>(168);
  const [weightLbs, setWeightLbs] = useState<number>(145);
  const [weightKg, setWeightKg] = useState<number>(65);

  let calculatedBmi = 0;
  if (bmiUnitSystem === 'us') {
    const totalInches = heightFeet * 12 + heightInches;
    if (totalInches > 0) {
      calculatedBmi = (weightLbs / (totalInches * totalInches)) * 703;
    }
  } else {
    const heightMeters = heightCm / 100;
    if (heightMeters > 0) {
      calculatedBmi = weightKg / (heightMeters * heightMeters);
    }
  }

  const getBmiCategory = (bmi: number) => {
    if (bmi < 18.5) return { label: 'Underweight', color: 'bg-blue-500 text-white', barPct: 15 };
    if (bmi < 24.9) return { label: 'Normal / Healthy Weight', color: 'bg-emerald-500 text-white', barPct: 45 };
    if (bmi < 29.9) return { label: 'Overweight', color: 'bg-amber-500 text-white', barPct: 70 };
    return { label: 'Obese', color: 'bg-rose-500 text-white', barPct: 90 };
  };

  const bmiCat = getBmiCategory(calculatedBmi);

  // Healthy weight range calculation
  const getHealthyWeightRange = () => {
    if (bmiUnitSystem === 'us') {
      const totalInches = heightFeet * 12 + heightInches;
      const minLbs = Math.round((18.5 * totalInches * totalInches) / 703);
      const maxLbs = Math.round((24.9 * totalInches * totalInches) / 703);
      return `${minLbs} lbs - ${maxLbs} lbs`;
    } else {
      const hM = heightCm / 100;
      const minKg = Math.round(18.5 * hM * hM);
      const maxKg = Math.round(24.9 * hM * hM);
      return `${minKg} kg - ${maxKg} kg`;
    }
  };

  // --- 2. BMR & TDEE CALCULATOR ---
  const [bmrAge, setBmrAge] = useState<number>(28);
  const [bmrGender, setBmrGender] = useState<'male' | 'female'>('female');
  const [bmrHeightCm, setBmrHeightCm] = useState<number>(168);
  const [bmrWeightKg, setBmrWeightKg] = useState<number>(65);
  const [activityLevel, setActivityLevel] = useState<number>(1.375); // 1.2, 1.375, 1.55, 1.725, 1.9

  // Mifflin-St Jeor Formula
  const baseBmr =
    10 * bmrWeightKg +
    6.25 * bmrHeightCm -
    5 * bmrAge +
    (bmrGender === 'male' ? 5 : -161);

  const tdee = baseBmr * activityLevel;

  // --- 3. CALORIE DEFICIT CALCULATOR ---
  const [weightGoal, setWeightGoal] = useState<'mild_loss' | 'loss' | 'extreme_loss' | 'maintain' | 'gain'>('loss');
  const deficitMap = {
    extreme_loss: -1000, // 2 lbs/wk
    loss: -500, // 1 lb/wk
    mild_loss: -250, // 0.5 lb/wk
    maintain: 0,
    gain: 500, // +1 lb/wk
  };
  const targetCalories = Math.max(1200, Math.round(tdee + deficitMap[weightGoal]));

  // --- 4. MACRO CALCULATOR ---
  const [dietRatio, setDietRatio] = useState<'balanced' | 'high_protein' | 'keto'>('balanced');
  const macroRatios = {
    balanced: { p: 0.3, c: 0.4, f: 0.3 },
    high_protein: { p: 0.4, c: 0.35, f: 0.25 },
    keto: { p: 0.25, c: 0.05, f: 0.7 },
  };
  const activeMacro = macroRatios[dietRatio];
  const proteinGrams = Math.round((targetCalories * activeMacro.p) / 4);
  const carbsGrams = Math.round((targetCalories * activeMacro.c) / 4);
  const fatGrams = Math.round((targetCalories * activeMacro.f) / 9);

  // --- 5. BRA SIZE CALCULATOR ---
  const [underbustInches, setUnderbustInches] = useState<number>(30);
  const [bustInches, setBustInches] = useState<number>(36);

  const bandSize = Math.round(underbustInches) % 2 === 0 ? Math.round(underbustInches) : Math.round(underbustInches) + 1;
  const cupDifference = Math.max(0, Math.round(bustInches - bandSize));
  const cupsList = ['AA', 'A', 'B', 'C', 'D', 'DD/E', 'DDD/F', 'G', 'H', 'I'];
  const calculatedCup = cupsList[Math.min(cupDifference, cupsList.length - 1)] || 'A';

  // --- 6. HEIGHT PREDICTOR CALCULATOR ---
  const [fatherHeightInches, setFatherHeightInches] = useState<number>(70); // 5'10"
  const [motherHeightInches, setMotherHeightInches] = useState<number>(64); // 5'4"
  const [childGender, setChildGender] = useState<'boy' | 'girl'>('boy');

  const midParentalInches =
    childGender === 'boy'
      ? (fatherHeightInches + motherHeightInches + 5) / 2
      : (fatherHeightInches + motherHeightInches - 5) / 2;

  const predictedFeet = Math.floor(midParentalInches / 12);
  const predictedInches = Math.round(midParentalInches % 12);
  const predictedCm = Math.round(midParentalInches * 2.54);

  // --- 7. BODY FAT (US NAVY METHOD) CALCULATOR ---
  const [navyGender, setNavyGender] = useState<'male' | 'female'>('male');
  const [navyWaistIn, setNavyWaistIn] = useState<number>(34);
  const [navyNeckIn, setNavyNeckIn] = useState<number>(15.5);
  const [navyHipIn, setNavyHipIn] = useState<number>(38); // for women
  const [navyHeightIn, setNavyHeightIn] = useState<number>(70);

  const calcNavyBodyFat = () => {
    if (navyGender === 'male') {
      const diff = navyWaistIn - navyNeckIn;
      if (diff <= 0 || navyHeightIn <= 0) return 0;
      const fat = 86.010 * Math.log10(diff) - 70.041 * Math.log10(navyHeightIn) + 36.76;
      return Math.max(3, Math.min(60, fat));
    } else {
      const diff = navyWaistIn + navyHipIn - navyNeckIn;
      if (diff <= 0 || navyHeightIn <= 0) return 0;
      const fat = 163.205 * Math.log10(diff) - 97.884 * Math.log10(navyHeightIn) - 78.387;
      return Math.max(5, Math.min(60, fat));
    }
  };
  const bodyFatPct = calcNavyBodyFat();

  // --- 8. IDEAL WEIGHT & WATER INTAKE CALCULATOR ---
  const [userWeightLbs, setUserWeightLbs] = useState<number>(160);
  const [userHeightInchesTotal, setUserHeightInchesTotal] = useState<number>(68); // 5'8"
  const [userGender, setUserGender] = useState<'male' | 'female'>('female');
  const [exerciseMinsPerDay, setExerciseMinsPerDay] = useState<number>(30);

  // Devine Formula
  const inchesOver5Ft = Math.max(0, userHeightInchesTotal - 60);
  const devineKg = userGender === 'male' ? 50 + 2.3 * inchesOver5Ft : 45.5 + 2.3 * inchesOver5Ft;
  const devineLbs = Math.round(devineKg * 2.20462);

  // Water Intake Formula (Weight in lbs * 0.67 + (exercise mins / 30)*12 oz)
  const baseWaterOz = userWeightLbs * 0.67;
  const exerciseBonusOz = (exerciseMinsPerDay / 30) * 12;
  const totalWaterOz = Math.round(baseWaterOz + exerciseBonusOz);
  const totalWaterLiters = (totalWaterOz * 0.0295735).toFixed(1);

  return (
    <div className="space-y-8">
      {/* 1. BMI CALCULATOR */}
      {(subToolId === 'bmi' || subToolId === 'all') && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
                  ⚖️
                </span>
                BMI (Body Mass Index) & Chart Calculator
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Calculate Body Mass Index for Women & Men with visual healthy weight spectrum chart.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setBmiUnitSystem('us')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg ${
                  bmiUnitSystem === 'us'
                    ? 'bg-teal-700 text-white'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                US (lbs / ft-in)
              </button>
              <button
                onClick={() => setBmiUnitSystem('metric')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg ${
                  bmiUnitSystem === 'metric'
                    ? 'bg-teal-700 text-white'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                Metric (kg / cm)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Gender</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setBmiGender('women')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg border ${
                    bmiGender === 'women'
                      ? 'bg-rose-500 text-white border-rose-500'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  Women 👩
                </button>
                <button
                  onClick={() => setBmiGender('men')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg border ${
                    bmiGender === 'men'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  Men 👨
                </button>
              </div>
            </div>

            {bmiUnitSystem === 'us' ? (
              <>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Height (Feet & Inches)</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={heightFeet}
                      onChange={(e) => setHeightFeet(Number(e.target.value))}
                      className="w-1/2 px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold"
                      placeholder="ft"
                    />
                    <input
                      type="number"
                      value={heightInches}
                      onChange={(e) => setHeightInches(Number(e.target.value))}
                      className="w-1/2 px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold"
                      placeholder="in"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Weight (lbs)</label>
                  <input
                    type="number"
                    value={weightLbs}
                    onChange={(e) => setWeightLbs(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold"
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Height (cm)</label>
                  <input
                    type="number"
                    value={heightCm}
                    onChange={(e) => setHeightCm(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    value={weightKg}
                    onChange={(e) => setWeightKg(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold"
                  />
                </div>
              </>
            )}

            <div className="bg-slate-900 text-white rounded-xl p-4 flex flex-col justify-center items-center text-center">
              <span className="text-xs uppercase text-slate-400 font-bold">Your BMI Score</span>
              <div className="text-3xl font-extrabold mt-1 text-teal-300">
                {calculatedBmi.toFixed(1)}
              </div>
              <span className={`text-xs font-bold px-2 py-0.5 rounded mt-1 ${bmiCat.color}`}>
                {bmiCat.label}
              </span>
            </div>
          </div>

          {/* Visual BMI Gauge Spectrum */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="flex justify-between text-xs font-semibold text-slate-600">
              <span>BMI Spectrum Indicator:</span>
              <span>Healthy Weight Target: {getHealthyWeightRange()}</span>
            </div>

            <div className="relative h-4 bg-slate-200 rounded-full overflow-hidden flex">
              <div className="w-[20%] bg-blue-400 h-full flex items-center justify-center text-[10px] text-white font-bold">
                &lt;18.5
              </div>
              <div className="w-[30%] bg-emerald-500 h-full flex items-center justify-center text-[10px] text-white font-bold">
                18.5 - 24.9
              </div>
              <div className="w-[25%] bg-amber-500 h-full flex items-center justify-center text-[10px] text-white font-bold">
                25 - 29.9
              </div>
              <div className="w-[25%] bg-rose-500 h-full flex items-center justify-center text-[10px] text-white font-bold">
                30+
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-center text-xs text-slate-600 font-medium pt-1">
              <div>Underweight (&lt;18.5)</div>
              <div className="text-emerald-700 font-bold">Normal (18.5–24.9)</div>
              <div>Overweight (25–29.9)</div>
              <div>Obese (30+)</div>
            </div>
          </div>
        </div>
      )}

      {/* 2. BMR & TDEE CALCULATOR */}
      {(subToolId === 'bmr-tdee' || subToolId === 'all') && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center font-bold">
                  🔥
                </span>
                BMR & TDEE Metabolic Rate Calculator
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Find your Basal Metabolic Rate (BMR) and Total Daily Energy Expenditure (TDEE).
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Age (Years)</label>
              <input
                type="number"
                value={bmrAge}
                onChange={(e) => setBmrAge(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Gender</label>
              <select
                value={bmrGender}
                onChange={(e) => setBmrGender(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold"
              >
                <option value="female">Female</option>
                <option value="male">Male</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Height (cm)</label>
              <input
                type="number"
                value={bmrHeightCm}
                onChange={(e) => setBmrHeightCm(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Weight (kg)</label>
              <input
                type="number"
                value={bmrWeightKg}
                onChange={(e) => setBmrWeightKg(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Activity Level</label>
            <select
              value={activityLevel}
              onChange={(e) => setActivityLevel(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold"
            >
              <option value={1.2}>Sedentary (Little or no exercise)</option>
              <option value={1.375}>Light Exercise (1-3 days/week)</option>
              <option value={1.55}>Moderate Exercise (3-5 days/week)</option>
              <option value={1.725}>Heavy Exercise (6-7 days/week)</option>
              <option value={1.9}>Athlete / Extra Active (2x per day)</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-orange-50 border border-orange-200 rounded-xl p-5">
            <div>
              <span className="text-xs font-bold text-orange-800 uppercase">Basal Metabolic Rate (BMR)</span>
              <div className="text-3xl font-extrabold text-orange-950 mt-1">
                {Math.round(baseBmr)} <span className="text-sm font-medium text-orange-700">kcal/day</span>
              </div>
              <p className="text-xs text-orange-700 mt-1">Calories burned strictly at rest (coma rate).</p>
            </div>
            <div>
              <span className="text-xs font-bold text-orange-800 uppercase">TDEE (Total Daily Energy)</span>
              <div className="text-3xl font-extrabold text-orange-900 mt-1">
                {Math.round(tdee)} <span className="text-sm font-medium text-orange-700">kcal/day</span>
              </div>
              <p className="text-xs text-orange-700 mt-1">Calories needed to maintain current weight.</p>
            </div>
          </div>
        </div>
      )}

      {/* 3. CALORIE DEFICIT & MACRO CALCULATOR */}
      {(subToolId === 'calorie-deficit' || subToolId === 'macro' || subToolId === 'all') && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  🥗
                </span>
                Calorie Deficit & Macro Nutrient Split
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Calculate daily calorie targets for weight loss and optimal Protein, Carbs & Fat distribution.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Fitness Goal</label>
              <select
                value={weightGoal}
                onChange={(e) => setWeightGoal(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold"
              >
                <option value="mild_loss">Mild Weight Loss (-0.5 lbs/wk)</option>
                <option value="loss">Standard Weight Loss (-1 lb/wk)</option>
                <option value="extreme_loss">Aggressive Weight Loss (-2 lbs/wk)</option>
                <option value="maintain">Maintain Current Weight</option>
                <option value="gain">Muscle Gain / Bulk (+1 lb/wk)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Diet Style</label>
              <select
                value={dietRatio}
                onChange={(e) => setDietRatio(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold"
              >
                <option value="balanced">Balanced (30% P / 40% C / 30% F)</option>
                <option value="high_protein">High Protein (40% P / 35% C / 25% F)</option>
                <option value="keto">Ketogenic (25% P / 5% C / 70% F)</option>
              </select>
            </div>
          </div>

          <div className="bg-slate-900 text-white rounded-xl p-5 grid grid-cols-2 gap-4 text-center">
            <div>
              <span className="text-xs uppercase font-bold text-slate-400">Target Daily Calories</span>
              <div className="text-3xl font-extrabold text-emerald-400 mt-1">{targetCalories}</div>
              <span className="text-[11px] text-slate-400">kcal / day</span>
            </div>
            <div>
              <span className="text-xs uppercase font-bold text-blue-400">Protein</span>
              <div className="text-2xl font-bold text-white mt-1">{proteinGrams}g</div>
              <span className="text-[11px] text-slate-400">{proteinGrams * 4} kcal</span>
            </div>
            <div>
              <span className="text-xs uppercase font-bold text-amber-400">Carbohydrates</span>
              <div className="text-2xl font-bold text-white mt-1">{carbsGrams}g</div>
              <span className="text-[11px] text-slate-400">{carbsGrams * 4} kcal</span>
            </div>
            <div>
              <span className="text-xs uppercase font-bold text-rose-400">Fats</span>
              <div className="text-2xl font-bold text-white mt-1">{fatGrams}g</div>
              <span className="text-[11px] text-slate-400">{fatGrams * 9} kcal</span>
            </div>
          </div>
        </div>
      )}

      {/* 4. BRA SIZE & HEIGHT PREDICTOR */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bra Size Calculator */}
        {(subToolId === 'bra-size' || subToolId === 'all') && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-sm">
                📐
              </span>
              Bra Size Measurement Calculator
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-600 mb-1">Underbust Measurement (in)</label>
                <input
                  type="number"
                  value={underbustInches}
                  onChange={(e) => setUnderbustInches(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1">Bust Measurement (in)</label>
                <input
                  type="number"
                  value={bustInches}
                  onChange={(e) => setBustInches(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold"
                />
              </div>
            </div>
            <div className="bg-rose-50 p-4 rounded-xl border border-rose-200 text-center">
              <span className="text-xs text-rose-800 uppercase font-bold">Calculated Bra Size</span>
              <div className="text-3xl font-extrabold text-rose-950 mt-1">
                {bandSize} {calculatedCup}
              </div>
              <p className="text-xs text-rose-700 mt-1">US / UK Standard Band & Cup Equivalent</p>
            </div>
          </div>
        )}

        {/* Height Predictor Calculator */}
        {(subToolId === 'height-predictor' || subToolId === 'all') && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                📏
              </span>
              Child Adult Height Predictor
            </h2>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-slate-600 mb-1">Father's Height (in)</label>
                <input
                  type="number"
                  value={fatherHeightInches}
                  onChange={(e) => setFatherHeightInches(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1">Mother's Height (in)</label>
                <input
                  type="number"
                  value={motherHeightInches}
                  onChange={(e) => setMotherHeightInches(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1">Child's Gender</label>
                <select
                  value={childGender}
                  onChange={(e) => setChildGender(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold"
                >
                  <option value="boy">Boy</option>
                  <option value="girl">Girl</option>
                </select>
              </div>
            </div>
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 text-center">
              <span className="text-xs text-blue-800 uppercase font-bold">Predicted Adult Height</span>
              <div className="text-3xl font-extrabold text-blue-950 mt-1">
                {predictedFeet}' {predictedInches}" ({predictedCm} cm)
              </div>
              <p className="text-xs text-blue-700 mt-1">Mid-Parental Method (+/- 2 inches range)</p>
            </div>
          </div>
        )}
      </div>

      {/* 5. US NAVY BODY FAT CALCULATOR */}
      {(subToolId === 'body-fat-navy' || subToolId === 'all') && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
                  💪
                </span>
                US Navy Body Fat % Calculator
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Calculate body fat percentage and lean body mass using the official US Navy tape measure method.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Gender</label>
              <select
                value={navyGender}
                onChange={(e) => setNavyGender(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-semibold text-sm"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Height (Inches)</label>
              <input
                type="number"
                value={navyHeightIn}
                onChange={(e) => setNavyHeightIn(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Neck Circumference (Inches)</label>
              <input
                type="number"
                step="0.1"
                value={navyNeckIn}
                onChange={(e) => setNavyNeckIn(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Waist Circumference (Inches)</label>
              <input
                type="number"
                step="0.1"
                value={navyWaistIn}
                onChange={(e) => setNavyWaistIn(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold"
              />
            </div>
            {navyGender === 'female' && (
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Hip Circumference (Inches)</label>
                <input
                  type="number"
                  step="0.1"
                  value={navyHipIn}
                  onChange={(e) => setNavyHipIn(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold"
                />
              </div>
            )}
          </div>

          <div className="bg-teal-950 text-white rounded-xl p-5 flex items-center justify-between">
            <div>
              <span className="text-xs text-teal-300 uppercase font-bold">Estimated Body Fat Percentage</span>
              <div className="text-4xl font-extrabold text-teal-300 mt-1">{bodyFatPct.toFixed(1)}%</div>
              <span className="text-xs text-teal-200">
                {bodyFatPct < 14
                  ? 'Athletic / Lean range'
                  : bodyFatPct < 24
                  ? 'Fitness / Healthy range'
                  : 'Acceptable / Above average range'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 6. IDEAL WEIGHT & WATER INTAKE CALCULATOR */}
      {(subToolId === 'ideal-weight-water' || subToolId === 'all') && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  💧
                </span>
                Ideal Body Weight & Daily Water Intake Calculator
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Calculate medical ideal body weight (Devine Formula) and daily fluid hydration needs.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Current Weight (lbs)</label>
              <input
                type="number"
                value={userWeightLbs}
                onChange={(e) => setUserWeightLbs(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Height (Total Inches)</label>
              <input
                type="number"
                value={userHeightInchesTotal}
                onChange={(e) => setUserHeightInchesTotal(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Gender</label>
              <select
                value={userGender}
                onChange={(e) => setUserGender(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold"
              >
                <option value="female">Female</option>
                <option value="male">Male</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Daily Exercise (Mins)</label>
              <input
                type="number"
                value={exerciseMinsPerDay}
                onChange={(e) => setExerciseMinsPerDay(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-900 text-white p-5 rounded-xl text-center">
              <span className="text-xs uppercase text-slate-400 font-bold">Ideal Body Weight (Devine Formula)</span>
              <div className="text-3xl font-extrabold text-emerald-400 mt-1">
                {devineLbs} lbs <span className="text-sm font-normal text-slate-300">({devineKg.toFixed(0)} kg)</span>
              </div>
            </div>
            <div className="bg-blue-950 text-white p-5 rounded-xl text-center">
              <span className="text-xs uppercase text-blue-300 font-bold">Target Daily Hydration</span>
              <div className="text-3xl font-extrabold text-blue-200 mt-1">
                {totalWaterOz} oz <span className="text-sm font-normal text-blue-300">({totalWaterLiters} Liters / ~{Math.round(totalWaterOz / 8)} glasses)</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
