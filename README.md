# student-reality-lab-Soto
IS219 Midterm Project Repository - Adam Soto


#Title
The Grocery Gap: Food Affordability for Young Adults Across the United States

#Essential Question
What percentage of a young adult's income is required to afford groceries in each U.S. state?
- This question examines how grocery affordability varies geographically and whether food costs place a disproportionate financial burden on students, recent graduates, and young professionals.

#Claim (Hypothesis)
Grocery affordability varies significantly across U.S. states, with high-cost states requiring more than double the share of income for groceries compared to the most affordable states.

#Audience
This project is designed for:
- College students
- Recent graduates
- Young professionals entering the workforce
- Educators and policymakers interested in cost-of-living disparities

The goal is to help young adults understand how grocery affordability differs depending on where they live.

#STAR Draft

#Situation
Rising food prices have become a common concern for students and young adults across the United States. While national statistics report overall food inflation, they rarely show how grocery affordability varies geographically. Students moving to different states for school or employment may face dramatically different food costs relative to their income.

#Task
The viewer should be able to determine:
- How grocery costs vary across states
- What percentage of income young adults may spend on groceries
- Which states are most and least affordable for food

By the end of the interaction, users should understand whether groceries represent a manageable expense or a significant financial burden depending on location.

#Action
This project will build an interactive data story with four views.

*View 1 — Geographic Context*
A U.S. map or bar chart showing average grocery costs by state.
Purpose:
Show how grocery prices vary geographically.

*View 2 — Evidence*
A chart showing percentage of income spent on groceries by state.
Purpose:
Directly test the claim that grocery affordability varies widely.

*View 3 — Interaction*
Users can adjust variables including:
- Age group (student, recent graduate, young professional)
- Estimated monthly grocery spending
- State selection
Purpose:
The chart will dynamically update to show how grocery affordability changes.

*View 4 — Comparison*
A ranking chart showing:
- Most affordable states
- Least affordable states
Purpose:
Highlight the geographic disparity clearly.

#Result (Expected)
The project is expected to show that:
- Grocery affordability varies dramatically across the United States
- Some states require over twice the share of income for groceries compared to others
- Young adults in high-cost states face significantly greater financial pressure

Key metrics reported:
- Percentage of income spent on groceries
- Monthly grocery cost differences across states

#Dataset & Provenance
Food cost estimates will come from:
- MIT Living Wage Calculator
- U.S. Department of Agriculture

Income estimates will come from:
- U.S. Census Bureau
- U.S. Bureau of Labor Statistics

Retrieval date: March 2026.
These sources provide reliable geographic estimates for both income and food costs.

#Data Dictionary
Column	                    Meaning	                                                 Units
state	                      U.S. state name                                          text
monthly_food_cost	          Estimated monthly grocery spending per person	           USD
annual_income	              Median annual income for young adults	                   USD
monthly_income	            Monthly equivalent income	                               USD
grocery_income_ratio	      Share of income spent on groceries	                      percentage

#Data Viability Audit
*Missing Values + Weird Fields*
Potential issues include:
- Inconsistent state naming conventions
- Food cost estimates calculated for households rather than individuals
- Income datasets using different age brackets

*Cleaning Plan*
The data pipeline will:
- Standardize state names.
- Convert annual income into monthly income.
- Convert food costs to monthly per-person values.
- Calculate grocery affordability using:
  - grocery_income_ratio = monthly_food_cost / monthly_income
- Remove incomplete records.

*What This Dataset Cannot Prove*
This dataset cannot account for:
- Individual grocery spending habits
- Dietary differences
- Local price variation within states

Therefore results represent general affordability trends rather than exact personal budgets.
