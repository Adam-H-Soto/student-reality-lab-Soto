# The Grocery Gap: Food Affordability for Young Adults Across the United States

## Essential Question

What percentage of a young adult's income is required to afford
groceries in each U.S. state?

This project examines how grocery affordability varies geographically
and whether food costs place a disproportionate financial burden on
students, recent graduates, and young professionals.

------------------------------------------------------------------------

## Claim (Hypothesis)

Grocery affordability varies significantly across U.S. states, with
high-cost states requiring more than **double the share of income for
groceries** compared to the most affordable states.

------------------------------------------------------------------------

## Audience

This project is designed for:

-   College students
-   Recent graduates
-   Young professionals
-   Educators interested in cost-of-living differences

The goal is to help viewers understand how grocery affordability differs
depending on where they live.

------------------------------------------------------------------------

## STAR Draft

### Situation

Food prices have increased significantly in recent years, creating
financial pressure for students and young adults. While national
statistics track inflation, they often fail to show how grocery
affordability varies geographically.

Young adults moving to different states for school or employment may
face very different food costs relative to their income.

### Task

The viewer should be able to determine:

-   How grocery costs vary by state
-   What percentage of income young adults spend on groceries
-   Which states are most and least affordable for food

By the end of the interaction, users should understand whether groceries
represent a manageable expense or a major financial burden depending on
location.

### Action

This project will build an interactive data story with four views.

**View 1 --- Geographic Context**\
A visualization showing grocery cost differences across U.S. states.

**View 2 --- Evidence**\
A chart showing the percentage of income spent on groceries by state.

**View 3 --- Interaction**\
Users can adjust variables including:

-   Age group (student, recent graduate, young professional)
-   Estimated grocery spending
-   State selection

The visualization will update dynamically.

**View 4 --- Comparison**\
A ranked chart highlighting the most affordable and least affordable
states.

### Result (Expected)

The project is expected to demonstrate that grocery affordability varies
widely across the United States.

Some states may require more than **twice the share of income for
groceries** compared to others.

Key metrics reported will include:

-   Monthly grocery costs
-   Percentage of income spent on groceries

------------------------------------------------------------------------

## Dataset & Provenance

Food cost estimates will come from:

-   MIT Living Wage Calculator
-   U.S. Department of Agriculture

Income estimates will come from:

-   U.S. Census Bureau
-   U.S. Bureau of Labor Statistics

**Retrieval date:** March 2026

These sources provide geographic estimates for both income and food
costs.

------------------------------------------------------------------------

## Data Dictionary

  -----------------------------------------------------------------------
  Column                  Meaning                 Units
  ----------------------- ----------------------- -----------------------
  state                   U.S. state name         text

  monthly_food_cost       Estimated monthly       USD
                          grocery spending per    
                          person                  

  annual_income           Median annual income    USD
                          for young adults        

  monthly_income          Monthly equivalent      USD
                          income                  

  grocery_income_ratio    Share of income spent   percentage
                          on groceries            
  -----------------------------------------------------------------------

------------------------------------------------------------------------

## Data Viability Audit

### Missing Values + Weird Fields

Potential issues include:

-   Inconsistent state naming conventions
-   Food cost estimates calculated for households rather than
    individuals
-   Income datasets using different age brackets

### Cleaning Plan

The data pipeline will:

1.  Standardize state names
2.  Convert annual income into monthly income
3.  Convert food costs to monthly per-person values
4.  Calculate grocery affordability using:

``` ts
grocery_income_ratio = monthly_food_cost / monthly_income
```

5.  Remove incomplete records

### What This Dataset Cannot Prove

This dataset cannot account for:

-   Individual grocery spending habits
-   Dietary differences
-   Local price variation within states

Therefore results represent **general affordability trends rather than
exact personal budgets**.

------------------------------------------------------------------------

## Draft Chart Screenshot

*(Add a screenshot of a simple Excel or Google Sheets chart here.)*

Example chart concept:

**Bar chart showing grocery cost as a percentage of income by state.**

Why this chart answers the question:

-   It directly measures grocery affordability.
-   It highlights geographic disparities between states.
