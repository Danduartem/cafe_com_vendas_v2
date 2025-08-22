# Cloudinary Integration Setup — Café com Vendas

> Minimal, production‑focused guidance for **responsive, optimized images** using Cloudinary. This doc reflects the repo rules: **TypeScript‑only**, **Tailwind‑only**, **ESM imports use `.js` extensions** in TS.

---

## Why Cloudinary here

* **Automatic formats**: WebP/AVIF with JPEG fallback (`f_auto`).
* **Smart compression**: `q_auto` tuned by Cloudinary.
* **Responsive delivery**: device‑appropriate sizes via `srcset`/`sizes`.
* **CDN**: low latency, cache‑friendly URLs.
* **Zero secrets in client**: **read‑only** delivery; no client uploads.

---

## What’s included (repo patterns)

* **Hero & section images** rendered with `<picture>` + `srcset`.
* **YouTube thumbnails** proxied via Cloudinary for consistent sizing/compression.
* **TS helpers** to build URLs with safe defaults (no inline styles).

---

## 1) Setup

### A) Create/locate account

1. Visit cloudinary.com and create/sign in.
2. Copy your **Cloud Name** from the dashboard.

### B) Configure environment variables

Create/update `.env.local` (and Netlify env) with:

```bash
CLOUDINARY_CLOUD_NAME=your-cloud-name
```

> We don’t expose API keys in the client; we only use public READ URLs.

### C) Upload required assets (public IDs)

Upload to **Media Library** with these **public IDs** (rename during upload if needed):

* `cafe-hero` ← `src/assets/images/cafe.jpg`
* `problem-overworked` ← `src/assets/images/problem-overworked.jpg`

> Keep public IDs short, lowercase, and stable; avoid spaces/accents.

---

## 2) Helper utilities (TypeScript)

Create/ensure the following files exist (or update to match). **Keep imports with `.js` extensions** per our ESM TS rule.

**`src/assets/js/utils/cloudinary.ts`**

```ts
// Build read‑only delivery URLs with safe defaults
// Note: imports in TS should use `.js` extensions in this repo; this file has none.

interface ClOptions {
  width?: number;
  height?: number;
  crop?: 'fill' | 'fit' | 'scale' | 'thumb';
  gravity?: 'auto' | 'center' | string;
  quality?: 'auto' | number;
  format?: 'auto' | 'webp' | 'avif' | 'jpg';
}

const ENV = {
  cloudName: (globalThis as any)?.ENV?.cloudinary?.cloudName ||
             (typeof process !== 'undefined' ? process.env.CLOUDINARY_CLOUD_NAME : ''),
};

const seg = (s?: string) => (s ? `/${s}` : '');

export function clImage(id: string, opts: ClOptions = {}): string {
  const {
    width,
    height,
    crop = 'fill',
    gravity = 'auto',
    quality = 'auto',
    format = 'auto',
  } = opts;

  const dims = [width ? `w_${width}` : null, height ? `h_${height}` : null]
    .filter(Boolean)
    .join(',');

  const parts = [
    'f_' + (format === 'auto' ? 'auto' : format),
    'q_' + (typeof quality === 'number' ? quality : 'auto'),
    dims || null,
    `c_${crop}`,
    gravity ? `g_${gravity}` : null,
  ].filter(Boolean);

  const transform = parts.join(',');
  return `https://res.cloudinary.com/${ENV.cloudName}/image/upload/${transform}${seg(id)}`;
}

export function clThumb(id: string): string {
  // Opinionated thumbnail helper (384×216 ~ 16:9), good for video thumbs
  return clImage(id, { width: 384, height: 216, crop: 'fill', gravity: 'auto' });
}
```

**Optional global typing** (if you expose ENV at runtime): `src/assets/js/types/config.ts`

```ts
export interface CloudinaryEnv {
  cloudinary: { cloudName: string };
}
```

---

## 3) Markup patterns

### A) Content images (`<picture>` + `srcset`)

Use responsive images for content sections (no inline styles):

```njk
<picture>
  <source
    srcset="{{ clImage('problem-overworked', { width: 960 }) }} 960w,
            {{ clImage('problem-overworked', { width: 1280 }) }} 1280w,
            {{ clImage('problem-overworked', { width: 1600 }) }} 1600w"
    sizes="(min-width: 1024px) 50vw, 100vw">
  <img
    src="{{ clImage('problem-overworked', { width: 800, crop: 'fit' }) }}"
    alt="Empresária exausta olhando para o portátil"
    loading="lazy" decoding="async" width="800" height="533"
    class="rounded-2xl shadow-sm" />
</picture>
```

### B) YouTube thumbnails via Cloudinary

Normalizes dimensions and compression for consistent layout:

```njk
<img
  src="{{ clThumb('youtube/my-video-thumb') }}"
  alt="Depoimento — João (2024)"
  loading="lazy" decoding="async" width="384" height="216"
  class="rounded-lg" />
```

> Replace `'youtube/my-video-thumb'` with your uploaded public ID.

---

## 4) File changes (aligned to TS‑only)

**Modified**

* `src/_includes/components/hero.njk` — responsive background/hero media
* `src/_includes/components/problem.njk` — `<picture>` with `srcset`
* `src/_data/testimonials.ts` — Cloudinary YouTube thumbnails
* `src/assets/css/main.css` — classes for hero media container
* `src/_includes/layout.njk` — preconnects/`dns-prefetch` as needed
* `CLAUDE.md` — note Cloudinary env var in Start‑Here

**New**

* `src/assets/js/utils/cloudinary.ts` — URL helpers (above)
* `src/platform/ui/components/cloudinary.ts` — (optional) media preloader utilities
* `docs/CLOUDINARY_SETUP.md` — this guide

---

## 5) Performance & a11y basics

* **LCP**: ensure hero media has proper intrinsic dimensions to prevent CLS.
* **Lazy‑load** non‑critical images (`loading="lazy"`, `decoding="async"`).
* **Alt text**: meaningful for content images; empty for decorative (`alt=""`).
* **Preconnect** (optional):

  ```html
  <link rel="preconnect" href="https://res.cloudinary.com" crossorigin>
  ```

---

## 6) Local & production verification

### Local

1. Set `CLOUDINARY_CLOUD_NAME` in `.env.local`.
2. `npm run dev` and open the page with Cloudinary images.
3. **Network tab** → confirm images load from `https://res.cloudinary.com/<cloud_name>/…`.

### Production (Netlify)

1. Add `CLOUDINARY_CLOUD_NAME` env var in site settings.
2. Deploy → test multiple devices.
3. Verify formats (WebP/AVIF) in DevTools → **Headers** → Content‑Type.

---

## 7) Advanced knobs (optional)

* **Quality**: pass `quality: 60` (or leave `auto`).
* **Crop/Gravity**: `crop: 'fill'`, `gravity: 'auto'` are sensible defaults for people/subjects.
* **Format**: usually `auto`; can force `'webp'` or `'avif'` for experiments.
* **Breakpoints**: tune the width list in `srcset` per section layout.

---

## 8) Troubleshooting

* **Broken images** → confirm public ID spelling and cloud name.
* **No AVIF/WebP** → browser may not support; `f_auto` will fall back.
* **Layout shift** → add `width`/`height` attributes; ensure container has stable dimensions.
* **Slow first paint** → reduce initial hero size; avoid unnecessary large `srcset` candidates.

---

## 9) Notes & guardrails

* Keep this integration **read‑only** on the client; no upload widgets or secrets.
* Respect repo rules: **TS‑only**, **Tailwind‑only**, ESM imports with `.js` extensions in TS code.
* Prefer `<picture>` over background images for critical content; when using background images, ensure the container reserves space via utility classes (no inline styles).

---

*Last updated: 2025‑08‑22*
