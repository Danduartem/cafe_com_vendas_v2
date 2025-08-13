---
file: GUIDE_brand_visual.md
version: 2025-08-13
purpose: Visual brand guidelines focusing on color-driven art direction
dependencies: DATA_design_tokens.json
original_name: BRAND_CREATIVE_BRIEF.md
---

# Creative Brief — Beauty First (Color-Driven Art Direction)

This brief guides the creation of elegant, high-converting pages grounded in your brand palette. Typography and audience details live in separate docs; use them together with this brief.

## Creative North Star
- Tone: calm, editorial, premium, strategic, feminine strength.
- Emotions: trust (navy), transformation (burgundy), ease/clarity (neutral), warmth (peach/gold).
- Space: generous white/neutral space; avoid visual noise.

## Color Direction (Anchors and Accents)
Anchors (non-negotiable presence):
- Navy Deep #191F3A (palette: --color-navy-800) — structural, headers, large silhouettes.
- Burgundy #81171F (palette: --color-burgundy-700) — CTAs, accents, key highlights.
- Neutral #ECECEC (palette: --color-neutral-200) — backgrounds, dividers.

Primary accents (use sparingly):
- Gold Warm #C89A3A (palette: --color-gold-500) — premium highlights, micro-ornaments.
- Peach Soft #F1C6B4 (palette: --color-peach-300) — human warmth, testimonials/cards.
- Optional: Mint #BEEAD2, Light Blue #D7ECF9 — light, airy emphasis in small doses.

Suggested proportions per page:
- Navy 30–55% • Neutral 20–45% • Burgundy 8–20% • Each accent 0–10%

## Functional Tokens (use purpose-first)
Prefer these semantic tokens over raw hex for easy theming:
- Text: --color-text-primary (navy-800), --color-text-secondary (navy-600), --color-text-subtle (neutral-500)
- Surfaces: --color-surface-main (white), --color-surface-subtle (neutral-100), --color-surface-accent (peach-100)
- Borders: --color-border-subtle (neutral-300)
- CTA: --color-cta-primary-background (burgundy-700), --color-cta-primary-hover (burgundy-800)

Guideline: expose palette/semantic tokens in your CSS theme layer so they are available as utilities without prescribing component structures. Keep tokens abstract; map them to components at design time.

## Page-Level Color Patterns (principles, not recipes)
- Hero: use either a long burgundy→navy gradient or a translucent overlay over photography; ensure type contrast without flattening the image.
- Rhythm: alternate light (neutral surfaces) and dark (navy) sections to create pacing and hierarchy.
- Warmth: reserve peach surfaces for human-centric blocks (stories, testimonials) to avoid washing the entire page in warmth.
- Borders: use subtle neutrals on light; use dark alphas on dark backgrounds for refinement.
- Accents: use gold for micro-details only; avoid large gold fills.

## Gradients & Overlays
- Primary gradient: 140° burgundy → navy (long, slow blend).
- Over photography: mix navy (for depth) with a hint of burgundy (for energy); keep legibility compliant.
- Keep gradients two-color; introduce transparency instead of extra hues for sophistication.

## Do / Don’t (Color)
- Do: Keep burgundy for emphasis (CTAs, key chips), not for long text blocks.
- Do: Ensure WCAG AA contrast for all text (large ≥ 3.0, normal ≥ 4.5).
- Do: Use accents (peach/gold) in small, meaningful places.
- Don’t: Place saturated navy and burgundy side by side in large areas.
- Don’t: Use neon or overly luminous variants; preserve tonal harmony.

## Prompts (Upgraded)
### Explore (3 variants)
Crie 3 heros elegantes com Navy #191F3A e Burgundy #81171F como âncoras, Neutral #ECECEC como base. Permita até 2 acentos (Peach #F1C6B4, Gold #C89A3A). Use gradiente 140° (Borgonha→Navy) ou overlay translúcido para tipografia legível. Entregue mapa de cores por camada (bg, overlay, texto, CTA) e tokens usados.

### Elegant
Componha uma página com 60% Navy, 25% Neutral, 15% Burgundy, toques de Gold. Seções alternadas claro/escuro; CTA primário em Borgonha-700. Inclua variação hover/focus e estados desabilitado com contraste válido.

### Experimental (com freios)
Mantenha Navy e Burgundy perceptíveis. Adicione até 2 acentos experimentais discretos. Preserve contraste e proporções; evite ruído. Explique a intenção emocional de cada acento.

## Deliverables (por variação)
- Mapa de camadas: fundo, overlay, texto (primário/secundário), CTA (bg/hover/texto), bordas.
- Lista de tokens usados (funcionais + palette) e como se conectam a Tailwind/utilitários.
- Gradiente/overlay especificados (ângulo, cores, opacidades).
- Mockups de: Hero, bloco de benefícios, depoimentos, CTA final.
- Comprovante de contraste (AA).

## Review Checklist
- Hierarquia clara via cor (olho flui hero → benefícios → prova → CTA).
- Proporções respeitadas; acentos com parcimônia.
- Legibilidade impecável em todos os blocos (incluindo sobre imagens).
- CTAs destacam sem agredir; estados hover/focus acessíveis.
- Paleta consistente com o documento de cor (anchors intactas).

## Reference (Palette Names)
Use as variáveis do arquivo de paleta info/color_pallet.json:
- --color-navy-50..900, --color-burgundy-50..900, --color-neutral-50..900
- --color-gold-50..900, --color-peach-50..900
- Funcionais: --color-text-*, --color-surface-*, --color-cta-*
