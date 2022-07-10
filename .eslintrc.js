module.exports = {
  root: true,
  parserOptions: {
    parser: 'babel-eslint',
    sourceType: 'module'
  },
  env: {
    node: true
  },
  plugins: [
    'vue'
  ],
  extends: [
    'plugin:vue/recommended',
    'eslint:recommended'
  ],
  rules: {
    'no-console': 0,
    'no-multi-spaces': 1,
    'eqeqeq': 1,
    'indent': [
      1,
      2
    ],
    'semi': [
      1,
      'never'
    ],
    'quotes': [
      1,
      'single'
    ],
    'operator-linebreak': [
      1,
      'after'
    ],
    'no-extra-semi': 1,
    'no-spaced-func': 1,
    'no-irregular-whitespace': 1,
    'key-spacing': [
      1,
      {
        'beforeColon': false,
        'afterColon': true
      }
    ],
    'keyword-spacing': 1,
    'space-infix-ops': 1,
    'comma-spacing': [
      1,
      {
        'before': false,
        'after': true
      }
    ],
    'space-before-blocks': 1,
    'comma-dangle': 1,
    'object-curly-newline': [1, {
      'multiline': true,
      'consistent': true
    }],
    'object-curly-spacing': [
      1,
      'always'
    ],
    'object-property-newline': [1, {
      'allowMultiplePropertiesPerLine': true 
    }],
    'space-in-parens': 1,
    'no-sequences': 1,
    'no-unused-expressions': 1,
    'arrow-spacing': 1
  },
  'parserOptions': {
    'parser': 'babel-eslint'
  }
}
