# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Solo operators and builders who collect more questions than they can move through at once.

## Product Purpose

Idea Field gives loose product thoughts a visible next state: Seed, Shaping, Testing, or Parked. Success means a visitor can capture a rough idea, find it later, and read its current context without pretending that a local list is a roadmap or an AI recommendation engine.

## Positioning

This is a private-by-default thinking instrument: a small field notebook for turning an idea into its next move. It is intentionally more honest and useful than a generic CRUD board.

## Operating Context

The current app is a browser-only portfolio demonstration. Ideas are seeded with deterministic local examples and user additions stay in localStorage. There is no account, shared workspace, ranking model, or backend sync.

## Capabilities and Constraints

- Capture a title, working note, and current signal.
- Search the field and filter by Seed, Shaping, Testing, or Parked.
- Select a thought to read its context and remove it from this browser.
- Keep interaction usable with keyboard and touch input at mobile widths.
- Do not introduce fake prioritisation, collaboration claims, or AI-generated insights.

## Evidence on Hand

- Existing implementation: `app/page.tsx`, `app/globals.css`, and `app/layout.tsx`.
- Evidence is limited to deterministic sample thoughts and browser-local state; no production dataset is available.

## Product Principles

- Preserve the roughness long enough to learn from it.
- Status names a next move, not a confidence score.
- A thought should remain inspectable without becoming a dashboard tile.
- Local-only behavior must be stated plainly.

## Accessibility & Inclusion

Use semantic forms and buttons, visible focus, strong contrast, readable body measure, clear live feedback, reduced-motion support, and no interaction that depends on color alone.
