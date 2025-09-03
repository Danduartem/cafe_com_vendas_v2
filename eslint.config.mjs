// @ts-check
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';

export default tseslint.config(
  // Base recommended configurations
  js.configs.recommended,
  tseslint.configs.recommended,
  tseslint.configs.recommendedTypeChecked,
  tseslint.configs.stylistic,

  // Global configuration for all files
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parserOptions: {
        projectService: {
          allowDefaultProject: ['eslint.config.mjs', '*.config.{js,mjs}', '.eleventy.mjs'],
          defaultProject: 'tsconfig.json',
        },
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        Stripe: 'readonly',
        gtag: 'readonly'
      }
    },
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-console': 'warn', // Warn about console statements in all environments
      'prefer-const': 'error'
    }
  },

  // TypeScript-specific configuration
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      // Disable base ESLint rules covered by TypeScript
      'no-unused-vars': 'off',
      'no-undef': 'off',

      // TypeScript-specific rules (keeping essential ones not covered by shared configs)
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/prefer-optional-chain': 'error',
      '@typescript-eslint/no-unnecessary-type-assertion': 'error',
      'no-console': ['warn', { allow: ['warn', 'error'] }], // Allow warn and error, but warn about others
    }
  },

  // JavaScript files (if any remain)
  {
    files: ['**/*.js', '**/*.mjs', '**/*.cjs'],
    extends: [tseslint.configs.disableTypeChecked],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        Stripe: 'readonly',
        gtag: 'readonly'
      }
    },
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-console': 'warn', // Warn about console statements
      'prefer-const': 'error',
      'no-var': 'error'
    }
  },

  // Root Eleventy config is JS: disable type-checked rules
  {
    files: ['.eleventy.mjs'],
    extends: [tseslint.configs.disableTypeChecked],
    rules: {
      'no-console': 'off'
    }
  },

  // Test files overrides
  {
    files: ['**/*.test.{js,ts}', '**/*.spec.{js,ts}', 'tests/**/*.{js,ts}'],
    rules: {
      'no-console': 'off' // Allow console in test files
    }
  },

  // Scripts-specific overrides
  {
    files: ['scripts/**/*.{js,ts}'],
    languageOptions: {
      globals: {
        ...globals.node,
        process: 'readonly'
      }
    },
    rules: {
      'no-console': 'off'
    }
  },

  // Netlify functions-specific overrides
  {
    files: ['netlify/functions/*.{js,ts}'],
    languageOptions: {
      globals: {
        ...globals.node,
        process: 'readonly'
      }
    },
    rules: {
      'no-console': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'warn',
      '@typescript-eslint/no-unsafe-member-access': 'warn',
      '@typescript-eslint/no-unsafe-call': 'warn',
      '@typescript-eslint/no-unsafe-return': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn'
    }
  },

  // Netlify edge functions - disable type-checked rules
  {
    files: ['netlify/edge-functions/*.{js,ts}'],
    extends: [tseslint.configs.disableTypeChecked],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.browser
      }
    },
    rules: {
      'no-console': 'off'
    }
  },

  // Ignore patterns
  {
    ignores: [
      '_site/**',
      'node_modules/**',
      'dist/**',
      '*.min.js',
      'src/assets/css/**',
      '.netlify/**',
      '**/*.d.ts',
      '.claude/**'
    ]
  }
);
