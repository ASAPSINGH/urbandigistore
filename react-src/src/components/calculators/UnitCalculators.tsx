import React, { useState } from 'react';
import { ArrowLeftRight, Box, Layers } from 'lucide-react';

interface Props {
  subToolId: string;
}

export const UnitCalculators: React.FC<Props> = ({ subToolId }) => {
  // --- 1. CURRENCY CONVERTER (GBP ↔ USD, EUR, CAD, JPY) ---
  const [currencyAmount, setCurrencyAmount] = useState<number>(100);
  const [fromCurr, setFromCurr] = useState<string>('GBP');
  const [toCurr, setToCurr] = useState<string>('USD');

  // Rates baseline to USD
  const ratesToUSD: Record<string, number> = {
    USD: 1.0,
    GBP: 1.28,
    EUR: 1.09,
    CAD: 0.74,
    JPY: 0.0065,
  };

  const convertCurrency = () => {
    const usdVal = currencyAmount * (ratesToUSD[fromCurr] || 1);
    const result = usdVal / (ratesToUSD[toCurr] || 1);
    return result;
  };

  const convertedCurrency = convertCurrency();

  // --- 2. LENGTH & MASS UNIT CONVERTER ---
  // Length cm <-> ft/in
  const [lengthCm, setLengthCm] = useState<number>(175);
  const lengthInchesTotal = lengthCm / 2.54;
  const lengthFeet = Math.floor(lengthInchesTotal / 12);
  const lengthRemainingInches = Math.round(lengthInchesTotal % 12);

  // Mass kg <-> lbs
  const [massKg, setMassKg] = useState<number>(70);
  const massLbs = massKg * 2.20462;

  // --- 3. SQUARE FOOTAGE & CONCRETE CALCULATOR ---
  const [roomLengthFt, setRoomLengthFt] = useState<number>(15);
  const [roomWidthFt, setRoomWidthFt] = useState<number>(12);

  const roomSqFt = roomLengthFt * roomWidthFt;
  const roomSqMeters = roomSqFt * 0.092903;

  // Concrete Volume
  const [concreteThicknessInches, setConcreteThicknessInches] = useState<number>(4);
  const concreteCubicFeet = (roomSqFt * (concreteThicknessInches / 12));
  const concreteCubicYards = concreteCubicFeet / 27;
  const bags80lb = Math.ceil(concreteCubicYards * 45); // ~45 80lb bags per cubic yard
  const bags60lb = Math.ceil(concreteCubicYards * 60); // ~60 60lb bags per cubic yard

  // --- 4. CONSTRUCTION MATERIALS (MULCH / GRAVEL / SOIL) CALCULATOR ---
  const [landscapeSqFt, setLandscapeSqFt] = useState<number>(500);
  const [materialDepthIn, setMaterialDepthIn] = useState<number>(3);
  const [materialType, setMaterialType] = useState<'mulch' | 'gravel' | 'soil' | 'asphalt'>('mulch');

  const matDensityTonsPerYd3 = {
    mulch: 0.5,
    soil: 1.2,
    gravel: 1.4,
    asphalt: 2.0,
  };

  const matCubicYards = (landscapeSqFt * (materialDepthIn / 12)) / 27;
  const matTons = matCubicYards * matDensityTonsPerYd3[materialType];
  const matBags2CuFt = Math.ceil((landscapeSqFt * (materialDepthIn / 12)) / 2);

  // --- 5. PAINT & STAIR STRINGER CALCULATOR ---
  const [paintRoomLength, setPaintRoomLength] = useState<number>(20);
  const [paintRoomWidth, setPaintRoomWidth] = useState<number>(15);
  const [paintCeilingHeight, setPaintCeilingHeight] = useState<number>(9);
  const [paintCoats, setPaintCoats] = useState<number>(2);

  const wallAreaSqFt = 2 * (paintRoomLength + paintRoomWidth) * paintCeilingHeight;
  const totalPaintSqFt = wallAreaSqFt * paintCoats;
  const paintGallons = Math.ceil(totalPaintSqFt / 350); // 350 sq ft per gallon

  // Stair Stringer
  const [totalStairRiseIn, setTotalStairRiseIn] = useState<number>(108); // 9 feet height
  const targetStepRiseIn = 7.5;
  const numberOfSteps = Math.round(totalStairRiseIn / targetStepRiseIn);
  const actualStepRiseIn = numberOfSteps > 0 ? (totalStairRiseIn / numberOfSteps).toFixed(2) : '0';
  const totalStairRunFt = numberOfSteps > 0 ? ((numberOfSteps - 1) * 10 / 12).toFixed(1) : '0';

  // --- 6. ELECTRICAL & PHYSICS CALCULATOR ---
  const [elecVoltage, setElecVoltage] = useState<number>(120);
  const [elecCurrent, setElecCurrent] = useState<number>(10);
  const elecPowerWatts = elecVoltage * elecCurrent;
  const elecResistanceOhms = elecCurrent > 0 ? elecVoltage / elecCurrent : 0;

  const [physMassKg, setPhysMassKg] = useState<number>(1000); // 1000 kg car
  const [physVelocityMs, setPhysVelocityMs] = useState<number>(20); // 20 m/s ~ 45 mph
  const physKineticEnergyJoules = 0.5 * physMassKg * Math.pow(physVelocityMs, 2);
  const physForceNewtons = physMassKg * 9.81; // Gravity force

  // --- 7. LAND AREA, SQR METER & CUBIC METER CALCULATOR ---
  const [landLengthMeters, setLandLengthMeters] = useState<number>(30);
  const [landWidthMeters, setLandWidthMeters] = useState<number>(20);
  const landAreaSqMeters = landLengthMeters * landWidthMeters;
  const landAreaSqFeet = landAreaSqMeters * 10.7639;
  const landAreaAcres = landAreaSqMeters / 4046.86;
  const landAreaHectares = landAreaSqMeters / 10000;

  // Cubic meters & material weight
  const [volLengthMeters, setVolLengthMeters] = useState<number>(10);
  const [volWidthMeters, setVolWidthMeters] = useState<number>(5);
  const [volDepthMeters, setVolDepthMeters] = useState<number>(0.2); // 20 cm slab/soil
  const volumeCubicMeters = volLengthMeters * volWidthMeters * volDepthMeters;
  const volumeCubicFeet = volumeCubicMeters * 35.3147;
  const estimatedSoilWeightTons = volumeCubicMeters * 1.3; // Soil ~1.3 tons / m³
  const estimatedConcreteWeightTons = volumeCubicMeters * 2.4; // Concrete ~2.4 tons / m³

  return (
    <div className="space-y-8">
      {/* 1. UNIVERSAL UNIT & CURRENCY CONVERTER */}
      {(subToolId === 'unit-converter' || subToolId === 'all') && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  💱
                </span>
                GBP to USD & Universal Currency / Unit Converter
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Convert British Pounds (£) to US Dollars ($), cm to feet/inches, and kg to pounds.
              </p>
            </div>
          </div>

          {/* Currency Section */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Currency Converter
            </h3>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Amount</label>
                <input
                  type="number"
                  value={currencyAmount}
                  onChange={(e) => setCurrencyAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">From</label>
                <select
                  value={fromCurr}
                  onChange={(e) => setFromCurr(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold"
                >
                  <option value="GBP">GBP (£ - British Pound)</option>
                  <option value="USD">USD ($ - US Dollar)</option>
                  <option value="EUR">EUR (€ - Euro)</option>
                  <option value="CAD">CAD ($ - Canadian Dollar)</option>
                  <option value="JPY">JPY (¥ - Japanese Yen)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">To</label>
                <select
                  value={toCurr}
                  onChange={(e) => setToCurr(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold"
                >
                  <option value="USD">USD ($ - US Dollar)</option>
                  <option value="GBP">GBP (£ - British Pound)</option>
                  <option value="EUR">EUR (€ - Euro)</option>
                  <option value="CAD">CAD ($ - Canadian Dollar)</option>
                  <option value="JPY">JPY (¥ - Japanese Yen)</option>
                </select>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-center">
                <span className="text-xs text-blue-800 uppercase font-bold">Converted Result</span>
                <div className="text-2xl font-extrabold text-blue-950 mt-1">
                  {toCurr === 'USD' || toCurr === 'CAD' ? '$' : toCurr === 'GBP' ? '£' : toCurr === 'EUR' ? '€' : '¥'}
                  {convertedCurrency.toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          {/* Mass & Length Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
            {/* Length cm <-> feet */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <span className="text-xs font-bold text-slate-700 uppercase">Centimeters (cm) to Feet & Inches</span>
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  value={lengthCm}
                  onChange={(e) => setLengthCm(Number(e.target.value))}
                  className="w-28 px-3 py-1.5 border border-slate-300 rounded-lg text-sm font-semibold"
                />
                <span className="text-xs font-bold text-slate-500">cm =</span>
                <span className="text-lg font-extrabold text-slate-900">
                  {lengthFeet}' {lengthRemainingInches}"
                </span>
              </div>
            </div>

            {/* Mass kg <-> lbs */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <span className="text-xs font-bold text-slate-700 uppercase">Kilograms (kg) to Pounds (lbs)</span>
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  value={massKg}
                  onChange={(e) => setMassKg(Number(e.target.value))}
                  className="w-28 px-3 py-1.5 border border-slate-300 rounded-lg text-sm font-semibold"
                />
                <span className="text-xs font-bold text-slate-500">kg =</span>
                <span className="text-lg font-extrabold text-slate-900">
                  {massLbs.toFixed(2)} lbs
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. SQUARE FOOTAGE & CONCRETE CALCULATOR */}
      {(subToolId === 'area-concrete' || subToolId === 'all') && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  📦
                </span>
                Square Footage & Concrete Volume Calculator
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Calculate surface area in Sq Ft and required concrete volume in cubic yards and pre-mix bags.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Length (Feet)</label>
              <input
                type="number"
                value={roomLengthFt}
                onChange={(e) => setRoomLengthFt(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Width (Feet)</label>
              <input
                type="number"
                value={roomWidthFt}
                onChange={(e) => setRoomWidthFt(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Slab Thickness (Inches)</label>
              <input
                type="number"
                value={concreteThicknessInches}
                onChange={(e) => setConcreteThicknessInches(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-emerald-50 border border-emerald-200 rounded-xl p-5 text-center">
            <div>
              <span className="text-xs text-emerald-800 uppercase font-bold">Total Square Footage</span>
              <div className="text-3xl font-extrabold text-emerald-950 mt-1">
                {roomSqFt.toLocaleString()} sq ft
              </div>
              <p className="text-xs text-emerald-700 mt-1">{roomSqMeters.toFixed(2)} m²</p>
            </div>

            <div>
              <span className="text-xs text-emerald-800 uppercase font-bold">Concrete Volume</span>
              <div className="text-3xl font-extrabold text-emerald-950 mt-1">
                {concreteCubicYards.toFixed(2)} cu. yds
              </div>
              <p className="text-xs text-emerald-700 mt-1">{concreteCubicFeet.toFixed(1)} cu. ft</p>
            </div>

            <div>
              <span className="text-xs text-emerald-800 uppercase font-bold">Pre-mix Bag Count</span>
              <div className="text-2xl font-extrabold text-emerald-950 mt-1">
                {bags80lb} bags (80 lb)
              </div>
              <p className="text-xs text-emerald-700 mt-1">or {bags60lb} bags (60 lb)</p>
            </div>
          </div>
        </div>
      )}

      {/* 3. CONSTRUCTION MATERIALS (MULCH / GRAVEL / SOIL) CALCULATOR */}
      {(subToolId === 'construction-materials' || subToolId === 'all') && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                  🪨
                </span>
                Mulch, Gravel, Soil & Construction Volume Calculator
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Calculate coverage cubic yards, tons, and 2 cu ft bagged volume for landscaping and building materials.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Coverage Area (Sq Ft)</label>
              <input
                type="number"
                value={landscapeSqFt}
                onChange={(e) => setLandscapeSqFt(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Depth (Inches)</label>
              <input
                type="number"
                value={materialDepthIn}
                onChange={(e) => setMaterialDepthIn(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Material Type</label>
              <select
                value={materialType}
                onChange={(e) => setMaterialType(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold"
              >
                <option value="mulch">Bark / Wood Mulch</option>
                <option value="soil">Topsoil / Garden Soil</option>
                <option value="gravel">Crushed Stone / Gravel</option>
                <option value="asphalt">Hot Mix Asphalt</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-amber-950 text-white p-5 rounded-xl text-center">
            <div>
              <span className="text-xs uppercase text-amber-300 font-bold">Bulk Volume Required</span>
              <div className="text-3xl font-extrabold text-white mt-1">
                {matCubicYards.toFixed(2)} cu yds
              </div>
            </div>
            <div>
              <span className="text-xs uppercase text-amber-300 font-bold">Total Weight (Tons)</span>
              <div className="text-3xl font-extrabold text-amber-200 mt-1">
                {matTons.toFixed(2)} Tons
              </div>
            </div>
            <div>
              <span className="text-xs uppercase text-amber-300 font-bold">2 cu. ft. Bag Count</span>
              <div className="text-3xl font-extrabold text-emerald-300 mt-1">
                {matBags2CuFt} Bags
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. PAINT & STAIR STRINGER CALCULATOR */}
      {(subToolId === 'paint-stair-stringer' || subToolId === 'all') && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Paint Calculator */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
                🎨
              </span>
              Wall Paint Gallons Calculator
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-600 mb-1">Room Dimensions (L x W ft)</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={paintRoomLength}
                    onChange={(e) => setPaintRoomLength(Number(e.target.value))}
                    className="w-1/2 px-2 py-1 border border-slate-300 rounded font-semibold text-xs"
                  />
                  <input
                    type="number"
                    value={paintRoomWidth}
                    onChange={(e) => setPaintRoomWidth(Number(e.target.value))}
                    className="w-1/2 px-2 py-1 border border-slate-300 rounded font-semibold text-xs"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1">Ceiling Height (ft)</label>
                <input
                  type="number"
                  value={paintCeilingHeight}
                  onChange={(e) => setPaintCeilingHeight(Number(e.target.value))}
                  className="w-full px-2 py-1 border border-slate-300 rounded font-semibold text-xs"
                />
              </div>
            </div>
            <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-xl text-center">
              <span className="text-xs text-indigo-800 uppercase font-bold">Paint Needed ({paintCoats} Coats)</span>
              <div className="text-3xl font-extrabold text-indigo-950 mt-1">
                {paintGallons} Gallon{paintGallons !== 1 ? 's' : ''}
              </div>
              <p className="text-xs text-indigo-700 mt-1">Total Coverage: {totalPaintSqFt} sq ft</p>
            </div>
          </div>

          {/* Stair Stringer Calculator */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-sm">
                🪜
              </span>
              Stair Stringer & Rise/Run Calculator
            </h2>
            <div>
              <label className="block text-xs text-slate-600 mb-1">Total Rise / Floor Height (Inches)</label>
              <input
                type="number"
                value={totalStairRiseIn}
                onChange={(e) => setTotalStairRiseIn(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold"
              />
            </div>
            <div className="bg-teal-50 border border-teal-200 p-4 rounded-xl grid grid-cols-3 gap-2 text-center">
              <div>
                <span className="text-xs text-teal-800">Steps (# Risers)</span>
                <div className="text-xl font-bold text-teal-950">{numberOfSteps} Steps</div>
              </div>
              <div>
                <span className="text-xs text-teal-800">Actual Rise</span>
                <div className="text-xl font-bold text-teal-950">{actualStepRiseIn}"</div>
              </div>
              <div>
                <span className="text-xs text-teal-800">Total Run</span>
                <div className="text-xl font-bold text-teal-950">{totalStairRunFt} ft</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. ELECTRICAL OHM'S LAW & PHYSICS CALCULATOR */}
      {(subToolId === 'electrical-physics' || subToolId === 'all') && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                  ⚡
                </span>
                Electrical Ohm's Law & Physics Mechanics Calculator
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Calculate Voltage, Current, Resistance, Power (Watts), Kinetic Energy, and Gravitational Force.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Electrical Ohm's Law */}
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4">
              <h3 className="text-sm font-bold text-slate-800 uppercase flex items-center gap-2">
                <span>💡</span> Ohm's Law & Power (V, I, R, P)
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-600 mb-1">Voltage V (Volts)</label>
                  <input
                    type="number"
                    value={elecVoltage}
                    onChange={(e) => setElecVoltage(Number(e.target.value))}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-600 mb-1">Current I (Amps)</label>
                  <input
                    type="number"
                    value={elecCurrent}
                    onChange={(e) => setElecCurrent(Number(e.target.value))}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="bg-amber-950 text-white p-4 rounded-xl grid grid-cols-2 gap-2 text-center">
                <div>
                  <span className="text-[11px] text-amber-300 font-bold uppercase">Power (P = V · I)</span>
                  <div className="text-2xl font-extrabold text-amber-200 mt-1">{elecPowerWatts.toLocaleString()} W</div>
                  <span className="text-[10px] text-amber-400">{(elecPowerWatts / 1000).toFixed(2)} kW</span>
                </div>
                <div>
                  <span className="text-[11px] text-amber-300 font-bold uppercase">Resistance (R = V / I)</span>
                  <div className="text-2xl font-extrabold text-white mt-1">{elecResistanceOhms.toFixed(2)} Ω</div>
                  <span className="text-[10px] text-amber-400">Ohms</span>
                </div>
              </div>
            </div>

            {/* Physics Mechanics */}
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4">
              <h3 className="text-sm font-bold text-slate-800 uppercase flex items-center gap-2">
                <span>🚀</span> Physics Mechanics & Energy (KE = ½mv²)
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-600 mb-1">Mass m (kg)</label>
                  <input
                    type="number"
                    value={physMassKg}
                    onChange={(e) => setPhysMassKg(Number(e.target.value))}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-600 mb-1">Velocity v (m/s)</label>
                  <input
                    type="number"
                    value={physVelocityMs}
                    onChange={(e) => setPhysVelocityMs(Number(e.target.value))}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="bg-slate-900 text-white p-4 rounded-xl grid grid-cols-2 gap-2 text-center">
                <div>
                  <span className="text-[11px] text-slate-400 font-bold uppercase">Kinetic Energy</span>
                  <div className="text-2xl font-extrabold text-emerald-400 mt-1">{(physKineticEnergyJoules / 1000).toFixed(1)} kJ</div>
                  <span className="text-[10px] text-slate-300">{physKineticEnergyJoules.toLocaleString()} Joules</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 font-bold uppercase">Weight / Gravity Force</span>
                  <div className="text-2xl font-extrabold text-indigo-300 mt-1">{physForceNewtons.toFixed(1)} N</div>
                  <span className="text-[10px] text-slate-300">Newtons (F = m · g)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. LAND AREA, SQUARE METER (m²) & CUBIC METER (m³) CALCULATOR */}
      {(subToolId === 'land-area-volume' || subToolId === 'all') && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  🗺️
                </span>
                Land Plot Area (m² / Acres) & Volume (m³ / Tonnage) Calculator
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Calculate land area in square meters (m²), acres, hectares, cubic meters (m³), and material weight.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Land Area */}
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4">
              <h3 className="text-sm font-bold text-slate-800 uppercase flex items-center gap-2">
                <span>📐</span> Plot Land Area Dimensions
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-600 mb-1">Plot Length (Meters)</label>
                  <input
                    type="number"
                    value={landLengthMeters}
                    onChange={(e) => setLandLengthMeters(Number(e.target.value))}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-600 mb-1">Plot Width (Meters)</label>
                  <input
                    type="number"
                    value={landWidthMeters}
                    onChange={(e) => setLandWidthMeters(Number(e.target.value))}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="bg-emerald-950 text-white p-4 rounded-xl grid grid-cols-2 gap-2 text-center">
                <div>
                  <span className="text-[11px] text-emerald-300 font-bold uppercase">Square Meters (m²)</span>
                  <div className="text-2xl font-extrabold text-white mt-1">{landAreaSqMeters.toLocaleString()} m²</div>
                  <span className="text-[10px] text-emerald-200">{landAreaSqFeet.toLocaleString(undefined, { maximumFractionDigits: 1 })} sq ft</span>
                </div>
                <div>
                  <span className="text-[11px] text-emerald-300 font-bold uppercase">Acres / Hectares</span>
                  <div className="text-2xl font-extrabold text-emerald-300 mt-1">{landAreaAcres.toFixed(3)} Acres</div>
                  <span className="text-[10px] text-emerald-200">{landAreaHectares.toFixed(3)} Hectares</span>
                </div>
              </div>
            </div>

            {/* Cubic Volume & Tonnage */}
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4">
              <h3 className="text-sm font-bold text-slate-800 uppercase flex items-center gap-2">
                <span>🧊</span> Cubic Volume (m³) & Weight Estimation
              </h3>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs text-slate-600 mb-1">Length (m)</label>
                  <input
                    type="number"
                    value={volLengthMeters}
                    onChange={(e) => setVolLengthMeters(Number(e.target.value))}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-600 mb-1">Width (m)</label>
                  <input
                    type="number"
                    value={volWidthMeters}
                    onChange={(e) => setVolWidthMeters(Number(e.target.value))}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-600 mb-1">Depth (m)</label>
                  <input
                    type="number"
                    step="0.05"
                    value={volDepthMeters}
                    onChange={(e) => setVolDepthMeters(Number(e.target.value))}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="bg-slate-900 text-white p-4 rounded-xl grid grid-cols-2 gap-2 text-center">
                <div>
                  <span className="text-[11px] text-slate-400 font-bold uppercase">Volume (m³)</span>
                  <div className="text-2xl font-extrabold text-teal-300 mt-1">{volumeCubicMeters.toFixed(2)} m³</div>
                  <span className="text-[10px] text-slate-300">{volumeCubicFeet.toFixed(1)} cu ft</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 font-bold uppercase">Material Tonnage</span>
                  <div className="text-2xl font-extrabold text-amber-300 mt-1">{estimatedSoilWeightTons.toFixed(1)} Tons</div>
                  <span className="text-[10px] text-slate-300">Soil/Graves (~{estimatedConcreteWeightTons.toFixed(1)}T Conc)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
