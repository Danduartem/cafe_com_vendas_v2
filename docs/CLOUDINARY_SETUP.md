# Cloudinary Integration Setup Guide

## Overview

This project is now fully integrated with Cloudinary for optimized image delivery and performance. All images are automatically served in modern formats (WebP/AVIF) with responsive sizing and smart compression.

## Features Implemented

### ✅ Hero Background Optimization
- Responsive background images for mobile (640px), tablet (1024px), and desktop (1920px)
- Automatic format optimization (WebP/AVIF with JPG fallback)
- Smart quality compression with fallback to local image

### ✅ Content Image Optimization  
- Responsive `<picture>` elements with `srcset` for different screen sizes
- Retina display support (1x and 2x density)
- Lazy loading and proper accessibility attributes

### ✅ YouTube Thumbnail Optimization
- All YouTube thumbnails proxied through Cloudinary
- Resized from 1280x720 to 384x216 (actual display size)
- Optimized compression and format conversion

### ✅ JavaScript Integration
- Dynamic URL replacement based on environment configuration  
- Automatic image preloading for critical resources
- Graceful fallback when Cloudinary is not configured

## Setup Instructions

### 1. Create Cloudinary Account
1. Go to [https://cloudinary.com](https://cloudinary.com)
2. Sign up for a free account (25GB bandwidth + 25GB storage monthly)
3. Note your **Cloud Name** from the dashboard

### 2. Upload Project Images
Upload these images to your Cloudinary media library with these exact public IDs:

- `cafe-hero` ← Upload: `src/assets/pictures/cafe.jpg`
- `problem-overworked` ← Upload: `src/assets/pictures/problem-overworked.jpg`

**Upload Steps:**
1. Go to Media Library in Cloudinary dashboard
2. Click "Upload" → "Image"
3. Upload `cafe.jpg` and set Public ID to `cafe-hero`
4. Upload `problem-overworked.jpg` and set Public ID to `problem-overworked`

### 3. Configure Environment Variables

Add to your `.env.local` file:
```bash
CLOUDINARY_CLOUD_NAME=your-actual-cloud-name
```

Add to Netlify environment variables:
```bash
CLOUDINARY_CLOUD_NAME=your-actual-cloud-name
```

### 4. Verification

After setup, the project will automatically:
- ✅ Serve optimized images from Cloudinary CDN
- ✅ Use responsive sizing based on device
- ✅ Apply automatic format optimization
- ✅ Fall back to local images if Cloudinary fails

## Performance Benefits

### Expected Improvements:
- **Image Size Reduction**: 60-70% smaller file sizes
- **Loading Speed**: 40-60% faster image loading
- **Mobile Experience**: Dramatically improved on 3G/4G
- **Lighthouse Score**: +15-20 points improvement
- **Core Web Vitals**: Better LCP and CLS scores

### Browser Support:
- **WebP**: Chrome, Firefox, Edge, Safari 14+
- **AVIF**: Chrome 85+, Firefox 93+
- **Fallback**: JPG for older browsers

## File Changes Made

### Modified Files:
- `src/_includes/components/hero.njk` - Responsive background
- `src/_includes/components/problem.njk` - Picture element with srcset
- `src/_data/testimonials.js` - Cloudinary YouTube thumbnails
- `src/assets/css/main.css` - Responsive background CSS
- `src/_includes/layout.njk` - Preconnect and global config
- `src/_data/site.js` - Environment variable support
- `CLAUDE.md` - Updated environment variables section

### New Files:
- `src/assets/js/utils/cloudinary.js` - Helper functions
- `src/platform/ui/components/cloudinary.js` - Dynamic URL management
- `docs/CLOUDINARY_SETUP.md` - This setup guide

## Testing

### Local Testing:
1. Set `CLOUDINARY_CLOUD_NAME` in `.env.local`
2. Run `npm run dev`
3. Check browser console - should see no "cloud name not configured" warnings
4. Inspect Network tab - images should load from `res.cloudinary.com`

### Production Testing:
1. Deploy to Netlify with environment variable configured
2. Test on multiple devices/screen sizes
3. Verify WebP format is served to supported browsers
4. Check Core Web Vitals with Lighthouse

## Advanced Configuration

### Custom Transformations:
Edit `src/assets/js/utils/cloudinary.js` to modify:
- Image quality settings
- Crop modes and gravity
- Special effects
- Responsive breakpoints

### Adding New Images:
1. Upload to Cloudinary with meaningful public ID
2. Use helper functions in `cloudinary.js`
3. Or directly use Cloudinary URLs with transformations

### Performance Monitoring:
- Monitor bandwidth usage in Cloudinary dashboard
- Track Core Web Vitals improvements
- Test on various connection speeds

## Troubleshooting

### Images Not Loading:
1. Check `CLOUDINARY_CLOUD_NAME` is correctly set
2. Verify image public IDs match exactly
3. Check browser console for errors
4. Confirm images exist in Cloudinary media library

### Fallback Behavior:
- If Cloudinary fails, local images will load automatically
- Check console for "cloud name not configured" warnings
- Verify local image files exist in `src/assets/pictures/`

### Performance Issues:
- Use Cloudinary analytics to monitor usage
- Check if auto-quality is too aggressive
- Verify images are being cached properly
- Consider adding more preload hints for critical images

## Next Steps

### Additional Optimizations:
- [ ] Add blur-up placeholders for smoother loading
- [ ] Implement progressive JPEG for slower connections  
- [ ] Add art direction for different aspect ratios
- [ ] Set up automatic image optimization on upload

### Monitoring:
- [ ] Set up Cloudinary usage alerts
- [ ] Monitor Core Web Vitals improvements
- [ ] Track conversion rate impact
- [ ] Analyze mobile performance gains

## Resources

- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Responsive Images Guide](https://web.dev/responsive-images/)
- [Core Web Vitals](https://web.dev/vitals/)
- [Picture Element Guide](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/picture)