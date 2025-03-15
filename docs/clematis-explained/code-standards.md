---
sidebar_position: 4
tags:
  - prettier
  - eslint  
  - lint-staged
---

# Code Standards

## Prettier

[Prettier](https://prettier.io/docs/) is an opinionated code formatter, and it
is installed the same way and acts the same for all the projects, it requires
zero configuration if a dev team is happy with the default style. 

The goal of prettier is to make code <i>look</i> the same way across the projects, 
not to catch errors, which is a task for [linters](https://en.wikipedia.org/wiki/Lint_%28software%29).
The Dev team of Prettier decides which code style is optimal,
and it changes from one version of the tool
to another. So it is advisable to have a specific version in `package.json` file.

Prettier claims to guarantee that the code will not be broken after the formatting.

### Customized Settings

For Clematis projects, it is a common thing to have it installed with some defaults changed
and an additional library to turn off conflicting settings with [ESlint](https://eslint.org/) linter:

````bash
npm install --save-dev --save-exact prettier
npm install --save-dev eslint-config-prettier
````

The customised settings are:

````json title=".prettierrc" 
{
  "singleQuote": true,
  "quoteProps": "consistent"
}
````

And the ignored files configuration:

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

ESLint uses plugins for configuration, and it requires a few plugins for React, JavaScript,
TypeScript, Jest, and Prettier, for example, as below:
````json
{
    "devDependencies": {
        "@eslint/js": "^9.19.0",
        "eslint": "^9.19.0",
        "eslint-config-prettier": "^10.0.1",
        "eslint-plugin-prettier": "^5.2.3",
        "eslint-plugin-react": "^7.37.4",
        "eslint-plugin-react-hooks": "^5.0.0",
        "eslint-plugin-jest": "^28.11.0",
        "eslint-plugin-react-refresh": "^0.4.14",
        "typescript-eslint": "^8.22.0"
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
    ...compat.extends('plugin:jest/recommended'),
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

Then the plugin should go to a Vite configuration file:

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

Angular and [Nx](https://nx.dev) also are using plugins to extend their functionality,
so it is required to add plugin [`@nx/eslint`](https://nx.dev/nx-api/eslint) for Nx to support ESLint.
Other plugins for ESLint itself: `@typescript-eslint/eslint-plugin` for TypeScript, 
`eslint-plugin-html` for HTML templates and for Prettier as well `eslint-config-prettier`:

````json title="package.json"
{
  "devDependencies": {
    "@nx/eslint": "19.5.7",
    "@nx/eslint-plugin": "19.5.7",
    "eslint": "^8.57.1",
    "eslint-config-prettier": "^9.1.0",
    "eslint-plugin-html": "^8.1.2",
    "@typescript-eslint/eslint-plugin": "^7.18.0",
    "@typescript-eslint/parser": "^7.18.0",
    "@typescript-eslint/utils": "^7.18.0"
  }
}
````
:::tip[Migration]
Money Tracker uses ESLint version 8, it is planned to migrate it to version 9, with the changes
in the configuration files.
:::

The configuration file in the root of the project then looks like below:

````json title=".eslintrc.json"
{
  "root": true,
  "ignorePatterns": ["!**/*"],
  "plugins": ["@nx", "html"],
  "overrides": [
    {
      "files": ["*.ts", "*.tsx", "*.js", "*.jsx"],
      "rules": {
        "@nx/enforce-module-boundaries": [
          "error",
          {
            "enforceBuildableLibDependency": true,
            "allow": [],
            "depConstraints": [
              {
                "sourceTag": "*",
                "onlyDependOnLibsWithTags": ["*"]
              }
            ]
          }
        ]
      }
    },
    {
      "files": ["*.ts", "*.tsx"],
      "extends": ["plugin:@nx/typescript"],
      "rules": {}
    },
    {
      "files": ["*.js", "*.jsx"],
      "extends": ["plugin:@nx/javascript"],
      "rules": {}
    },
    {
      "files": ["*.spec.ts", "*.spec.tsx", "*.spec.js", "*.spec.jsx"],
      "env": {
        "jest": true
      },
      "rules": {}
    }
  ]
}

````

There is one rule `@nx/enforce-module-boundaries` which is specific for Nx monorepo approach, 
and it should be checked for the code to stay within the module borders.


Library and application ESLint configurations are inherited from the root, for example:

````json title="apps/money-tracker-ui/.eslintrc.json"
{
  "extends": ["../../.eslintrc.json"],
  "plugins": ["html"]
}
````

Nx project configuration file should then contain a `lint` task with files
masks to process:

````json
{
  "name": "money-tracker-ui",
  "prefix": "app",
  "targets": {
    "lint": {
      "executor": "@nx/eslint:lint",
      "outputs": [
        "{options.outputFile}"
      ],
      "options": {
        "lintFilePatterns": [
          "apps/money-tracker-ui/**/*.ts",
          "apps/money-tracker-ui/**/*.html"
        ]
      }
    }
  }
}
````
Linting can be run with (to fix add `-- --fix`):
````bash
 nx lint
 nx run shared-components:lint
 nx run model:lint
````