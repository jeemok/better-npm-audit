module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
    mocha: true,
    node: true,
  },
  extends: ['eslint:recommended', 'google'],
  parserOptions: {
    ecmaVersion: 12,
  },
  rules: {
    'arrow-parens': ['error', 'as-needed'],
    'max-len': ['error', { code: 160, ignoreUrls: true }],
    'object-curly-spacing': ['off'],
  },
};
