# The Grocery Gap: Food Affordability for Young Adults Across the United States

### Adam Soto – IS219 – Student Reality Lab

## Live Demo

Try the live site here:
https://student-reality-lab-soto.vercel.app/

---

# Essential Question

What share of income must young adults spend on groceries in different U.S. states?

This project examines how grocery affordability varies geographically and whether food costs place a disproportionate financial burden on students, recent graduates, and young professionals.

---

# Claim (Hypothesis)

Grocery affordability varies significantly across U.S. states, with some states requiring **substantially larger shares of income for groceries** compared to the most affordable states.

---

# Audience

This project is designed for:

* College students
* Recent graduates
* Young professionals
* Educators interested in cost-of-living differences

The goal is to help viewers understand how grocery affordability differs depending on where they live.

---

# STAR Draft

## Situation

Food prices have increased significantly in recent years, creating financial pressure for students and young adults. While national statistics track inflation, they often fail to show how grocery affordability varies geographically.

Young adults moving to different states for school or employment may face very different food costs relative to their income.

---

## Task

The viewer should be able to determine:

* How grocery costs vary by state
* What percentage of income young adults spend on groceries
* Which states are most and least affordable for food

By the end of the interaction, users should understand whether groceries represent a manageable expense or a major financial burden depending on location.

---

## Action

This project builds an interactive data story composed of several coordinated visualizations.

**View 1 — Geographic Context**
A map visualization showing how grocery affordability varies across U.S. states.

**View 2 — Evidence**
A comparison chart highlighting the most and least affordable states for groceries relative to income.

**View 3 — Interaction**
Users can interact with the visualization using:

* Income group selector (College Student, Recent Graduate, Young Adult)
* Monthly vs Annual grocery cost toggle

These controls allow viewers to see how grocery affordability changes as income levels change and how costs accumulate over time.

**View 4 — Comparison**
Additional visual comparisons highlight the states with the highest and lowest grocery burden relative to income.

---

## Result (Expected)

The project demonstrates that grocery affordability varies widely across the United States.

When income assumptions change across students, recent graduates, and young adults, the overall burden decreases, but many of the same states remain consistently more expensive relative to income.

Key metrics shown include:

* Monthly grocery costs
* Annual grocery costs
* Percentage of income spent on groceries

---

# Dataset & Provenance

Food cost estimates were derived from:

* MIT Living Wage Calculator
* U.S. Department of Agriculture

Income estimates were derived from:

* U.S. Census Bureau
* U.S. Bureau of Labor Statistics

**Retrieval Date:** March 2026

These sources provide geographic estimates for both income and food costs used to estimate grocery affordability.

---

# Data Dictionary

| Column               | Meaning                                        | Units      |
| -------------------- | ---------------------------------------------- | ---------- |
| state                | U.S. state name                                | text       |
| monthly_food_cost    | Estimated monthly grocery spending per person  | USD        |
| annual_income        | Estimated annual income for the selected group | USD        |
| monthly_income       | Monthly equivalent income                      | USD        |
| grocery_income_ratio | Share of income spent on groceries             | percentage |

---

# Data Viability Audit

## Missing Values + Potential Issues

Potential issues in the dataset include:

* Inconsistent state naming conventions across datasets
* Food cost estimates originally calculated for households rather than individuals
* Income datasets using different age brackets

---

## Cleaning Plan

The data pipeline performs the following steps:

1. Standardizes state names
2. Converts annual income into monthly income
3. Converts food costs into monthly per-person estimates
4. Removes incomplete records
5. Calculates grocery affordability using the following formula:

```ts
grocery_income_ratio = monthly_food_cost / monthly_income
```

---

## What This Dataset Cannot Prove

This dataset cannot account for:

* Individual grocery spending habits
* Dietary differences
* Local price variation within states

As a result, the analysis represents **general affordability trends rather than exact personal budgets**.

---

# Technologies Used

* Next.js
* React
* TypeScript
* Data visualization components for charts and geographic mapping
* Vercel for deployment

---

# Limits & What I’d Do Next

* Data is limited to average grocery costs and may not reflect local variations within a state.
* Charts assume income scaling is linear, while real-world budgets may vary.
* Interactions are limited to predefined income groups. Additional demographic filters could provide deeper insight.

Future improvements could include:

* More granular city-level food price data
* Additional demographic comparisons
* Dynamic updates using real-time cost-of-living data sources

---

# Draft Chart Screenshot

Screenshot of an early exploratory chart used during the planning stage.

Example chart concept:
**Bar chart showing grocery cost as a percentage of income by state**

Why this chart answers the question:

* It directly measures grocery affordability.
* It highlights geographic disparities between states.
