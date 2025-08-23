import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import globals from 'globals';

export default [
  // Base recommended configuration
  js.configs.recommended,

  {
    files: ['src/**/*.js', 'scripts/**/*.js', '*.js'],
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
      'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
      'prefer-const': 'error',
      'no-var': 'error'
    }
  },

  {
    files: ['src/**/*.ts', 'scripts/**/*.ts', 'tests/**/*.ts', '*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        project: './tsconfig.json'
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        Stripe: 'readonly',
        gtag: 'readonly'
      }
    },
    plugins: {
      '@typescript-eslint': tseslint
    },
    rules: {
      // Disable base ESLint rules covered by TypeScript
      'no-unused-vars': 'off',
      'no-undef': 'off',

      // Essential TypeScript rules
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/prefer-optional-chain': 'error',
      '@typescript-eslint/no-unnecessary-type-assertion': 'error',

      // Keep essential quality rules
      'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
      'prefer-const': 'error'
    }
  },

  {
    files: ['scripts/*.js', 'scripts/*.ts'],
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

  {
    ignores: [
      '_site/**',
      'node_modules/**',
      'dist/**',
      '*.min.js',
      'src/assets/css/**',
      'netlify/**',
      '.netlify/**',
      '**/*.d.ts'
    ]
  }
];