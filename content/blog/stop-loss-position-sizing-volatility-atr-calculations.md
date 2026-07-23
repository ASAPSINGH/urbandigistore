title: Stop-Loss Sizing: Position Sizing by Volatility and Average True Range (ATR)
description: Learn how to calculate the Average True Range (ATR) and use asset price volatility to structure dynamic stop-loss levels and size trades.
date: 2026-07-23
category: Finance
author: Urbandigistore Research
---

# Position Sizing with Volatility and Average True Range

Looking for a secure way to analyze and optimize your workflows? Here is a quick reference guide on the subject.

**Position sizing models** are risk-management calculations used to determine optimal capital allocations. By calculating metrics like ATR volatility, maximum drawdown, or the Sharpe and Sortino ratios, traders manage protection zones and limit trade losses.

In active trading, setting a fixed percentage stop-loss (like 2% or 5%) does not account for changes in market volatility. During highly volatile periods, a tight stop-loss can result in premature exits. To solve this, traders use the **Average True Range (ATR)** to calculate dynamic, volatility-adjusted stop-loss levels.

---

> **Product-Led CTA**: Managing risk manually is slow and leads to trading errors. Use our free, real-time [Position Size Calculator](/position-size-calculator) to quickly model share counts and risk targets.

## 📐 How to Calculate Average True Range (ATR)

To calculate the ATR, you first calculate the True Range ($TR$) for each period, which is the greatest of three values:

1.  Current High minus Current Low:
    $$TR_1 = High_i - Low_i$$
2.  Absolute value of Current High minus Previous Close:
    $$TR_2 = |High_i - Close_{i-1}|$$
3.  Absolute value of Current Low minus Previous Close:
    $$TR_3 = |Low_i - Close_{i-1}|$$

The ATR is then calculated as a moving average of these True Range values (typically using a 14-period lookback window). By measuring the average range of price movement, the ATR helps you place stops outside of normal market noise.

---

## 📊 Volatility Bands Sizing Reference

To structure your trades, set your stop-loss as a multiple of the ATR (e.g., 2.0x ATR) from your entry price. Refer to the chart below to see how these bands establish dynamic trading channels:

![Trading charts outlining position sizing risk metrics and stop-loss boundaries](/static/images/atr_multipliers_bands.png)

---

## 🛡️ Sizing Positions Based on Volatility

To optimize your trading allocations:
*   **Adjust Size to Volatility**: Reduce your position size on highly volatile assets with high ATR values to keep your total cash risk consistent.
*   **Set Dynamic Stops**: Read [Stop-Loss Sizing with ATR](/blog/stop-loss-sizing-average-true-range-atr) and [Volatility-Adjusted Stop-Loss Sizing](/blog/stop-loss-sizing-volatility-adjusted-atr) to manage your trade entries.
*   Calculate share sizes and risk distances instantly using our browser-based [Position Size Calculator](/position-size-calculator).
