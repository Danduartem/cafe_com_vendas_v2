Layout & composition
	•	Grid: 12-col, max container 1200–1280px, 24–32px gutters.
	•	Split: image 55% / content 45% (desktop). On mobile: stack image → text.
	•	Safe areas: 96–128px top/bottom padding (desktop), 56–72px (mobile).
	•	Eye path: one dominant visual (left or right) → text block → small proof row. Never two competing focal points.
	•	Alignment: left-align text to the image’s inner edge; let the image breathe with asymmetric margin on the outer edge.

Background & surfaces
	•	Canvas: warm or cool neutral (2–4% chroma).
	•	Optional gradient: ultra-subtle radial from corners (opacity 6–10%) or vertical 0→3% shift.
	•	Cards: avoid unless needed; if used, 1px hairline border (black/10–12%) + very soft shadow.

Spacing system (8pt rhythm)
	•	Section padding: 12–16 units.
	•	Element groups: 3–4 units.
	•	Between list items: 2–3 units.
	•	Keep consistent negative space “columns” around the image (never butt edges).

Typography (visual rules only)
	•	Scale: H2 40–56px; sub 18–22px; body 16–18px.
	•	Line lengths: 45–70 chars; never full-width.
	•	Weights: 600 for H2, 400–500 for body.
	•	Tracking: tight for H2 (-1% to -2%), normal elsewhere.
	•	Baseline: 8pt baseline grid; line-height 140–160% for paragraphs.

Color usage
	•	Palette: neutral canvas + 1 brand accent.
	•	Contrast: text on surface ≥ 7:1 for body, ≥ 4.5:1 for small UI.
	•	Accents: reserve the brand color for links/micro-CTA underline or step numbers; never paint large blocks with it.
	•	Logos/proof: grayscale or single-tone to avoid noise.

Imagery (the star of the section)
	•	Content: one photo that tells the promise visually (calm, focus, achievement). No collages.
	•	Crop: 5:4 or 4:3 on desktop; 16:9 works if it’s a “scene.” Keep eyes/horizon on a rule-of-thirds line.
	•	Treatment: gentle lift—radius 16–24px; shadow 0 12px 32px hsl(0 0% 0% / 0.12), spread -6.
	•	Grading: consistent warmth/coolth across the site; mild grain (1–2%) okay; avoid heavy filters.
	•	Overlays: only if text overlays image; then add a 8–12% linear gradient behind text area.

Lists & iconography (if used)
	•	Bullets: simple dot or minimalist check; 16–20px, stroke 1.5–2px.
	•	Alignment: icon top-aligned with first text line; 8–12px gap.
	•	Dividers: hairline 1px with 8–12% opacity; prefer spacing over lines.

Proof row (visual treatment)
	•	Option A: single testimonial “chip” with avatar 40px, name, tiny dash.
	•	Option B: logo strip (4–6 marks), all monochrome at equal height (20–24px).
	•	Placement: below text block, before micro-CTA. Keep low contrast to avoid stealing focus.

Motion (one tasteful effect)
	•	Entrance: fade + 8–16px translate-up, 180–240ms, ease-out.
	•	Stagger text children by 40–60ms.
	•	No parallax, no bouncing. Motion should reduce friction, not perform.

Responsive rules
	•	Breakpoints:
	•	≥1024px: 55/45 split.
	•	640–1023px: 50/50 or stack if copy is long.
	•	<640px: stack; image first; maintain 24px side padding.
	•	Touch targets: min 40px height; focus ring visible (outline offset 2–3px).

Shape & details
	•	Corner radius scale: 8 / 12 / 16 / 24 — pick two and stick to them (image > card).
	•	Shadows: 2 levels max across the whole page.
	•	Borders: use when you need separation on light backgrounds; 1px, low contrast.
	•	Noise: avoid decorative blobs/lines unless they guide the eye.

Ready-to-reuse visual tokens (example)
:root{
  --container: 1200px;
  --space-1: 8px; --space-2: 16px; --space-3: 24px; --space-4: 32px;
  --radius-sm: 12px; --radius-lg: 20px;
  --surface: hsl(28 40% 98%);
  --ink-1: hsl(20 20% 12%); --ink-2: hsl(20 10% 40%);
  --hairline: hsl(0 0% 0% / 0.12);
  --shadow-1: 0 8px 24px hsl(0 0% 0% / .10);
  --shadow-2: 0 12px 32px hsl(0 0% 0% / .12);
}

Quick visual checklist (ship when all true)
	•	One dominant image, zero competing focal points.
	•	Clean 55/45 split with generous breathing room.
	•	Neutral canvas; one accent only.
	•	Hairline dividers + soft shadow; no heavy borders.
	•	Typographic rhythm consistent; comfortable line lengths.
	•	Proof visuals subdued; image and heading remain the heroes.
	•	A single, subtle entrance animation.