#!/usr/bin/env tsx
/**
 * Content Validation Script
 *
 * Validates all content JSON files against their corresponding schemas
 * to catch content errors before deployment.
 */

import fs from 'fs';
import path from 'path';

const root = process.cwd();
const contentDir = path.join(root, 'content');

interface ValidationResult {
  file: string;
  valid: boolean;
  errors: string[];
}

interface ValidationSummary {
  total: number;
  valid: number;
  invalid: number;
  results: ValidationResult[];
}

// Import section schemas dynamically
const SCHEMA_MODULES = new Map<string, string>([
  ['hero', 'src/_includes/sections/hero/schema.ts'],
  ['about', 'src/_includes/sections/about/schema.ts'],
  ['offer', 'src/_includes/sections/offer/schema.ts'],
  ['faq', 'src/_includes/sections/faq/schema.ts'],
  ['footer', 'src/_includes/sections/footer/schema.ts'],
  ['problem', 'src/_includes/sections/problem/schema.ts'],
  ['solution', 'src/_includes/sections/solution/schema.ts'],
  ['social-proof', 'src/_includes/sections/social-proof/schema.ts'],
  ['top-banner', 'src/_includes/sections/top-banner/schema.ts'],
  ['final-cta', 'src/_includes/sections/final-cta/schema.ts']
]);

async function loadSchemaValidator(sectionName: string) {
  const schemaPath = SCHEMA_MODULES.get(sectionName);
  if (!schemaPath) {
    return null;
  }

  try {
    const fullPath = path.resolve(root, schemaPath);
    const schemaModule = await import(fullPath);

    // Look for validation function in various formats
    const validator =
      schemaModule.default?.validate ||
      schemaModule.validate ||
      schemaModule[`validate${sectionName.charAt(0).toUpperCase() + sectionName.slice(1)}Section`] ||
      schemaModule[`${sectionName}Schema`]?.validate;

    return validator || null;
  } catch (error) {
    console.warn(`⚠️  Could not load schema for ${sectionName}: ${(error as Error).message}`);
    return null;
  }
}

function extractSectionNameFromPath(filePath: string): string | null {
  // Extract section name from paths like:
  // content/pt-PT/sections/hero.json -> hero
  // content/pt-PT/sections/about.json -> about
  const match = filePath.match(/\/sections\/([^/]+)\.json$/);
  return match ? match[1] : null;
}

async function validateContentFile(filePath: string): Promise<ValidationResult> {
  const relativePath = path.relative(root, filePath);
  const result: ValidationResult = {
    file: relativePath,
    valid: true,
    errors: []
  };

  try {
    // Read and parse JSON
    const content = fs.readFileSync(filePath, 'utf8');
    let data: unknown;

    try {
      data = JSON.parse(content);
    } catch (parseError) {
      result.valid = false;
      result.errors.push(`JSON parse error: ${(parseError as Error).message}`);
      return result;
    }

    // Extract section name from file path
    const sectionName = extractSectionNameFromPath(filePath);
    if (!sectionName) {
      // Skip validation for non-section files (site.json, event.json, etc.)
      console.log(`ℹ️  Skipping validation for non-section file: ${relativePath}`);
      return result;
    }

    // Load and apply schema validation
    const validator = await loadSchemaValidator(sectionName);
    if (!validator) {
      console.log(`ℹ️  No schema validator found for section: ${sectionName}`);
      return result;
    }

    if (typeof validator === 'function') {
      try {
        const isValid = validator(data);
        if (!isValid) {
          result.valid = false;
          result.errors.push(`Schema validation failed for section: ${sectionName}`);
        }
      } catch (validationError) {
        result.valid = false;
        result.errors.push(`Validation error: ${(validationError as Error).message}`);
      }
    }

  } catch (error) {
    result.valid = false;
    result.errors.push(`File read error: ${(error as Error).message}`);
  }

  return result;
}

function findJsonFiles(dir: string): string[] {
  const files: string[] = [];

  function walkDir(currentDir: string) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        walkDir(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.json')) {
        files.push(fullPath);
      }
    }
  }

  walkDir(dir);
  return files;
}

async function validateAllContent(): Promise<ValidationSummary> {
  console.log('🔍 Scanning content directory for JSON files...');

  // Find all JSON files in content directory
  const fullPaths = findJsonFiles(contentDir);
  const contentFiles = fullPaths.map(file => path.relative(contentDir, file));

  console.log(`📁 Found ${contentFiles.length} content files`);

  const results: ValidationResult[] = [];

  for (const filePath of fullPaths) {
    const result = await validateContentFile(filePath);
    results.push(result);

    if (result.valid) {
      console.log(`✅ ${result.file}`);
    } else {
      console.log(`❌ ${result.file}`);
      result.errors.forEach(error => console.log(`   └─ ${error}`));
    }
  }

  const summary: ValidationSummary = {
    total: results.length,
    valid: results.filter(r => r.valid).length,
    invalid: results.filter(r => !r.valid).length,
    results
  };

  return summary;
}

async function main(): Promise<void> {
  try {
    console.log('🚀 Starting content validation...\n');

    const summary = await validateAllContent();

    console.log('\n📊 Validation Summary:');
    console.log(`   Total files: ${summary.total}`);
    console.log(`   Valid: ${summary.valid}`);
    console.log(`   Invalid: ${summary.invalid}`);

    if (summary.invalid > 0) {
      console.log('\n❌ Content validation failed!');
      console.log('Please fix the errors above before deploying.');
      process.exit(1);
    } else {
      console.log('\n✅ All content files are valid!');
    }

  } catch (error) {
    console.error('💥 Fatal error during validation:', (error as Error).message);
    process.exit(1);
  }
}

main();