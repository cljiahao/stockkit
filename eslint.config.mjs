import coreWebVitals from 'eslint-config-next/core-web-vitals';
import typescript from 'eslint-config-next/typescript';
import sonarjs from 'eslint-plugin-sonarjs';

const config = [
  ...coreWebVitals,
  ...typescript,
  {
    plugins: { sonarjs },
    rules: {
      // Honour the `_`-prefix convention for intentionally-unused args/vars.
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],
      // Comment hygiene: own-line comments only, no commented-out code. See templatecentral:standards code-standards/comments.md.
      'no-inline-comments': [
        'error',
        { ignorePattern: 'eslint-|@ts-|prettier-|c8 |istanbul |webpackChunkName' },
      ],
      'sonarjs/no-commented-code': 'error',
    },
  },
  { ignores: ['.next/**', 'node_modules/**', 'next-env.d.ts', '.claude/**'] },
];

export default config;
