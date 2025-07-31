// .eslintrc.js in C:\Users\Ian justine\Projects\RentCycle\vehicle-rental-frontend
module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: [
    'plugin:vue/vue3-essential',
    'eslint:recommended',
  ],
  parserOptions: {
    parser: '@babel/eslint-parser',
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    // This rule allows unused variables if they start with an underscore.
    // We'll use this for 'commit' where it's not directly called but needed for destructuring.
    'no-unused-vars': ['error', { 'argsIgnorePattern': '^_', 'varsIgnorePattern': '^_'}],
    'no-empty-pattern': 'off' // Turn off this rule if it continues to be problematic with empty destructuring
  },
  globals: { // <-- THIS SECTION IS CRITICAL FOR __firebase_config and __initial_auth_token
    __firebase_config: 'readonly',
    __initial_auth_token: 'readonly',
  },
};
