import React, { useState } from 'react';
import { GraphCanvas } from '../GraphCanvas';
import { Calculator, LineChart, Binary, Divide, CornerDownLeft } from 'lucide-react';

interface Props {
  subToolId: string;
}

export const MathGraphingCalculators: React.FC<Props> = ({ subToolId }) => {
  // --- 1. SCIENTIFIC & GRAPHING CALCULATOR ---
  const [calcDisplay, setCalcDisplay] = useState<string>('0');
  const [graphFunction, setGraphFunction] = useState<string>('x^2 - 4');
  const [angleMode, setAngleMode] = useState<'DEG' | 'RAD'>('DEG');

  const handleKeypadClick = (val: string) => {
    if (val === 'C') {
      setCalcDisplay('0');
      return;
    }
    if (val === '=') {
      try {
        let expr = calcDisplay
          .replace(/×/g, '*')
          .replace(/÷/g, '/')
          .replace(/π/g, 'Math.PI')
          .replace(/e/g, 'Math.E')
          .replace(/sin\(/g, angleMode === 'DEG' ? 'Math.sin((Math.PI/180)*' : 'Math.sin(')
          .replace(/cos\(/g, angleMode === 'DEG' ? 'Math.cos((Math.PI/180)*' : 'Math.cos(')
          .replace(/tan\(/g, angleMode === 'DEG' ? 'Math.tan((Math.PI/180)*' : 'Math.tan(')
          .replace(/sqrt\(/g, 'Math.sqrt(')
          .replace(/log\(/g, 'Math.log10(')
          .replace(/ln\(/g, 'Math.log(')
          .replace(/\^/g, '**');

        const fn = new Function(`return ${expr};`);
        const res = fn();
        setCalcDisplay(String(Number(res.toFixed(8))));
      } catch (err) {
        setCalcDisplay('Error');
      }
      return;
    }

    if (calcDisplay === '0' || calcDisplay === 'Error') {
      setCalcDisplay(val);
    } else {
      setCalcDisplay((prev) => prev + val);
    }
  };

  // --- 2. MATH SOLVER (Quadratic, Slope, Distance) ---
  const [solverType, setSolverType] = useState<'quadratic' | 'distance' | 'slope'>('quadratic');

  // Quadratic coefficients: ax^2 + bx + c = 0
  const [quadA, setQuadA] = useState<number>(1);
  const [quadB, setQuadB] = useState<number>(-5);
  const [quadC, setQuadC] = useState<number>(6);

  // Distance & Slope points: (x1, y1) and (x2, y2)
  const [ptX1, setPtX1] = useState<number>(1);
  const [ptY1, setPtY1] = useState<number>(2);
  const [ptX2, setPtX2] = useState<number>(4);
  const [ptY2, setPtY2] = useState<number>(6);

  // Quadratic Calculation
  const discriminant = quadB * quadB - 4 * quadA * quadC;
  const vertexX = quadA !== 0 ? -quadB / (2 * quadA) : 0;
  const vertexY = quadA * vertexX * vertexX + quadB * vertexX + quadC;

  let quadRoots = '';
  if (discriminant > 0) {
    const root1 = (-quadB + Math.sqrt(discriminant)) / (2 * quadA);
    const root2 = (-quadB - Math.sqrt(discriminant)) / (2 * quadA);
    quadRoots = `x₁ = ${root1.toFixed(3)}, x₂ = ${root2.toFixed(3)}`;
  } else if (discriminant === 0) {
    const root = -quadB / (2 * quadA);
    quadRoots = `x = ${root.toFixed(3)} (Double Root)`;
  } else {
    const realPart = (-quadB / (2 * quadA)).toFixed(3);
    const imagPart = (Math.sqrt(-discriminant) / (2 * quadA)).toFixed(3);
    quadRoots = `x₁ = ${realPart} + ${imagPart}i, x₂ = ${realPart} - ${imagPart}i`;
  }

  // Distance & Slope Calculation
  const distanceVal = Math.sqrt(Math.pow(ptX2 - ptX1, 2) + Math.pow(ptY2 - ptY1, 2));
  const slopeVal = ptX2 !== ptX1 ? (ptY2 - ptY1) / (ptX2 - ptX1) : null;
  const lineInterceptY = slopeVal !== null ? ptY1 - slopeVal * ptX1 : null;

  // --- 3. FRACTION & PERCENTAGE CALCULATOR ---
  const [fracNum1, setFracNum1] = useState<number>(3);
  const [fracDen1, setFracDen1] = useState<number>(4);
  const [fracOp, setFracOp] = useState<'+' | '-' | '*' | '/'>('+');
  const [fracNum2, setFracNum2] = useState<number>(1);
  const [fracDen2, setFracDen2] = useState<number>(2);

  // Fraction arithmetic
  const calcFractionResult = () => {
    let resN = 0;
    let resD = 1;

    if (fracOp === '+') {
      resN = fracNum1 * fracDen2 + fracNum2 * fracDen1;
      resD = fracDen1 * fracDen2;
    } else if (fracOp === '-') {
      resN = fracNum1 * fracDen2 - fracNum2 * fracDen1;
      resD = fracDen1 * fracDen2;
    } else if (fracOp === '*') {
      resN = fracNum1 * fracNum2;
      resD = fracDen1 * fracDen2;
    } else if (fracOp === '/') {
      resN = fracNum1 * fracDen2;
      resD = fracDen1 * fracNum2;
    }

    // Simplify fraction via GCD
    const gcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcd(b, a % b));
    const divisor = gcd(resN, resD);
    const simpleN = resN / divisor;
    const simpleD = resD / divisor;
    const decimalVal = simpleD !== 0 ? simpleN / simpleD : 0;

    return { simpleN, simpleD, decimalVal };
  };

  const fracRes = calcFractionResult();

  // Percentage Calculations
  const [pctVal, setPctVal] = useState<number>(15);
  const [pctTotal, setPctTotal] = useState<number>(250);
  const pctResult = (pctVal / 100) * pctTotal;

  const [pctFrom, setPctFrom] = useState<number>(80);
  const [pctTo, setPctTo] = useState<number>(110);
  const pctChange = pctFrom !== 0 ? ((pctTo - pctFrom) / pctFrom) * 100 : 0;

  // --- 4. GPA & GRADE CALCULATOR ---
  const [gpaCourses, setGpaCourses] = useState([
    { name: 'Course 1', grade: 4.0, credits: 3 },
    { name: 'Course 2', grade: 3.0, credits: 4 },
    { name: 'Course 3', grade: 3.7, credits: 3 },
    { name: 'Course 4', grade: 2.7, credits: 3 },
  ]);

  const totalGpaCredits = gpaCourses.reduce((sum, c) => sum + c.credits, 0);
  const totalGpaPoints = gpaCourses.reduce((sum, c) => sum + c.grade * c.credits, 0);
  const cumulativeGpa = totalGpaCredits > 0 ? totalGpaPoints / totalGpaCredits : 0;

  // --- 5. STATISTICS & MATRIX CALCULATOR ---
  const [statsInput, setStatsInput] = useState<string>('12, 18, 25, 30, 42, 18, 55');

  const calcStats = () => {
    const nums = statsInput
      .split(',')
      .map((s) => parseFloat(s.trim()))
      .filter((n) => !isNaN(n));
    if (nums.length === 0) return { mean: 0, median: 0, stdDev: 0, sum: 0, min: 0, max: 0, count: 0 };

    const count = nums.length;
    const sum = nums.reduce((a, b) => a + b, 0);
    const mean = sum / count;

    const sorted = [...nums].sort((a, b) => a - b);
    const min = sorted[0];
    const max = sorted[count - 1];
    const median = count % 2 === 0 ? (sorted[count / 2 - 1] + sorted[count / 2]) / 2 : sorted[Math.floor(count / 2)];

    const variance = nums.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / count;
    const stdDev = Math.sqrt(variance);

    return { mean, median, stdDev, sum, min, max, count };
  };
  const statsRes = calcStats();

  // --- 6. GEOMETRY CALCULATOR ---
  const [triBase, setTriBase] = useState<number>(10);
  const [triHeight, setTriHeight] = useState<number>(6);
  const triArea = 0.5 * triBase * triHeight;

  const [circleRadius, setCircleRadius] = useState<number>(5);
  const circleArea = Math.PI * Math.pow(circleRadius, 2);
  const circleCircumference = 2 * Math.PI * circleRadius;
  const circleDiameter = 2 * circleRadius;

  const [cylRadius, setCylRadius] = useState<number>(4);
  const [cylHeight, setCylHeight] = useState<number>(10);
  const cylVolume = Math.PI * Math.pow(cylRadius, 2) * cylHeight;
  const cylSurfaceArea = 2 * Math.PI * cylRadius * cylHeight + 2 * Math.PI * Math.pow(cylRadius, 2);

  const [sphereRadius, setSphereRadius] = useState<number>(3);
  const sphereVolume = (4 / 3) * Math.PI * Math.pow(sphereRadius, 3);
  const sphereSurfaceArea = 4 * Math.PI * Math.pow(sphereRadius, 2);

  // --- 7. ADVANCED CALCULUS & SIMULTANEOUS EQUATIONS ---
  // System: a1*x + b1*y = c1; a2*x + b2*y = c2
  const [eqA1, setEqA1] = useState<number>(2);
  const [eqB1, setEqB1] = useState<number>(3);
  const [eqC1, setEqC1] = useState<number>(12);
  const [eqA2, setEqA2] = useState<number>(4);
  const [eqB2, setEqB2] = useState<number>(-1);
  const [eqC2, setEqC2] = useState<number>(5);

  const calcSimultaneousEq = () => {
    const det = eqA1 * eqB2 - eqA2 * eqB1;
    if (det === 0) return { x: 'No Unique Solution', y: 'Parallel Lines', det };
    const x = (eqC1 * eqB2 - eqC2 * eqB1) / det;
    const y = (eqA1 * eqC2 - eqA2 * eqC1) / det;
    return { x: x.toFixed(2), y: y.toFixed(2), det };
  };
  const simEqRes = calcSimultaneousEq();

  return (
    <div className="space-y-8">
      {/* 1. TI-84 / DESMOS SCIENTIFIC & GRAPHING CALCULATOR */}
      {(subToolId === 'scientific-graphing' || subToolId === 'all') && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                  📐
                </span>
                TI-84 & Desmos Scientific / Function Grapher
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Full scientific calculator keypad and real-time interactive function curve plotter.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setAngleMode(angleMode === 'DEG' ? 'RAD' : 'DEG')}
                className="px-3 py-1.5 text-xs font-bold rounded-lg bg-slate-900 text-emerald-400 font-mono"
              >
                {angleMode}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Scientific Keypad Left (5 Cols) */}
            <div className="lg:col-span-5 bg-slate-900 rounded-2xl p-4 border border-slate-800 shadow-xl flex flex-col justify-between space-y-4">
              {/* Display */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-right font-mono">
                <div className="text-xs text-slate-500">TI-84 Plus CE Mode</div>
                <div className="text-2xl font-bold text-emerald-400 break-all min-h-[36px] mt-1">
                  {calcDisplay}
                </div>
              </div>

              {/* Keypad buttons */}
              <div className="grid grid-cols-4 gap-2 text-xs font-bold font-mono">
                {['C', '(', ')', '÷', 'sin(', 'cos(', 'tan(', '×', 'sqrt(', 'log(', 'ln(', '-', '7', '8', '9', '+', '4', '5', '6', '^', '1', '2', '3', '=', '0', '.', 'π', 'e'].map(
                  (btn) => (
                    <button
                      key={btn}
                      onClick={() => handleKeypadClick(btn)}
                      className={`py-2.5 rounded-lg border text-center transition ${
                        btn === '='
                          ? 'bg-emerald-600 text-white border-emerald-500 hover:bg-emerald-500 col-span-2'
                          : btn === 'C'
                          ? 'bg-rose-900 text-rose-200 border-rose-800 hover:bg-rose-800'
                          : ['+', '-', '×', '÷', '^', 'sqrt('].includes(btn)
                          ? 'bg-indigo-900 text-indigo-200 border-indigo-800 hover:bg-indigo-800'
                          : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
                      }`}
                    >
                      {btn}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Function Grapher Right (7 Cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-700">y =</span>
                <input
                  type="text"
                  value={graphFunction}
                  onChange={(e) => setGraphFunction(e.target.value)}
                  placeholder="e.g. x^2 - 4 or sin(x)"
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono font-bold focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <GraphCanvas expression={graphFunction} />

              <div className="flex flex-wrap gap-2 text-xs">
                <span className="font-semibold text-slate-500">Quick Functions:</span>
                {['x^2 - 4', 'sin(x)', 'cos(x)', '2*x + 1', 'x^3 - 3*x'].map((fnStr) => (
                  <button
                    key={fnStr}
                    onClick={() => setGraphFunction(fnStr)}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 font-mono"
                  >
                    y = {fnStr}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. MATH SOLVER (Quadratic, Distance, Slope) */}
      {(subToolId === 'math-solver' || subToolId === 'all') && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  ⚡
                </span>
                Step-by-Step Math Solver
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Solve Quadratic Formula, Distance between points, and Slope of a line.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setSolverType('quadratic')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg ${
                  solverType === 'quadratic'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                Quadratic
              </button>
              <button
                onClick={() => setSolverType('distance')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg ${
                  solverType === 'distance'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                Distance & Slope
              </button>
            </div>
          </div>

          {solverType === 'quadratic' ? (
            <div className="space-y-4">
              <span className="text-sm font-bold text-slate-700">
                Quadratic Equation: <span className="font-mono text-blue-600">{quadA}x² + ({quadB})x + ({quadC}) = 0</span>
              </span>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">a (x² coeff)</label>
                  <input
                    type="number"
                    value={quadA}
                    onChange={(e) => setQuadA(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">b (x coeff)</label>
                  <input
                    type="number"
                    value={quadB}
                    onChange={(e) => setQuadB(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">c (constant)</label>
                  <input
                    type="number"
                    value={quadC}
                    onChange={(e) => setQuadC(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold"
                  />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 space-y-2">
                <div className="text-xs text-blue-800 font-bold uppercase">Discriminant (b² - 4ac)</div>
                <div className="text-xl font-mono font-bold text-blue-950">
                  Δ = {quadB}² - 4({quadA})({quadC}) = {discriminant}
                </div>

                <div className="pt-2 border-t border-blue-200">
                  <span className="text-xs text-blue-800 font-bold uppercase">Roots (Solutions)</span>
                  <div className="text-2xl font-mono font-extrabold text-blue-900 mt-1">{quadRoots}</div>
                  <p className="text-xs text-blue-700 mt-1">
                    Parabola Vertex: ({vertexX.toFixed(2)}, {vertexY.toFixed(2)})
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <span className="text-sm font-bold text-slate-700">
                Line between Point 1 ({ptX1}, {ptY1}) and Point 2 ({ptX2}, {ptY2})
              </span>

              <div className="grid grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs text-slate-600 mb-1">x₁</label>
                  <input
                    type="number"
                    value={ptX1}
                    onChange={(e) => setPtX1(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-600 mb-1">y₁</label>
                  <input
                    type="number"
                    value={ptY1}
                    onChange={(e) => setPtY1(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-600 mb-1">x₂</label>
                  <input
                    type="number"
                    value={ptX2}
                    onChange={(e) => setPtX2(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-600 mb-1">y₂</label>
                  <input
                    type="number"
                    value={ptY2}
                    onChange={(e) => setPtY2(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-blue-50 border border-blue-200 rounded-xl p-5">
                <div>
                  <span className="text-xs text-blue-800 font-bold uppercase">Distance Formula</span>
                  <div className="text-2xl font-mono font-bold text-blue-950 mt-1">
                    d = {distanceVal.toFixed(4)}
                  </div>
                  <p className="text-xs text-blue-700 mt-1">√((x₂-x₁)² + (y₂-y₁)²)</p>
                </div>
                <div>
                  <span className="text-xs text-blue-800 font-bold uppercase">Slope (m) & Line Eq</span>
                  <div className="text-2xl font-mono font-bold text-blue-950 mt-1">
                    m = {slopeVal !== null ? slopeVal.toFixed(3) : 'Undefined'}
                  </div>
                  {slopeVal !== null && lineInterceptY !== null && (
                    <p className="text-xs text-blue-700 mt-1">
                      y = {slopeVal.toFixed(2)}x {lineInterceptY >= 0 ? '+' : '-'} {Math.abs(lineInterceptY).toFixed(2)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. FRACTION & PERCENTAGE CALCULATOR */}
      {(subToolId === 'fraction-percentage' || subToolId === 'all') && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Fraction Calculator */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
                ½
              </span>
              Fraction Arithmetic Calculator
            </h2>

            <div className="flex items-center gap-2">
              <div className="flex flex-col gap-1 w-16">
                <input
                  type="number"
                  value={fracNum1}
                  onChange={(e) => setFracNum1(Number(e.target.value))}
                  className="px-2 py-1 border border-slate-300 rounded text-center text-sm font-bold"
                />
                <div className="h-0.5 bg-slate-800 w-full" />
                <input
                  type="number"
                  value={fracDen1}
                  onChange={(e) => setFracDen1(Number(e.target.value))}
                  className="px-2 py-1 border border-slate-300 rounded text-center text-sm font-bold"
                />
              </div>

              <select
                value={fracOp}
                onChange={(e) => setFracOp(e.target.value as any)}
                className="px-3 py-2 border border-slate-300 rounded text-lg font-bold"
              >
                <option value="+">+</option>
                <option value="-">-</option>
                <option value="*">×</option>
                <option value="/">÷</option>
              </select>

              <div className="flex flex-col gap-1 w-16">
                <input
                  type="number"
                  value={fracNum2}
                  onChange={(e) => setFracNum2(Number(e.target.value))}
                  className="px-2 py-1 border border-slate-300 rounded text-center text-sm font-bold"
                />
                <div className="h-0.5 bg-slate-800 w-full" />
                <input
                  type="number"
                  value={fracDen2}
                  onChange={(e) => setFracDen2(Number(e.target.value))}
                  className="px-2 py-1 border border-slate-300 rounded text-center text-sm font-bold"
                />
              </div>

              <span className="text-xl font-bold text-slate-400">=</span>

              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex-1 text-center font-mono">
                <div className="text-lg font-extrabold text-emerald-950">
                  {fracRes.simpleN} / {fracRes.simpleD}
                </div>
                <div className="text-xs text-emerald-700">
                  Decimal: {fracRes.decimalVal.toFixed(4)}
                </div>
              </div>
            </div>
          </div>

          {/* Percentage Calculator */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-sm">
                %
              </span>
              Percentage Increase / Change Calculator
            </h2>

            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-2">
                <span>What is</span>
                <input
                  type="number"
                  value={pctVal}
                  onChange={(e) => setPctVal(Number(e.target.value))}
                  className="w-16 px-2 py-1 border border-slate-300 rounded font-bold"
                />
                <span>% of</span>
                <input
                  type="number"
                  value={pctTotal}
                  onChange={(e) => setPctTotal(Number(e.target.value))}
                  className="w-20 px-2 py-1 border border-slate-300 rounded font-bold"
                />
                <span className="font-bold text-amber-900">= {pctResult.toFixed(2)}</span>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                <span>% Change from</span>
                <input
                  type="number"
                  value={pctFrom}
                  onChange={(e) => setPctFrom(Number(e.target.value))}
                  className="w-16 px-2 py-1 border border-slate-300 rounded font-bold"
                />
                <span>to</span>
                <input
                  type="number"
                  value={pctTo}
                  onChange={(e) => setPctTo(Number(e.target.value))}
                  className="w-16 px-2 py-1 border border-slate-300 rounded font-bold"
                />
                <span className="font-bold text-emerald-700">
                  = {pctChange >= 0 ? '+' : ''}
                  {pctChange.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. CUMULATIVE GPA & GRADE CALCULATOR */}
      {(subToolId === 'gpa-grade' || subToolId === 'all') && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                  🎓
                </span>
                Cumulative GPA & Course Grade Calculator
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Calculate weighted semester and cumulative Grade Point Average (4.0 scale).
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {gpaCourses.map((course, idx) => (
              <div key={idx} className="grid grid-cols-3 gap-3 items-center">
                <input
                  type="text"
                  value={course.name}
                  onChange={(e) => {
                    const next = [...gpaCourses];
                    next[idx].name = e.target.value;
                    setGpaCourses(next);
                  }}
                  className="px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold"
                />
                <select
                  value={course.grade}
                  onChange={(e) => {
                    const next = [...gpaCourses];
                    next[idx].grade = Number(e.target.value);
                    setGpaCourses(next);
                  }}
                  className="px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold"
                >
                  <option value={4.0}>A (4.0)</option>
                  <option value={3.7}>A- (3.7)</option>
                  <option value={3.3}>B+ (3.3)</option>
                  <option value={3.0}>B (3.0)</option>
                  <option value={2.7}>B- (2.7)</option>
                  <option value={2.3}>C+ (2.3)</option>
                  <option value={2.0}>C (2.0)</option>
                  <option value={1.0}>D (1.0)</option>
                  <option value={0.0}>F (0.0)</option>
                </select>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="6"
                    value={course.credits}
                    onChange={(e) => {
                      const next = [...gpaCourses];
                      next[idx].credits = Number(e.target.value);
                      setGpaCourses(next);
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold"
                  />
                  <span className="text-xs text-slate-500 font-medium">Credits</span>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-indigo-950 text-white rounded-xl p-5 flex items-center justify-between">
            <div>
              <span className="text-xs text-indigo-300 uppercase font-bold">Cumulative GPA</span>
              <div className="text-4xl font-extrabold text-white mt-1">{cumulativeGpa.toFixed(2)}</div>
              <span className="text-xs text-indigo-200">Total Credits: {totalGpaCredits}</span>
            </div>
          </div>
        </div>
      )}

      {/* 5. STATISTICS CALCULATOR */}
      {(subToolId === 'statistics-matrix' || subToolId === 'all') && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
                  📊
                </span>
                Descriptive Statistics & Data Set Calculator
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Calculate Mean, Median, Standard Deviation, Variance, and Sum for any number sequence.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Enter numbers separated by commas:</label>
            <textarea
              rows={2}
              value={statsInput}
              onChange={(e) => setStatsInput(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-sm font-semibold focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-900 text-white p-5 rounded-xl text-center">
            <div>
              <span className="text-xs uppercase text-slate-400 font-bold">Mean (Average)</span>
              <div className="text-2xl font-bold text-teal-300 mt-1">{statsRes.mean.toFixed(2)}</div>
            </div>
            <div>
              <span className="text-xs uppercase text-slate-400 font-bold">Median</span>
              <div className="text-2xl font-bold text-emerald-300 mt-1">{statsRes.median.toFixed(2)}</div>
            </div>
            <div>
              <span className="text-xs uppercase text-slate-400 font-bold">Standard Dev (σ)</span>
              <div className="text-2xl font-bold text-indigo-300 mt-1">{statsRes.stdDev.toFixed(2)}</div>
            </div>
            <div>
              <span className="text-xs uppercase text-slate-400 font-bold">Count / Sum</span>
              <div className="text-2xl font-bold text-amber-300 mt-1">N={statsRes.count} (Σ={statsRes.sum})</div>
            </div>
          </div>
        </div>
      )}

      {/* 6. 2D & 3D GEOMETRY CALCULATOR */}
      {(subToolId === 'geometry-calc' || subToolId === 'all') && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                  📐
                </span>
                2D & 3D Geometry Area, Surface Area & Volume Solver
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Calculate area, perimeter, surface area, and volume for triangles, circles, cylinders, and spheres.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Triangle */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase flex items-center gap-1">
                <span>🔺</span> Triangle Area
              </h3>
              <div>
                <label className="block text-[11px] text-slate-500">Base (b)</label>
                <input
                  type="number"
                  value={triBase}
                  onChange={(e) => setTriBase(Number(e.target.value))}
                  className="w-full px-2.5 py-1 border border-slate-300 rounded font-semibold text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500">Height (h)</label>
                <input
                  type="number"
                  value={triHeight}
                  onChange={(e) => setTriHeight(Number(e.target.value))}
                  className="w-full px-2.5 py-1 border border-slate-300 rounded font-semibold text-xs"
                />
              </div>
              <div className="bg-indigo-900 text-white p-3 rounded-lg text-center">
                <span className="text-[10px] text-indigo-200 uppercase font-bold">Area (½ · b · h)</span>
                <div className="text-xl font-extrabold">{triArea.toFixed(2)}</div>
              </div>
            </div>

            {/* Circle */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase flex items-center gap-1">
                <span>🔴</span> Circle
              </h3>
              <div>
                <label className="block text-[11px] text-slate-500">Radius (r)</label>
                <input
                  type="number"
                  value={circleRadius}
                  onChange={(e) => setCircleRadius(Number(e.target.value))}
                  className="w-full px-2.5 py-1 border border-slate-300 rounded font-semibold text-xs"
                />
              </div>
              <div className="bg-slate-900 text-white p-3 rounded-lg space-y-1 text-center">
                <div className="text-xs">Area: <span className="font-bold text-emerald-400">{circleArea.toFixed(2)}</span></div>
                <div className="text-xs">Circumference: <span className="font-bold text-amber-300">{circleCircumference.toFixed(2)}</span></div>
                <div className="text-[11px] text-slate-400">Diameter: {circleDiameter.toFixed(1)}</div>
              </div>
            </div>

            {/* Cylinder */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase flex items-center gap-1">
                <span>🛢️</span> 3D Cylinder
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] text-slate-500">Radius</label>
                  <input
                    type="number"
                    value={cylRadius}
                    onChange={(e) => setCylRadius(Number(e.target.value))}
                    className="w-full px-2 py-1 border border-slate-300 rounded font-semibold text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500">Height</label>
                  <input
                    type="number"
                    value={cylHeight}
                    onChange={(e) => setCylHeight(Number(e.target.value))}
                    className="w-full px-2 py-1 border border-slate-300 rounded font-semibold text-xs"
                  />
                </div>
              </div>
              <div className="bg-teal-950 text-white p-3 rounded-lg text-center space-y-1">
                <div className="text-xs">Volume: <span className="font-bold text-teal-300">{cylVolume.toFixed(2)}</span></div>
                <div className="text-xs">Surface Area: <span className="font-bold text-teal-100">{cylSurfaceArea.toFixed(2)}</span></div>
              </div>
            </div>

            {/* Sphere */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase flex items-center gap-1">
                <span>🌐</span> 3D Sphere
              </h3>
              <div>
                <label className="block text-[11px] text-slate-500">Radius (r)</label>
                <input
                  type="number"
                  value={sphereRadius}
                  onChange={(e) => setSphereRadius(Number(e.target.value))}
                  className="w-full px-2.5 py-1 border border-slate-300 rounded font-semibold text-xs"
                />
              </div>
              <div className="bg-indigo-950 text-white p-3 rounded-lg text-center space-y-1">
                <div className="text-xs">Volume: <span className="font-bold text-indigo-300">{sphereVolume.toFixed(2)}</span></div>
                <div className="text-xs">Surface Area: <span className="font-bold text-indigo-100">{sphereSurfaceArea.toFixed(2)}</span></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. CALCULUS & SIMULTANEOUS EQUATIONS SOLVER */}
      {(subToolId === 'advanced-calculus-algebra' || subToolId === 'all') && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                  ∑
                </span>
                Simultaneous Linear Systems & Calculus Integration Solver
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Solve 2x2 simultaneous equations, integration by parts formulas, and polynomial derivative steps.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Simultaneous Equations */}
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4">
              <h3 className="text-sm font-bold text-slate-800 uppercase flex items-center gap-2">
                <span>🔤</span> 2x2 Simultaneous Linear System
              </h3>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold">
                  <span className="w-16">Eq 1:</span>
                  <input
                    type="number"
                    value={eqA1}
                    onChange={(e) => setEqA1(Number(e.target.value))}
                    className="w-16 px-2 py-1 border border-slate-300 rounded text-center"
                  />
                  <span>x +</span>
                  <input
                    type="number"
                    value={eqB1}
                    onChange={(e) => setEqB1(Number(e.target.value))}
                    className="w-16 px-2 py-1 border border-slate-300 rounded text-center"
                  />
                  <span>y =</span>
                  <input
                    type="number"
                    value={eqC1}
                    onChange={(e) => setEqC1(Number(e.target.value))}
                    className="w-20 px-2 py-1 border border-slate-300 rounded text-center"
                  />
                </div>

                <div className="flex items-center gap-2 text-xs font-semibold">
                  <span className="w-16">Eq 2:</span>
                  <input
                    type="number"
                    value={eqA2}
                    onChange={(e) => setEqA2(Number(e.target.value))}
                    className="w-16 px-2 py-1 border border-slate-300 rounded text-center"
                  />
                  <span>x +</span>
                  <input
                    type="number"
                    value={eqB2}
                    onChange={(e) => setEqB2(Number(e.target.value))}
                    className="w-16 px-2 py-1 border border-slate-300 rounded text-center"
                  />
                  <span>y =</span>
                  <input
                    type="number"
                    value={eqC2}
                    onChange={(e) => setEqC2(Number(e.target.value))}
                    className="w-20 px-2 py-1 border border-slate-300 rounded text-center"
                  />
                </div>
              </div>

              <div className="bg-indigo-950 text-white p-4 rounded-xl grid grid-cols-2 gap-2 text-center">
                <div>
                  <span className="text-[11px] text-indigo-300 font-bold uppercase">Solution (x)</span>
                  <div className="text-2xl font-extrabold text-white mt-1">x = {simEqRes.x}</div>
                </div>
                <div>
                  <span className="text-[11px] text-indigo-300 font-bold uppercase">Solution (y)</span>
                  <div className="text-2xl font-extrabold text-emerald-400 mt-1">y = {simEqRes.y}</div>
                </div>
              </div>
            </div>

            {/* Integration by Parts Reference */}
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4">
              <h3 className="text-sm font-bold text-slate-800 uppercase flex items-center gap-2">
                <span>∫</span> Calculus Integration By Parts Formula
              </h3>

              <div className="bg-slate-900 text-white p-4 rounded-xl font-mono text-center space-y-2">
                <div className="text-lg font-bold text-teal-300">∫ u · dv = u · v - ∫ v · du</div>
                <p className="text-xs text-slate-400 font-sans">
                  LIATE Priority Rule: Logarithmic, Inverse trig, Algebraic, Trigonometric, Exponential.
                </p>
              </div>

              <div className="text-xs text-slate-600 bg-white p-3 rounded-lg border border-slate-200 space-y-1">
                <p className="font-bold text-slate-800">Example: ∫ x · eˣ dx</p>
                <p>1. Set u = x ⇒ du = dx</p>
                <p>2. Set dv = eˣ dx ⇒ v = eˣ</p>
                <p className="font-bold text-indigo-700">Result = x · eˣ - eˣ + C</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
