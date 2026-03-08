# Presentation Plan (STAR)

## Situation

Rising food prices have made everyday expenses more difficult for students and early-career workers to manage. While many people think of groceries as a fixed or predictable cost, the financial burden of food varies significantly depending on both income level and geographic location. Students making decisions about where to study, work, or relocate often focus on tuition, rent, or wages, but grocery affordability is another important part of the cost-of-living equation.

This project examines how grocery costs affect different early-career income groups across the United States, focusing specifically on how much of a person’s income must be allocated to groceries in different states.

---

## Task

The goal of this project was to answer the following question:

**Where in the United States do groceries consume the largest share of income for students and young adults?**

The objective was to build an interactive data story that allows viewers to explore how grocery affordability changes when income level changes, while keeping grocery prices constant. By interacting with the visualizations, users should be able to identify which states consistently place the greatest grocery burden on early-career earners.

---

## Action

To address this question, I built an interactive data visualization application that combines multiple views and user controls to highlight patterns in grocery affordability.

The application includes several coordinated visualizations:

* **Affordability Map**
  A geographic view that shows how much of a person’s income is spent on groceries in each state. The map highlights the most and least affordable states to help anchor interpretation.

* **Comparative Bar Chart**
  A chart that directly compares the states with the highest and lowest grocery burden, making the contrast easier to interpret numerically.

* **Monthly vs. Annual Cost Toggle**
  A control that allows users to switch between monthly and annual grocery costs, helping illustrate how small monthly differences accumulate over time.

* **Income Group Selector**
  A dropdown interaction that allows the viewer to switch between three income groups:

  * College Students
  * Recent Graduates
  * Young Adults

  This interaction rescales income assumptions while holding grocery prices constant, allowing the viewer to see how affordability changes as earnings increase.

From a technical standpoint, the project includes a structured data pipeline that loads raw data, processes it into a consistent schema, and feeds the cleaned dataset into the visualization components. The application was built as a responsive web interface and deployed online so users can interact with the data directly.

---

## Result

The visualizations show that grocery affordability varies substantially across states and income levels. When the lowest income group (college students) is selected, grocery costs consume a significantly larger share of income across most states. As income increases for recent graduates and young adults, the burden becomes smaller overall, but the same states tend to remain among the most expensive relative to income.

This pattern suggests that geographic differences in grocery costs are relatively persistent and not simply a result of income level. Some states consistently place a higher grocery burden on residents, even when earnings increase.

One important limitation of this analysis is that the grocery price data is averaged at the state level. This means the project cannot capture differences within states, such as the higher food costs often found in major cities compared to rural areas.

Despite this limitation, the project demonstrates how interactive visualizations can help students better understand how everyday expenses relate to income. The key takeaway is that grocery affordability depends not only on food prices but on the relationship between those prices and earnings, which varies meaningfully across locations.