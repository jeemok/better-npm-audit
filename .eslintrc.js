module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
    mocha: true,
    node: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 12,
  },
  extends: [
    'eslint:recommended',
    'google',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  rules: {
    'prettier/prettier': 'error',
    'arrow-parens': ['error', 'as-needed'],
    'max-len': ['error', { code: 160, ignoreUrls: true }],
    'object-curly-spacing': ['off'],
    indent: ['error', 2, { SwitchCase: 1 }],
  },
  ignorePatterns: ['lib'],
  plugins: ['prettier'],
};
