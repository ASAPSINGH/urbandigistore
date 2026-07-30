import React, { useState } from 'react';

interface Props {
  subToolId: string;
}

// Helper: result row
const Row = ({ label, value, unit = '', accent = 'indigo' }: { label: string; value: string | number; unit?: string; accent?: string }) => (
  <div className={`bg-${accent}-50 border border-${accent}-100 rounded-xl p-4 text-center`}>
    <span className={`text-[10px] uppercase font-bold text-${accent}-700 block`}>{label}</span>
    <div className={`text-xl font-extrabold text-${accent}-900 mt-1`}>{value}{unit && <span className={`text-sm font-bold text-${accent}-700 ml-1`}>{unit}</span>}</div>
  </div>
);

const Header2 = ({ emoji, title, subtitle, badge, color }: { emoji: string; title: string; subtitle: string; badge: string; color: string }) => (
  <div className={`flex items-center justify-between border-b border-slate-100 pb-4`}>
    <div>
      <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
        <span className={`w-8 h-8 rounded-lg bg-${color}-100 text-${color}-700 flex items-center justify-center`}>{emoji}</span>
        {title}
      </h2>
      <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
    </div>
    <span className={`text-xs font-semibold px-3 py-1 bg-${color}-50 text-${color}-700 rounded-full border border-${color}-200`}>{badge}</span>
  </div>
);

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
    {children}
  </div>
);

const inputCls = (color: string) => `w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-${color}-500 focus:outline-none font-semibold text-slate-800`;
const selectCls = (color: string) => `w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-${color}-500 focus:outline-none font-semibold text-slate-800`;
const card = 'bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6';
const grid2 = 'grid grid-cols-1 sm:grid-cols-2 gap-4';
const grid3 = 'grid grid-cols-1 sm:grid-cols-3 gap-4';

export const OtherCalculators: React.FC<Props> = ({ subToolId }) => {

  // ── PREGNANCY DUE DATE ──────────────────────────────
  const [lmp, setLmp] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [cycleLen, setCycleLen] = useState<number>(28);
  const pregResult = (() => {
    if (!lmp) return null;
    const d = new Date(lmp);
    if (isNaN(d.getTime())) return null;
    const due = new Date(d.getTime() + (280 + (cycleLen - 28)) * 86400000);
    const diff = Math.max(0, Math.floor((Date.now() - d.getTime()) / 86400000));
    const weeks = Math.floor(diff / 7); const days = diff % 7;
    const rem = Math.max(0, Math.floor((due.getTime() - Date.now()) / 86400000));
    return { due: due.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), weeks, days, tri: weeks >= 27 ? 'Third' : weeks >= 13 ? 'Second' : 'First', rem };
  })();

  // ── MOLARITY ─────────────────────────────────────────
  const [soluteMass, setSoluteMass] = useState<number>(5.84);
  const [mw, setMw] = useState<number>(58.44);
  const [volMl, setVolMl] = useState<number>(500);
  const molarity = mw > 0 && volMl > 0 ? (soluteMass / mw) / (volMl / 1000) : 0;

  // ── VELOCITY & ACCELERATION ──────────────────────────
  const [v0, setV0] = useState<number>(0);
  const [accel, setAccel] = useState<number>(9.8);
  const [tSec, setTSec] = useState<number>(5);
  const vf = v0 + accel * tSec;
  const dist = v0 * tSec + 0.5 * accel * tSec * tSec;

  // ── CALORIE BURN ─────────────────────────────────────
  const [wKg, setWKg] = useState<number>(70);
  const [durMin, setDurMin] = useState<number>(30);
  const [met, setMet] = useState<number>(11.5);
  const burned = durMin * met * wKg * 0.0175;

  // ── DOG AGE ──────────────────────────────────────────
  const [dogYrs, setDogYrs] = useState<number>(5);
  const [dogSz, setDogSz] = useState<'small' | 'medium' | 'large'>('medium');
  const dogResult = (() => {
    const trad = dogYrs * 7;
    const sci = dogYrs > 0 ? Math.round(16 * Math.log(dogYrs) + 31) : 0;
    const f = dogSz === 'small' ? 4 : dogSz === 'medium' ? 5 : 6;
    const size = dogYrs <= 1 ? 15 : dogYrs <= 2 ? 24 : 24 + (dogYrs - 2) * f;
    return { trad, sci, size };
  })();

  // ── OVULATION ─────────────────────────────────────────
  const [lastPeriod, setLastPeriod] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [ovCycle, setOvCycle] = useState<number>(28);
  const ovResult = (() => {
    if (!lastPeriod) return null;
    const d = new Date(lastPeriod);
    if (isNaN(d.getTime())) return null;
    const ov = new Date(d.getTime() + (ovCycle - 14) * 86400000);
    const winStart = new Date(ov.getTime() - 5 * 86400000);
    const winEnd = new Date(ov.getTime() + 1 * 86400000);
    const fmt = (dt: Date) => dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return { ov: fmt(ov), start: fmt(winStart), end: fmt(winEnd) };
  })();

  // ── BLOOD PRESSURE ────────────────────────────────────
  const [sys, setSys] = useState<number>(120);
  const [dia, setDia] = useState<number>(80);
  const bpCat = (() => {
    const map = (cat: string, col: string) => ({ cat, col });
    if (sys < 120 && dia < 80) return map('Normal', 'green');
    if (sys < 130 && dia < 80) return map('Elevated', 'yellow');
    if (sys < 140 || dia < 90) return map('Stage 1 Hypertension', 'orange');
    if (sys >= 180 || dia >= 120) return map('Hypertensive Crisis', 'red');
    return map('Stage 2 Hypertension', 'red');
  })();
  const map = Math.round(dia + (sys - dia) / 3);

  // ── CHILD BMI ─────────────────────────────────────────
  const [cAge, setCAge] = useState<number>(8);
  const [cSex, setCsex] = useState<'M' | 'F'>('M');
  const [cWeightKg, setCWeightKg] = useState<number>(28);
  const [cHeightCm, setCHeightCm] = useState<number>(128);
  const childBmi = cHeightCm > 0 ? (cWeightKg / Math.pow(cHeightCm / 100, 2)).toFixed(1) : '—';

  // ── pH CALCULATOR ─────────────────────────────────────
  const [hConc, setHConc] = useState<number>(0.001); // [H+] mol/L
  const phVal = hConc > 0 ? -Math.log10(hConc) : 7;
  const pohVal = 14 - phVal;
  const phLabel = phVal < 7 ? 'Acidic' : phVal > 7 ? 'Basic (Alkaline)' : 'Neutral';

  // ── IDEAL GAS LAW ─────────────────────────────────────
  const [gasP, setGasP] = useState<number>(1); // atm
  const [gasV, setGasV] = useState<number>(22.4); // L
  const [gasN, setGasN] = useState<number>(1); // mol
  const gasT = (gasP * gasV) / (gasN * 0.08206); // K

  // ── DILUTION CALCULATOR ───────────────────────────────
  const [c1, setC1] = useState<number>(10); // mol/L
  const [v1, setV1] = useState<number>(50); // mL
  const [c2, setC2] = useState<number>(2); // target mol/L
  const v2 = c2 > 0 ? (c1 * v1) / c2 : 0;

  // ── PROJECTILE MOTION ─────────────────────────────────
  const [projAngle, setProjAngle] = useState<number>(45); // degrees
  const [projV0, setProjV0] = useState<number>(20); // m/s
  const g = 9.81;
  const rad = (projAngle * Math.PI) / 180;
  const projRange = (projV0 * projV0 * Math.sin(2 * rad)) / g;
  const projMaxH = (projV0 * projV0 * Math.sin(rad) * Math.sin(rad)) / (2 * g);
  const projTime = (2 * projV0 * Math.sin(rad)) / g;

  // ── OHM'S LAW ─────────────────────────────────────────
  const [ohmV, setOhmV] = useState<number>(120);
  const [ohmR, setOhmR] = useState<number>(60);
  const ohmI = ohmR > 0 ? ohmV / ohmR : 0;
  const ohmP = ohmV * ohmI;

  // ── WORK, ENERGY & POWER ──────────────────────────────
  const [ewMass, setEwMass] = useState<number>(10); // kg
  const [ewHeight, setEwHeight] = useState<number>(5); // m
  const [ewVelocity, setEwVelocity] = useState<number>(3); // m/s
  const [ewTime, setEwTime] = useState<number>(2); // s
  const PE = ewMass * 9.81 * ewHeight;
  const KE = 0.5 * ewMass * ewVelocity * ewVelocity;
  const Work = PE;
  const Power = ewTime > 0 ? Work / ewTime : 0;

  // ── PACE CALCULATOR ───────────────────────────────────
  const [paceMin, setPaceMin] = useState<number>(9);
  const [paceSec, setPaceSec] = useState<number>(0);
  const totalPaceSec = paceMin * 60 + paceSec;
  const fmt = (s: number) => `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m ${Math.round(s % 60)}s`;
  const races = [
    { name: '5K', dist: 3.107 }, { name: '10K', dist: 6.214 },
    { name: 'Half Marathon', dist: 13.109 }, { name: 'Full Marathon', dist: 26.219 }
  ].map(r => ({ ...r, time: fmt(r.dist * totalPaceSec) }));

  // ── VO2 MAX ───────────────────────────────────────────
  const [vo2Age, setVo2Age] = useState<number>(30);
  const [hrRest, setHrRest] = useState<number>(65);
  const [hrMax, setHrMax] = useState<number>(190);
  const vo2 = 15 * (hrMax / hrRest);
  const vo2Cat = vo2 >= 55 ? 'Superior' : vo2 >= 48 ? 'Excellent' : vo2 >= 42 ? 'Good' : vo2 >= 36 ? 'Fair' : 'Poor';

  // ── ONE REP MAX ───────────────────────────────────────
  const [ormWeight, setOrmWeight] = useState<number>(100); // kg
  const [ormReps, setOrmReps] = useState<number>(5);
  const brzycki = ormWeight * (36 / (37 - ormReps));
  const epley = ormWeight * (1 + ormReps / 30);
  const lombardi = ormWeight * Math.pow(ormReps, 0.1);

  // ── SLEEP CALCULATOR ─────────────────────────────────
  const [wakeTime, setWakeTime] = useState<string>('07:00');
  const sleepCycles = [6, 7.5, 9].map(h => {
    const wakeMs = (() => {
      const [hh, mm] = wakeTime.split(':').map(Number);
      return hh * 60 + mm;
    })();
    const bedMs = ((wakeMs - h * 60) + 1440) % 1440;
    return { hrs: h, bed: `${String(Math.floor(bedMs / 60)).padStart(2, '0')}:${String(bedMs % 60).padStart(2, '0')}` };
  });

  // ── FUEL COST ─────────────────────────────────────────
  const [tripMiles, setTripMiles] = useState<number>(500);
  const [mpg, setMpg] = useState<number>(30);
  const [gasPrice, setGasPrice] = useState<number>(3.5);
  const fuelCost = mpg > 0 ? (tripMiles / mpg) * gasPrice : 0;
  const gallonsUsed = mpg > 0 ? tripMiles / mpg : 0;

  // ── DISCOUNT CALCULATOR ───────────────────────────────
  const [origPrice, setOrigPrice] = useState<number>(199);
  const [discPct, setDiscPct] = useState<number>(25);
  const savings = (origPrice * discPct) / 100;
  const salePrice = origPrice - savings;

  // ── CARBON FOOTPRINT ──────────────────────────────────
  const [kwh, setKwh] = useState<number>(900); // monthly kWh
  const [carMiles, setCarMiles] = useState<number>(12000); // annual miles
  const [flights, setFlights] = useState<number>(2); // short haul flights/yr
  const [dietType, setDietType] = useState<number>(2.5); // tonnes/yr
  const carbonTotal = ((kwh * 12 * 0.000386) + (carMiles * 0.000404) + (flights * 0.9) + dietType).toFixed(2);

  // ── SOLAR PANEL SAVINGS ───────────────────────────────
  const [panelKw, setPanelKw] = useState<number>(6); // system kW
  const [elecRate, setElecRate] = useState<number>(0.14); // $/kWh
  const [panelCost, setPanelCost] = useState<number>(18000);
  const annualKwh = panelKw * 4 * 365;
  const annualSavings = annualKwh * elecRate;
  const payback = annualSavings > 0 ? panelCost / annualSavings : 0;

  // ── WATER FOOTPRINT ───────────────────────────────────
  const [showerMin, setShowerMin] = useState<number>(8);
  const [showerPerDay, setShowerPerDay] = useState<number>(1);
  const [laundryLoads, setLaundryLoads] = useState<number>(5);
  const dailyWater = (showerMin * 2.1 * showerPerDay) + (laundryLoads * 19 / 7) + 30;

  // ── COOKING CONVERSION ────────────────────────────────
  const [cookAmt, setCookAmt] = useState<number>(1);
  const [cookFrom, setCookFrom] = useState<string>('cup');
  const [cookTo, setCookTo] = useState<string>('ml');
  const mlBase: Record<string, number> = { cup: 236.588, ml: 1, tbsp: 14.7868, tsp: 4.92892, oz: 29.5735, L: 1000, pint: 473.176 };
  const cookResult = mlBase[cookFrom] && mlBase[cookTo] ? ((cookAmt * mlBase[cookFrom]) / mlBase[cookTo]).toFixed(3) : '—';

  // ── CALORIE DENSITY ───────────────────────────────────
  const [foodCal, setFoodCal] = useState<number>(350);
  const [foodGrams, setFoodGrams] = useState<number>(100);
  const calDensity = foodGrams > 0 ? (foodCal / foodGrams).toFixed(2) : '0';

  // ── ALCOHOL / BAC ─────────────────────────────────────
  const [drinks, setDrinks] = useState<number>(2);
  const [abv, setAbv] = useState<number>(5);
  const [drinkOz, setDrinkOz] = useState<number>(12);
  const [bodyWtLb, setBodyWtLb] = useState<number>(160);
  const [alcoholSex, setAlcoholSex] = useState<'M' | 'F'>('M');
  const units = (drinks * abv * drinkOz * 0.5915) / 10;
  const r = alcoholSex === 'M' ? 0.73 : 0.66;
  const bac = (drinks * 0.6 * 5.14) / (bodyWtLb * r);
  const soberHrs = bac / 0.015;

  // ── Z-SCORE ───────────────────────────────────────────
  const [rawScore, setRawScore] = useState<number>(75);
  const [mean, setMean] = useState<number>(70);
  const [sd, setSd] = useState<number>(10);
  const zScore = sd > 0 ? ((rawScore - mean) / sd).toFixed(3) : '0';
  const zNum = sd > 0 ? (rawScore - mean) / sd : 0;
  const pctApprox = (() => {
    // Approximate normal CDF using error function approximation
    const z = zNum;
    const t = 1 / (1 + 0.2315419 * Math.abs(z));
    const poly = t * (0.319381530 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
    const phi = (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * z * z) * poly;
    const cdf = z >= 0 ? 1 - phi : phi;
    return (cdf * 100).toFixed(1);
  })();

  // ── CONFIDENCE INTERVAL ───────────────────────────────
  const [ciMean, setCiMean] = useState<number>(50);
  const [ciSd, setCiSd] = useState<number>(10);
  const [ciN, setCiN] = useState<number>(100);
  const [ciConf, setCiConf] = useState<number>(95);
  const zCrit = ciConf === 99 ? 2.576 : ciConf === 90 ? 1.645 : 1.96;
  const se = ciN > 0 ? ciSd / Math.sqrt(ciN) : 0;
  const moe = zCrit * se;
  const ciLow = (ciMean - moe).toFixed(2);
  const ciHigh = (ciMean + moe).toFixed(2);

  // ── SAMPLE SIZE ───────────────────────────────────────
  const [ssConf, setSsConf] = useState<number>(95);
  const [ssMoe, setSsMoe] = useState<number>(5);
  const [ssProp, setSsProp] = useState<number>(50);
  const ssZ = ssConf === 99 ? 2.576 : ssConf === 90 ? 1.645 : 1.96;
  const p = ssProp / 100;
  const sampleSize = Math.ceil((ssZ * ssZ * p * (1 - p)) / Math.pow(ssMoe / 100, 2));

  // ── RENDER ────────────────────────────────────────────
  return (
    <div className="space-y-8">

      {/* 1 - PREGNANCY */}
      {subToolId === 'pregnancy-due-date' && (
        <div className={card}>
          <Header2 emoji="🤰" title="Pregnancy Due Date" subtitle="Estimate due milestones and delivery timeline." badge="Biology" color="pink" />
          <div className={grid2}>
            <Field label="Last Period First Day (LMP)"><input type="date" value={lmp} onChange={e => setLmp(e.target.value)} className={inputCls('pink')} /></Field>
            <Field label="Average Cycle Length (Days)"><input type="number" value={cycleLen} onChange={e => setCycleLen(Math.max(20, Number(e.target.value)))} className={inputCls('pink')} /></Field>
          </div>
          {pregResult && (
            <div className="bg-pink-50 border border-pink-100 rounded-xl p-5 grid grid-cols-2 gap-4 text-center">
              <Row label="Estimated Due Date" value={pregResult.due} accent="pink" />
              <Row label="Gestational Age" value={`${pregResult.weeks}w ${pregResult.days}d`} accent="pink" />
              <Row label="Trimester" value={`${pregResult.tri} Trimester`} accent="pink" />
              <Row label="Days to Delivery" value={pregResult.rem} unit="days" accent="pink" />
            </div>
          )}
        </div>
      )}

      {/* 2 - MOLARITY */}
      {subToolId === 'molarity' && (
        <div className={card}>
          <Header2 emoji="🧪" title="Molarity Calculator" subtitle="Calculate molar concentration of solutions." badge="Chemistry" color="teal" />
          <div className={grid2}>
            <Field label="Mass of Solute (g)"><input type="number" value={soluteMass} onChange={e => setSoluteMass(Number(e.target.value))} className={inputCls('teal')} /></Field>
            <Field label="Formula Weight (g/mol)"><input type="number" value={mw} onChange={e => setMw(Number(e.target.value))} className={inputCls('teal')} /></Field>
            <Field label="Solution Volume (mL)"><input type="number" value={volMl} onChange={e => setVolMl(Number(e.target.value))} className={inputCls('teal')} /></Field>
          </div>
          <Row label="Molar Concentration" value={molarity.toFixed(4)} unit="mol/L" accent="teal" />
        </div>
      )}

      {/* 3 - VELOCITY */}
      {subToolId === 'velocity-acceleration' && (
        <div className={card}>
          <Header2 emoji="🌌" title="Velocity & Acceleration" subtitle="Solve kinematics motion equations." badge="Physics" color="blue" />
          <div className={grid2}>
            <Field label="Initial Velocity (m/s)"><input type="number" value={v0} onChange={e => setV0(Number(e.target.value))} className={inputCls('blue')} /></Field>
            <Field label="Acceleration (m/s²)"><input type="number" value={accel} onChange={e => setAccel(Number(e.target.value))} className={inputCls('blue')} /></Field>
            <Field label="Time Elapsed (s)"><input type="number" value={tSec} onChange={e => setTSec(Math.max(0, Number(e.target.value)))} className={inputCls('blue')} /></Field>
          </div>
          <div className={grid2}>
            <Row label="Final Velocity" value={vf.toFixed(2)} unit="m/s" accent="blue" />
            <Row label="Distance Traveled" value={dist.toFixed(2)} unit="m" accent="blue" />
          </div>
        </div>
      )}

      {/* 4 - CALORIE BURN */}
      {subToolId === 'calorie-burn' && (
        <div className={card}>
          <Header2 emoji="🏃" title="Activity Calorie Burn" subtitle="Estimate metabolic burn from exercise." badge="Sports" color="orange" />
          <div className={grid2}>
            <Field label="Body Weight (kg)"><input type="number" value={wKg} onChange={e => setWKg(Number(e.target.value))} className={inputCls('orange')} /></Field>
            <Field label="Duration (minutes)"><input type="number" value={durMin} onChange={e => setDurMin(Number(e.target.value))} className={inputCls('orange')} /></Field>
            <Field label="Exercise Type">
              <select value={met} onChange={e => setMet(Number(e.target.value))} className={selectCls('orange')}>
                <option value={11.5}>Running (Moderate)</option>
                <option value={14.5}>Running (Fast)</option>
                <option value={4.0}>Walking (Brisk)</option>
                <option value={8.0}>Cycling (Moderate)</option>
                <option value={9.8}>Swimming (Laps)</option>
                <option value={6.0}>Yoga / Pilates</option>
                <option value={3.5}>Weight Training</option>
              </select>
            </Field>
          </div>
          <Row label="Estimated Calories Burned" value={Math.round(burned)} unit="kcal" accent="orange" />
        </div>
      )}

      {/* 5 - DOG AGE */}
      {subToolId === 'dog-age' && (
        <div className={card}>
          <Header2 emoji="🐕" title="Dog Age Converter" subtitle="Convert dog years to human equivalent." badge="Everyday Life" color="rose" />
          <div className={grid2}>
            <Field label="Dog Age (Years)"><input type="number" value={dogYrs} onChange={e => setDogYrs(Math.max(0.5, Number(e.target.value)))} className={inputCls('rose')} /></Field>
            <Field label="Breed Size">
              <select value={dogSz} onChange={e => setDogSz(e.target.value as 'small' | 'medium' | 'large')} className={selectCls('rose')}>
                <option value="small">Small (&lt; 20 lbs)</option>
                <option value="medium">Medium (20–50 lbs)</option>
                <option value="large">Large (&gt; 50 lbs)</option>
              </select>
            </Field>
          </div>
          <div className={grid3}>
            <Row label="Size-Aware Model" value={dogResult.size} unit="yrs" accent="rose" />
            <Row label="Scientific (log)" value={dogResult.sci} unit="yrs" accent="rose" />
            <Row label="Traditional (×7)" value={dogResult.trad} unit="yrs" accent="rose" />
          </div>
        </div>
      )}

      {/* 6 - OVULATION */}
      {subToolId === 'ovulation-calculator' && (
        <div className={card}>
          <Header2 emoji="🧬" title="Ovulation & Fertility Window" subtitle="Find your most fertile days for conception." badge="Biology" color="pink" />
          <div className={grid2}>
            <Field label="First Day of Last Period"><input type="date" value={lastPeriod} onChange={e => setLastPeriod(e.target.value)} className={inputCls('pink')} /></Field>
            <Field label="Cycle Length (Days)"><input type="number" value={ovCycle} min={21} max={45} onChange={e => setOvCycle(Number(e.target.value))} className={inputCls('pink')} /></Field>
          </div>
          {ovResult && (
            <div className={grid3}>
              <Row label="Fertile Window Start" value={ovResult.start} accent="pink" />
              <Row label="Ovulation Day" value={ovResult.ov} accent="pink" />
              <Row label="Fertile Window End" value={ovResult.end} accent="pink" />
            </div>
          )}
        </div>
      )}

      {/* 7 - BLOOD PRESSURE */}
      {subToolId === 'blood-pressure' && (
        <div className={card}>
          <Header2 emoji="❤️" title="Blood Pressure Classifier" subtitle="AHA blood pressure category & MAP calculator." badge="Biology" color="red" />
          <div className={grid2}>
            <Field label="Systolic Pressure (mmHg)"><input type="number" value={sys} onChange={e => setSys(Number(e.target.value))} className={inputCls('red')} /></Field>
            <Field label="Diastolic Pressure (mmHg)"><input type="number" value={dia} onChange={e => setDia(Number(e.target.value))} className={inputCls('red')} /></Field>
          </div>
          <div className={grid2}>
            <Row label="AHA Category" value={bpCat.cat} accent="red" />
            <Row label="Mean Arterial Pressure" value={map} unit="mmHg" accent="red" />
          </div>
          <p className="text-xs text-slate-400 text-center">Normal: &lt;120/80 · Elevated: 120–129/&lt;80 · Stage 1: 130–139/80–89 · Stage 2: ≥140/90</p>
        </div>
      )}

      {/* 8 - CHILD BMI */}
      {subToolId === 'bmi-children' && (
        <div className={card}>
          <Header2 emoji="👶" title="Child BMI & Percentile" subtitle="CDC BMI-for-age reference (ages 2–20)." badge="Biology" color="emerald" />
          <div className={grid2}>
            <Field label="Child Age (years)"><input type="number" value={cAge} min={2} max={20} onChange={e => setCAge(Number(e.target.value))} className={inputCls('emerald')} /></Field>
            <Field label="Biological Sex"><select value={cSex} onChange={e => setCsex(e.target.value as 'M' | 'F')} className={selectCls('emerald')}><option value="M">Male</option><option value="F">Female</option></select></Field>
            <Field label="Weight (kg)"><input type="number" value={cWeightKg} onChange={e => setCWeightKg(Number(e.target.value))} className={inputCls('emerald')} /></Field>
            <Field label="Height (cm)"><input type="number" value={cHeightCm} onChange={e => setCHeightCm(Number(e.target.value))} className={inputCls('emerald')} /></Field>
          </div>
          <div className={grid2}>
            <Row label="Child BMI" value={childBmi} unit="kg/m²" accent="emerald" />
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-xs text-emerald-800 space-y-1">
              <p className="font-bold">BMI Percentile Ranges (age-based):</p>
              <p>Underweight: &lt; 5th percentile</p>
              <p>Healthy weight: 5th–84th percentile</p>
              <p>Overweight: 85th–94th percentile</p>
              <p>Obese: ≥ 95th percentile</p>
            </div>
          </div>
        </div>
      )}

      {/* 9 - pH */}
      {subToolId === 'ph-calculator' && (
        <div className={card}>
          <Header2 emoji="⚗️" title="pH & Acid-Base Calculator" subtitle="Calculate pH, pOH and solution classification." badge="Chemistry" color="purple" />
          <Field label="Hydrogen Ion Concentration [H⁺] (mol/L)">
            <input type="number" value={hConc} step={0.0001} onChange={e => setHConc(Math.max(1e-14, Number(e.target.value)))} className={inputCls('purple')} />
          </Field>
          <div className={grid3}>
            <Row label="pH" value={phVal.toFixed(2)} accent="purple" />
            <Row label="pOH" value={pohVal.toFixed(2)} accent="purple" />
            <Row label="Classification" value={phLabel} accent="purple" />
          </div>
          <p className="text-xs text-slate-400 text-center">pH 0–6 = Acid · pH 7 = Neutral · pH 8–14 = Base</p>
        </div>
      )}

      {/* 10 - IDEAL GAS LAW */}
      {subToolId === 'ideal-gas-law' && (
        <div className={card}>
          <Header2 emoji="💨" title="Ideal Gas Law (PV = nRT)" subtitle="Solve for temperature given P, V, and n." badge="Chemistry" color="sky" />
          <div className={grid3}>
            <Field label="Pressure (atm)"><input type="number" value={gasP} step={0.1} onChange={e => setGasP(Number(e.target.value))} className={inputCls('sky')} /></Field>
            <Field label="Volume (L)"><input type="number" value={gasV} step={0.1} onChange={e => setGasV(Number(e.target.value))} className={inputCls('sky')} /></Field>
            <Field label="Moles (n)"><input type="number" value={gasN} step={0.01} onChange={e => setGasN(Number(e.target.value))} className={inputCls('sky')} /></Field>
          </div>
          <div className={grid2}>
            <Row label="Temperature" value={gasT.toFixed(1)} unit="K" accent="sky" />
            <Row label="Temperature" value={(gasT - 273.15).toFixed(1)} unit="°C" accent="sky" />
          </div>
          <p className="text-xs text-slate-400 text-center">R = 0.08206 L·atm/mol·K</p>
        </div>
      )}

      {/* 11 - DILUTION */}
      {subToolId === 'dilution-calculator' && (
        <div className={card}>
          <Header2 emoji="🔬" title="Solution Dilution (C₁V₁ = C₂V₂)" subtitle="Calculate final volume after dilution." badge="Chemistry" color="cyan" />
          <div className={grid2}>
            <Field label="Stock Concentration C₁ (mol/L)"><input type="number" value={c1} onChange={e => setC1(Number(e.target.value))} className={inputCls('cyan')} /></Field>
            <Field label="Stock Volume V₁ (mL)"><input type="number" value={v1} onChange={e => setV1(Number(e.target.value))} className={inputCls('cyan')} /></Field>
            <Field label="Target Concentration C₂ (mol/L)"><input type="number" value={c2} step={0.1} onChange={e => setC2(Math.max(0.001, Number(e.target.value)))} className={inputCls('cyan')} /></Field>
          </div>
          <Row label="Final Volume V₂" value={v2.toFixed(1)} unit="mL" accent="cyan" />
        </div>
      )}

      {/* 12 - PROJECTILE MOTION */}
      {subToolId === 'projectile-motion' && (
        <div className={card}>
          <Header2 emoji="🚀" title="Projectile Motion" subtitle="Calculate trajectory, range, and max height." badge="Physics" color="violet" />
          <div className={grid2}>
            <Field label="Launch Angle (degrees)"><input type="number" value={projAngle} min={0} max={90} onChange={e => setProjAngle(Number(e.target.value))} className={inputCls('violet')} /></Field>
            <Field label="Initial Velocity (m/s)"><input type="number" value={projV0} onChange={e => setProjV0(Number(e.target.value))} className={inputCls('violet')} /></Field>
          </div>
          <div className={grid3}>
            <Row label="Horizontal Range" value={projRange.toFixed(2)} unit="m" accent="violet" />
            <Row label="Max Height" value={projMaxH.toFixed(2)} unit="m" accent="violet" />
            <Row label="Time of Flight" value={projTime.toFixed(2)} unit="s" accent="violet" />
          </div>
        </div>
      )}

      {/* 13 - OHM'S LAW */}
      {subToolId === 'ohms-law' && (
        <div className={card}>
          <Header2 emoji="⚡" title="Ohm's Law Calculator" subtitle="Solve V = IR and P = IV for any variable." badge="Physics" color="yellow" />
          <div className={grid2}>
            <Field label="Voltage V (Volts)"><input type="number" value={ohmV} onChange={e => setOhmV(Number(e.target.value))} className={inputCls('yellow')} /></Field>
            <Field label="Resistance R (Ohms)"><input type="number" value={ohmR} onChange={e => setOhmR(Math.max(0.001, Number(e.target.value)))} className={inputCls('yellow')} /></Field>
          </div>
          <div className={grid2}>
            <Row label="Current I" value={ohmI.toFixed(4)} unit="A" accent="yellow" />
            <Row label="Power P" value={ohmP.toFixed(2)} unit="W" accent="yellow" />
          </div>
        </div>
      )}

      {/* 14 - WORK ENERGY */}
      {subToolId === 'energy-work' && (
        <div className={card}>
          <Header2 emoji="🔋" title="Work, Energy & Power" subtitle="Calculate PE, KE, work done, and power output." badge="Physics" color="amber" />
          <div className={grid2}>
            <Field label="Mass (kg)"><input type="number" value={ewMass} onChange={e => setEwMass(Number(e.target.value))} className={inputCls('amber')} /></Field>
            <Field label="Height (m)"><input type="number" value={ewHeight} onChange={e => setEwHeight(Number(e.target.value))} className={inputCls('amber')} /></Field>
            <Field label="Velocity (m/s)"><input type="number" value={ewVelocity} onChange={e => setEwVelocity(Number(e.target.value))} className={inputCls('amber')} /></Field>
            <Field label="Time (s)"><input type="number" value={ewTime} onChange={e => setEwTime(Number(e.target.value))} className={inputCls('amber')} /></Field>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Row label="Potential Energy" value={PE.toFixed(1)} unit="J" accent="amber" />
            <Row label="Kinetic Energy" value={KE.toFixed(1)} unit="J" accent="amber" />
            <Row label="Work Done" value={Work.toFixed(1)} unit="J" accent="amber" />
            <Row label="Power Output" value={Power.toFixed(2)} unit="W" accent="amber" />
          </div>
        </div>
      )}

      {/* 15 - PACE CALCULATOR */}
      {subToolId === 'pace-calculator' && (
        <div className={card}>
          <Header2 emoji="🏅" title="Running Pace Calculator" subtitle="Predict race finish times from pace per mile." badge="Sports" color="green" />
          <div className={grid2}>
            <Field label="Pace — Minutes"><input type="number" value={paceMin} min={0} onChange={e => setPaceMin(Number(e.target.value))} className={inputCls('green')} /></Field>
            <Field label="Pace — Seconds"><input type="number" value={paceSec} min={0} max={59} onChange={e => setPaceSec(Number(e.target.value))} className={inputCls('green')} /></Field>
          </div>
          <div className="space-y-2">
            {races.map(r => (
              <div key={r.name} className="flex items-center justify-between bg-green-50 border border-green-100 rounded-xl px-4 py-3">
                <span className="text-xs font-bold text-green-700">{r.name}</span>
                <span className="text-sm font-extrabold text-green-900">{r.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 16 - VO2 MAX */}
      {subToolId === 'vo2-max' && (
        <div className={card}>
          <Header2 emoji="🫁" title="VO₂ Max Estimator" subtitle="Estimate aerobic fitness using HR method." badge="Sports" color="lime" />
          <div className={grid3}>
            <Field label="Age (years)"><input type="number" value={vo2Age} onChange={e => setVo2Age(Number(e.target.value))} className={inputCls('lime')} /></Field>
            <Field label="Resting Heart Rate"><input type="number" value={hrRest} onChange={e => setHrRest(Number(e.target.value))} className={inputCls('lime')} /></Field>
            <Field label="Max Heart Rate (or 220 − age)"><input type="number" value={hrMax} onChange={e => setHrMax(Number(e.target.value))} className={inputCls('lime')} /></Field>
          </div>
          <div className={grid2}>
            <Row label="Estimated VO₂ Max" value={vo2.toFixed(1)} unit="mL/kg/min" accent="lime" />
            <Row label="Fitness Category" value={vo2Cat} accent="lime" />
          </div>
        </div>
      )}

      {/* 17 - ONE REP MAX */}
      {subToolId === 'one-rep-max' && (
        <div className={card}>
          <Header2 emoji="🏋️" title="1RM One Rep Max" subtitle="Estimate maximum strength across 3 formulas." badge="Sports" color="red" />
          <div className={grid2}>
            <Field label="Weight Lifted (kg)"><input type="number" value={ormWeight} onChange={e => setOrmWeight(Number(e.target.value))} className={inputCls('red')} /></Field>
            <Field label="Reps Completed"><input type="number" value={ormReps} min={1} max={15} onChange={e => setOrmReps(Math.max(1, Math.min(15, Number(e.target.value))))} className={inputCls('red')} /></Field>
          </div>
          <div className={grid3}>
            <Row label="Brzycki" value={brzycki.toFixed(1)} unit="kg" accent="red" />
            <Row label="Epley" value={epley.toFixed(1)} unit="kg" accent="red" />
            <Row label="Lombardi" value={lombardi.toFixed(1)} unit="kg" accent="red" />
          </div>
        </div>
      )}

      {/* 18 - SLEEP CALCULATOR */}
      {subToolId === 'sleep-calculator' && (
        <div className={card}>
          <Header2 emoji="🌙" title="Sleep Cycle Calculator" subtitle="Wake up refreshed by aligning with 90-min cycles." badge="Everyday Life" color="indigo" />
          <Field label="Target Wake-Up Time"><input type="time" value={wakeTime} onChange={e => setWakeTime(e.target.value)} className={inputCls('indigo')} /></Field>
          <div className="space-y-2">
            {sleepCycles.map(s => (
              <div key={s.hrs} className="flex items-center justify-between bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3">
                <span className="text-xs font-bold text-indigo-700">{s.hrs}h sleep ({s.hrs === 6 ? '4' : s.hrs === 7.5 ? '5' : '6'} cycles)</span>
                <span className="text-sm font-extrabold text-indigo-900">Go to bed at {s.bed}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-400 text-center">Includes 14 min to fall asleep. Aim for 5–6 complete cycles.</p>
        </div>
      )}

      {/* 19 - FUEL COST */}
      {subToolId === 'fuel-cost' && (
        <div className={card}>
          <Header2 emoji="⛽" title="Road Trip Fuel Cost" subtitle="Estimate gas spend for any trip distance." badge="Everyday Life" color="stone" />
          <div className={grid3}>
            <Field label="Distance (miles)"><input type="number" value={tripMiles} onChange={e => setTripMiles(Number(e.target.value))} className={inputCls('stone')} /></Field>
            <Field label="Fuel Economy (MPG)"><input type="number" value={mpg} onChange={e => setMpg(Number(e.target.value))} className={inputCls('stone')} /></Field>
            <Field label="Gas Price ($/gal)"><input type="number" value={gasPrice} step={0.01} onChange={e => setGasPrice(Number(e.target.value))} className={inputCls('stone')} /></Field>
          </div>
          <div className={grid2}>
            <Row label="Total Fuel Cost" value={`$${fuelCost.toFixed(2)}`} accent="stone" />
            <Row label="Gallons Used" value={gallonsUsed.toFixed(1)} unit="gal" accent="stone" />
          </div>
        </div>
      )}

      {/* 20 - DISCOUNT */}
      {subToolId === 'discount-calculator' && (
        <div className={card}>
          <Header2 emoji="🏷️" title="Discount & Sale Price" subtitle="Calculate final price after any percentage off." badge="Everyday Life" color="fuchsia" />
          <div className={grid2}>
            <Field label="Original Price ($)"><input type="number" value={origPrice} onChange={e => setOrigPrice(Number(e.target.value))} className={inputCls('fuchsia')} /></Field>
            <Field label="Discount (%)"><input type="number" value={discPct} min={0} max={100} onChange={e => setDiscPct(Number(e.target.value))} className={inputCls('fuchsia')} /></Field>
          </div>
          <div className={grid3}>
            <Row label="Sale Price" value={`$${salePrice.toFixed(2)}`} accent="fuchsia" />
            <Row label="You Save" value={`$${savings.toFixed(2)}`} accent="fuchsia" />
            <Row label="Discount" value={`${discPct}%`} accent="fuchsia" />
          </div>
        </div>
      )}

      {/* 21 - CARBON FOOTPRINT */}
      {subToolId === 'carbon-footprint' && (
        <div className={card}>
          <Header2 emoji="🌿" title="Carbon Footprint Calculator" subtitle="Estimate your annual CO₂ emissions." badge="Ecology" color="green" />
          <div className={grid2}>
            <Field label="Monthly Electricity (kWh)"><input type="number" value={kwh} onChange={e => setKwh(Number(e.target.value))} className={inputCls('green')} /></Field>
            <Field label="Annual Car Miles"><input type="number" value={carMiles} onChange={e => setCarMiles(Number(e.target.value))} className={inputCls('green')} /></Field>
            <Field label="Short-Haul Flights / Year"><input type="number" value={flights} min={0} onChange={e => setFlights(Number(e.target.value))} className={inputCls('green')} /></Field>
            <Field label="Diet Type">
              <select value={dietType} onChange={e => setDietType(Number(e.target.value))} className={selectCls('green')}>
                <option value={1.5}>Vegan</option>
                <option value={2.0}>Vegetarian</option>
                <option value={2.5}>Average Omnivore</option>
                <option value={3.3}>Heavy Meat Eater</option>
              </select>
            </Field>
          </div>
          <Row label="Annual Carbon Footprint" value={carbonTotal} unit="tonnes CO₂" accent="green" />
          <p className="text-xs text-slate-400 text-center">Global average: ~4 tonnes/year · Paris Agreement target: &lt;2 tonnes/year</p>
        </div>
      )}

      {/* 22 - SOLAR SAVINGS */}
      {subToolId === 'solar-panel-savings' && (
        <div className={card}>
          <Header2 emoji="☀️" title="Solar Panel Savings" subtitle="ROI, annual savings, and payback period estimate." badge="Ecology" color="yellow" />
          <div className={grid3}>
            <Field label="System Size (kW)"><input type="number" value={panelKw} step={0.5} onChange={e => setPanelKw(Number(e.target.value))} className={inputCls('yellow')} /></Field>
            <Field label="Electricity Rate ($/kWh)"><input type="number" value={elecRate} step={0.01} onChange={e => setElecRate(Number(e.target.value))} className={inputCls('yellow')} /></Field>
            <Field label="Installation Cost ($)"><input type="number" value={panelCost} step={500} onChange={e => setPanelCost(Number(e.target.value))} className={inputCls('yellow')} /></Field>
          </div>
          <div className={grid3}>
            <Row label="Annual kWh Generated" value={annualKwh.toLocaleString()} unit="kWh" accent="yellow" />
            <Row label="Annual Savings" value={`$${annualSavings.toFixed(0)}`} accent="yellow" />
            <Row label="Payback Period" value={payback.toFixed(1)} unit="years" accent="yellow" />
          </div>
        </div>
      )}

      {/* 23 - WATER FOOTPRINT */}
      {subToolId === 'water-footprint' && (
        <div className={card}>
          <Header2 emoji="💧" title="Water Footprint Calculator" subtitle="Estimate daily household water consumption." badge="Ecology" color="cyan" />
          <div className={grid3}>
            <Field label="Shower Duration (min)"><input type="number" value={showerMin} onChange={e => setShowerMin(Number(e.target.value))} className={inputCls('cyan')} /></Field>
            <Field label="Showers per Day"><input type="number" value={showerPerDay} min={0} max={5} onChange={e => setShowerPerDay(Number(e.target.value))} className={inputCls('cyan')} /></Field>
            <Field label="Laundry Loads/Week"><input type="number" value={laundryLoads} min={0} onChange={e => setLaundryLoads(Number(e.target.value))} className={inputCls('cyan')} /></Field>
          </div>
          <Row label="Daily Water Use" value={dailyWater.toFixed(0)} unit="gallons/day" accent="cyan" />
          <p className="text-xs text-slate-400 text-center">US average: ~80–100 gallons/day. Shower: 2.1 gal/min. Laundry: ~19 gal/load.</p>
        </div>
      )}

      {/* 24 - COOKING CONVERSION */}
      {subToolId === 'cooking-conversion' && (
        <div className={card}>
          <Header2 emoji="🍳" title="Cooking Measurement Converter" subtitle="Convert cups, ml, tbsp, oz, and more." badge="Food" color="orange" />
          <div className={grid3}>
            <Field label="Amount"><input type="number" value={cookAmt} step={0.25} onChange={e => setCookAmt(Number(e.target.value))} className={inputCls('orange')} /></Field>
            <Field label="From">
              <select value={cookFrom} onChange={e => setCookFrom(e.target.value)} className={selectCls('orange')}>
                {Object.keys(mlBase).map(k => <option key={k} value={k}>{k}</option>)}
              </select>
            </Field>
            <Field label="To">
              <select value={cookTo} onChange={e => setCookTo(e.target.value)} className={selectCls('orange')}>
                {Object.keys(mlBase).map(k => <option key={k} value={k}>{k}</option>)}
              </select>
            </Field>
          </div>
          <Row label={`${cookAmt} ${cookFrom} =`} value={`${cookResult} ${cookTo}`} accent="orange" />
        </div>
      )}

      {/* 25 - CALORIE DENSITY */}
      {subToolId === 'calorie-density' && (
        <div className={card}>
          <Header2 emoji="🍎" title="Calorie Density Calculator" subtitle="Compare energy density of foods per gram." badge="Food" color="red" />
          <div className={grid2}>
            <Field label="Calories (kcal)"><input type="number" value={foodCal} onChange={e => setFoodCal(Number(e.target.value))} className={inputCls('red')} /></Field>
            <Field label="Serving Size (g)"><input type="number" value={foodGrams} onChange={e => setFoodGrams(Number(e.target.value))} className={inputCls('red')} /></Field>
          </div>
          <Row label="Calorie Density" value={calDensity} unit="kcal/g" accent="red" />
          <div className="text-xs text-slate-500 space-y-1 bg-slate-50 rounded-xl p-3">
            <p className="font-bold">Reference:</p>
            <p>🥦 Vegetables: ~0.2–0.5 kcal/g · 🍚 Rice (cooked): ~1.3 kcal/g · 🥜 Nuts: ~5–6 kcal/g · 🧈 Butter: ~7.2 kcal/g</p>
          </div>
        </div>
      )}

      {/* 26 - ALCOHOL / BAC */}
      {subToolId === 'alcohol-units' && (
        <div className={card}>
          <Header2 emoji="🍺" title="Alcohol Units & BAC" subtitle="Estimate blood alcohol content and sober-up time." badge="Food" color="amber" />
          <div className={grid2}>
            <Field label="Number of Drinks"><input type="number" value={drinks} min={0} onChange={e => setDrinks(Number(e.target.value))} className={inputCls('amber')} /></Field>
            <Field label="ABV (%)"><input type="number" value={abv} step={0.5} onChange={e => setAbv(Number(e.target.value))} className={inputCls('amber')} /></Field>
            <Field label="Drink Size (oz)"><input type="number" value={drinkOz} step={0.5} onChange={e => setDrinkOz(Number(e.target.value))} className={inputCls('amber')} /></Field>
            <Field label="Body Weight (lbs)"><input type="number" value={bodyWtLb} onChange={e => setBodyWtLb(Number(e.target.value))} className={inputCls('amber')} /></Field>
            <Field label="Biological Sex"><select value={alcoholSex} onChange={e => setAlcoholSex(e.target.value as 'M' | 'F')} className={selectCls('amber')}><option value="M">Male</option><option value="F">Female</option></select></Field>
          </div>
          <div className={grid3}>
            <Row label="Alcohol Units" value={units.toFixed(1)} unit="units" accent="amber" />
            <Row label="Est. BAC" value={bac.toFixed(4)} unit="%" accent="amber" />
            <Row label="Sober in ~" value={soberHrs.toFixed(1)} unit="hours" accent="amber" />
          </div>
          <p className="text-xs text-red-500 text-center font-semibold">⚠️ Never drink and drive. Legal limit is 0.08% BAC in the US.</p>
        </div>
      )}

      {/* 27 - Z-SCORE */}
      {subToolId === 'z-score' && (
        <div className={card}>
          <Header2 emoji="📊" title="Z-Score Calculator" subtitle="Standardize scores and find normal distribution percentile." badge="Statistics" color="indigo" />
          <div className={grid3}>
            <Field label="Raw Score (X)"><input type="number" value={rawScore} onChange={e => setRawScore(Number(e.target.value))} className={inputCls('indigo')} /></Field>
            <Field label="Population Mean (μ)"><input type="number" value={mean} onChange={e => setMean(Number(e.target.value))} className={inputCls('indigo')} /></Field>
            <Field label="Standard Deviation (σ)"><input type="number" value={sd} step={0.1} onChange={e => setSd(Math.max(0.01, Number(e.target.value)))} className={inputCls('indigo')} /></Field>
          </div>
          <div className={grid2}>
            <Row label="Z-Score" value={zScore} accent="indigo" />
            <Row label="Percentile Rank" value={`${pctApprox}th`} accent="indigo" />
          </div>
        </div>
      )}

      {/* 28 - CONFIDENCE INTERVAL */}
      {subToolId === 'confidence-interval' && (
        <div className={card}>
          <Header2 emoji="📉" title="Confidence Interval" subtitle="Calculate CI for sample means at any confidence level." badge="Statistics" color="blue" />
          <div className={grid2}>
            <Field label="Sample Mean (x̄)"><input type="number" value={ciMean} onChange={e => setCiMean(Number(e.target.value))} className={inputCls('blue')} /></Field>
            <Field label="Std. Deviation (σ)"><input type="number" value={ciSd} step={0.1} onChange={e => setCiSd(Number(e.target.value))} className={inputCls('blue')} /></Field>
            <Field label="Sample Size (n)"><input type="number" value={ciN} min={2} onChange={e => setCiN(Number(e.target.value))} className={inputCls('blue')} /></Field>
            <Field label="Confidence Level">
              <select value={ciConf} onChange={e => setCiConf(Number(e.target.value))} className={selectCls('blue')}>
                <option value={90}>90%</option>
                <option value={95}>95%</option>
                <option value={99}>99%</option>
              </select>
            </Field>
          </div>
          <div className={grid3}>
            <Row label="Lower Bound" value={ciLow} accent="blue" />
            <Row label="Upper Bound" value={ciHigh} accent="blue" />
            <Row label="Margin of Error" value={moe.toFixed(2)} accent="blue" />
          </div>
        </div>
      )}

      {/* 29 - SAMPLE SIZE */}
      {subToolId === 'sample-size' && (
        <div className={card}>
          <Header2 emoji="🧮" title="Sample Size Calculator" subtitle="Min sample for statistically valid surveys and A/B tests." badge="Statistics" color="violet" />
          <div className={grid3}>
            <Field label="Confidence Level">
              <select value={ssConf} onChange={e => setSsConf(Number(e.target.value))} className={selectCls('violet')}>
                <option value={90}>90%</option>
                <option value={95}>95%</option>
                <option value={99}>99%</option>
              </select>
            </Field>
            <Field label="Margin of Error (%)"><input type="number" value={ssMoe} step={0.5} min={0.5} onChange={e => setSsMoe(Number(e.target.value))} className={inputCls('violet')} /></Field>
            <Field label="Expected Proportion (%)"><input type="number" value={ssProp} min={1} max={99} onChange={e => setSsProp(Number(e.target.value))} className={inputCls('violet')} /></Field>
          </div>
          <Row label="Required Sample Size" value={sampleSize.toLocaleString()} unit="responses" accent="violet" />
          <p className="text-xs text-slate-400 text-center">Use 50% proportion when unknown — this maximises the sample size conservatively.</p>
        </div>
      )}

    </div>
  );
};
