# Cloudinary Setup — Café com Vendas

> **Responsive images with automatic formats** (WebP/AVIF + fallbacks), smart compression, and CDN delivery.

---

## Setup

### 1) Environment
```bash
# .env.local (and Netlify env)
CLOUDINARY_CLOUD_NAME=your-cloud-name
```

### 2) Upload Assets
Upload to Cloudinary Media Library with these public IDs:
* `cafe-hero` ← your hero image
* `problem-overworked` ← section images
* Keep IDs lowercase, no spaces

---

## Helper Utility

**`src/assets/js/utils/cloudinary.ts`**
```ts
interface ClOptions {
  width?: number;
  height?: number;
  crop?: 'fill' | 'fit' | 'scale';
  quality?: 'auto' | number;
  format?: 'auto' | 'webp' | 'avif';
}

const cloudName = process.env.CLOUDINARY_CLOUD_NAME || '';

export function clImage(id: string, opts: ClOptions = {}): string {
  const { width, height, crop = 'fill', quality = 'auto', format = 'auto' } = opts;
  
  const parts = [
    `f_${format}`,
    `q_${quality}`,
    width ? `w_${width}` : null,
    height ? `h_${height}` : null,
    `c_${crop}`,
    'g_auto'
  ].filter(Boolean).join(',');
  
  return `https://res.cloudinary.com/${cloudName}/image/upload/${parts}/${id}`;
}

export function clThumb(id: string): string {
  return clImage(id, { width: 384, height: 216, crop: 'fill' });
}
```

---

## Usage Patterns

### Responsive Images
```html
<picture>
  <source srcset="{{clImage('cafe-hero', {width: 960})}} 960w,
                  {{clImage('cafe-hero', {width: 1280})}} 1280w"
          sizes="(min-width: 1024px) 50vw, 100vw">
  <img src="{{clImage('cafe-hero', {width: 800})}}"
       alt="Café com Vendas hero"
       loading="lazy" width="800" height="533">
</picture>
```

### Video Thumbnails
```html
<img src="{{clThumb('youtube/video-id')}}"
     alt="Video title"
     loading="lazy" width="384" height="216">
```

---

## Performance

* **Lazy load** non-critical images: `loading="lazy" decoding="async"`
* **Dimensions** prevent layout shift: `width="800" height="533"`
* **Preconnect** (optional): `<link rel="preconnect" href="https://res.cloudinary.com">`

## Testing

1. Set `CLOUDINARY_CLOUD_NAME` in `.env.local`
2. `npm run dev` → verify images load from `res.cloudinary.com`
3. Check Network tab for WebP/AVIF formats