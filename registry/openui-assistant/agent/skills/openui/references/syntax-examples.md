# OpenUI Lang syntax examples

One statement per line: `identifier = Expression`. Write top-down: layout, nested
components, then leaf values. Positional arguments map to Zod prop order. Forward
references are allowed; the renderer shows placeholders until defined.

```text
root = Card([header, summary, metricsTable, followups])
header = CardHeader("Q4 Dashboard", "Revenue and user growth")
summary = TextContent("Revenue is up while user growth is steady.", "default")
metricsTable = Table([metricCol, valueCol, trendCol])
metricCol = Col("Metric", ["Revenue", "Users"])
valueCol = Col("Value", ["$1.2M", "450k"])
trendCol = Col("Trend", ["up", "flat"])
followups = FollowUpBlock([details])
details = FollowUpItem("Show the detailed breakdown")
```
