# /dev

Start development server with live reload.

## Usage
```
/dev                    # Start dev server
/dev --open            # Open browser automatically
/dev --port 3000       # Custom port
```

## What it does
1. Builds CSS tokens if needed
2. Starts Eleventy dev server
3. Watches for file changes
4. Live reloads browser
5. Shows local and network URLs

## Features
- Hot reload for all changes
- Tailwind CSS compilation
- Eleventy data cascade
- Browser sync
- Mobile preview via network URL

## URLs
- Local: http://localhost:8080
- Network: http://192.168.x.x:8080
- Netlify Functions: http://localhost:8888

## Keyboard Shortcuts
- `Ctrl+C`: Stop server
- `r`: Restart server
- `o`: Open in browser