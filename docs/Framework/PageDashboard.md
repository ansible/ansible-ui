# Overview

The PageDashboard component controls the layout of dashboard cards using a grid layout.
It does not have a set number of columns or rows.
The number of columns change based on the width of the dashboard.
By doing this the dashboard keeps the columns a standard width.
That allows cards to keep a consistent size for content.

PageDashboardCards have a width and a height.
The width and height is not in rows or columns, but instead relative units "sm", "md, "lg", etc...
If a height is not specified, the card will use auto height and take up as little space as possible.

# Cards

## PageDashbaord

# Components

## PageChartContainer

The PageChartContainer is used to wrap around a chart.
It provides the chart with its width and height.
This is important as PF charts need to know their size to render properly.
