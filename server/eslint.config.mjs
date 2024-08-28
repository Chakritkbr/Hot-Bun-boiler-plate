import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import eslintPluginNode from 'eslint-plugin-node';
import eslintPluginJest from 'eslint-plugin-jest';

export default [
  {
    files: ['**/*.{js,mjs,cjs,ts}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      node: eslintPluginNode,
      jest: eslintPluginJest,
    },
    extends: [
      pluginJs.configs.recommended,
      ...tseslint.configs.recommended,
      'plugin:node/recommended',
      'plugin:jest/recommended',
    ],
    rules: {},
  },
];
