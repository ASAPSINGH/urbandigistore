---
title: Stop-Loss Sizing: Position Sizing by Ulcer Index (UI) Drawdown Pain
description: Learn how to use the Ulcer Index to calculate drawdown depth and duration, optimizing portfolio risk allocations based on volatility.
date: 2026-07-19
category: Finance
author: Urbandigistore Research

---

# Position Sizing by Ulcer Index (UI) Drawdown Pain

Looking for a secure way to analyze and optimize your workflows? Here is a quick reference guide on the subject.

**Position sizing models** are risk-management calculations used to determine optimal capital allocations. By calculating metrics like ATR volatility, maximum drawdown, or the Sharpe and Sortino ratios, traders manage protection zones and limit trade losses.

When building a trading system, standard deviation is the most common metric used to calculate risk. However, standard deviation fails to distinguish between upward price spikes (positive volatility) and downward price drops (negative volatility). Furthermore, it ignores the duration of a drawdown. To resolve this, quantitative managers use the **Ulcer Index (UI)** to evaluate strategy risk and scale allocation sizes.

In this guide, we'll write out the Ulcer Index formula, explain drawdown duration penalties, and analyze position sizing.

---

> **Product-Led CTA**: Managing risk manually is slow and leads to trading errors. Use our free, real-time [Position Size Calculator](/position-size-calculator) to quickly model share counts and risk targets.

## 📐 The Ulcer Index (UI) Formula

The Ulcer Index measures the depth and duration of drawdowns in an equity curve. 

1.  **Calculate Drawdown ($D_i$)**: For each day $i$, calculate the percentage drop from the highest peak reached up to that point ($P_{\text{max}}$):
    $$D_i = 100 \times \left( \frac{\text{Price}_i - P_{\text{max}}}{P_{\text{max}}} \right)$$
2.  **Calculate the Quadratic Mean**: Square the daily drawdowns, find their average over a lookback window $N$, and take the square root:
    $$\text{Ulcer Index} = \sqrt{\frac{1}{N} \sum_{i=1}^{N} D_i^2}$$

By squaring the drawdowns, the Ulcer Index penalizes deep retracements more heavily than shallow pullbacks. Because it evaluates every daily data point in a drawdown (not just the valley), it also penalizes strategies that remain stuck in drawdowns for months.

---

## 📊 Volatility Bands Reference

When planning entries, traders use ATR volatility bands to structure protection zones. The chart below illustrates how volatility bands establish risk parameters around asset price channels:

![Trading charts outlining position sizing risk metrics and stop-loss boundaries](/static/images/atr_multipliers_bands.png)

---

## 🔍 Sizing Positions with the Ulcer Index

To size positions based on drawdown stress:
*   **Scale Inversely to UI**: Allocate larger capital weights to trading systems displaying low Ulcer Index values, and scale down systems with high UI values.
*   **Drawdown Management**: Review the maximum historical drawdowns of your strategies. (See our [Maximum Drawdown Sizing Guide](/blog/stop-loss-position-sizing-maximum-drawdown) to check account threshold boundaries).
*   **Calculate Positions Instantly**: Use our browser-based [Position Size Calculator](/position-size-calculator) to quickly model share counts and risk targets.
