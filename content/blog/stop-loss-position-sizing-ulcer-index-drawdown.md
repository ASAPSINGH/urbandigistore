title: Stop-Loss Sizing: Position Sizing by Ulcer Index and Drawdown Pain
description: Learn how to calculate the Ulcer Index (UI) and use historical drawdown pain to optimize your portfolio position sizing.
date: 2026-07-22
category: Finance
author: Urbandigistore Research
---

# Position Sizing with the Ulcer Index

Looking for a secure way to analyze and optimize your workflows? Here is a quick reference guide on the subject.

**Position sizing models** are risk-management calculations used to determine optimal capital allocations. By calculating metrics like ATR volatility, maximum drawdown, or the Sharpe and Sortino ratios, traders manage protection zones and limit trade losses.

Standard risk measures, like the Sharpe Ratio or standard deviation, treat all price movement as volatility, ignoring the direction of the trend. To help traders manage the psychological and financial stress of trading, Peter Martin developed the **Ulcer Index (UI)**. This metric measures the depth and duration of drawdowns to assess risk.

---

> **Product-Led CTA**: Managing risk manually is slow and leads to trading errors. Use our free, real-time [Position Size Calculator](/position-size-calculator) to quickly model share counts and risk targets.

## 📐 How to Calculate the Ulcer Index

The Ulcer Index calculates the quadratic mean of drawdowns over a lookback window, penalizing deeper and longer-lasting declines:

1.  **Drawdown ($D_i$)**: The percentage decline from the highest peak ($P$) reached up to day $i$:
    $$D_i = 100 \times \frac{Price_i - P}{P}$$
2.  **Squared Drawdown Average**: Square each daily drawdown to emphasize larger declines:
    $$UI = \sqrt{\frac{1}{N} \sum_{i=1}^{N} D_i^2}$$

Unlike standard deviation, which penalizes upward rallies, the Ulcer Index increases only when prices fall and remain below their previous highs.

---

## 📊 Volatility Bands Sizing Reference

To limit portfolio drawdown, traders set stop losses using ATR volatility bands. Refer to the chart below to see how these bands establish dynamic trading channels:

![Trading charts outlining position sizing risk metrics and stop-loss boundaries](/static/images/atr_multipliers_bands.png)

---

## 🛡️ Sizing Positions by Drawdown Pain

Traders can use the Ulcer Index to size their positions:
*   **Volatile Assets**: Reduce position sizes for assets with high Ulcer Index scores to limit drawdown risk.
*   **Allocation Rules**: Read [Stop-Loss Position Sizing with the Ulcer Index](/blog/stop-loss-position-sizing-ulcer-index) and [Sizing by Maximum Drawdown](/blog/stop-loss-position-sizing-maximum-drawdown) to set up account rules.
*   Calculate share sizes and risk distances instantly using our browser-based [Position Size Calculator](/position-size-calculator).
