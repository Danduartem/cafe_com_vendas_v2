# YouTube API Documentation

This document covers the YouTube integration used in this project for displaying testimonial videos.

## Overview

The project uses YouTube's no-cookie embed domain (`youtube-nocookie.com`) for privacy-compliant video embedding with a click-to-load implementation to improve performance.

## Current Implementation

### Click-to-Load YouTube Videos

The project implements a custom click-to-load solution for YouTube testimonial videos to improve page performance and user privacy.

```javascript
// YouTube Click-to-Load Functionality in main.js
function initializeYouTubeEmbeds() {
    const youtubeEmbeds = document.querySelectorAll('.youtube-embed');
    
    youtubeEmbeds.forEach(embed => {
        const playButton = embed.querySelector('.youtube-play-btn');
        const videoId = embed.dataset.videoId;
        
        if (playButton && videoId) {
            playButton.addEventListener('click', function() {
                // Create iframe
                const iframe = document.createElement('iframe');
                iframe.className = 'absolute inset-0 w-full h-full';
                iframe.src = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&controls=1&disablekb=1&fs=1&iv_load_policy=3&playsinline=1`;
                iframe.frameBorder = '0';
                iframe.allow = 'accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; autoplay';
                iframe.allowFullscreen = true;
                iframe.title = `Testemunho - Café com Vendas`;
                
                // Replace thumbnail with iframe
                embed.innerHTML = '';
                embed.appendChild(iframe);
                
                // Analytics tracking
                console.log(`Analytics: youtube_video_play_${videoId}`);
            }, { passive: true });
        }
    });
}
```

### HTML Structure for YouTube Embeds

```html
<!-- Example YouTube embed structure -->
<div class="youtube-embed relative" data-video-id="VIDEO_ID_HERE">
  <!-- Video thumbnail -->
  <img src="https://img.youtube.com/vi/VIDEO_ID_HERE/maxresdefault.jpg" 
       alt="Video thumbnail" 
       class="w-full h-auto rounded-lg">
  
  <!-- Play button overlay -->
  <button class="youtube-play-btn absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/50 transition-colors rounded-lg"
          aria-label="Play video">
    <svg class="w-16 h-16 text-white" viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7z"/>
    </svg>
  </button>
</div>
```

## YouTube API Features Used

### No-Cookie Domain
```
https://www.youtube-nocookie.com/embed/
```

Benefits:
- Improved privacy compliance
- No tracking cookies set by YouTube
- GDPR-friendly implementation
- Same functionality as regular YouTube embeds

### URL Parameters Used

```
?autoplay=1&rel=0&modestbranding=1&controls=1&disablekb=1&fs=1&iv_load_policy=3&playsinline=1
```

Parameter breakdown:
- `autoplay=1`: Start playing automatically when loaded
- `rel=0`: Don't show related videos at the end
- `modestbranding=1`: Remove YouTube branding where possible
- `controls=1`: Show player controls
- `disablekb=1`: Disable keyboard shortcuts
- `fs=1`: Enable fullscreen button
- `iv_load_policy=3`: Don't load annotations
- `playsinline=1`: Play inline on mobile devices

## Thumbnail Generation

### YouTube Thumbnail URLs
YouTube automatically generates thumbnails that can be accessed via URL:

```javascript
// Different thumbnail sizes available:
`https://img.youtube.com/vi/${videoId}/default.jpg`     // 120x90
`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`   // 320x180
`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`   // 480x360
`https://img.youtube.com/vi/${videoId}/sddefault.jpg`   // 640x480
`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` // 1280x720
```

### Responsive Thumbnails
```html
<img src="https://img.youtube.com/vi/${videoId}/maxresdefault.jpg" 
     srcset="https://img.youtube.com/vi/${videoId}/mqdefault.jpg 320w,
             https://img.youtube.com/vi/${videoId}/hqdefault.jpg 480w,
             https://img.youtube.com/vi/${videoId}/maxresdefault.jpg 1280w"
     sizes="(max-width: 768px) 320px, 480px"
     alt="Video thumbnail"
     loading="lazy">
```

## Analytics and Tracking

### Video Play Tracking
```javascript
// Track when videos are played
console.log(`Analytics: youtube_video_play_${videoId}`);

// Enhanced analytics with Google Analytics
if (typeof gtag !== 'undefined') {
  gtag('event', 'video_play', {
    'event_category': 'Testimonials',
    'event_label': `YouTube Video ${videoId}`,
    'value': 1
  });
}
```

### Performance Metrics
```javascript
// Track loading performance
const loadStart = performance.now();

// After iframe is created and loaded
iframe.onload = function() {
  const loadTime = performance.now() - loadStart;
  
  if (typeof gtag !== 'undefined') {
    gtag('event', 'video_load_time', {
      'event_category': 'Performance',
      'event_label': 'YouTube Embed',
      'value': Math.round(loadTime)
    });
  }
};
```

## Performance Optimization

### Lazy Loading Benefits
The click-to-load implementation provides several performance benefits:

1. **Faster initial page load** - No iframe requests on page load
2. **Reduced bandwidth** - Only load videos when requested
3. **Better Core Web Vitals** - Improves LCP and CLS scores
4. **Mobile-friendly** - Saves data on mobile connections

### Intersection Observer for Thumbnails
```javascript
// Enhanced implementation with intersection observer for thumbnails
const imageObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      const videoId = img.closest('.youtube-embed').dataset.videoId;
      
      // Load high-quality thumbnail when in view
      img.src = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
      imageObserver.unobserve(img);
    }
  });
});

// Observe all YouTube thumbnail images
document.querySelectorAll('.youtube-embed img').forEach(img => {
  imageObserver.observe(img);
});
```

## Accessibility Considerations

### Keyboard Navigation
```javascript
// Enhanced keyboard support for play button
playButton.addEventListener('keydown', function(e) {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    this.click();
  }
});
```

### Screen Reader Support
```html
<div class="youtube-embed" 
     data-video-id="VIDEO_ID"
     role="button"
     tabindex="0"
     aria-label="Play testimonial video from [Customer Name]">
  
  <img src="thumbnail.jpg" 
       alt="Testimonial video thumbnail showing [Customer Name]">
  
  <button class="youtube-play-btn" 
          aria-label="Play video testimonial"
          aria-describedby="video-description">
    <!-- Play icon -->
  </button>
  
  <div id="video-description" class="sr-only">
    Video testimonial from [Customer Name] about their experience with Café com Vendas
  </div>
</div>
```

## Error Handling

### Video Load Failures
```javascript
iframe.onerror = function() {
  console.error('Failed to load YouTube video:', videoId);
  
  // Show error message to user
  const errorMessage = document.createElement('div');
  errorMessage.className = 'error-message p-4 bg-red-100 text-red-700 rounded-lg';
  errorMessage.textContent = 'Erro ao carregar vídeo. Tente novamente mais tarde.';
  
  embed.innerHTML = '';
  embed.appendChild(errorMessage);
  
  // Track error
  if (typeof gtag !== 'undefined') {
    gtag('event', 'video_error', {
      'event_category': 'Error',
      'event_label': `YouTube Video ${videoId}`,
      'value': 1
    });
  }
};
```

### Network Issues
```javascript
// Detect if user is offline
if (!navigator.onLine) {
  // Show offline message instead of loading video
  const offlineMessage = document.createElement('div');
  offlineMessage.textContent = 'Vídeo disponível quando reconectado à internet.';
  embed.appendChild(offlineMessage);
}
```

## Content Security Policy

### Required CSP Directives
```html
<meta http-equiv="Content-Security-Policy" 
      content="
        frame-src 'self' https://www.youtube-nocookie.com;
        img-src 'self' https://img.youtube.com;
        script-src 'self' 'unsafe-inline';
      ">
```

## Video Content Management

### Video ID Management
Store video IDs in data files for easy management:

```json
// _data/testimonials.json
{
  "videos": [
    {
      "id": "dQw4w9WgXcQ",
      "title": "Ana Castro - Terapeuta",
      "description": "Como aumentei minhas vendas em 30%",
      "thumbnail": "custom-thumbnail.jpg" // Optional custom thumbnail
    },
    {
      "id": "xyz123abc",
      "title": "Mariana Lopes - Consultora", 
      "description": "Minha experiência no Café com Vendas"
    }
  ]
}
```

### Template Integration
```njk
<!-- In social-proof.njk -->
{% for video in testimonials.videos %}
<div class="youtube-embed" data-video-id="{{ video.id }}">
  <img src="https://img.youtube.com/vi/{{ video.id }}/maxresdefault.jpg" 
       alt="{{ video.title }} - {{ video.description }}"
       loading="lazy">
  
  <button class="youtube-play-btn" 
          aria-label="Play testimonial: {{ video.title }}">
    <!-- Play button content -->
  </button>
</div>
{% endfor %}
```

## Best Practices

### Performance
1. **Use click-to-load** to avoid loading videos unnecessarily
2. **Lazy load thumbnails** when they come into view
3. **Optimize thumbnail sizes** for different screen sizes
4. **Use youtube-nocookie.com** for privacy and performance

### User Experience
1. **Clear play button indicators** so users know videos are clickable
2. **Provide loading states** when videos are loading
3. **Handle errors gracefully** with user-friendly messages
4. **Support keyboard navigation** for accessibility

### Analytics
1. **Track video engagement** to measure testimonial effectiveness
2. **Monitor load times** to ensure good performance
3. **Track error rates** to identify problematic videos
4. **Measure conversion impact** of video testimonials

## Troubleshooting

### Common Issues
1. **Video won't play**: Check video ID and privacy settings
2. **Thumbnails not loading**: Verify video is public and thumbnail exists
3. **Analytics not tracking**: Ensure gtag is loaded before video interactions
4. **CSP violations**: Add required domains to Content Security Policy

### Testing Checklist
- [ ] Videos load and play correctly
- [ ] Thumbnails display properly on all devices
- [ ] Play buttons are keyboard accessible
- [ ] Analytics events fire correctly
- [ ] Error handling works for invalid video IDs
- [ ] Performance is acceptable on slow connections