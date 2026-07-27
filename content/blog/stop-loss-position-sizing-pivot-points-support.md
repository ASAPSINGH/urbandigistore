title: Stop-Loss Sizing: Position Sizing by Volatility-Adjusted Pivot Point Support
description: Learn how to calculate position size and place stop-losses using volatility-adjusted Pivot Point support levels (S1, S2, S3).
date: 2026-07-27
category: Finance
author: Urbandigistore Research
---

# Position Sizing with Pivot Points and Volatility

Looking for a secure way to analyze and optimize your workflows? Here is a quick reference guide on the subject.

**Position sizing models** are risk-management calculations used to determine optimal capital allocations. By calculating metrics like ATR volatility, maximum drawdown, or the Sharpe and Sortino ratios, traders manage protection zones and limit trade losses.

When entering range-bound or breakout trades, setting stop-losses at standard arbitrary percentages leads to excessive drawdowns. Placing stop-losses just below **Pivot Point Support** levels (S1, S2, or S3) protects your capital by using structural price support limits.

---

> **Product-Led CTA**: Calculating risk limits manually during fast market breakouts leads to sizing errors. Use our free, real-time [Position Size Calculator](/position-size-calculator) to quickly model share counts and risk targets.

## 📐 Pivot Point and Support Calculations

Classic Pivot Points and their associated support levels are calculated using the high, low, and close prices from the previous period:

*   **Pivot Point (PP)**: The central baseline coordinate:
    $$\text{PP} = \frac{\text{High} + \text{Low} + \text{Close}}{3}$$
*   **Support 1 (S1)**: The first structural price barrier:
    $$\text{S1} = (2 \times \text{PP}) - \text{High}$$
*   **Support 2 (S2)**: The secondary price safety threshold:
    $$\text{S2} = \text{PP} - (\text{High} - \text{Low})$$
*   **Support 3 (S3)**: The ultimate downside boundary:
    $$\text{S3} = \text{Low} - 2 \times (\text{High} - \text{PP})$$

---

## 📊 Volatility Bands Sizing Reference

To manage drawdown risk, traders place stop-losses using ATR volatility bands. Refer to the chart below to see how these bands establish dynamic trading channels:

![Trading charts outlining position sizing risk metrics and stop-loss boundaries](/static/images/atr_multipliers_bands.png)

---

## 🛡️ Sizing Ranges Safely

To manage support risk:
*   **Place Stops below S1/S2 levels**: In range-bound systems, place stop-losses just below the S1 or S2 support boundaries to avoid price spikes.
*   **Reduce Size near S3 boundaries**: If placing stop-losses at the S3 level, the risk distance increases. Reduce your share size to keep the total trade risk within your 1% or 2% portfolio limits.
*   Read [Stop-Loss Sizing with ATR Multipliers](/blog/stop-loss-position-sizing-atr-multipliers) and [Volatility Adjusted ATR Sizing](/blog/stop-loss-sizing-volatility-adjusted-atr) to learn more.
*   Calculate share sizes and risk distances instantly using our browser-based [Position Size Calculator](/position-size-calculator).
