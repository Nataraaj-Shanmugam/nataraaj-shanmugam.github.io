# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Static personal portfolio website for a Lead SDET. Built with vanilla HTML5, CSS3, and ES6 JavaScript — no frameworks, no bundler, no build step.

**Live site:** Hosted on GitHub Pages
**Branch structure:** `master` (production/deploy), `V2_DesignRevamp` (active development)

## Development

**Dev server:** VS Code Live Server extension on port 5501. Open `index.html` and use "Go Live" from the status bar.

There is no build process, no package manager, and no test suite. All dependencies (Font Awesome 6.4.0, Google Fonts) are loaded via CDN.

## Architecture

### Data-Driven Content

All portfolio content lives in JSON files under `data/` — nothing is hardcoded in HTML. JavaScript fetches these at runtime and renders them into the DOM:

| File | Content |
|------|---------|
| `projects.json` | Project cards with case studies, metrics, tech stacks |
| `experience.json` | Career timeline positions |
| `skills.json` | Categorized skill grid with proficiency scores |
| `Testimonials.json` | Recommendation cards (note: capital T in filename) |
| `certifications.json` | Certifications (section currently hidden from nav) |
| `insights.json` | Technical content links grouped by category |
| `insights-meta.json` | Display metadata (icons, titles, labels) for insight categories |

### Pages and Routing

Three HTML pages share a single JS file (`src/main.js`) and a single CSS file (`src/index.css`):

- **`index.html`** — Main single-page layout with hero, projects (first 3), experience timeline, skills, testimonials, insights
- **`src/projects.html`** — Full project catalog (all projects shown, no "View All" button)
- **`src/insights.html`** — Accordion-based learning page with URL param support (`?section=leetcode`)

`main.js` detects whether it's running from root or `src/` and adjusts data fetch paths accordingly via `getDataPath()` and `getLinkPath()` helpers. The same `renderProject()` function serves both the home page (3 projects) and the projects page (all).

### CSS Design System

Defined via CSS custom properties in `src/index.css`:
- **Primary palette:** Navy (#1e3a5f) with light/dark variants
- **Fonts:** Inter (body), JetBrains Mono (code)
- **Layout:** CSS Grid with `auto-fit`/`minmax()` for responsive grids, max-width 1400px containers
- **Breakpoints:** 1024px (tablet), 768px (mobile nav), 480px (small mobile)

### Key JS Patterns

- **Intersection Observers** drive both scroll-reveal animations (`.reveal` class) and active nav link highlighting
- **Staggered animations** on timeline cards use 150ms delay increments
- **Mobile nav** uses hamburger toggle with click-outside-to-close detection
- **Keyboard navigation** tracked via Tab key detection (adds `.keyboard-navigation` class to body)

## File Conventions

- 4-space indentation throughout
- JSON data files use descriptive keys matching their rendered UI components
- Project tags have matching CSS classes (e.g., `.tag-open-source`, `.tag-ai-assisted`)
- Images in `public/` — logo, profile photo

## SEO

`index.html` includes Open Graph, Twitter Card, and Schema.org JSON-LD markup. `sitemap.xml` and `robots.txt` exist but reference a placeholder domain that needs updating to the production URL.
