module.exports = {
    env: {
        browser: true,
        es6: true,
    },
    extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint'],
    parserOptions: {
        "sourceType": "module",
        // TypeScriptのLint時に参照するconfigファイルを指定
        "project": "./tsconfig.json" 
    },
    root: true,
    rules: {},
};