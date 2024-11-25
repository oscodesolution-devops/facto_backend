// .eslintrc.js
module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'import'],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:import/typescript',
  ],
  settings: {
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
        project: './tsconfig.json',
      },
    },
  },
  rules: {
    'import/no-relative-parent-imports': 'error',
    'import/order': ['error', {
      'pathGroups': [
        {
          'pattern': '@/**',
          'group': 'internal'
        }
      ],
    }],
  },
}
