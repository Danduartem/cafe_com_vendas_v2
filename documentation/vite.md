# Vite Configuration Guide

This document provides a comprehensive guide to Vite configuration and usage for the Café com Vendas project.

## Overview

Vite is a next-generation frontend build tool that provides:
- **Instant Server Start**: Lightning-fast development server
- **Lightning-fast HMR**: Hot Module Replacement for instant updates
- **Optimized Builds**: Production builds with Rollup bundling
- **Rich Out-of-the-box Features**: TypeScript, JSX, CSS support

## Current Project Configuration

Our project uses Vite to bundle JavaScript modules from a modular ES6 architecture into a single optimized file.

### `vite.config.js`

```javascript
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    outDir: '_site/assets/js',
    emptyOutDir: true,
    lib: {
      entry: resolve(__dirname, 'src/assets/js/main.js'),
      name: 'CafeComVendas',
      fileName: 'main',
      formats: ['iife'] // Self-executing function for browser compatibility
    },
    rollupOptions: {
      output: {
        // Ensure consistent file naming
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]'
      }
    },
    // Enable source maps for development
    sourcemap: process.env.NODE_ENV === 'development',
    // Minify in production
    minify: process.env.NODE_ENV === 'production'
  }
});
```

## Build Configuration Options

### Core Build Options

#### `build.lib`
Configures Vite to build as a library rather than an application:

```javascript
build: {
  lib: {
    entry: 'src/assets/js/main.js',     // Entry point
    name: 'CafeComVendas',              // Global variable name
    fileName: 'main',                   // Output filename
    formats: ['iife']                   // Output format
  }
}
```

**Available formats:**
- `es` - ES modules
- `cjs` - CommonJS
- `umd` - Universal Module Definition
- `iife` - Immediately Invoked Function Expression (our choice)

#### `build.rollupOptions`
Direct access to Rollup configuration for advanced customization:

```javascript
build: {
  rollupOptions: {
    // Configure external dependencies
    external: ['vue', 'react'],
    
    // Configure output options
    output: {
      entryFileNames: '[name].js',
      chunkFileNames: '[name].js',
      assetFileNames: '[name].[ext]',
      
      // Manual chunking for optimization
      manualChunks(id) {
        if (id.includes('node_modules')) {
          return 'vendor';
        }
      },
      
      // Global variables for UMD builds
      globals: {
        vue: 'Vue'
      }
    }
  }
}
```

#### `build.sourcemap`
Controls source map generation:

```javascript
build: {
  sourcemap: true,           // Separate .map files
  sourcemap: 'inline',       // Inline as data URI
  sourcemap: 'hidden'        // Generate but suppress comments
}
```

#### `build.minify`
Configure minification:

```javascript
build: {
  minify: 'esbuild',    // Fast (default)
  minify: 'terser',     // Better compression
  minify: false         // Disable minification
}
```

#### `build.target`
Set browser compatibility target:

```javascript
build: {
  target: 'es2015',           // Specific ES version
  target: 'modules',          // Browsers with ESM support
  target: ['chrome87', 'firefox78'] // Multiple targets
}
```

## Development vs Production

### Environment Variables

Our build scripts use `NODE_ENV` to differentiate between development and production:

```json
{
  "scripts": {
    "build:js": "NODE_ENV=production vite build",
    "build:js:dev": "NODE_ENV=development vite build"
  }
}
```

### Development Features
- **Source Maps**: Enabled for debugging
- **Faster Builds**: Less optimization for speed
- **HMR Support**: Hot Module Replacement

### Production Features
- **Minification**: Compressed output
- **Tree Shaking**: Remove unused code
- **Asset Optimization**: Optimized file sizes

## Common Configuration Patterns

### Library with Multiple Entries

```javascript
export default defineConfig({
  build: {
    lib: {
      entry: {
        'main': resolve(__dirname, 'src/main.js'),
        'secondary': resolve(__dirname, 'src/secondary.js')
      },
      name: 'MyLib'
    }
  }
});
```

### Multi-Page Application

```javascript
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        admin: resolve(__dirname, 'admin/index.html')
      }
    }
  }
});
```

### Backend Integration

```javascript
export default defineConfig({
  build: {
    manifest: true,  // Generate manifest.json
    rollupOptions: {
      input: '/path/to/main.js'  // Override HTML entry
    }
  },
  server: {
    cors: {
      origin: 'http://my-backend.example.com'
    }
  }
});
```

## Performance Optimization

### Bundle Analysis
Enable bundle analysis to understand output:

```javascript
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        vendor: ['vue', 'vue-router'],
        utils: ['lodash', 'axios']
      }
    }
  }
}
```

### Asset Optimization

```javascript
build: {
  assetsInlineLimit: 4096,      // Inline small assets as data URIs
  chunkSizeWarningLimit: 500,   // Warn for large chunks
  reportCompressedSize: false   // Skip gzip reporting for faster builds
}
```

### CSS Optimization

```javascript
build: {
  cssMinify: 'lightningcss',  // Use Lightning CSS for better minification
  cssCodeSplit: true          // Split CSS into separate files
}
```

## Integration with Eleventy

Our project integrates Vite with Eleventy (11ty) static site generator:

### Build Process Flow

1. **Token Generation**: `npm run tokens:build`
2. **CSS Processing**: `npm run build:css` (Tailwind + PostCSS)
3. **JavaScript Bundling**: `npm run build:js` (Vite)
4. **Static Site Generation**: `eleventy`

### Eleventy Configuration

```javascript
// .eleventy.js
module.exports = function(eleventyConfig) {
  // Exclude JS files from passthrough - Vite handles bundling
  eleventyConfig.addPassthroughCopy({ 'src/assets/css': 'assets/css' });
  eleventyConfig.addPassthroughCopy({ 'src/assets/fonts': 'assets/fonts' });
  eleventyConfig.addPassthroughCopy({ 'src/assets/pictures': 'assets/pictures' });
  // JS files are handled by Vite build process
};
```

## Dependency Optimization

### Pre-bundling Configuration

```javascript
export default defineConfig({
  optimizeDeps: {
    include: ['linked-dep'],        // Force include dependencies
    exclude: ['my-lib-dep'],        // Skip pre-bundling
    esbuildOptions: {
      target: 'es2020'              // Set esbuild target
    }
  }
});
```

### Force Re-optimization

```bash
npm run dev -- --force
```

## Troubleshooting

### Common Issues

1. **Module Resolution Problems**
   ```javascript
   resolve: {
     alias: {
       '@': resolve(__dirname, 'src')
     }
   }
   ```

2. **Large Bundle Warnings**
   ```javascript
   build: {
     chunkSizeWarningLimit: 1000
   }
   ```

3. **CSS Import Issues**
   ```javascript
   css: {
     preprocessorOptions: {
       scss: {
         additionalData: `@import "@/styles/variables.scss";`
       }
     }
   }
   ```

### Debug Mode

Enable verbose logging:

```bash
DEBUG=vite:* npm run build:js
```

## CLI Commands

### Development
```bash
vite                    # Start dev server
vite --host            # Expose to network
vite --port 3000       # Custom port
```

### Building
```bash
vite build             # Production build
vite build --watch     # Watch mode
vite build --mode staging  # Custom mode
```

### Preview
```bash
vite preview           # Preview production build
vite preview --port 4000   # Custom preview port
```

## Advanced Features

### Environment-Specific Configuration

```javascript
export default defineConfig(({ command, mode }) => {
  const config = {
    // Base configuration
  };

  if (command === 'serve') {
    // Development-specific config
    config.server = {
      port: 3000
    };
  } else {
    // Build-specific config
    config.build = {
      minify: mode === 'production'
    };
  }

  return config;
});
```

### Custom Build Target

```javascript
build: {
  target: 'baseline-widely-available',  // Vite 7 default
  // Or custom browserslist-compatible targets
  target: ['chrome87', 'firefox78', 'safari14']
}
```

### Plugin Integration

```javascript
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    // Custom plugins for specific needs
  ],
  build: {
    // Build configuration
  }
});
```

## Best Practices

1. **Use Source Maps in Development**
   ```javascript
   build: {
     sourcemap: process.env.NODE_ENV === 'development'
   }
   ```

2. **Optimize Bundle Size**
   ```javascript
   build: {
     rollupOptions: {
       external: ['large-dependency'],
       output: {
         manualChunks: {
           vendor: ['vue', 'vue-router']
         }
       }
     }
   }
   ```

3. **Environment-Specific Settings**
   ```javascript
   build: {
     minify: process.env.NODE_ENV === 'production',
     sourcemap: process.env.NODE_ENV === 'development'
   }
   ```

4. **Asset Optimization**
   ```javascript
   build: {
     assetsInlineLimit: 4096,
     reportCompressedSize: false  // For faster builds
   }
   ```

## Resources

- [Vite Official Documentation](https://vitejs.dev/)
- [Rollup Documentation](https://rollupjs.org/)
- [esbuild Documentation](https://esbuild.github.io/)
- [Vite Plugin Ecosystem](https://github.com/vitejs/awesome-vite)

---

*This documentation is specific to the Café com Vendas project configuration and build process.*