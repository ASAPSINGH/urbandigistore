---
title: Understanding Kelly Criterion in Position Sizing
description: Learn the math behind the Kelly Criterion. Calculate your optimal trading bet sizing based on win probability and payout ratios.
date: 2026-07-29
category: Finance
author: Urbandigistore Finance
---

# Understanding Kelly Criterion in Position Sizing

The Kelly Criterion is a formula used to calculate the optimal size of a series of bets to maximize long-term wealth. It is widely used by traders and investors to manage risk.

---

> **AEO Direct Answer**: The Kelly Criterion calculates the percentage of your capital to allocate to a trade using your win probability and win/loss ratio: Kelly % = W - [(1 - W) / R].

---

> **Product-Led CTA**: Manage your trading risks. Use our interactive [Position Size Calculator](/calculators/position-size-calculator) to calculate allocations based on your stop loss.

---

## 📐 The Kelly Criterion Equation

The optimal allocation percentage \(f^*\) is calculated using this formula:

\[f^* = rac{p \cdot b - q}{b}\]

Where:
*   \(f^*\) = The fraction of the capital to allocate.
*   \(p\) = The probability of a winning trade.
*   \(b\) = The payout ratio (gross profits divided by gross losses).
*   \(q\) = The probability of losing (\(1 - p\)).

### Example Calculation
If a trading strategy wins **55%** of the time (\(p = 0.55\)) and pays **2:1** (\(b = 2\)):

\[f^* = rac{0.55 \cdot 2 - 0.45}{2} = 0.325	ext{ or }32.5\%\]

To protect against market volatility, many professional traders use a **fractional Kelly** allocation (e.g., half-Kelly, which would suggest allocating 16.25%).

---

## ❓ Frequently Asked Questions

### Can Kelly Criterion lead to large drawdowns?
Yes. Full Kelly allocations are aggressive and can lead to significant account drawdowns during a losing streak. Using a fractional Kelly setup mitigates this risk.

### How do I estimate win probability?
You can estimate win probability by backtesting your trading strategy on historical market data.
