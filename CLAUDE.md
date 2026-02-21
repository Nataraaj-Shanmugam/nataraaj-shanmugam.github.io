# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A **vanilla static portfolio site** — no framework, no build system, no package manager. The repository is the deployable artifact; any push to the appropriate branch deploys directly via GitHub Pages.

## Local Development

No build step required. Serve the root directory with any static file server:

```bash
# Python
python3 -m http.server 8080

# Node.js (if npx available)
npx serve .
```

Then open `http://localhost:8080`. Do not open `index.html` directly as a `file://` URL — `fetch()` calls to `data/*.json` will fail due to CORS restrictions.

## Architecture

### Content-Data Separation

All visible content lives in JSON files under `data/`. To change work history, projects, skills, testimonials, or insights — edit only the JSON files, not HTML or JS.

| File | Content |
|---|---|
| `data/experience.json` | Work history entries |
| `data/projects.json` | Featured projects with case study details |
| `data/skills.json` | Technical skills by category |
| `data/certifications.json` | Certification entries |
| `data/Testimonials.json` | Colleague testimonials (note: capital T in filename) |
| `data/insights.json` | LinkedIn posts grouped by topic |
| `data/insights-meta.json` | Display metadata (titles, icons, descriptions) for insights sections |

### Rendering Pattern

`src/main.js` fires parallel `fetch()` calls against the `data/` JSON files on page load, then injects HTML into empty container `div`s via `innerHTML`. There is no virtual DOM or diffing — it's a one-time injection per section. Each fetch handler calls `hideSection(sectionId)` to remove both the section and its nav link when data is empty or fails to load.

```
index.html loads → static structure rendered
→ main.js fires 6+ parallel fetch() calls to data/*.json
→ Each resolves → HTML injected via innerHTML into section containers
→ Empty/failed sections are hidden along with their nav links
→ IntersectionObserver handles scroll-based nav highlighting and reveal animations
```

### Pages

- **`index.html`** — Single-page entry point with sections: `#home`, `#experience`, `#projects`, `#skills`, `#testimonials`, `#learning`, `#certifications`, `#contact`
- **`src/projects.html`** — Full case studies page. Fetches `../data/projects.json` and renders expanded cards with case study blocks (problem/solution/results). Has its own inline `<style>` block (not just `index.css`).
- **`src/insights.html`** — Standalone sub-page. Reads `?section=` URL query param to open the correct accordion. Uses `../data/` relative paths for JSON fetches.

**Sub-page path convention:** Pages in `src/` reference the shared stylesheet as `index.css` (same directory) and JSON data as `../data/`. They link back to the main page via `../index.html#<section>` (e.g. `../index.html#projects`) so the user returns to the section they came from.

**Sub-page navigation:** Both sub-pages have a floating "Back" button that appears (via `IntersectionObserver`) when the user scrolls past the static back button at the top.

### CSS Design System

`src/index.css` is monolithic. The entire design token system is defined in `:root` at the top — color palette (`--primary`, `--accent`), gray scale (`--gray-50` through `--gray-900`), shadow levels, and border radius scales. All component styles reference these tokens.

### Tag Color Convention

Project tags (e.g., `"Open Source"`, `"AI-Assisted"`) are normalized to CSS class names in JS:
```js
tag.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
// → .tag-open-source, .tag-ai-assisted
```
Each tag type needs a corresponding CSS rule in `src/index.css`.

## Known Issues / Placeholders

- `src/projects.html` has a large inline `<style>` block (~370 lines). Consider extracting to a separate CSS file if it grows further.
