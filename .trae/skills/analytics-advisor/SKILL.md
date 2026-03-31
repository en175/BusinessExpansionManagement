---
name: "analytics-advisor"
description: "Data analysis and charting advisor. Invoke when defining metrics, designing dashboards/reports, or suggesting charts/queries and instrumentation."
---

# Analytics Advisor

Helps define metrics, choose visualizations, and outline queries and instrumentation for dashboards and reports.

## What it does
- Clarifies goals → KPIs, dimensions, segments, and filters.
- Proposes chart types with rationale and expected interactions.
- Outlines data model assumptions and sampling windows.
- Suggests pseudo-SQL or query scaffolds and index hints.
- Designs event tracking (name, params) and logging for auditability.

## When to invoke
- Designing/reporting dashboards, periodic reports, or analytics pages.
- Formalizing metric definitions and ownership (single source of truth).
- Planning instrumentation/埋点 with event names and parameters.

## Inputs
- Business questions and success criteria.
- Available schema (tables/fields) or a brief description if unknown.
- Data volume, time range, and latency constraints if relevant.

## Outputs
- Metric catalog with definitions, formulas, and data lineage notes.
- Visualization recommendations with chart specs and interactions.
- Query scaffolds (pseudo-SQL) and optimization notes.
- Event tracking plan (events, properties) and retention considerations.

## Example usage
- “Design a weekly activity dashboard: active users, approvals, conversion.”
- “Recommend charts and queries for pending vs. completed items over time.”
- “Draft events and properties for a new submission form funnel.”

