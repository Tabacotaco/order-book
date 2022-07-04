module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: ['react'],
  globals: {
    __WEBPACK_DEFINE__: true,
  },
  extends: ['airbnb', 'airbnb/hooks'],
  ignorePatterns: ['dist/*', 'build/*'],
  rules: {
    'no-continue': 'warn',
    semi: ['error', 'always'],
    quotes: ['error', 'single'],
    indent: [
      'error',
      2,
      {
        SwitchCase: 1,
      },
    ],
    'operator-linebreak': ['error', 'before'],
    'comma-dangle': ['error', 'only-multiline'],
    'no-param-reassign': [
      'error',
      {
        props: true,
        ignorePropertyModificationsForRegex: ['^draft'],
      },
    ],
    'arrow-parens': ['error', 'always'],
    'implicit-arrow-linebreak': ['error', 'beside'],
    'key-spacing': [
      'error',
      {
        afterColon: true,
      },
    ],
    'object-curly-spacing': ['error', 'always'],
    'comma-spacing': [
      'error',
      {
        before: false,
        after: true,
      },
    ],
    'padding-line-between-statements': [
      'error',
      {
        blankLine: 'always',
        prev: '*',
        next: ['const', 'let', 'var', 'function', 'return'],
      },
      {
        blankLine: 'always',
        prev: ['const', 'let', 'var', 'function'],
        next: '*',
      },
      {
        blankLine: 'any',
        prev: ['const', 'let', 'var'],
        next: ['const', 'let', 'var'],
      },
    ],
    'react-hooks/exhaustive-deps': 'warn',
    'react/jsx-props-no-spreading': 'off',
    'react/require-default-props': 'off',
    'react/forbid-prop-types': 'off',
    'react/state-in-constructor': 'off',
    'react/function-component-definition': 'off',
    'no-unused-vars': ['warn', { destructuredArrayIgnorePattern: '^_' }],
    'no-nested-ternary': 'warn',
    'jsx-a11y/aria-role': 'off',
    'no-multiple-empty-lines': { max: 2 }
  }
};
