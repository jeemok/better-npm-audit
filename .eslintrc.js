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
  extends: ['eslint:recommended', 'google', 'plugin:@typescript-eslint/eslint-recommended', 'plugin:@typescript-eslint/recommended'],
  rules: {
    'prettier/prettier': 'error',
    'arrow-parens': ['error', 'always'],
    'max-len': ['error', { code: 140, ignoreUrls: true }],
    'object-curly-spacing': ['off'],
    // eslint-disable-next-line prettier/prettier
    'indent': ['error', 2, { SwitchCase: 1 }],
    'no-shadow': 'off',
  },
  ignorePatterns: ['lib'],
  plugins: ['prettier'],
};
