import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { AmortizationRow } from '../../types';
import { DollarSign, ArrowDown, PieChart as PieIcon, Download, Sparkles } from 'lucide-react';

interface Props {
  subToolId: string;
}

export const FinanceCalculators: React.FC<Props> = ({ subToolId }) => {
  // --- 1. MORTGAGE CALCULATOR ---
  const [homePrice, setHomePrice] = useState<number>(400000);
  const [downPayment, setDownPayment] = useState<number>(80000); // 20%
  const [interestRate, setInterestRate] = useState<number>(6.5);
  const [loanTermYears, setLoanTermYears] = useState<number>(30);
  const [propertyTaxYear, setPropertyTaxYear] = useState<number>(4800);
  const [homeInsuranceYear, setHomeInsuranceYear] = useState<number>(1200);
  const [hoaFeeMonth, setHoaFeeMonth] = useState<number>(150);
  const [pmiRate, setPmiRate] = useState<number>(0.5);

  // Mortgage calculations
  const principalAmount = Math.max(0, homePrice - downPayment);
  const monthlyRate = interestRate / 100 / 12;
  const totalPaymentsCount = loanTermYears * 12;

  let monthlyPrincipalInterest = 0;
  if (monthlyRate > 0 && totalPaymentsCount > 0) {
    monthlyPrincipalInterest =
      (principalAmount * (monthlyRate * Math.pow(1 + monthlyRate, totalPaymentsCount))) /
      (Math.pow(1 + monthlyRate, totalPaymentsCount) - 1);
  } else if (totalPaymentsCount > 0) {
    monthlyPrincipalInterest = principalAmount / totalPaymentsCount;
  }

  const monthlyTax = propertyTaxYear / 12;
  const monthlyInsurance = homeInsuranceYear / 12;
  const isPmiRequired = downPayment / homePrice < 0.2;
  const monthlyPmi = isPmiRequired ? (principalAmount * (pmiRate / 100)) / 12 : 0;
  const totalMonthlyMortgage = monthlyPrincipalInterest + monthlyTax + monthlyInsurance + hoaFeeMonth + monthlyPmi;

  // Generate amortization chart data
  const generateAmortizationData = (): { year: number; balance: number; interestPaid: number }[] => {
    let balance = principalAmount;
    let accumulatedInterest = 0;
    const chartData: { year: number; balance: number; interestPaid: number }[] = [];

    chartData.push({ year: 0, balance: Math.round(balance), interestPaid: 0 });

    for (let month = 1; month <= totalPaymentsCount; month++) {
      const interestForMonth = balance * monthlyRate;
      const principalForMonth = monthlyPrincipalInterest - interestForMonth;
      balance = Math.max(0, balance - principalForMonth);
      accumulatedInterest += interestForMonth;

      if (month % 12 === 0 || month === totalPaymentsCount) {
        chartData.push({
          year: Math.round(month / 12),
          balance: Math.round(balance),
          interestPaid: Math.round(accumulatedInterest),
        });
      }
    }
    return chartData;
  };

  const mortgageChartData = generateAmortizationData();

  const mortgagePieData = [
    { name: 'Principal & Interest', value: Math.round(monthlyPrincipalInterest), color: '#10b981' },
    { name: 'Property Tax', value: Math.round(monthlyTax), color: '#3b82f6' },
    { name: 'Home Insurance', value: Math.round(monthlyInsurance), color: '#f59e0b' },
    { name: 'HOA Fees', value: Math.round(hoaFeeMonth), color: '#8b5cf6' },
    ...(monthlyPmi > 0 ? [{ name: 'PMI Insurance', value: Math.round(monthlyPmi), color: '#ef4444' }] : []),
  ];

  // --- 2. AUTO LOAN CALCULATOR ---
  const [carPrice, setCarPrice] = useState<number>(35000);
  const [carDownPayment, setCarDownPayment] = useState<number>(5000);
  const [tradeInValue, setTradeInValue] = useState<number>(3000);
  const [carInterestRate, setCarInterestRate] = useState<number>(5.9);
  const [carLoanMonths, setCarLoanMonths] = useState<number>(60);
  const [carSalesTaxRate, setCarSalesTaxRate] = useState<number>(7.0);

  const taxableCarPrice = Math.max(0, carPrice - tradeInValue);
  const carSalesTax = taxableCarPrice * (carSalesTaxRate / 100);
  const totalCarLoan = Math.max(0, carPrice + carSalesTax - carDownPayment - tradeInValue);
  const carMonthlyRate = carInterestRate / 100 / 12;

  let monthlyCarPayment = 0;
  if (carMonthlyRate > 0 && carLoanMonths > 0) {
    monthlyCarPayment =
      (totalCarLoan * (carMonthlyRate * Math.pow(1 + carMonthlyRate, carLoanMonths))) /
      (Math.pow(1 + carMonthlyRate, carLoanMonths) - 1);
  } else if (carLoanMonths > 0) {
    monthlyCarPayment = totalCarLoan / carLoanMonths;
  }
  const totalCarCost = monthlyCarPayment * carLoanMonths + carDownPayment + tradeInValue;
  const totalCarInterest = Math.max(0, monthlyCarPayment * carLoanMonths - totalCarLoan);

  // --- 3. PERSONAL LOAN & AMORTIZATION ---
  const [loanAmount, setLoanAmount] = useState<number>(15000);
  const [loanRate, setLoanRate] = useState<number>(9.5);
  const [loanTermMonths, setLoanTermMonths] = useState<number>(36);
  const [extraPayment, setExtraPayment] = useState<number>(100);

  const personalMonthlyRate = loanRate / 100 / 12;
  let standardMonthlyPayment = 0;
  if (personalMonthlyRate > 0 && loanTermMonths > 0) {
    standardMonthlyPayment =
      (loanAmount * (personalMonthlyRate * Math.pow(1 + personalMonthlyRate, loanTermMonths))) /
      (Math.pow(1 + personalMonthlyRate, loanTermMonths) - 1);
  } else {
    standardMonthlyPayment = loanAmount / loanTermMonths;
  }

  // Extra payment savings calculation
  const calcExtraSavings = () => {
    let bal = loanAmount;
    let month = 0;
    let totalIntExtra = 0;
    const totalPmt = standardMonthlyPayment + extraPayment;

    while (bal > 0 && month < 360) {
      month++;
      const interest = bal * personalMonthlyRate;
      const principal = totalPmt - interest;
      totalIntExtra += interest;
      bal -= principal;
    }
    const standardTotalInterest = standardMonthlyPayment * loanTermMonths - loanAmount;
    const interestSaved = Math.max(0, standardTotalInterest - totalIntExtra);
    const monthsSaved = Math.max(0, loanTermMonths - month);
    return { monthsWithExtra: month, interestSaved, monthsSaved };
  };

  const extraSavings = calcExtraSavings();

  // --- 4. PAYCHECK & SALARY CALCULATOR ---
  const [salaryMode, setSalaryMode] = useState<'yearly' | 'hourly'>('yearly');
  const [grossSalary, setGrossSalary] = useState<number>(85000);
  const [hourlyRateInput, setHourlyRateInput] = useState<number>(40.86);
  const [hoursPerWeek, setHoursPerWeek] = useState<number>(40);
  const [payFrequency, setPayFrequency] = useState<'weekly' | 'biweekly' | 'semimonthly' | 'monthly'>('biweekly');
  const [fedTaxRate, setFedTaxRate] = useState<number>(14);
  const [stateTaxRate, setStateTaxRate] = useState<number>(5);
  const [retirementDeductionPct, setRetirementDeductionPct] = useState<number>(6);

  const annualGross = salaryMode === 'yearly' ? grossSalary : hourlyRateInput * hoursPerWeek * 52;
  const payPeriods = payFrequency === 'weekly' ? 52 : payFrequency === 'biweekly' ? 26 : payFrequency === 'semimonthly' ? 24 : 12;

  const grossPerPaycheck = annualGross / payPeriods;
  const fedTaxAmount = grossPerPaycheck * (fedTaxRate / 100);
  const stateTaxAmount = grossPerPaycheck * (stateTaxRate / 100);
  const ficaTaxAmount = grossPerPaycheck * 0.0765; // Social security 6.2% + Medicare 1.45%
  const four01kDeduction = grossPerPaycheck * (retirementDeductionPct / 100);
  const netTakeHome = Math.max(0, grossPerPaycheck - fedTaxAmount - stateTaxAmount - ficaTaxAmount - four01kDeduction);

  // --- 5. RETIREMENT 401K & ROTH IRA ---
  const [currentAge, setCurrentAge] = useState<number>(30);
  const [retirementAge, setRetirementAge] = useState<number>(65);
  const [currentBalance, setCurrentBalance] = useState<number>(25000);
  const [monthlyContribution, setMonthlyContribution] = useState<number>(600);
  const [annualReturnRate, setAnnualReturnRate] = useState<number>(8.0);
  const [employerMatchPct, setEmployerMatchPct] = useState<number>(50); // 50% match up to 6%
  const [userSalaryForMatch, setUserSalaryForMatch] = useState<number>(85000);

  const yearsToRetire = Math.max(1, retirementAge - currentAge);
  const monthlyMatch = Math.min((userSalaryForMatch * 0.06) / 12, (monthlyContribution * (employerMatchPct / 100)));
  const totalMonthlySavings = monthlyContribution + monthlyMatch;

  const generateRetirementGrowth = () => {
    let bal = currentBalance;
    const data = [];
    const r = annualReturnRate / 100 / 12;

    data.push({ age: currentAge, balance: Math.round(bal), totalContributions: Math.round(bal) });
    let totalContributed = currentBalance;

    for (let yr = 1; yr <= yearsToRetire; yr++) {
      for (let m = 0; m < 12; m++) {
        bal = bal * (1 + r) + totalMonthlySavings;
        totalContributed += totalMonthlySavings;
      }
      data.push({
        age: currentAge + yr,
        balance: Math.round(bal),
        totalContributions: Math.round(totalContributed),
      });
    }
    return { data, finalBalance: Math.round(bal), totalContributed: Math.round(totalContributed) };
  };

  const retirementResults = generateRetirementGrowth();

  // --- 6. COMPOUND INTEREST & CD CALCULATOR ---
  const [cdDeposit, setCdDeposit] = useState<number>(10000);
  const [cdApy, setCdApy] = useState<number>(4.75);
  const [cdTermYears, setCdTermYears] = useState<number>(3);
  const [monthlyAddition, setMonthlyAddition] = useState<number>(200);

  const calcCdGrowth = () => {
    let bal = cdDeposit;
    const r = cdApy / 100 / 12;
    const totalMonths = cdTermYears * 12;
    let totalInterest = 0;

    for (let m = 0; m < totalMonths; m++) {
      const monthInterest = bal * r;
      totalInterest += monthInterest;
      bal += monthInterest + monthlyAddition;
    }
    return { finalBalance: Math.round(bal), totalInterest: Math.round(totalInterest) };
  };

  const cdResults = calcCdGrowth();

  // --- 7. MARGIN & TIP CALCULATOR ---
  const [costPrice, setCostPrice] = useState<number>(45);
  const [sellingPrice, setSellingPrice] = useState<number>(75);
  const profit = sellingPrice - costPrice;
  const marginPct = sellingPrice > 0 ? (profit / sellingPrice) * 100 : 0;
  const markupPct = costPrice > 0 ? (profit / costPrice) * 100 : 0;

  const [billAmount, setBillAmount] = useState<number>(120);
  const [tipPct, setTipPct] = useState<number>(18);
  const [splitCount, setSplitCount] = useState<number>(3);

  const tipAmount = billAmount * (tipPct / 100);
  const totalWithTip = billAmount + tipAmount;
  const perPersonShare = splitCount > 0 ? totalWithTip / splitCount : totalWithTip;

  // --- 8. REFINANCE & HELOC CALCULATOR ---
  const [refinanceBal, setRefinanceBal] = useState<number>(320000);
  const [currentRefRate, setCurrentRefRate] = useState<number>(7.25);
  const [currentRefPmt, setCurrentRefPmt] = useState<number>(2182);
  const [newRefRate, setNewRefRate] = useState<number>(5.85);
  const [newRefTermYears, setNewRefTermYears] = useState<number>(30);
  const [refClosingCosts, setRefClosingCosts] = useState<number>(4500);
  const [helocBorrowAmt, setHelocBorrowAmt] = useState<number>(50000);
  const [helocRate, setHelocRate] = useState<number>(8.5);

  const newRefMonthlyRate = newRefRate / 100 / 12;
  const newRefPayments = newRefTermYears * 12;
  let newRefPmt = 0;
  if (newRefMonthlyRate > 0 && newRefPayments > 0) {
    newRefPmt = (refinanceBal * (newRefMonthlyRate * Math.pow(1 + newRefMonthlyRate, newRefPayments))) / (Math.pow(1 + newRefMonthlyRate, newRefPayments) - 1);
  }
  const monthlyRefSavings = currentRefPmt - newRefPmt;
  const breakEvenMonths = monthlyRefSavings > 0 ? Math.ceil(refClosingCosts / monthlyRefSavings) : 0;
  const helocMonthlyInterestOnly = (helocBorrowAmt * (helocRate / 100)) / 12;

  // --- 9. CREDIT CARD PAYOFF CALCULATOR ---
  const [cardBalance, setCardBalance] = useState<number>(8500);
  const [cardApr, setCardApr] = useState<number>(22.9);
  const [monthlyPayoffBudget, setMonthlyPayoffBudget] = useState<number>(350);

  const calcCardPayoff = () => {
    let bal = cardBalance;
    const r = cardApr / 100 / 12;
    let month = 0;
    let totalInterest = 0;

    while (bal > 0 && month < 360) {
      month++;
      const interest = bal * r;
      totalInterest += interest;
      const principal = monthlyPayoffBudget - interest;
      if (principal <= 0) break; // Budget too low to pay interest
      bal -= principal;
    }
    return { months: month < 360 ? month : 999, totalInterest: Math.round(totalInterest) };
  };
  const cardPayoffResult = calcCardPayoff();

  // --- 10. STUDENT LOAN CALCULATOR ---
  const [studentBal, setStudentBal] = useState<number>(35000);
  const [studentApr, setStudentApr] = useState<number>(5.5);
  const [studentTermYears, setStudentTermYears] = useState<number>(10);
  const [annualIncomeIDR, setAnnualIncomeIDR] = useState<number>(55000);

  const studentMonthlyRate = studentApr / 100 / 12;
  const studentTotalPayments = studentTermYears * 12;
  let studentStandardPmt = 0;
  if (studentMonthlyRate > 0 && studentTotalPayments > 0) {
    studentStandardPmt = (studentBal * (studentMonthlyRate * Math.pow(1 + studentMonthlyRate, studentTotalPayments))) / (Math.pow(1 + studentMonthlyRate, studentTotalPayments) - 1);
  }
  const discretionaryIncome = Math.max(0, annualIncomeIDR - 22500); // SAVE plan ~225% FPL single threshold
  const idrMonthlyPmt = Math.max(0, (discretionaryIncome * 0.05) / 12);

  // --- 11. BUSINESS ROI & CAGR CALCULATOR ---
  const [bizInitInvest, setBizInitInvest] = useState<number>(50000);
  const [bizFinalVal, setBizFinalVal] = useState<number>(125000);
  const [bizYears, setBizYears] = useState<number>(5);

  const bizProfit = bizFinalVal - bizInitInvest;
  const bizRoi = bizInitInvest > 0 ? (bizProfit / bizInitInvest) * 100 : 0;
  const bizCagr = (bizInitInvest > 0 && bizFinalVal > 0 && bizYears > 0)
    ? (Math.pow(bizFinalVal / bizInitInvest, 1 / bizYears) - 1) * 100
    : 0;

  // --- 12. SOCIAL SECURITY CALCULATOR ---
  const [fraBenefitAt67, setFraBenefitAt67] = useState<number>(2400);
  const [claimAge, setClaimAge] = useState<number>(67);

  const getSsMultiplier = (age: number) => {
    if (age === 62) return 0.70;
    if (age === 63) return 0.75;
    if (age === 64) return 0.80;
    if (age === 65) return 0.867;
    if (age === 66) return 0.933;
    if (age === 67) return 1.0;
    if (age === 68) return 1.08;
    if (age === 69) return 1.16;
    if (age === 70) return 1.24;
    return 1.0;
  };
  const ssMonthlyCheck = fraBenefitAt67 * getSsMultiplier(claimAge);

  // --- 13. DTI & BUDGET CALCULATOR ---
  const [grossMonthlyIncome, setGrossMonthlyIncome] = useState<number>(7500);
  const [proposedMortgagePmt, setProposedMortgagePmt] = useState<number>(1950);
  const [otherMonthlyDebts, setOtherMonthlyDebts] = useState<number>(650);

  const frontEndDti = grossMonthlyIncome > 0 ? (proposedMortgagePmt / grossMonthlyIncome) * 100 : 0;
  const backEndDti = grossMonthlyIncome > 0 ? ((proposedMortgagePmt + otherMonthlyDebts) / grossMonthlyIncome) * 100 : 0;

  // --- 14. COMMERCIAL MORTGAGE, BOND & LTV LOAN CALCULATOR ---
  const [commPropertyValue, setCommPropertyValue] = useState<number>(1500000);
  const [commDownPmt, setCommDownPmt] = useState<number>(375000); // 25% down
  const [commRate, setCommRate] = useState<number>(6.5);
  const [commAmortYears, setCommAmortYears] = useState<number>(25);

  const commLoanAmt = Math.max(0, commPropertyValue - commDownPmt);
  const commLtvPct = commPropertyValue > 0 ? (commLoanAmt / commPropertyValue) * 100 : 0;

  const calcCommMonthlyPmt = () => {
    if (commLoanAmt <= 0 || commRate <= 0 || commAmortYears <= 0) return 0;
    const r = commRate / 100 / 12;
    const n = commAmortYears * 12;
    return (commLoanAmt * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  };
  const commMonthlyPmt = calcCommMonthlyPmt();

  // Bond Yield
  const [bondFaceVal, setBondFaceVal] = useState<number>(1000);
  const [bondPriceVal, setBondPriceVal] = useState<number>(950);
  const [bondCouponRate, setBondCouponRate] = useState<number>(5.0);
  const [bondMaturityYrs, setBondMaturityYrs] = useState<number>(10);

  const annualCouponDollar = bondFaceVal * (bondCouponRate / 100);
  const bondApproxYtm =
    bondPriceVal > 0 && bondMaturityYrs > 0
      ? ((annualCouponDollar + (bondFaceVal - bondPriceVal) / bondMaturityYrs) / ((bondFaceVal + bondPriceVal) / 2)) * 100
      : 0;

  // --- 15. BORROWING POWER & RENTAL YIELD ---
  const [borrowGrossIncome, setBorrowGrossIncome] = useState<number>(115000);
  const [borrowMonthlyExp, setBorrowMonthlyExp] = useState<number>(2400);
  const [borrowInterestRate, setBorrowInterestRate] = useState<number>(6.5);
  const [borrowTermYears, setBorrowTermYears] = useState<number>(30);

  const monthlyNetIncomeEstimate = (borrowGrossIncome * 0.75) / 12; // ~25% tax/deductions
  const netMonthlyDisposable = Math.max(0, monthlyNetIncomeEstimate - borrowMonthlyExp);
  const maxBorrowPmtCapacity = netMonthlyDisposable * 0.45; // 45% max capacity buffer

  const calcMaxBorrowLoan = () => {
    if (borrowInterestRate <= 0 || maxBorrowPmtCapacity <= 0) return 0;
    const r = borrowInterestRate / 100 / 12;
    const n = borrowTermYears * 12;
    return (maxBorrowPmtCapacity * (Math.pow(1 + r, n) - 1)) / (r * Math.pow(1 + r, n));
  };
  const maxBorrowLoanAmt = Math.round(calcMaxBorrowLoan());

  // Rental Yield
  const [rentalPropPrice, setRentalPropPrice] = useState<number>(450000);
  const [rentalMonthlyIncome, setRentalMonthlyIncome] = useState<number>(2800);
  const [rentalAnnualExpenses, setRentalAnnualExpenses] = useState<number>(4200);

  const annualRentalIncome = rentalMonthlyIncome * 12;
  const grossRentalYield = rentalPropPrice > 0 ? (annualRentalIncome / rentalPropPrice) * 100 : 0;
  const netRentalIncome = annualRentalIncome - rentalAnnualExpenses;
  const netRentalYield = rentalPropPrice > 0 ? (netRentalIncome / rentalPropPrice) * 100 : 0;

  // --- 16. TERM DEPOSIT, GOLD LOAN & FOREX COMPOUNDING ---
  const [depositPrincipal, setDepositPrincipal] = useState<number>(25000);
  const [depositApy, setDepositApy] = useState<number>(5.25);
  const [depositMonths, setDepositMonths] = useState<number>(12);

  const depositTotalReturn = depositPrincipal * Math.pow(1 + depositApy / 100 / 12, depositMonths);
  const depositInterestEarned = depositTotalReturn - depositPrincipal;

  // Gold Loan
  const [goldGrams, setGoldGrams] = useState<number>(100);
  const [goldRatePerGram, setGoldRatePerGram] = useState<number>(85); // $85/g
  const [goldLtvPct, setGoldLtvPct] = useState<number>(75); // 75%
  const [goldInterestRate, setGoldInterestRate] = useState<number>(8.5);

  const goldTotalMarketVal = goldGrams * goldRatePerGram;
  const goldMaxLoanAmt = goldTotalMarketVal * (goldLtvPct / 100);
  const goldMonthlyInterestPmt = goldMaxLoanAmt * (goldInterestRate / 100 / 12);

  return (
    <div className="space-y-8">
      {/* 1. MORTGAGE CALCULATOR */}
      {(subToolId === 'mortgage' || subToolId === 'all') && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  $
                </span>
                Mortgage & Home Payment Calculator
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Estimate monthly principal, interest, taxes, HOA, PMI, and amortization payoff.
              </p>
            </div>
            <span className="text-xs font-semibold px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
              Bankrate Style
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Home Price ($)</label>
              <input
                type="number"
                value={homePrice}
                onChange={(e) => setHomePrice(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none font-semibold text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Down Payment ($)</label>
              <input
                type="number"
                value={downPayment}
                onChange={(e) => setDownPayment(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none font-semibold text-slate-800"
              />
              <span className="text-[11px] text-slate-400">
                ({homePrice > 0 ? ((downPayment / homePrice) * 100).toFixed(1) : 0}% down)
              </span>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Interest Rate (%)</label>
              <input
                type="number"
                step="0.1"
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none font-semibold text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Loan Term (Years)</label>
              <select
                value={loanTermYears}
                onChange={(e) => setLoanTermYears(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none font-semibold text-slate-800"
              >
                <option value={30}>30-Year Fixed</option>
                <option value={20}>20-Year Fixed</option>
                <option value={15}>15-Year Fixed</option>
                <option value={10}>10-Year Fixed</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Property Tax ($/yr)</label>
              <input
                type="number"
                value={propertyTaxYear}
                onChange={(e) => setPropertyTaxYear(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Home Insurance ($/yr)</label>
              <input
                type="number"
                value={homeInsuranceYear}
                onChange={(e) => setHomeInsuranceYear(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">HOA Fees ($/mo)</label>
              <input
                type="number"
                value={hoaFeeMonth}
                onChange={(e) => setHoaFeeMonth(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">PMI Rate (%)</label>
              <input
                type="number"
                step="0.1"
                value={pmiRate}
                onChange={(e) => setPmiRate(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-800"
              />
            </div>
          </div>

          {/* Results Summary Box & Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4 border-t border-slate-100">
            {/* Summary Left */}
            <div className="bg-emerald-900 text-white rounded-xl p-5 flex flex-col justify-between">
              <div>
                <span className="text-xs uppercase tracking-wider font-semibold text-emerald-300">
                  Total Monthly Payment
                </span>
                <div className="text-3xl font-extrabold text-white mt-1">
                  ${Math.round(totalMonthlyMortgage).toLocaleString()}
                  <span className="text-sm font-normal text-emerald-200">/mo</span>
                </div>
                <p className="text-xs text-emerald-200 mt-2">
                  Loan Principal: ${principalAmount.toLocaleString()}
                </p>
              </div>

              <div className="space-y-2 mt-6 border-t border-emerald-800/80 pt-4 text-xs text-emerald-100">
                <div className="flex justify-between">
                  <span>Principal & Interest:</span>
                  <span className="font-semibold text-white">
                    ${Math.round(monthlyPrincipalInterest).toLocaleString()}/mo
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Property Tax:</span>
                  <span className="font-semibold text-white">${Math.round(monthlyTax).toLocaleString()}/mo</span>
                </div>
                <div className="flex justify-between">
                  <span>Home Insurance:</span>
                  <span className="font-semibold text-white">
                    ${Math.round(monthlyInsurance).toLocaleString()}/mo
                  </span>
                </div>
                {monthlyPmi > 0 && (
                  <div className="flex justify-between text-rose-300">
                    <span>PMI Insurance:</span>
                    <span className="font-semibold">${Math.round(monthlyPmi).toLocaleString()}/mo</span>
                  </div>
                )}
                {hoaFeeMonth > 0 && (
                  <div className="flex justify-between">
                    <span>HOA Fees:</span>
                    <span className="font-semibold text-white">${hoaFeeMonth}/mo</span>
                  </div>
                )}
              </div>
            </div>

            {/* Pie Chart Breakdown */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex flex-col items-center justify-center">
              <h3 className="text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">
                Monthly Cost Distribution
              </h3>
              <div className="w-full h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={mortgagePieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {mortgagePieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `$${value}`} />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Amortization Growth Area Chart */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <h3 className="text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">
                30-Year Loan Payoff Balance
              </h3>
              <div className="w-full h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={mortgageChartData}>
                    <XAxis dataKey="year" tick={{ fontSize: 10 }} label={{ value: 'Years', position: 'insideBottom', offset: -2 }} />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `$${v / 1000}k`} />
                    <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                    <Area type="monotone" dataKey="balance" name="Remaining Balance" stroke="#10b981" fill="#d1fae5" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. AUTO / CAR LOAN CALCULATOR */}
      {(subToolId === 'auto-loan' || subToolId === 'all') && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  🚗
                </span>
                Car Loan & Auto Payment Calculator
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Estimate auto loan payments, sales tax, trade-in impact, and total loan interest.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Vehicle Price ($)</label>
              <input
                type="number"
                value={carPrice}
                onChange={(e) => setCarPrice(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Cash Down Payment ($)</label>
              <input
                type="number"
                value={carDownPayment}
                onChange={(e) => setCarDownPayment(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Trade-in Value ($)</label>
              <input
                type="number"
                value={tradeInValue}
                onChange={(e) => setTradeInValue(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Interest Rate (%)</label>
              <input
                type="number"
                step="0.1"
                value={carInterestRate}
                onChange={(e) => setCarInterestRate(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Loan Term (Months)</label>
              <select
                value={carLoanMonths}
                onChange={(e) => setCarLoanMonths(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-semibold"
              >
                <option value={24}>24 Months (2 yrs)</option>
                <option value={36}>36 Months (3 yrs)</option>
                <option value={48}>48 Months (4 yrs)</option>
                <option value={60}>60 Months (5 yrs)</option>
                <option value={72}>72 Months (6 yrs)</option>
                <option value={84}>84 Months (7 yrs)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Sales Tax (%)</label>
              <input
                type="number"
                step="0.1"
                value={carSalesTaxRate}
                onChange={(e) => setCarSalesTaxRate(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-blue-50 border border-blue-200 rounded-xl p-5">
            <div>
              <span className="text-xs text-blue-700 font-semibold uppercase">Monthly Car Payment</span>
              <div className="text-3xl font-extrabold text-blue-950 mt-1">
                ${Math.round(monthlyCarPayment).toLocaleString()}
                <span className="text-sm font-medium text-blue-700">/mo</span>
              </div>
            </div>
            <div>
              <span className="text-xs text-blue-700 font-semibold uppercase">Total Financed Amount</span>
              <div className="text-xl font-bold text-blue-900 mt-1">
                ${Math.round(totalCarLoan).toLocaleString()}
              </div>
              <span className="text-xs text-blue-600">Includes ${Math.round(carSalesTax)} sales tax</span>
            </div>
            <div>
              <span className="text-xs text-blue-700 font-semibold uppercase">Total Interest Paid</span>
              <div className="text-xl font-bold text-blue-900 mt-1">
                ${Math.round(totalCarInterest).toLocaleString()}
              </div>
              <span className="text-xs text-blue-600">Total Vehicle Cost: ${Math.round(totalCarCost).toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}

      {/* 3. PERSONAL LOAN & AMORTIZATION */}
      {(subToolId === 'personal-loan' || subToolId === 'all') && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                  🏦
                </span>
                Personal Loan & Extra Payment Calculator
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Analyze interest savings by making extra monthly payments toward your personal loan.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Loan Amount ($)</label>
              <input
                type="number"
                value={loanAmount}
                onChange={(e) => setLoanAmount(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Interest Rate (%)</label>
              <input
                type="number"
                step="0.1"
                value={loanRate}
                onChange={(e) => setLoanRate(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Term (Months)</label>
              <input
                type="number"
                value={loanTermMonths}
                onChange={(e) => setLoanTermMonths(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Extra Monthly Payment ($)</label>
              <input
                type="number"
                value={extraPayment}
                onChange={(e) => setExtraPayment(Number(e.target.value))}
                className="w-full px-3 py-2 border border-purple-300 bg-purple-50 rounded-lg focus:ring-2 focus:ring-purple-500 font-semibold text-purple-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-xs font-semibold text-slate-500 uppercase">Standard Monthly Payment</span>
              <div className="text-2xl font-extrabold text-slate-800 mt-1">
                ${Math.round(standardMonthlyPayment).toLocaleString()}
              </div>
            </div>
            <div className="bg-purple-900 text-white p-4 rounded-xl">
              <span className="text-xs font-semibold text-purple-200 uppercase">Interest Saved with Extra $</span>
              <div className="text-2xl font-extrabold text-white mt-1">
                ${Math.round(extraSavings.interestSaved).toLocaleString()}
              </div>
              <p className="text-xs text-purple-200 mt-1">
                Paid off {extraSavings.monthsSaved} months faster!
              </p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-xs font-semibold text-slate-500 uppercase">New Payoff Term</span>
              <div className="text-2xl font-extrabold text-slate-800 mt-1">
                {extraSavings.monthsWithExtra} months
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. PAYCHECK & SALARY CALCULATOR */}
      {(subToolId === 'paycheck-salary' || subToolId === 'all') && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
                  💼
                </span>
                Paycheck & Tax Take-Home Calculator
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Calculate gross paycheck to net take-home pay after Federal, State, FICA, and 401(k) deductions.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Pay Type</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setSalaryMode('yearly')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg border ${
                    salaryMode === 'yearly'
                      ? 'bg-teal-600 text-white border-teal-600'
                      : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  Annual Salary
                </button>
                <button
                  onClick={() => setSalaryMode('hourly')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg border ${
                    salaryMode === 'hourly'
                      ? 'bg-teal-600 text-white border-teal-600'
                      : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  Hourly Rate
                </button>
              </div>
            </div>

            {salaryMode === 'yearly' ? (
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Annual Salary ($)</label>
                <input
                  type="number"
                  value={grossSalary}
                  onChange={(e) => setGrossSalary(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 font-semibold"
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Hourly Rate ($/hr)</label>
                <input
                  type="number"
                  step="0.5"
                  value={hourlyRateInput}
                  onChange={(e) => setHourlyRateInput(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 font-semibold"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Pay Frequency</label>
              <select
                value={payFrequency}
                onChange={(e) => setPayFrequency(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 font-semibold"
              >
                <option value="weekly">Weekly (52 checks/yr)</option>
                <option value="biweekly">Bi-weekly (26 checks/yr)</option>
                <option value="semimonthly">Semi-monthly (24 checks/yr)</option>
                <option value="monthly">Monthly (12 checks/yr)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Est. Federal Tax (%)</label>
              <input
                type="number"
                value={fedTaxRate}
                onChange={(e) => setFedTaxRate(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Est. State Tax (%)</label>
              <input
                type="number"
                value={stateTaxRate}
                onChange={(e) => setStateTaxRate(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">401(k) Contribution (%)</label>
              <input
                type="number"
                value={retirementDeductionPct}
                onChange={(e) => setRetirementDeductionPct(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-teal-950 text-white rounded-xl p-6">
            <div>
              <span className="text-xs uppercase font-bold text-teal-400 tracking-wider">
                Take-Home Pay Per Check ({payFrequency})
              </span>
              <div className="text-4xl font-extrabold text-white mt-1">
                ${Math.round(netTakeHome).toLocaleString()}
              </div>
              <p className="text-xs text-teal-300 mt-2">
                Annual Gross: ${Math.round(annualGross).toLocaleString()} | Est. Net Annual: ${Math.round(netTakeHome * payPeriods).toLocaleString()}
              </p>
            </div>

            <div className="space-y-2 text-xs border-t md:border-t-0 md:border-l border-teal-800 pt-4 md:pt-0 md:pl-6 text-teal-100">
              <div className="flex justify-between">
                <span>Gross Pay per Check:</span>
                <span className="font-bold text-white">${Math.round(grossPerPaycheck).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-rose-300">
                <span>Federal Income Tax ({fedTaxRate}%):</span>
                <span>-${Math.round(fedTaxAmount).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-rose-300">
                <span>State Income Tax ({stateTaxRate}%):</span>
                <span>-${Math.round(stateTaxAmount).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-rose-300">
                <span>FICA (Social Sec + Medicare 7.65%):</span>
                <span>-${Math.round(ficaTaxAmount).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-amber-300">
                <span>401(k) Contribution ({retirementDeductionPct}%):</span>
                <span>-${Math.round(four01kDeduction).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. RETIREMENT 401K & ROTH IRA */}
      {(subToolId === 'retirement-401k' || subToolId === 'all') && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  📈
                </span>
                401(k), Roth IRA & Retirement Wealth Growth
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Project your retirement nest egg with monthly contributions, annual return, and employer match.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Current Age</label>
              <input
                type="number"
                value={currentAge}
                onChange={(e) => setCurrentAge(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Retirement Target Age</label>
              <input
                type="number"
                value={retirementAge}
                onChange={(e) => setRetirementAge(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Current Savings ($)</label>
              <input
                type="number"
                value={currentBalance}
                onChange={(e) => setCurrentBalance(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Monthly Contribution ($)</label>
              <input
                type="number"
                value={monthlyContribution}
                onChange={(e) => setMonthlyContribution(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Expected Return (%/yr)</label>
              <input
                type="number"
                step="0.5"
                value={annualReturnRate}
                onChange={(e) => setAnnualReturnRate(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Employer Match ($/mo est.)</label>
              <div className="px-3 py-2 bg-slate-100 rounded-lg text-sm font-semibold text-slate-700">
                +${Math.round(monthlyMatch)}/mo
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
            <div className="bg-slate-900 text-white rounded-xl p-5 flex flex-col justify-between">
              <div>
                <span className="text-xs uppercase tracking-wider font-semibold text-emerald-400">
                  Projected Nest Egg at Age {retirementAge}
                </span>
                <div className="text-3xl font-extrabold text-emerald-300 mt-1">
                  ${retirementResults.finalBalance.toLocaleString()}
                </div>
                <p className="text-xs text-slate-300 mt-2">
                  Total Contributed: ${retirementResults.totalContributed.toLocaleString()}
                </p>
                <p className="text-xs text-emerald-400 mt-1">
                  Interest Earned: ${(retirementResults.finalBalance - retirementResults.totalContributed).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="lg:col-span-2 bg-slate-50 border border-slate-200 rounded-xl p-4">
              <h3 className="text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">
                Retirement Growth Projection Curve
              </h3>
              <div className="w-full h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={retirementResults.data}>
                    <XAxis dataKey="age" label={{ value: 'Age', position: 'insideBottom', offset: -2 }} tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `$${v >= 1000000 ? (v / 1000000).toFixed(1) + 'M' : (v / 1000).toFixed(0) + 'k'}`} />
                    <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} />
                    <Area type="monotone" dataKey="balance" name="Total Portfolio" stroke="#059669" fill="#a7f3d0" />
                    <Area type="monotone" dataKey="totalContributions" name="Contributions" stroke="#3b82f6" fill="#bfdbfe" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. COMPOUND INTEREST & CD CALCULATOR */}
      {(subToolId === 'investment-cd' || subToolId === 'all') && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                  🏦
                </span>
                Certificate of Deposit (CD) & Savings Yield Calculator
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Calculate fixed CD interest yields and compound savings returns.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Initial Deposit ($)</label>
              <input
                type="number"
                value={cdDeposit}
                onChange={(e) => setCdDeposit(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">APY / Rate (%)</label>
              <input
                type="number"
                step="0.05"
                value={cdApy}
                onChange={(e) => setCdApy(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Term (Years)</label>
              <input
                type="number"
                value={cdTermYears}
                onChange={(e) => setCdTermYears(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Monthly Addition ($)</label>
              <input
                type="number"
                value={monthlyAddition}
                onChange={(e) => setMonthlyAddition(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-indigo-50 border border-indigo-200 rounded-xl p-5">
            <div>
              <span className="text-xs text-indigo-700 font-bold uppercase">Final CD Balance</span>
              <div className="text-3xl font-extrabold text-indigo-950 mt-1">
                ${cdResults.finalBalance.toLocaleString()}
              </div>
            </div>
            <div>
              <span className="text-xs text-indigo-700 font-bold uppercase">Total Interest Earned</span>
              <div className="text-3xl font-extrabold text-indigo-700 mt-1">
                +${cdResults.totalInterest.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. MARGIN & TIP CALCULATOR */}
      {(subToolId === 'margin-tip' || subToolId === 'all') && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Margin & Markup */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
                %
              </span>
              Profit Margin & Markup Calculator
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-600 mb-1">Cost Price ($)</label>
                <input
                  type="number"
                  value={costPrice}
                  onChange={(e) => setCostPrice(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1">Selling Price ($)</label>
                <input
                  type="number"
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold"
                />
              </div>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-3 gap-2 text-center">
              <div>
                <span className="text-xs text-slate-500">Gross Profit</span>
                <div className="text-lg font-extrabold text-slate-800">${profit.toFixed(2)}</div>
              </div>
              <div>
                <span className="text-xs text-slate-500">Profit Margin</span>
                <div className="text-lg font-extrabold text-emerald-600">{marginPct.toFixed(1)}%</div>
              </div>
              <div>
                <span className="text-xs text-slate-500">Markup</span>
                <div className="text-lg font-extrabold text-blue-600">{markupPct.toFixed(1)}%</div>
              </div>
            </div>
          </div>

          {/* Tip & Bill Split */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-sm">
                🍽️
              </span>
              Tip & Bill Splitter Calculator
            </h2>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-slate-600 mb-1">Bill Total ($)</label>
                <input
                  type="number"
                  value={billAmount}
                  onChange={(e) => setBillAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1">Tip (%)</label>
                <input
                  type="number"
                  value={tipPct}
                  onChange={(e) => setTipPct(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1">Split (# people)</label>
                <input
                  type="number"
                  min="1"
                  value={splitCount}
                  onChange={(e) => setSplitCount(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold"
                />
              </div>
            </div>
            <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 grid grid-cols-3 gap-2 text-center">
              <div>
                <span className="text-xs text-amber-800">Tip Amount</span>
                <div className="text-lg font-extrabold text-amber-900">${tipAmount.toFixed(2)}</div>
              </div>
              <div>
                <span className="text-xs text-amber-800">Total Bill</span>
                <div className="text-lg font-extrabold text-amber-900">${totalWithTip.toFixed(2)}</div>
              </div>
              <div>
                <span className="text-xs text-amber-800">Per Person Share</span>
                <div className="text-lg font-extrabold text-emerald-700">${perPersonShare.toFixed(2)}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 8. REFINANCE & HELOC CALCULATOR */}
      {(subToolId === 'refinance-heloc' || subToolId === 'all') && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  🔄
                </span>
                Refinance & HELOC Payment Calculator
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Compare cash-out refinance vs HELOC line of credit, new rate savings, and break-even timeline.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Current Loan Balance ($)</label>
              <input
                type="number"
                value={refinanceBal}
                onChange={(e) => setRefinanceBal(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Current Monthly Payment ($)</label>
              <input
                type="number"
                value={currentRefPmt}
                onChange={(e) => setCurrentRefPmt(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">New Refinance Rate (%)</label>
              <input
                type="number"
                step="0.05"
                value={newRefRate}
                onChange={(e) => setNewRefRate(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Closing Costs ($)</label>
              <input
                type="number"
                value={refClosingCosts}
                onChange={(e) => setRefClosingCosts(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-emerald-900 text-white rounded-xl p-5">
            <div>
              <span className="text-xs text-emerald-300 font-bold uppercase">New Monthly Payment</span>
              <div className="text-3xl font-extrabold mt-1">${Math.round(newRefPmt).toLocaleString()}/mo</div>
              <span className="text-xs text-emerald-200">
                {monthlyRefSavings > 0
                  ? `Saves $${Math.round(monthlyRefSavings)}/mo!`
                  : `Increases payment by $${Math.abs(Math.round(monthlyRefSavings))}/mo`}
              </span>
            </div>
            <div>
              <span className="text-xs text-emerald-300 font-bold uppercase">Break-Even Period</span>
              <div className="text-3xl font-extrabold mt-1">{breakEvenMonths} Months</div>
              <span className="text-xs text-emerald-200">Time to recover ${refClosingCosts.toLocaleString()} closing costs</span>
            </div>
            <div className="border-l border-emerald-800 pl-4">
              <span className="text-xs text-emerald-300 font-bold uppercase">HELOC Draw Period ($50k @ 8.5%)</span>
              <div className="text-xl font-bold mt-1">${Math.round(helocMonthlyInterestOnly)}/mo</div>
              <span className="text-xs text-emerald-200">Interest-only during 10-yr draw</span>
            </div>
          </div>
        </div>
      )}

      {/* 9. CREDIT CARD PAYOFF CALCULATOR */}
      {(subToolId === 'credit-card-payoff' || subToolId === 'all') && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
                  💳
                </span>
                Credit Card Payoff & Interest Reduction Calculator
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Calculate months to zero balance and total interest saved with custom monthly payment strategies.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Total Credit Card Balance ($)</label>
              <input
                type="number"
                value={cardBalance}
                onChange={(e) => setCardBalance(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Interest Rate APR (%)</label>
              <input
                type="number"
                step="0.1"
                value={cardApr}
                onChange={(e) => setCardApr(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Monthly Payment Budget ($)</label>
              <input
                type="number"
                value={monthlyPayoffBudget}
                onChange={(e) => setMonthlyPayoffBudget(Number(e.target.value))}
                className="w-full px-3 py-2 border border-rose-300 bg-rose-50 rounded-lg font-semibold text-rose-950"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-rose-950 text-white rounded-xl p-5">
            <div>
              <span className="text-xs text-rose-300 font-bold uppercase">Time to Become Debt-Free</span>
              <div className="text-3xl font-extrabold text-white mt-1">
                {cardPayoffResult.months < 999 ? `${cardPayoffResult.months} Months` : 'Payment Too Low'}
              </div>
              <span className="text-xs text-rose-200">
                {cardPayoffResult.months < 999
                  ? `~${(cardPayoffResult.months / 12).toFixed(1)} years`
                  : 'Monthly payment does not cover monthly APR interest!'}
              </span>
            </div>
            <div>
              <span className="text-xs text-rose-300 font-bold uppercase">Total APR Interest Paid</span>
              <div className="text-3xl font-extrabold text-rose-300 mt-1">
                ${cardPayoffResult.totalInterest.toLocaleString()}
              </div>
              <span className="text-xs text-rose-200">
                Total Paid: ${(cardBalance + cardPayoffResult.totalInterest).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 10. STUDENT LOAN CALCULATOR */}
      {(subToolId === 'student-loan' || subToolId === 'all') && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                  🎓
                </span>
                Student Loan Repayment & IDR/SAVE Calculator
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Compare Standard 10-Year Repayment vs Income-Driven Repayment (IDR) options.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Student Loan Balance ($)</label>
              <input
                type="number"
                value={studentBal}
                onChange={(e) => setStudentBal(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Interest Rate (%)</label>
              <input
                type="number"
                step="0.1"
                value={studentApr}
                onChange={(e) => setStudentApr(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Term (Years)</label>
              <input
                type="number"
                value={studentTermYears}
                onChange={(e) => setStudentTermYears(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Annual Income ($ for IDR)</label>
              <input
                type="number"
                value={annualIncomeIDR}
                onChange={(e) => setAnnualIncomeIDR(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-900 text-white p-5 rounded-xl">
              <span className="text-xs text-emerald-400 font-bold uppercase">Standard 10-Yr Plan</span>
              <div className="text-3xl font-extrabold text-white mt-1">${Math.round(studentStandardPmt)}/mo</div>
              <span className="text-xs text-slate-300">
                Total Interest: ${Math.round(studentStandardPmt * studentTotalPayments - studentBal).toLocaleString()}
              </span>
            </div>
            <div className="bg-indigo-950 text-white p-5 rounded-xl">
              <span className="text-xs text-indigo-300 font-bold uppercase">IDR / SAVE Income-Driven Plan</span>
              <div className="text-3xl font-extrabold text-indigo-200 mt-1">${Math.round(idrMonthlyPmt)}/mo</div>
              <span className="text-xs text-indigo-300">Capped based on discretionary income</span>
            </div>
          </div>
        </div>
      )}

      {/* 11. BUSINESS ROI & CAGR CALCULATOR */}
      {(subToolId === 'business-roi-cagr' || subToolId === 'all') && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
                  💼
                </span>
                Business ROI & Compound Growth (CAGR) Calculator
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Calculate total Return on Investment (ROI) and Compound Annual Growth Rate (CAGR).
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Initial Investment ($)</label>
              <input
                type="number"
                value={bizInitInvest}
                onChange={(e) => setBizInitInvest(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Final Value / Revenue ($)</label>
              <input
                type="number"
                value={bizFinalVal}
                onChange={(e) => setBizFinalVal(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Investment Horizon (Years)</label>
              <input
                type="number"
                value={bizYears}
                onChange={(e) => setBizYears(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-teal-900 text-white p-5 rounded-xl">
            <div>
              <span className="text-xs text-teal-300 font-bold uppercase">Net Profit</span>
              <div className="text-3xl font-extrabold mt-1">${bizProfit.toLocaleString()}</div>
            </div>
            <div>
              <span className="text-xs text-teal-300 font-bold uppercase">Total ROI %</span>
              <div className="text-3xl font-extrabold text-teal-200 mt-1">{bizRoi.toFixed(1)}%</div>
            </div>
            <div>
              <span className="text-xs text-teal-300 font-bold uppercase">Annualized CAGR %</span>
              <div className="text-3xl font-extrabold text-emerald-300 mt-1">{bizCagr.toFixed(2)}%</div>
            </div>
          </div>
        </div>
      )}

      {/* 12. SOCIAL SECURITY CALCULATOR */}
      {(subToolId === 'social-security-retirement' || subToolId === 'all') && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                  🛡️
                </span>
                Social Security Benefits Estimator
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Estimate monthly Social Security check amount by claiming age (62 early vs 67 FRA vs 70 delayed).
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Full Retirement Benefit (PIA at Age 67) ($/mo)</label>
              <input
                type="number"
                value={fraBenefitAt67}
                onChange={(e) => setFraBenefitAt67(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Target Claiming Age</label>
              <select
                value={claimAge}
                onChange={(e) => setClaimAge(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-semibold"
              >
                <option value={62}>Age 62 (Early - 30% Reduction)</option>
                <option value={63}>Age 63 (Early - 25% Reduction)</option>
                <option value={64}>Age 64 (Early - 20% Reduction)</option>
                <option value={65}>Age 65 (Early - 13.3% Reduction)</option>
                <option value={66}>Age 66 (Early - 6.7% Reduction)</option>
                <option value={67}>Age 67 (Full Retirement Age - 100%)</option>
                <option value={68}>Age 68 (Delayed +8% Bonus)</option>
                <option value={69}>Age 69 (Delayed +16% Bonus)</option>
                <option value={70}>Age 70 (Maximum +24% Bonus)</option>
              </select>
            </div>
          </div>

          <div className="bg-amber-950 text-white p-5 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-xs text-amber-300 font-bold uppercase">Estimated Monthly Benefit Check</span>
              <div className="text-4xl font-extrabold text-white mt-1">${Math.round(ssMonthlyCheck).toLocaleString()}/mo</div>
              <span className="text-xs text-amber-200">
                {(getSsMultiplier(claimAge) * 100).toFixed(0)}% of your full $
                {fraBenefitAt67.toLocaleString()} benchmark at age 67
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 13. DTI & BUDGET CALCULATOR */}
      {(subToolId === 'dti-budget' || subToolId === 'all') && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                  📊
                </span>
                Debt-to-Income (DTI) & Mortgage Pre-Approval Calculator
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Calculate Front-End (28% limit) and Back-End (36% limit) DTI ratios.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Gross Monthly Income ($)</label>
              <input
                type="number"
                value={grossMonthlyIncome}
                onChange={(e) => setGrossMonthlyIncome(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Proposed Housing Payment PITI ($)</label>
              <input
                type="number"
                value={proposedMortgagePmt}
                onChange={(e) => setProposedMortgagePmt(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Other Debts ($ auto, student, credit)</label>
              <input
                type="number"
                value={otherMonthlyDebts}
                onChange={(e) => setOtherMonthlyDebts(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-900 text-white p-5 rounded-xl">
            <div>
              <span className="text-xs text-slate-400 font-bold uppercase">Front-End Housing DTI</span>
              <div className={`text-3xl font-extrabold mt-1 ${frontEndDti <= 28 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {frontEndDti.toFixed(1)}%
              </div>
              <span className="text-xs text-slate-300">Target: ≤ 28% of gross monthly income</span>
            </div>
            <div>
              <span className="text-xs text-slate-400 font-bold uppercase">Back-End Total Debt DTI</span>
              <div className={`text-3xl font-extrabold mt-1 ${backEndDti <= 36 ? 'text-emerald-400' : backEndDti <= 43 ? 'text-amber-400' : 'text-rose-400'}`}>
                {backEndDti.toFixed(1)}%
              </div>
              <span className="text-xs text-slate-300">
                {backEndDti <= 36 ? 'Excellent mortgage approval ratio!' : backEndDti <= 43 ? 'Acceptable for FHA / conventional' : 'High DTI - may require debt reduction'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 14. COMMERCIAL MORTGAGE, BOND & LTV LOAN CALCULATOR */}
      {(subToolId === 'commercial-bond-loan' || subToolId === 'all') && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  🏢
                </span>
                Commercial Mortgage, Bond & LTV Loan Calculator
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Analyze commercial property financing, LTV down payments, construction loans, and bond Yield to Maturity (YTM).
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Commercial Property Value ($)</label>
              <input
                type="number"
                value={commPropertyValue}
                onChange={(e) => setCommPropertyValue(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Down Payment ($)</label>
              <input
                type="number"
                value={commDownPmt}
                onChange={(e) => setCommDownPmt(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Interest Rate (%)</label>
              <input
                type="number"
                step="0.1"
                value={commRate}
                onChange={(e) => setCommRate(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Amortization (Years)</label>
              <input
                type="number"
                value={commAmortYears}
                onChange={(e) => setCommAmortYears(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-blue-950 text-white p-5 rounded-xl text-center">
            <div>
              <span className="text-xs uppercase text-blue-300 font-bold">Loan-To-Value (LTV) Ratio</span>
              <div className="text-3xl font-extrabold text-white mt-1">{commLtvPct.toFixed(1)}%</div>
              <span className="text-xs text-blue-200">Financed Amount: ${commLoanAmt.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-xs uppercase text-blue-300 font-bold">Monthly Commercial Payment</span>
              <div className="text-3xl font-extrabold text-emerald-300 mt-1">${Math.round(commMonthlyPmt).toLocaleString()}/mo</div>
              <span className="text-xs text-blue-200">25-Yr Amortized Schedule</span>
            </div>
            <div>
              <span className="text-xs uppercase text-blue-300 font-bold">Annual Debt Service</span>
              <div className="text-3xl font-extrabold text-amber-300 mt-1">${Math.round(commMonthlyPmt * 12).toLocaleString()}/yr</div>
            </div>
          </div>

          {/* Bond Price & YTM Estimator */}
          <div className="pt-6 border-t border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <span>🏷️</span> Bond Yield to Maturity (YTM) & Price Analysis
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs text-slate-600 mb-1">Face Value ($)</label>
                <input
                  type="number"
                  value={bondFaceVal}
                  onChange={(e) => setBondFaceVal(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1">Market Price ($)</label>
                <input
                  type="number"
                  value={bondPriceVal}
                  onChange={(e) => setBondPriceVal(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1">Annual Coupon Rate (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={bondCouponRate}
                  onChange={(e) => setBondCouponRate(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1">Maturity (Years)</label>
                <input
                  type="number"
                  value={bondMaturityYrs}
                  onChange={(e) => setBondMaturityYrs(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs font-semibold"
                />
              </div>
            </div>

            <div className="bg-slate-100 p-4 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-600 font-bold uppercase">Approximate Yield To Maturity (YTM)</span>
                <div className="text-2xl font-extrabold text-indigo-700 mt-0.5">{bondApproxYtm.toFixed(2)}%</div>
              </div>
              <div className="text-right text-xs text-slate-500">
                Annual Coupon Income: <span className="font-bold text-slate-800">${annualCouponDollar.toFixed(2)}/yr</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 15. MORTGAGE BORROWING POWER & RENTAL YIELD CALCULATOR */}
      {(subToolId === 'borrowing-power-rental-yield' || subToolId === 'all') && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  🏡
                </span>
                Mortgage Borrowing Power & Rental Yield Calculator
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Estimate maximum home loan borrowing capacity based on income, plus rental yield % for buy-to-let investments.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Borrowing Capacity */}
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4">
              <h3 className="text-sm font-bold text-slate-800 uppercase flex items-center gap-2">
                <span>💰</span> Maximum Borrowing Capacity
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-600 mb-1">Annual Gross Income ($)</label>
                  <input
                    type="number"
                    value={borrowGrossIncome}
                    onChange={(e) => setBorrowGrossIncome(Number(e.target.value))}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-600 mb-1">Monthly Expenses ($)</label>
                  <input
                    type="number"
                    value={borrowMonthlyExp}
                    onChange={(e) => setBorrowMonthlyExp(Number(e.target.value))}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-600 mb-1">Interest Rate (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={borrowInterestRate}
                    onChange={(e) => setBorrowInterestRate(Number(e.target.value))}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-600 mb-1">Loan Term (Years)</label>
                  <input
                    type="number"
                    value={borrowTermYears}
                    onChange={(e) => setBorrowTermYears(Number(e.target.value))}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="bg-emerald-950 text-white p-4 rounded-xl text-center space-y-1">
                <span className="text-[11px] text-emerald-300 font-bold uppercase">Estimated Max Borrowing Limit</span>
                <div className="text-3xl font-extrabold text-white">${maxBorrowLoanAmt.toLocaleString()}</div>
                <p className="text-[10px] text-emerald-200">Max Monthly Repayment Capacity: ${Math.round(maxBorrowPmtCapacity).toLocaleString()}/mo</p>
              </div>
            </div>

            {/* Rental Yield */}
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4">
              <h3 className="text-sm font-bold text-slate-800 uppercase flex items-center gap-2">
                <span>🔑</span> Buy-To-Let Rental Yield Analyzer
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-slate-600 mb-1">Property Price ($)</label>
                  <input
                    type="number"
                    value={rentalPropPrice}
                    onChange={(e) => setRentalPropPrice(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-600 mb-1">Monthly Rent ($)</label>
                  <input
                    type="number"
                    value={rentalMonthlyIncome}
                    onChange={(e) => setRentalMonthlyIncome(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-600 mb-1">Annual Expenses ($)</label>
                  <input
                    type="number"
                    value={rentalAnnualExpenses}
                    onChange={(e) => setRentalAnnualExpenses(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="bg-slate-900 text-white p-4 rounded-xl grid grid-cols-2 gap-2 text-center">
                <div>
                  <span className="text-[11px] text-slate-400 font-bold uppercase">Gross Rental Yield</span>
                  <div className="text-2xl font-extrabold text-emerald-400 mt-1">{grossRentalYield.toFixed(2)}%</div>
                  <span className="text-[10px] text-slate-300">${annualRentalIncome.toLocaleString()}/yr gross</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 font-bold uppercase">Net Rental Yield</span>
                  <div className="text-2xl font-extrabold text-amber-300 mt-1">{netRentalYield.toFixed(2)}%</div>
                  <span className="text-[10px] text-slate-300">${netRentalIncome.toLocaleString()}/yr net</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 16. TERM DEPOSIT, GOLD LOAN & FOREX COMPOUNDING */}
      {(subToolId === 'term-deposit-gold-loan' || subToolId === 'all') && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                  🥇
                </span>
                Term Deposit, Gold Collateral Loan & Forex Compounding Calculator
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Calculate CD term deposit fixed yields, gold ornament collateral loan limits, and investment growth.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Term Deposit */}
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4">
              <h3 className="text-sm font-bold text-slate-800 uppercase flex items-center gap-2">
                <span>🏦</span> CD / Term Deposit Fixed Interest
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-slate-600 mb-1">Deposit ($)</label>
                  <input
                    type="number"
                    value={depositPrincipal}
                    onChange={(e) => setDepositPrincipal(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-600 mb-1">Interest Rate APY %</label>
                  <input
                    type="number"
                    step="0.1"
                    value={depositApy}
                    onChange={(e) => setDepositApy(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-600 mb-1">Term (Months)</label>
                  <input
                    type="number"
                    value={depositMonths}
                    onChange={(e) => setDepositMonths(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="bg-amber-950 text-white p-4 rounded-xl grid grid-cols-2 gap-2 text-center">
                <div>
                  <span className="text-[11px] text-amber-300 font-bold uppercase">Maturity Balance</span>
                  <div className="text-2xl font-extrabold text-white mt-1">${Math.round(depositTotalReturn).toLocaleString()}</div>
                </div>
                <div>
                  <span className="text-[11px] text-amber-300 font-bold uppercase">Interest Earned</span>
                  <div className="text-2xl font-extrabold text-amber-200 mt-1">+${Math.round(depositInterestEarned).toLocaleString()}</div>
                </div>
              </div>
            </div>

            {/* Gold Loan */}
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4">
              <h3 className="text-sm font-bold text-slate-800 uppercase flex items-center gap-2">
                <span>⚖️</span> Gold Collateral Loan Eligibility
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-600 mb-1">Gold Weight (Grams)</label>
                  <input
                    type="number"
                    value={goldGrams}
                    onChange={(e) => setGoldGrams(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-600 mb-1">Gold Price ($/Gram)</label>
                  <input
                    type="number"
                    value={goldRatePerGram}
                    onChange={(e) => setGoldRatePerGram(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="bg-slate-900 text-white p-4 rounded-xl grid grid-cols-2 gap-2 text-center">
                <div>
                  <span className="text-[11px] text-slate-400 font-bold uppercase">Market Value</span>
                  <div className="text-2xl font-extrabold text-amber-300 mt-1">${goldTotalMarketVal.toLocaleString()}</div>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 font-bold uppercase">Max Loan (75% LTV)</span>
                  <div className="text-2xl font-extrabold text-emerald-400 mt-1">${Math.round(goldMaxLoanAmt).toLocaleString()}</div>
                  <span className="text-[10px] text-slate-300">Int: ${Math.round(goldMonthlyInterestPmt)}/mo</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

