# Eleventy (11ty) Documentation

This document contains key documentation for Eleventy, the static site generator used in this project.

## About Eleventy

Eleventy is a simpler, more flexible static site generator that uses a JavaScript backend. It supports multiple templating engines and provides excellent performance for static sites.

## Key Configuration

### Basic Configuration File
```javascript
export default async function(eleventyConfig) {
	// Configure Eleventy
};
```

### Directory Configuration
```javascript
export default function(eleventyConfig) {
  // Set input directory
  eleventyConfig.setInputDirectory("src");
  
  // Set output directory
  eleventyConfig.setOutputDirectory("_site");
  
  // Set includes directory
  eleventyConfig.setIncludesDirectory("_includes");
  
  // Set data directory
  eleventyConfig.setDataDirectory("_data");
};
```

### Template Formats
```javascript
export default function (eleventyConfig) {
	// Set template formats
	eleventyConfig.setTemplateFormats([ "html", "liquid", "njk", "md" ]);
	
	// Add additional formats
	eleventyConfig.addTemplateFormats([ "css" ]);
};
```

## Data Files

### Global Data Files
Place JSON files in `_data/` directory:

```javascript
// _data/site.js
export default {
  title: "My Awesome Site",
  url: "https://example.com"
};
```

### Template Data Files
Data files can be specific to templates:

```json
// posts/posts.json
{
  "layout": "layouts/post.njk"
}
```

### Environment Variables in Data
```javascript
// _data/environment.js
export default function () {
	return {
		environment: process.env.MY_ENVIRONMENT || "development",
	};
}
```

## Templates and Includes

### Nunjucks Template Syntax
```njk
<!-- Including templates -->
{% include 'included.njk' %}
{% include './included.njk' %}

<!-- Extending templates -->
{% extends 'base.njk' %}

<!-- Importing macros -->
{% import 'macros.njk' %}
```

### Layout Files
```njk
<!-- _includes/layout.njk -->
<!DOCTYPE html>
<html>
<head>
  <title>My Layout</title>
</head>
<body>
  <header>My Site Header</header>
  <main>
    {{ content | safe }}
  </main>
  <footer>My Site Footer</footer>
</body>
</html>
```

## Built-in Variables

### Page Variable
```javascript
const page = {
	// URL for linking to other templates
	url: "/current/page/myFile/",
	
	// For permalinks: filename minus extension
	fileSlug: "myFile",
	
	// For permalinks: path minus extension
	filePathStem: "/current/page/myFile",
	
	// Date object for sorting collections
	date: new Date(),
	
	// Path to source file
	inputPath: "./current/page/myFile.md",
	
	// Output path
	outputPath: "./_site/current/page/myFile/index.html",
	
	// Output file extension
	outputFileExtension: "html",
	
	// Template syntaxes processing this template
	templateSyntax: "liquid,md"
};
```

## Filters and Shortcodes

### Adding Custom Filters
```javascript
export default function(eleventyConfig) {
  // Universal filters (works across templating languages)
  eleventyConfig.addFilter("myFilter", function(value) { 
    return value.toUpperCase();
  });
  
  // Nunjucks-specific filter
  eleventyConfig.addNunjucksFilter("myNjkFilter", function(value) { 
    return value;
  });
};
```

### Adding Shortcodes
```javascript
export default function(eleventyConfig) {
  // Simple shortcode
  eleventyConfig.addShortcode("currentYear", function() {
    return new Date().getFullYear();
  });
};
```

## Pagination

### Basic Pagination
```yaml
---
pagination:
  data: collections.posts
  size: 10
---
```

### Creating Pages from Data
```yaml
---
pagination:
  data: possums
  size: 1
  alias: possum
permalink: "possums/{{ possum.name | slugify }}/"
---
```

## Performance and Optimization

### Passthrough Copy
```javascript
export default function(eleventyConfig) {
  // Copy files without processing
  eleventyConfig.addPassthroughCopy("src/assets/images");
  eleventyConfig.addPassthroughCopy("src/assets/js");
};
```

### Watch and Serve
```javascript
export default function(eleventyConfig) {
  // Watch JavaScript dependencies
  eleventyConfig.setWatchJavaScriptDependencies(true);
};
```

## Commands

### Development
```bash
npx @11ty/eleventy --serve --watch
```

### Build
```bash
npx @11ty/eleventy
```

### Specify Input/Output
```bash
npx @11ty/eleventy --input=src --output=dist
```

## Common Use Cases

### Adding CSS Processing
```javascript
export default function (eleventyConfig) {
  eleventyConfig.addTemplateFormats("css");
  
  // Process CSS files
  eleventyConfig.setTemplateFormats([
    "md", "njk", "html", 
    "css" // Process CSS as templates
  ]);
};
```

### Custom Data Extensions
```javascript
export default function (eleventyConfig) {
  // Add YAML data support
  eleventyConfig.addDataExtension("yaml", contents => yaml.load(contents));
};
```

### Virtual Templates
```javascript
export default function(eleventyConfig) {
  // Create virtual templates programmatically
  eleventyConfig.addTemplate("virtual.md", `# Hello`, {
    layout: "virtual.html"
  });
};
```

## Best Practices

1. **Use data files** for site configuration and content that doesn't change often
2. **Leverage the data cascade** to avoid repetition
3. **Use layouts** to maintain consistent structure
4. **Optimize images** with lazy loading and proper formats
5. **Use passthrough copy** for static assets
6. **Implement proper SEO** with meta tags and schema markup
7. **Test your build** regularly to catch issues early

## Common Issues

- **File not found errors**: Check your includes directory configuration
- **Data not updating**: Restart the dev server when changing data files
- **Template syntax errors**: Verify your template engine syntax
- **Build performance**: Use passthrough copy for static assets instead of processing them as templates

## Project-Specific Configuration

In this project, Eleventy is configured with:
- Input directory: `src/`
- Output directory: `_site/`
- Includes directory: `_includes/`
- Data directory: `_data/`
- Template formats: Nunjucks (.njk), Markdown (.md), HTML (.html)
- Custom data files for site metadata, event information, and design tokens