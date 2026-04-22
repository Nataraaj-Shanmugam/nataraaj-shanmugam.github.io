# UI / UX Defect Log

Tested via live preview at `localhost:8080` across desktop (1280px), tablet (768px), and mobile (375px).
Sub-pages `src/projects.html` and `src/insights.html` were also tested.

---

## 🔴 Critical — Breaks Core Functionality

### 1. Mobile nav drawer panel too short (backdrop-filter containment bug)
**Where:** All pages · mobile (≤768px)  
**Steps to reproduce:** Open site on mobile → tap hamburger menu  
**What happens:** Nav items appear to float in the centre of the screen with no background panel. The white drawer only covers ~60px (the height of the nav bar itself).  
**Root cause:** The `.nav` parent has `backdrop-filter: blur(18px)`. In Chromium this creates a new compositing/stacking context, which causes `position: fixed` descendants to be fixed relative to the parent element instead of the viewport. So the `.nav-links` drawer's `top:0; bottom:0` resolves to the nav bar height (~60px) rather than the full screen.  
**Fix:** Move `<ul id="navMenu">` **outside** the `<nav>` element (as a sibling in `<body>`) and toggle it from JS. The CSS rule `position: fixed; top:0; right:0; bottom:0` will then work correctly. Alternatively, add a separate full-screen overlay `<div id="navOverlay">` instead of relying on the `ul` for the backdrop.

---

## 🟠 High — Major UX / Visual Issues

### 2. Sub-pages missing `Plus Jakarta Sans` font — falls back to system sans-serif
**Where:** `src/projects.html`, `src/insights.html`  
**What happens:** Both sub-pages have their own `<link>` tag loading `Inter` (old font) but not `Plus Jakarta Sans` (new body font). The shared `src/index.css` sets `--font-body: 'Plus Jakarta Sans'` but the font is never fetched, so text renders in the system `sans-serif` fallback — creating a visual inconsistency with the main page.  
**Fix:** Replace the Google Fonts `<link>` in both sub-pages:
```
Old: family=Inter:wght@300;400;500;600;700
New: family=Plus+Jakarta+Sans:wght@300;400;500;600;700
```
Also remove the `font-family: var(--font-sans)` inline override in insights.html (it references the old alias — though the alias now maps to the correct font after the fix).

### 3. Floating "Back" button visible on page load in `projects.html`
**Where:** `src/projects.html`  
**What happens:** The `.back-btn-float` element renders with `display: flex` immediately on page load. It should only appear after the user has scrolled past the static back button at the top of the page.  
**Root cause:** The `IntersectionObserver` for the static back button fires but the initial `display:none` is not being applied — likely because the inline `<style>` in `projects.html` doesn't include the initial hidden state, and the shared CSS `.back-btn-float { display: none }` is being overridden by the JS that adds `.visible`.  
**Fix:** Audit the `IntersectionObserver` logic in `projects.html` — ensure `display: none` is set by default and only `display: inline-flex` is applied when `.visible` is toggled.

### 4. Section reveal animation doesn't trigger on hash navigation or nav link clicks
**Where:** `index.html` — all `.reveal` sections  
**What happens:** When navigating directly via URL hash (e.g. `/#experience`) or by clicking a nav link (which uses `e.preventDefault()` + `window.scrollTo()`), sections remain `opacity: 0` because `window.scrollTo()` jumps the position without triggering `IntersectionObserver` entries. Only manual mouse-wheel scrolling reliably fires the observer.  
**Fix:** After every programmatic scroll, force a check:
```js
// After window.scrollTo(...)
setTimeout(() => {
  document.querySelectorAll('.reveal:not(.active)').forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      el.classList.add('active');
    }
  });
}, 350); // after scroll settles
```
Also handle `window.location.hash` on `DOMContentLoaded` with the same check.

---

## 🟡 Medium — UX Degradations

### 5. No backdrop overlay when mobile nav opens
**Where:** All pages · mobile (≤768px)  
**What happens:** When the hamburger menu opens, the underlying page content remains fully visible and clickable. Modern mobile nav UX expects a semi-transparent dark overlay behind the drawer to signal the rest of the page is inactive. Tapping outside the drawer should also close it.  
**Fix:** Add a `<div id="navOverlay">` sibling to the nav list:
```css
#navOverlay {
  display: none; position: fixed; inset: 0;
  background: rgba(0,0,0,.4); z-index: 998;
}
#navOverlay.active { display: block; }
```
Toggle `.active` on open/close alongside the nav menu. Add `click` listener on overlay to close the menu.

### 6. Active nav link has no visual indicator — only colour change
**Where:** `index.html` · desktop nav  
**What happens:** The active/hover state for nav links only changes text colour from `--text-muted` to `--navy`. There is no bottom border, underline, or dot indicator — making it hard to distinguish "active section" from "hovered link" at a glance.  
**Fix:** Add an underline or bottom border to `.nav-link.active`:
```css
.nav-link.active {
  color: var(--navy);
  position: relative;
}
.nav-link.active::after {
  content: '';
  position: absolute; bottom: -4px; left: 0; right: 0;
  height: 2px; border-radius: 1px;
  background: var(--amber);
}
```

### 7. `insights.html` back-button style is inconsistent with `projects.html`
**Where:** `src/insights.html` vs `src/projects.html`  
**What happens:** The back button in `insights.html` has an inline style setting `background: var(--gray-900)` — a very dark `#0F1926` — on a navy `#1B2B4B` background. The button in `projects.html` correctly uses the shared CSS rule (`rgba(255,255,255,.1)` ghost style). The two back buttons look completely different across sub-pages.  
**Fix:** Remove the custom `.back-btn` override from `insights.html`'s inline `<style>` block and let the shared `src/index.css` rule govern it.

### 8. Experience timeline spine line may not align with year-dot circles
**Where:** `index.html` — `#experience` section · desktop  
**What happens:** The `.exp-spine` horizontal line is positioned `top: 2.75rem` from the `.timeline-container`. The `.exp-dot` circles are positioned `top: -1.35rem` from each card's top edge, which itself starts inside the grid. The visual alignment depends on the card's rendered top margin — at some widths the line floats above or below the dots.  
**Fix:** Test at 1280px to confirm alignment. If misaligned, adjust `.exp-spine` `top` value to match the actual computed offset of the dots (or use JavaScript to position it dynamically based on the first `.exp-dot` position).

### 9. `scroll-margin-top` not set — nav overlap risk on direct anchor navigation
**Where:** All section anchors in `index.html`  
**What happens:** All sections have `scroll-margin-top: 0px`. The JS intercepts clicks and applies a manual 72px offset, which works when JS is enabled. However when JS is disabled, or on browsers where `scroll-padding-top` on `html` is ignored (older Safari), section headings can scroll under the fixed nav.  
**Fix:** Add to CSS:
```css
section[id] { scroll-margin-top: 72px; }
```

---

## 🔵 Low — Polish & Accessibility

### 10. `<em>` used for decorative colour split on hero name
**Where:** `index.html` — `.hero-name`  
**What happens:** `<h1 class="hero-name">Nataraaj<br><em>Shanmugam</em></h1>` — the `<em>` tag is semantically "emphasis" and will be announced differently by screen readers (stress emphasis). Since the intent is purely visual (blue colour), a `<span>` is more appropriate.  
**Fix:** Replace `<em>Shanmugam</em>` with `<span class="hero-name-last">Shanmugam</span>` and update the CSS selector from `.hero-name em` to `.hero-name-last`.

### 11. Contact section carries redundant `.section` class
**Where:** `index.html` — `#contact`  
**What happens:** `<section class="cta-section section reveal" id="contact">` — `.section` gives `padding: 6rem 0` which is immediately overridden by `.cta-section`'s `padding: 5.5rem 0`. Renders correctly but introduces dead CSS specificity and confusion.  
**Fix:** Remove the `.section` class: `<section class="cta-section reveal" id="contact">`.

### 12. Nav logo image (`public/logo.png`) no longer displayed
**Where:** `index.html` — nav  
**What happens:** The old nav used `<img src="public/logo.png">` as the brand mark. The redesign replaced it with text "Nataraaj S." — intentional per the design — but the logo file exists unused.  
**Fix (optional):** Either remove `public/logo.png` to clean up assets, or add the logo back as an SVG/image mark alongside the text brand in the nav.

### 13. Google Fonts link in sub-pages still requests unused `Inter`
**Where:** `src/projects.html`, `src/insights.html`  
**What happens:** Both sub-pages request `Inter` from Google Fonts — a font that is no longer used anywhere in the design system. This is a wasted network round-trip (~50ms on first visit).  
**Fix:** Remove `&family=Inter:wght@300;400;500;600;700` from the Google Fonts URL in both files. Replace with the Plus Jakarta Sans import (see defect #2 above).

### 14. Project card tag chips use square border-radius, metrics use pill — inconsistent shape language
**Where:** `index.html` — `#projects`, `src/projects.html`  
**What happens:** Tag chips (`.chip`, `.tag-*`) use `border-radius: var(--r) = 8px` (square-ish corners) while metric chips (`.metric-chip`, `.metric`) use `border-radius: var(--r-pill) = 99px` (pill). Within a single card this creates two different shape languages for decorative labels.  
**Fix:** Standardise — either make all chips pill-shaped (`var(--r-pill)`) or all use the smaller radius (`var(--r-lg) = 14px`).

### 15. Footer has no back-to-top or social links
**Where:** `index.html` — `.footer`  
**What happens:** The footer only shows a copyright line. For a portfolio where visitors may want to quickly return to the top or jump to social profiles after reading to the bottom, this is a missed opportunity.  
**Fix (optional):** Add a "Back to top" link and LinkedIn/GitHub icon links to the footer.

---

## Summary Table

| # | Severity | Area | Status |
|---|----------|------|--------|
| 1 | 🔴 Critical | Mobile nav drawer (backdrop-filter bug) | Open |
| 2 | 🟠 High | Sub-pages missing Plus Jakarta Sans font | Open |
| 3 | 🟠 High | Floating back button shows on page load (`projects.html`) | Open |
| 4 | 🟠 High | Reveal animation fails on hash/nav-link navigation | Open |
| 5 | 🟡 Medium | No backdrop overlay behind mobile nav | Open |
| 6 | 🟡 Medium | Active nav link lacks visual indicator | Open |
| 7 | 🟡 Medium | `insights.html` back-button style inconsistency | Open |
| 8 | 🟡 Medium | Timeline spine line alignment with year dots | Open |
| 9 | 🟡 Medium | `scroll-margin-top` not set on sections | Open |
| 10 | 🔵 Low | `<em>` used for decorative name colour split | Open |
| 11 | 🔵 Low | Contact section has redundant `.section` class | Open |
| 12 | 🔵 Low | Logo image unused after nav redesign | Open |
| 13 | 🔵 Low | Sub-pages waste request fetching unused Inter font | Open |
| 14 | 🔵 Low | Chip border-radius inconsistency (square vs pill) | Open |
| 15 | 🔵 Low | Footer missing back-to-top / social links | Open |
