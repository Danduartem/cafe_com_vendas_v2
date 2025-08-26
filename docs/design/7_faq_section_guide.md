# FAQ Section — Design Checklist (High-Conversion & Beautiful)

> Use this checklist to design a visually stunning, conversion-driven FAQ for your landing page (event in Lisbon, audience: female entrepreneurs). Keep it elegant, minimal, and aligned to your style guide.

---

## 1) Role & Placement
- [ ] Place FAQ **before the Final CTA** to remove last objections right where action happens.
- [ ] Add a short preface line (1 sentence) that **sets intent** (“Tire suas dúvidas em 60s”).
- [ ] Keep total FAQs focused (≈ **7–12** items). More → collapse into categories.

## 2) Eye-Path & Hierarchy (First → Second → Third)
- [ ] **First:** Section eyebrow + headline (e.g., “FAQ / Perguntas Frequentes”) with clear visual priority.
- [ ] **Second:** Top 3 high-friction questions surfaced at the top (price, time, guarantee/logistics).
- [ ] **Third:** Trust micro-row (badge/testimonial snippet/refund note) and a soft CTA anchor to register.

## 3) Content Strategy (Objection-Driven)
- [ ] Write each FAQ to **neutralize a specific objection** (time, value, logistics, risk, inclusivity).
- [ ] Order questions by **likelihood + friction** (highest first).
- [ ] Keep answers **concise** (2–5 lines) with optional “Saiba mais” link if depth is needed.
- [ ] Use **plain, empathetic language** (PT-PT), avoid jargon; mirror audience wording.
- [ ] If needed, group into **micro-categories** (Ex.: Logística, Pagamento, Conteúdo, Resultados).

## 4) Interaction Pattern
- [ ] Use a clean **accordion** (one level). Click area is the full question row.
- [ ] Provide a **visible affordance** (+/chevron) that rotates on open/close.
- [ ] Smooth, **subtle** open/close animation (200–250ms), no “circus” effects.
- [ ] Keep only **one question open** at a time to reduce cognitive load (optional).

## 5) Visual Composition
- [ ] One simple **column stack** on mobile; optional two-column on desktop **only** if scannability improves.
- [ ] Generous **white space** between items (≥ 24–32px) for a light, premium feel.
- [ ] Use **dividers** (hairline) or soft cards to separate Q&As—never heavy boxes.
- [ ] Maintain clear **left alignment** for fast scanning.

## 6) Typography
- [ ] Questions: use **heading style** (brand heading font)
- [ ] Answers: **body font** (brand), comfortable line height
- [ ] Contrast: WCAG-compliant; never rely on color alone to show state.
- [ ] Truncate long questions on mobile (2 lines) with ellipsis if needed.

## 7) Color & Accents
- [ ] Background: **neutral** (brand light/white). 
- [ ] Apply **accent color** to the section eyebrow, icons, and hover/focus states (match style guide).
- [ ] Use **subtle emphasis** (bold or accent) for key phrases in answers (e.g., “lugares limitados”).
- [ ] Keep error-prone red/orange minimal; prefer **trusted accent** for positivity/reassurance.

## 8) Iconography & Micro-visuals
- [ ] Use a **single, consistent icon style** (line or duotone) for chevrons/markers.
- [ ] Optional small **trust icons** (shield/lock/refund) inline with answers—subtle, not loud.
- [ ] Consider a **soft decorative element** (very low-contrast motif) in the section background.

## 9) Trust & Risk Removal
- [ ] Include answers for **refund/transfer policy**, **safety/security**, **payment methods**.
- [ ] Add a **micro-testimonial** or “Seen by ___ empreendedoras” line near the end.
- [ ] If seats are limited, state **scarcity** clearly (and truthfully).
- [ ] If relevant, add **location/logistics** clarity (bairro, acesso, transporte, duração).

## 10) CTA Integration (Two-Step Flow)
- [ ] Add an in-context **micro-CTA** after the last 1–2 answers: “**Reserve seu lugar**”.
- [ ] Clarify the **two-step**: 1) dados básicos → 2) pagamento seguro.
- [ ] Provide a **secondary inline link** inside a high-intent answer (“Como garantimos sua vaga?”).
- [ ] Ensure the **primary CTA button** is visible **immediately after** the FAQ block.

## 11) Motion & States
- [ ] Hover/focus states for question rows and icons (accessibility + feedback).
- [ ] **No parallax or flashy reveals**; keep transitions subtle and consistent.
- [ ] Persist **open state** when navigating back (optional nice-to-have).

## 12) Accessibility
- [ ] Accordion uses **semantic buttons** with `aria-expanded` and keyboard support.
- [ ] Focus ring is **visible** and on-brand.
- [ ] Copy is clear, at least **16px** base size; sufficient color contrast.
- [ ] Avoid conveying meaning by color alone; use icons/text labels.

## 13) Mobile-First Responsiveness
- [ ] Touch targets **≥ 44px** height; ample spacing between items.
- [ ] Performance budget respected; avoid heavy images/scripts.
- [ ] Long answers collapse gracefully; scrolling within the page is smooth.

## 14) Performance & Hygiene
- [ ] Defer non-critical scripts; **CSS first paint** prioritized.
- [ ] SVG icons inlined or sprite-based; minimal HTTP requests.
- [ ] No layout shift on accordion open/close (reserve space or animate height smoothly).

## 15) Measurement & Iteration
- [ ] Track **accordion opens** per question (which objections matter most).
- [ ] A/B test **question order**, **CTA placement**, and **micro-copy** in top 3 FAQs.
- [ ] Monitor drop-off from FAQ → CTA; iterate on final **handoff sentence** and button label.

---

## Ready-to-Ship Preflight
- [ ] All FAQs map to **real objections**; fluff removed.
- [ ] Visual priority: headline → top questions → trust cue → CTA is **obvious**.
- [ ] Copy localized to **PT-PT**, tone is warm, direct, and supportive.
- [ ] Accordion is accessible, responsive, and pleasantly **minimal**.
- [ ] Primary CTA after FAQ reiterates **two-step flow** clearly.