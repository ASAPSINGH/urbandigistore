title: Stop-Loss Sizing: Position Sizing by Leveraged Margin and Liquidation Bounds
description: Learn how to calculate position sizing and place stop-loss levels for leveraged margin trades to avoid liquidation.
date: 2026-07-24
category: Finance
author: Urbandigistore Research
---

# Position Sizing with Leveraged Margin and Liquidation

Looking for a secure way to analyze and optimize your workflows? Here is a quick reference guide on the subject.

**Position sizing models** are risk-management calculations used to determine optimal capital allocations. By calculating metrics like ATR volatility, maximum drawdown, or the Sharpe and Sortino ratios, traders manage protection zones and limit trade losses.

When trading with leverage, your risk increases significantly. A small price movement against your position can trigger a margin call and liquidate your entire trade. To protect your capital, you must calculate **position sizes** that align with your liquidation thresholds.

---

> **Product-Led CTA**: Managing risk manually is slow and leads to trading errors. Use our free, real-time [Position Size Calculator](/position-size-calculator) to quickly model share counts and risk targets.

## 📐 Leverage and Liquidation Sizing Calculations

To calculate your liquidation price, you must factor in your leverage multiple and maintenance margin requirement:

*   **Long Liquidation Price**: The price at which a long position will be closed:
    $$\text{Liquidation Price} = \text{Entry Price} \times \left(1 - \frac{1}{L} + MMR\right)$$
*   **Short Liquidation Price**: The price at which a short position will be closed:
    $$\text{Liquidation Price} = \text{Entry Price} \times \left(1 + \frac{1}{L} - MMR\right)$$
    Where $L$ is the leverage multiple and $MMR$ is the maintenance margin requirement. To prevent liquidation, always set your stop-loss order well before this threshold is reached.

---

## 📊 Volatility Bands Sizing Reference

To manage drawdown risk, traders place stop-losses using ATR volatility bands. Refer to the chart below to see how these bands establish dynamic trading channels:

![Trading charts outlining position sizing risk metrics and stop-loss boundaries](/static/images/atr_multipliers_bands.png)

---

## 🛡️ Sizing Leveraged Trades Safely

To manage leveraged risk:
*   **Place Stop-Losses Above Liquidation**: Your stop-loss must be triggered before your maintenance margin threshold is reached.
*   **Keep Leverage Moderate**: Read [Margin vs Spot Risk](/blog/spot-vs-margin-trading-risk-leverage-liquidation) and [Stop-Loss Sizing with Portfolio Risk](/blog/stop-loss-sizing-portfolio-risk-two-percent) to structure your setup.
*   Calculate share sizes and risk distances instantly using our browser-based [Position Size Calculator](/position-size-calculator).
