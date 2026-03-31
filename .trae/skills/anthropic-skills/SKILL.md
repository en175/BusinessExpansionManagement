---
name: "anthropic-skills"
description: "Catalog and installer for Anthropic skills. Invoke when user asks to discover or install skills from anthropics/skills or requests capabilities listed there."
---

# Anthropic Skills Catalog

This skill helps browse, select, and locally install skills inspired by the Anthropic skills repository (anthropics/skills). It acts as a catalog and installer wrapper inside this workspace.

## What it does
- Provides a catalog view of common skill categories and examples.
- Guides selection based on user goals and suggests relevant skills.
- Installs chosen skills by creating local SKILL.md wrappers that follow workspace conventions.
- Gives usage guidelines and trigger conditions for each installed skill.

## When to invoke
- User asks to find, browse, or install a skill from the Anthropic skills catalog.
- User requests a capability commonly provided by skills in that catalog.
- Before defining custom automation for tasks that match known skill patterns.

## How to use
1. Ask the user for the target capability (e.g., “UI/UX design aid”, “SQL analysis”, “API testing”, “content drafting”).
2. Propose 1–3 matching skills with short pros/cons and a recommended default.
3. On confirmation, generate a local `.trae/skills/<skill-name>/SKILL.md` that:
   - Contains a concise description with both function and trigger conditions.
   - Includes clear usage guidelines and examples.
4. Optionally link to external docs or references as non-blocking context.

## Example prompts
- “Install a skill for professional UI/UX review and design guidelines.”  
  → Install `ui-ux-pro-max` (or similar) with instructions on when to invoke.
- “Find a skill for data analysis and chart suggestions.”  
  → Propose analysis-oriented skills and install the recommended one.

## Notes
- Keep descriptions under ~200 characters to help the model route correctly.
- Prefer one focused skill per user task to reduce overlap and ambiguity.
- Use English for the skill file unless the user prefers another language.

