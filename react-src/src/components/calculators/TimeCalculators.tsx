import React, { useState } from 'react';
import { Clock, Calendar, Briefcase, Plus, Trash2 } from 'lucide-react';

interface Props {
  subToolId: string;
}

interface ShiftRow {
  day: string;
  clockIn: string; // "09:00"
  clockOut: string; // "17:00"
  breakMins: number; // 30
}

export const TimeCalculators: React.FC<Props> = ({ subToolId }) => {
  // --- 1. TIME CLOCK & WORK HOURS CALCULATOR ---
  const [hourlyPayRate, setHourlyPayRate] = useState<number>(25);
  const [overtimeMultiplier, setOvertimeMultiplier] = useState<number>(1.5);
  const [overtimeThreshold, setOvertimeThreshold] = useState<number>(40);

  const [shifts, setShifts] = useState<ShiftRow[]>([
    { day: 'Monday', clockIn: '08:30', clockOut: '17:00', breakMins: 30 },
    { day: 'Tuesday', clockIn: '08:30', clockOut: '17:00', breakMins: 30 },
    { day: 'Wednesday', clockIn: '08:30', clockOut: '17:00', breakMins: 30 },
    { day: 'Thursday', clockIn: '08:30', clockOut: '17:00', breakMins: 30 },
    { day: 'Friday', clockIn: '08:30', clockOut: '17:00', breakMins: 30 },
    { day: 'Saturday', clockIn: '', clockOut: '', breakMins: 0 },
    { day: 'Sunday', clockIn: '', clockOut: '', breakMins: 0 },
  ]);

  const updateShift = (index: number, field: keyof ShiftRow, val: any) => {
    const updated = [...shifts];
    updated[index] = { ...updated[index], [field]: val };
    setShifts(updated);
  };

  const calculateShiftHours = (s: ShiftRow): number => {
    if (!s.clockIn || !s.clockOut) return 0;
    const [inH, inM] = s.clockIn.split(':').map(Number);
    const [outH, outM] = s.clockOut.split(':').map(Number);

    let totalMins = outH * 60 + outM - (inH * 60 + inM);
    if (totalMins < 0) totalMins += 24 * 60; // Overnight shift handle
    totalMins -= s.breakMins;
    return Math.max(0, totalMins / 60);
  };

  const totalWorkedHours = shifts.reduce((acc, s) => acc + calculateShiftHours(s), 0);
  const regularHours = Math.min(totalWorkedHours, overtimeThreshold);
  const overtimeHours = Math.max(0, totalWorkedHours - overtimeThreshold);

  const regularPay = regularHours * hourlyPayRate;
  const overtimePay = overtimeHours * (hourlyPayRate * overtimeMultiplier);
  const totalGrossPay = regularPay + overtimePay;

  // --- 2. DATE & TIME DURATION & AGE CALCULATOR ---
  const [startDate, setStartDate] = useState<string>('2026-01-01');
  const [endDate, setEndDate] = useState<string>('2026-12-31');

  const [birthDate, setBirthDate] = useState<string>('1998-05-15');

  // Calculate Date Difference
  const calcDateDifference = () => {
    const d1 = new Date(startDate);
    const d2 = new Date(endDate);
    if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return { totalDays: 0, weeks: 0 };

    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const weeks = Math.floor(totalDays / 7);
    const remainingDays = totalDays % 7;

    return { totalDays, weeks, remainingDays };
  };

  const dateDiff = calcDateDifference();

  // Calculate Age
  const calcExactAge = () => {
    const b = new Date(birthDate);
    const now = new Date();
    if (isNaN(b.getTime())) return { years: 0, months: 0, days: 0 };

    let years = now.getFullYear() - b.getFullYear();
    let months = now.getMonth() - b.getMonth();
    let days = now.getDate() - b.getDate();

    if (days < 0) {
      months--;
      const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      days += prevMonth.getDate();
    }
    if (months < 0) {
      years--;
      months += 12;
    }

    const totalDaysLived = Math.floor((now.getTime() - b.getTime()) / (1000 * 60 * 60 * 24));
    return { years, months, days, totalDaysLived };
  };

  const exactAge = calcExactAge();

  // --- 3. HOURLY TO SALARY CONVERTER ---
  const [convHourlyRate, setConvHourlyRate] = useState<number>(35);
  const [convHoursPerWk, setConvHoursPerWk] = useState<number>(40);
  const [convWksPerYr, setConvWksPerYr] = useState<number>(52);

  const annualSalaryVal = convHourlyRate * convHoursPerWk * convWksPerYr;
  const monthlySalaryVal = annualSalaryVal / 12;
  const biweeklySalaryVal = annualSalaryVal / 26;
  const weeklySalaryVal = annualSalaryVal / 52;

  // --- 4. BUSINESS DAYS CALCULATOR ---
  const [bizStartDate, setBizStartDate] = useState<string>('2026-03-01');
  const [bizDaysToAdd, setBizDaysToAdd] = useState<number>(15);

  const calcTargetBusinessDate = () => {
    let curr = new Date(bizStartDate);
    if (isNaN(curr.getTime())) return { targetStr: '', calDays: 0 };

    let added = 0;
    let totalCalendarDays = 0;

    while (added < bizDaysToAdd && totalCalendarDays < 365) {
      curr.setDate(curr.getDate() + 1);
      totalCalendarDays++;
      const dayOfWeek = curr.getDay(); // 0 is Sun, 6 is Sat
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        added++;
      }
    }

    const y = curr.getFullYear();
    const m = String(curr.getMonth() + 1).padStart(2, '0');
    const d = String(curr.getDate()).padStart(2, '0');
    return { targetStr: `${y}-${m}-${d}`, calDays: totalCalendarDays };
  };

  const bizRes = calcTargetBusinessDate();

  return (
    <div className="space-y-8">
      {/* 1. TIME CLOCK & WORK HOURS CALCULATOR */}
      {(subToolId === 'time-clock' || subToolId === 'all') && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                  ⏰
                </span>
                Work Hours Time Clock & Payroll Calculator
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Log daily shift start/end times, break subtractions, overtime hours, and gross pay earnings.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Hourly Rate ($/hr)</label>
              <input
                type="number"
                value={hourlyPayRate}
                onChange={(e) => setHourlyPayRate(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Overtime Threshold (hrs/wk)</label>
              <input
                type="number"
                value={overtimeThreshold}
                onChange={(e) => setOvertimeThreshold(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Overtime Multiplier</label>
              <select
                value={overtimeMultiplier}
                onChange={(e) => setOvertimeMultiplier(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold"
              >
                <option value={1.5}>1.5x (Time and a Half)</option>
                <option value={2.0}>2.0x (Double Time)</option>
              </select>
            </div>
          </div>

          {/* Shift Timesheet Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase">
                <tr>
                  <th className="p-3">Day</th>
                  <th className="p-3">Clock In</th>
                  <th className="p-3">Clock Out</th>
                  <th className="p-3">Break (mins)</th>
                  <th className="p-3">Total Worked</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {shifts.map((s, idx) => {
                  const hrs = calculateShiftHours(s);
                  return (
                    <tr key={s.day} className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-800">{s.day}</td>
                      <td className="p-3">
                        <input
                          type="time"
                          value={s.clockIn}
                          onChange={(e) => updateShift(idx, 'clockIn', e.target.value)}
                          className="px-2 py-1 border border-slate-300 rounded font-mono"
                        />
                      </td>
                      <td className="p-3">
                        <input
                          type="time"
                          value={s.clockOut}
                          onChange={(e) => updateShift(idx, 'clockOut', e.target.value)}
                          className="px-2 py-1 border border-slate-300 rounded font-mono"
                        />
                      </td>
                      <td className="p-3">
                        <input
                          type="number"
                          value={s.breakMins}
                          onChange={(e) => updateShift(idx, 'breakMins', Number(e.target.value))}
                          className="w-16 px-2 py-1 border border-slate-300 rounded font-mono"
                        />
                      </td>
                      <td className="p-3 font-bold text-slate-900">
                        {hrs > 0 ? `${hrs.toFixed(2)} hrs` : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-amber-950 text-white rounded-xl p-5">
            <div>
              <span className="text-xs uppercase font-bold text-amber-400">Total Worked Hours</span>
              <div className="text-3xl font-extrabold text-white mt-1">
                {totalWorkedHours.toFixed(2)} <span className="text-sm font-normal text-amber-300">hrs</span>
              </div>
            </div>
            <div>
              <span className="text-xs uppercase font-bold text-slate-300">Regular Hours</span>
              <div className="text-2xl font-bold text-white mt-1">{regularHours.toFixed(2)} hrs</div>
              <span className="text-xs text-amber-300">${regularPay.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-xs uppercase font-bold text-rose-300">Overtime Hours</span>
              <div className="text-2xl font-bold text-rose-200 mt-1">{overtimeHours.toFixed(2)} hrs</div>
              <span className="text-xs text-rose-300">${overtimePay.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-xs uppercase font-bold text-amber-300">Gross Weekly Pay</span>
              <div className="text-3xl font-extrabold text-amber-400 mt-1">
                ${totalGrossPay.toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. DATE, TIME & AGE CALCULATOR */}
      {(subToolId === 'date-time-duration' || subToolId === 'all') && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Date Duration */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
                📅
              </span>
              Date to Date Duration Calculator
            </h2>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-600 mb-1">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold"
                />
              </div>
            </div>

            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 grid grid-cols-2 gap-2 text-center">
              <div>
                <span className="text-xs text-indigo-800 uppercase font-bold">Total Days</span>
                <div className="text-2xl font-extrabold text-indigo-950 mt-1">
                  {dateDiff.totalDays} Days
                </div>
              </div>
              <div>
                <span className="text-xs text-indigo-800 uppercase font-bold">Weeks & Days</span>
                <div className="text-lg font-bold text-indigo-900 mt-1">
                  {dateDiff.weeks} Wks, {dateDiff.remainingDays} Days
                </div>
              </div>
            </div>
          </div>

          {/* Exact Age Calculator */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
                🎂
              </span>
              Exact Age Calculator
            </h2>

            <div>
              <label className="block text-xs text-slate-600 mb-1">Date of Birth</label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold"
              />
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
              <span className="text-xs text-emerald-800 uppercase font-bold">Your Exact Age</span>
              <div className="text-2xl font-extrabold text-emerald-950 mt-1">
                {exactAge.years} Years, {exactAge.months} Months, {exactAge.days} Days
              </div>
              <p className="text-xs text-emerald-700 mt-1">
                Total lived: {exactAge.totalDaysLived.toLocaleString()} Days
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 3. HOURLY TO SALARY CONVERTER */}
      {(subToolId === 'hourly-salary' || subToolId === 'all') && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
                  💼
                </span>
                Hourly Wage to Annual Salary Converter
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Convert hourly wage to annual, monthly, bi-weekly, and weekly gross earnings.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Hourly Wage ($)</label>
              <input
                type="number"
                value={convHourlyRate}
                onChange={(e) => setConvHourlyRate(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Hours / Week</label>
              <input
                type="number"
                value={convHoursPerWk}
                onChange={(e) => setConvHoursPerWk(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Weeks / Year</label>
              <input
                type="number"
                value={convWksPerYr}
                onChange={(e) => setConvWksPerYr(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-teal-950 text-white rounded-xl p-5 text-center">
            <div>
              <span className="text-xs uppercase text-teal-300 font-bold">Annual Salary</span>
              <div className="text-2xl font-extrabold text-white mt-1">${annualSalaryVal.toLocaleString()}</div>
            </div>
            <div>
              <span className="text-xs uppercase text-teal-300 font-bold">Monthly Gross</span>
              <div className="text-2xl font-bold text-teal-200 mt-1">${Math.round(monthlySalaryVal).toLocaleString()}</div>
            </div>
            <div>
              <span className="text-xs uppercase text-teal-300 font-bold">Bi-Weekly Gross</span>
              <div className="text-2xl font-bold text-teal-200 mt-1">${Math.round(biweeklySalaryVal).toLocaleString()}</div>
            </div>
            <div>
              <span className="text-xs uppercase text-teal-300 font-bold">Weekly Gross</span>
              <div className="text-2xl font-bold text-teal-200 mt-1">${Math.round(weeklySalaryVal).toLocaleString()}</div>
            </div>
          </div>
        </div>
      )}

      {/* 4. BUSINESS DAYS CALCULATOR */}
      {(subToolId === 'business-days' || subToolId === 'all') && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  📆
                </span>
                Business Days & Working Days Calculator
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Add business days (excluding weekends) to find future target completion dates.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Start Date</label>
              <input
                type="date"
                value={bizStartDate}
                onChange={(e) => setBizStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Add Business Days (# days)</label>
              <input
                type="number"
                value={bizDaysToAdd}
                onChange={(e) => setBizDaysToAdd(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold"
              />
            </div>
          </div>

          <div className="bg-blue-950 text-white rounded-xl p-5 flex items-center justify-between">
            <div>
              <span className="text-xs text-blue-300 uppercase font-bold">Target Completion Date</span>
              <div className="text-3xl font-extrabold text-white mt-1">{bizRes.targetStr}</div>
              <span className="text-xs text-blue-200">
                Spans {bizRes.calDays} total calendar days including weekends
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
