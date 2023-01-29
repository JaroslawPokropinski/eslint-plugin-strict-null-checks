# `eslint-plugin-strict-null-checks`

[![NPM version][npm-image]][npm-url]

Eslint plugin that aims to reproduce strictNullChecks from tsconfig for easier migration and for projects that prefer to have it as a warning not an error.

# Installation

Install eslint-plugin-strict-null-checks plugin locally.

```sh
$ npm install eslint-plugin-strict-null-checks --save-dev
```

# Configuration

To use this plugin you need to configure your eslint config with:

```json
  "parserOptions": {
    "project": "./tsconfig.strictNullChecks.json"
  },
  "plugins": [
    "strict-null-checks"
  ],
  "rules": {
    "strict-null-checks/all": "warn"
  }
```

And create `tsconfig.strictNullChecks.json` with

```
{
  "compilerOptions": {
    "strictNullChecks": true,
  }
}
```

If you get this error:
```
Parsing error: "parserOptions.project" has been set for @typescript-eslint/parser.
The file does not match your project config: .eslintrc.js.
The file must be included in at least one of the projects provided.
```

Add this line to your ESLint config:
```js
ignorePatterns: ['.eslintrc.js'],
```

# License

`eslint-plugin-strict-null-checks` is licensed under the [MIT License](https://opensource.org/licenses/mit-license.php).

[npm-url]: https://npmjs.org/package/eslint-plugin-strict-null-checks
[npm-image]: https://img.shields.io/npm/v/eslint-plugin-strict-null-checks.svg
