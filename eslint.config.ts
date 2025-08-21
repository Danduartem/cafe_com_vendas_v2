import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import globals from 'globals';

export default [
  // Base recommended configuration
  js.configs.recommended,

  {
    // Configuration for JavaScript files
    files: ['src/**/*.js', 'scripts/**/*.js', '*.js', '.eleventy.js'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        // External libraries and APIs
        Stripe: 'readonly',
        gtag: 'readonly'
      }
    },
    rules: {
      // ES6 Module enforcement
      'no-undef': 'error',
      'no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_'
      }],

      // Code quality
      'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
      'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
      'no-alert': 'warn',

      // Modern JavaScript practices
      'prefer-const': 'error',
      'no-var': 'error',
      'prefer-arrow-functions': 'off', // Allow both arrow and regular functions
      'object-shorthand': 'error',
      'prefer-template': 'error',

      // Consistency
      'camelcase': ['error', { properties: 'never' }],
      'no-trailing-spaces': 'error',
      'semi': ['error', 'always'],
      'quotes': ['error', 'single', { avoidEscape: true }],
      'indent': ['error', 2], // Match existing codebase indentation
      'comma-dangle': ['warn', 'never'],

      // Best practices aligned with project architecture
      'no-magic-numbers': ['warn', {
        ignore: [0, 1, -1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 16, 25, 30, 36, 40, 50, 56, 60, 75, 80, 100, 133, 200, 250, 300, 400, 409, 429, 500, 600, 800, 1000, 2000, 3000, 8000, 0.1, 0.3, 0.4, 0.8, 1.5, 2.5, -5, -10, -20, -30, -40],
        ignoreArrayIndexes: true,
        ignoreDefaultValues: true,
        detectObjects: false
      }],
      'complexity': ['warn', 15], // Increase for UI components
      'max-lines-per-function': ['warn', 80], // Increase for UI components

      // Browser environment specific
      'no-implicit-globals': 'error',
      'no-global-assign': 'error',

      // Prevent common errors
      'no-duplicate-imports': 'error',
      'no-unreachable': 'error',
      'no-constant-condition': 'error',
      'valid-typeof': 'error',

      // Style consistency with Tailwind CSS approach
      'no-inline-comments': 'off', // Allow inline comments for documentation
      'spaced-comment': ['error', 'always'],
      'no-multiple-empty-lines': ['error', { max: 2, maxEOF: 1 }]
    }
  },

  {
    // Configuration for TypeScript files
    files: ['src/**/*.ts', 'scripts/**/*.ts', '*.ts', 'vite.config.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        project: './tsconfig.json'
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        // External libraries and APIs
        Stripe: 'readonly',
        gtag: 'readonly'
      }
    },
    plugins: {
      '@typescript-eslint': tseslint
    },
    rules: {
      // Disable base ESLint rules that are covered by TypeScript
      'no-undef': 'off', // TypeScript handles this
      'no-unused-vars': 'off', // Use TypeScript version instead

      // TypeScript-specific rules
      '@typescript-eslint/no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_'
      }],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off', // Too strict for this project
      '@typescript-eslint/explicit-module-boundary-types': 'off', // Too strict for this project
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/prefer-nullish-coalescing': 'error',
      '@typescript-eslint/prefer-optional-chain': 'error',
      '@typescript-eslint/no-unnecessary-type-assertion': 'error',

      // TypeScript versions of JavaScript rules
      '@typescript-eslint/no-shadow': 'error',
      '@typescript-eslint/no-use-before-define': 'error',

      // Keep consistent code quality rules
      'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
      'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
      'no-alert': 'warn',

      // Modern TypeScript practices
      'prefer-const': 'error',
      'object-shorthand': 'error',
      'prefer-template': 'error',

      // Consistency - use single quotes to match existing codebase
      'quotes': ['error', 'single', { avoidEscape: true }],
      'semi': ['error', 'always'],
      'indent': ['error', 2],
      'comma-dangle': ['warn', 'never'],
      'no-trailing-spaces': 'error',

      // TypeScript-specific best practices
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
      '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],

      // Style consistency
      'no-inline-comments': 'off',
      'spaced-comment': ['error', 'always'],
      'no-multiple-empty-lines': ['error', { max: 2, maxEOF: 1 }]
    }
  },

  {
    // Configuration for build and config files (Node.js environment)
    files: ['.eleventy.js', 'vite.config.js', 'vite.config.ts', 'eslint.config.js', 'scripts/*.js', 'scripts/*.ts'],
    languageOptions: {
      globals: {
        ...globals.node,
        process: 'readonly',
        __dirname: 'readonly'
      }
    },
    rules: {
      'no-console': 'off' // Allow console in build scripts
    }
  },

  {
    // Ignore patterns
    ignores: [
      '_site/**',
      'node_modules/**',
      'dist/**',
      '*.min.js',
      'src/assets/css/**', // CSS files handled by PostCSS/Tailwind
      'src/platform/**', // Platform files excluded from TypeScript project
      'netlify/**', // Netlify functions and generated files
      '.netlify/**', // Netlify dev files
      '**/*.d.ts' // TypeScript declaration files
    ]
  }
];