import js from '@eslint/js';
import globals from 'globals';

export default [
  {
    ignores: ['lib/**/*', 'test/fixtures/**/*', 'node_modules/**/*', 'coverage/**/*']
  },
  js.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.node
      },
      ecmaVersion: 2022,
      sourceType: 'module'
    },
    rules: {
      'no-console': [
        'warn',
        {
          allow: ['warn', 'error']
        }
      ],
      'prefer-const': 'error',
      'no-var': 'error',
      'no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_'
        }
      ],
      eqeqeq: ['error', 'always'],
      curly: ['error', 'all'],
      'dot-notation': 'error',
      'no-multi-assign': 'error',
      'prefer-template': 'error',
      'prefer-arrow-callback': 'error',
      'no-else-return': 'error',
      'no-useless-return': 'error',
      'no-throw-literal': 'error',
      'no-await-in-loop': 'warn',
      'max-depth': ['warn', 4],
      'max-params': ['warn', 4],
      complexity: ['warn', 15]
    }
  },
  {
    files: ['test/**/*.js'],
    languageOptions: {
      globals: {
        ...globals.mocha
      }
    },
    rules: {
      'no-console': 'off',
      'max-depth': 'off',
      'max-params': 'off',
      complexity: 'off'
    }
  },
  {
    files: ['**/optimizers/*.js'],
    rules: {
      'max-params': ['warn', 8]
    }
  },
  {
    files: ['**/optimizer-registry.js'],
    rules: {
      'no-await-in-loop': 'off'
    }
  }
];
