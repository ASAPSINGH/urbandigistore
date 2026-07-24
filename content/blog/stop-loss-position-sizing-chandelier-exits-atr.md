title: Stop-Loss Sizing: Position Sizing by Volatility-Adjusted Chandelier Exits
description: Learn how to calculate position size and place trailing stop-losses using ATR-based Chandelier Exit breakout thresholds.
date: 2026-07-25
category: Finance
author: Urbandigistore Research
---

# Position Sizing with Chandelier Exits and Volatility

Looking for a secure way to analyze and optimize your workflows? Here is a quick reference guide on the subject.

**Position sizing models** are risk-management calculations used to determine optimal capital allocations. By calculating metrics like ATR volatility, maximum drawdown, or the Sharpe and Sortino ratios, traders manage protection zones and limit trade losses.

When riding high-momentum trend runs, letting profits run while keeping risk minimal is key. Placing stop-losses at volatility-adjusted **Chandelier Exit** levels lets you trail prices using standard Average True Range calculations.

---

> **Product-Led CTA**: Calculating risk limits manually during fast market breakouts leads to sizing errors. Use our free, real-time [Position Size Calculator](/position-size-calculator) to quickly model share counts and risk targets.

## 📐 Chandelier Exit and Volatility Bounds

Chandelier Exits are trailing stop-losses calculated from the highest high (for longs) or lowest low (for shorts) of a specified period:

*   **Long Chandelier Exit**: The trailing stop level for a long position:
    $$\text{Chandelier Exit} = \text{Highest High}(P, N) - (\text{ATR}(N) \times K)$$
*   **Short Chandelier Exit**: The trailing stop level for a short position:
    $$\text{Chandelier Exit} = \text{Lowest Low}(P, N) + (\text{ATR}(N) \times K)$$
    Where $N$ is the period length (typically 22 days) and $K$ is the ATR multiplier (typically 3.0).

---

## 📊 Volatility Bands Sizing Reference

To manage drawdown risk, traders place stop-losses using ATR volatility bands. Refer to the chart below to see how these bands establish dynamic trading channels:

![Trading charts outlining position sizing risk metrics and stop-loss boundaries](/static/images/atr_multipliers_bands.png)

---

## 🛡️ Trailing Trends Safely

To manage momentum trend risk:
*   **Never Lower Trailing Stops**: Long Chandelier Exits must only move upward as new highs are reached, locking in profits.
*   **Adjust Size Dynamically**: When the ATR widens, your stop-loss distance increases. Reduce your share size to keep the total portfolio risk consistent.
*   Read [Stop-Loss Sizing with ATR Multipliers](/blog/stop-loss-position-sizing-atr-multipliers) and [Volatility Adjusted ATR Sizing](/blog/stop-loss-sizing-volatility-adjusted-atr) to learn more.
*   Calculate share sizes and risk distances instantly using our browser-based [Position Size Calculator](/position-size-calculator).
