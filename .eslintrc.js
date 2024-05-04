module.exports = {
  root: true,
  extends: ['airbnb-base', 'airbnb-typescript/base', 'prettier'],
  rules: {
    'no-restricted-syntax': 0,
    'no-continue': 'off',
    'prettier/prettier': 'error',
    'no-plusplus': 0,
    '@typescript-eslint/no-use-before-define': 0,
    'no-param-reassign': 0,
    'import/prefer-default-export': 0,
    'default-case': 0,
    'no-underscore-dangle': 0,
    'consistent-return': 0
  },
  parserOptions: {
    project: './tsconfig.json'
  },
  plugins: ['prettier'],
  ignorePatterns: ['.eslintrc.js', '**/node_modules/**', 'jest.config.js', 'forwarder/**']
};
