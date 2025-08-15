import js from '@eslint/js';
import globals from 'globals';

export default [
  // Base recommended configuration
  js.configs.recommended,

  {
    // Main configuration for source files
    files: ['src/**/*.js', 'scripts/**/*.js', '*.js'],
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
        ignore: [0, 1, -1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 16, 25, 30, 36, 40, 50, 56, 60, 75, 100, 133, 200, 250, 300, 400, 409, 429, 500, 600, 800, 1000, 2000, 3000, 8000, 0.1, 0.3, 0.4, 0.8, 1.5, 2.5, -5, -10, -20, -30, -40],
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
    // Configuration for build and config files
    files: ['.eleventy.js', 'vite.config.js', 'eslint.config.js', 'scripts/*.js'],
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
      'netlify/**', // Netlify functions and generated files
      '.netlify/**' // Netlify dev files
    ]
  }
];