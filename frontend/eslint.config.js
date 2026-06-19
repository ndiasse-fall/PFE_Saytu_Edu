import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },
  {
    files: ['src/**/*.{js,jsx}'],
    ignores: ['src/app/core/api/apiClient.js'],
    rules: {
      'no-restricted-imports': ['error', {
        paths: [{
          name: 'axios',
          message: 'Axios est centralisé dans app/core/api/apiClient.js.',
        }],
      }],
    },
  },
  {
    files: [
      'src/app/views/**/*.{js,jsx}',
      'src/app/shared/**/*.{js,jsx}',
      'src/app/router/**/*.{js,jsx}',
      'src/app/core/context/**/*.{js,jsx}',
      'src/app/core/guards/**/*.{js,jsx}',
    ],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [{
          group: ['**/core/api/apiClient', '**/core/api/apiClient.js'],
          message: 'Les composants utilisent un service métier, jamais apiClient directement.',
        }],
      }],
    },
  },
])
