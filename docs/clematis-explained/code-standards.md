---
sidebar_position: 3
tags:
  - prettier
  - eslint  
  - lint-staged
---

# Code Standards

## Prettier

[Prettier](https://prettier.io/docs/) is an opinionated code formatter, and it
is installed the same way and acts the same for all the projects, it requires
zero configuration if dev team is happy with the default style. 

The goal of prettier is to make code <i>look</i> the same way across the projects, 
not to catch errors, which is a task for [linters](https://en.wikipedia.org/wiki/Lint_%28software%29).
Dev team of Prettier decides which code style is optimal,
and it changes from one version of the tool
to another. So it is advisable to have a specific version in `package.json` file.

Prettier claims to guarantee that the code will not be broken after the formatting.

### Customized Settings

For Clematis projects it is a common thing to have it installed with some defaults changed
and additional library to turn off conflicting settings with [ESlint](https://eslint.org/) linter:

````bash
npm install --save-dev --save-exact prettier
npm install --save-dev eslint-config-prettier
````

The customised settings are:

````json title=".prettierrc" 
{
  "singleQuote": true,
  "quote-props": "consistent"
}
````

And the ignore files configuration:

````prettier title=".prettierignore" 
# Ignore artifacts:
.angular
/.nx/cache
/.nx/workspace-data
/.vscode/

coverage
node_modules
dist
````
The tool can be run with the following command in the root directory:

````bash
prettier --write .
````

## ESLint

The second actor to analyze the code is one of the most popular 
JavaScript [linters](https://en.wikipedia.org/wiki/Lint_%28software%29): 
[ESList](https://eslint.org/). It is also completely pluggable and is used the same 
way across all the projects:

It is advisable to have the latest version of the tool, as it may have more cases to 
validate than the previous ones:

````bash
npm init @eslint/config@latest
````

:::warning[Migration]
Since it is the newest version installed, a new config system is used. In the new system,
`.eslintrc*` is no longer used, `eslint.config.js` should be the default config file name.
:::

### Plugins For React

ESLint uses plugins for configuration, and it requires a few plugins for React and Prettier,
for example as below. They are added by eslint config initialization tool:
````json
{
    "devDependencies": {
        "@eslint/js": "^9.19.0",
        "eslint": "^9.19.0",
        "eslint-config-prettier": "^10.0.1",
        "eslint-plugin-prettier": "^5.2.3",
        "eslint-plugin-react": "^7.37.4",
        "eslint-plugin-react-hooks": "^5.0.0",
        "eslint-plugin-react-refresh": "^0.4.14"
    }
}
````

:::info[]
Plugin `eslint-config-react-app` is not using eslint version 9  
:::

The plugins are added to the new configuration file, and there is a trick with the old
`eslint-plugin-react-hooks` and `prettier` plugins. It requires `FlatCompat` 
to be used to get flat configuration, for instance `...compat.extends('plugin:react-hooks/recommended')` 
instead of, say, `pluginReactHooks.configs.flat.recommended`:

````javascript title="eslint.config.js"
import { FlatCompat } from '@eslint/eslintrc';
import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import pluginReact from 'eslint-plugin-react';

const compat = new FlatCompat();

/** @type {import('eslint').Linter.Config[]} */
export default [
    {
        files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'],
    },
    {
        languageOptions: {
            globals: globals.browser,
        },
    },
    pluginJs.configs.recommended,
    ...tseslint.configs.recommended,
    pluginReact.configs.flat.recommended,
    pluginReact.configs.flat['jsx-runtime'],
    ...compat.extends('plugin:react-hooks/recommended'),
    {
        rules: {
            'react/jsx-uses-react': 'off',
            'react/react-in-jsx-scope': 'off',
        },
    },
    ...compat.extends('plugin:prettier/recommended'),
];

````
:::tip[]
Prettier plugin should go the last to override all linting settings.
:::

The last step is to add a line to `package.json`:

````json title="package.json"
{
  "scripts": {
    "lint": "eslint src"
  }
}
````

### Integration With Vite

Since Vite is using plugins for configuration, it is required to install a plugin, 
in particular `vite-plugin-eslint2`, not `vite-plugin-eslint` (it is discontinued):

````bash
 npm install vite-plugin-eslint2 --save-dev
````

Then plugin should go to Vite configuration file:

````typescript title="vite.config.js"
/** @type {import('vite').UserConfig} */

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
/**
 * @ts-expect-error See https://github.com/gxmari007/vite-plugin-eslint/issues/79
 * import eslint from "vite-plugin-eslint";
 */
import eslint from "vite-plugin-eslint2";

// https://vite.dev/config/
export default defineConfig({
    plugins: [react(), tsconfigPaths(), eslint()],
    server: {
        port: 3030,
    },
    preview: {
        port: 3000,
    },
});

````
Where `rules` section contains some custom styles.

### Integration With Angular And Nx

Angular and [Nx](https://nx.dev) also are using plugins to extends their functionality,
so it is required to add plugins 
[`@angular-eslint/eslint-plugin`](https://github.com/angular-eslint/angular-eslint) and 
[`@nx/eslint`](https://nx.dev/nx-api/eslint) to support ESLint:

````json title="package.json"
{
  "devDependencies": {
    "@angular-eslint/eslint-plugin": "^18.3.1",
    "@angular-eslint/eslint-plugin-template": "^18.3.1",
    "@angular-eslint/template-parser": "^18.3.1",
    "@nx/eslint": "19.5.7",
    "@nx/eslint-plugin": "19.5.7",
    "eslint": "^8.57.1",
    "eslint-config-prettier": "^9.1.0",
    "typescript": "~5.6.2",
    "typescript-eslint": "^8.22.0"
  }
}
````
:::tip[Migration]
Money Tracker uses ESLint version 8, it is planned to migrate it to the version 9, with the changes
in the configuration files.
:::
