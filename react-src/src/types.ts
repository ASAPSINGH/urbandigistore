export type CategoryId = 'finance' | 'health' | 'math' | 'time' | 'unit';

export interface ToolItem {
  id: string;
  name: string;
  category: CategoryId;
  description: string;
  keywords: string[];
  icon: string;
  isPopular?: boolean;
}

export interface AmortizationRow {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  remainingBalance: number;
  totalInterestPaid: number;
}

export interface CalculationHistoryItem {
  id: string;
  toolId: string;
  toolName: string;
  timestamp: string;
  summary: string;
  details?: Record<string, string | number>;
}
