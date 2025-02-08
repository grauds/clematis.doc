---
sidebar_position: 3
tags:
  - webpack
  - vite
  - spa
  - ssr
  - esbuild
---

# Module Bundlers

## Money Tracker

Angular or Nx both use
[esbuild](https://esbuild.github.io) by default now. For Money Tracker application,
however, build is done with [`@angular-devkit/build-angular:browser`](https://www.npmjs.com/package/@angular-devkit/build-angular)
which uses [Webpack](https://webpack.js.org/). 

:::tip[Can Be Done Better]
Angular team in turn encourages to
use the [new build system](https://angular.dev/tools/cli/build-system-migration#).
:::

### Application Configuration

Each module in mono-repository has `project.json` file where build configuration 
can also be specified in the corresponding section:

````json title="apps/money-tracker-ui/project.json"
{
   "build": {
      "executor": "@angular-devkit/build-angular:browser",
      "outputs": ["{options.outputPath}"],
      "options": {
        "outputPath": "dist/apps/money-tracker-ui",
        "index": "apps/money-tracker-ui/src/index.html",
        "main": "apps/money-tracker-ui/src/main.ts",
        "polyfills": "apps/money-tracker-ui/src/polyfills.ts",
        "tsConfig": "apps/money-tracker-ui/tsconfig.app.json",
        "inlineStyleLanguage": "sass",
        "assets": [
          "apps/money-tracker-ui/src/favicon.ico",
          "apps/money-tracker-ui/src/assets"
        ],
        "styles": [
          "./node_modules/@angular/material/prebuilt-themes/indigo-pink.css",
          "apps/money-tracker-ui/src/styles.css",
          "apps/money-tracker-ui/src/styles.sass"
        ],
        "scripts": [],
        "allowedCommonJsDependencies": ["keycloak-js", "base64-js", "js-sha256"]
      },
      "configurations": {
        "default": {
          "budgets": [
            {
              "type": "initial",
              "maximumWarning": "5mb",
              "maximumError": "15mb"
            },
            {
              "type": "anyComponentStyle",
              "maximumWarning": "2kb",
              "maximumError": "4kb"
            }
          ],
          "outputHashing": "all"
        }
      },
      "defaultConfiguration": "default"
    }

}
````

### Library Configuration

Build executors for libraries are different, for example:

````json
{
  "build": {
    "executor": "@nx/angular:package",
    "outputs": [
      "{workspaceRoot}/dist/{projectRoot}"
    ]
  }
}
````

## Pomodoro 

Pomodoro is configured to use Server Side Rendering just to demo the approach, 
since the application is not only the timer, but mostly a sandbox for React/Webpack stack.

### Webpack And Server Side Rendering

Server Side Rendering (SSR) is configured by [Webpack 5](https://webpack.js.org/) for Pomodoro. 
There are a few packages that need to be installed first:

````json title="package.json"
{
  "dependencies": {
    "compression": "^1.7.4",
    "express": "^4.21.0",
    "helmet": "^7.1.0",
    "react-dom": "^17.0.2" 
  },
  "devDependencies": {
    "clean-webpack-plugin": "^4.0.0",
    "html-webpack-plugin": "^4.5.2",
    "webpack": "^5.97.1",
    "webpack-cli": "^5.1.4",
    "webpack-dev-middleware": "^3.7.3",
    "webpack-dev-server": "^3.11.3",
    "webpack-hot-middleware": "^2.26.1"
  }
}
````
The configuration file is:

````javascript title="webpack.config.js"
const webpackClientConfig = require('./cfg/webpack.client.config');
const webpackServerConfig = require('./cfg/webpack.server.config');

module.exports = [webpackClientConfig, webpackServerConfig];
````
It just includes two more webpack configuration files, one for client and another for server
and returns joint configuration in a tuple.

### Express Web Framework

Pomodoro uses [express 4](https://expressjs.com/) to serve rendered HTML to clients:

````typescript title="src/server/server.js"
import express from 'express';
import ReactDOM from 'react-dom/server';
import compression from 'compression';
import helmet from 'helmet';

import { App } from '@/App';

import { indexTemplate } from './indexTemplate';

const app = express();

const PORT = process.env.PORT || 3000;

app.use('/static', express.static('./dist/client'));

app.use(compression());
app.use(
  helmet({
    contentSecurityPolicy: false,
  }),
);

app.get('*', (req, res) => {
  res.send(indexTemplate(ReactDOM.renderToString(App())));
});

app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});

````
`Express` server uses [`ReactDOM.renderToString(App())`](https://react.dev/reference/react-dom/server/renderToString)
to get HTML to send (to be hydrated later on the client side), also
it uses [`compression`](https://expressjs.com/en/resources/middleware/compression.html)
middleware to gzip the response and [`helmet`](https://github.com/helmetjs/helmet)
middleware to disable `Content-Security-Policy` in our case.  

### Server HTML Index Template

It's a JavaScript file which export a basic HTML file with placeholder for 
React rendered content, see line ` res.send(indexTemplate(ReactDOM.renderToString(App())))`
above:

````javascript title="src/server/indexTemplate.js"
export const indexTemplate = (content) => `
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Pomodoro</title>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🍅</text></svg>">
        <script src="/static/client.js" type="application/javascript"></script>
    </head>
    <body>
      <div id="react_root">${content}</div>
      <div id="modal_root"></div>
    </body>
</html>
`;
````
### Server Rendering Configuration

Webpack configuration for the server side is used to actually produce the HTML which is 
mentioned above. Is uses [`webpack-node-externals`](https://www.npmjs.com/package/webpack-node-externals)
to exclude node modules from the output, obviously, they are included on the client side
to be downloaded once, not with every page request from the server:

````javascript title="cfg/webpack.server.config.js"
/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const { DefinePlugin } = require('webpack');
const nodeExternals = require('webpack-node-externals');

const NODE_ENV = process.env.NODE_ENV;
const GLOBAL_CSS_REGEXP = /\.global\.css$/;
const COMMON_PLUGINS = [
    new DefinePlugin({ 'process.env.CLIENT_ID': `'${process.env.CLIENT_ID}'` }),
];

module.exports = {
    target: 'node',
    mode: NODE_ENV || 'development',
    entry: path.resolve(__dirname, '../src/server/server.js'),
    output: {
        path: path.resolve(__dirname, '../dist/server'),
        filename: 'server.js',
    },
    resolve: {
        extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
        alias: {
            '@/*': path.resolve(__dirname, '../src/*'),
        },
    },
    externals: [nodeExternals()],
    module: {
        rules: [
            {
                test: /\.[tj]sx?$/,
                use: ['ts-loader'],
            },
            {
                test: /\.css$/,
                use: [
                    {
                        loader: 'css-loader',
                        options: {
                            modules: {
                                mode: 'local',
                                localIdentName: '[name]__[local]--[hash:base64:5]',
                            },
                            onlyLocals: true,
                        },
                    },
                ],
                exclude: GLOBAL_CSS_REGEXP,
            },
            {
                test: /\.less$/,
                use: [
                    {
                        loader: 'css-loader',
                        options: {
                            modules: {
                                mode: 'local',
                                localIdentName: '[name]__[local]--[hash:base64:5]',
                            },
                            onlyLocals: true,
                        },
                    },
                    'less-loader',
                ],
            },
            {
                test: GLOBAL_CSS_REGEXP,
                use: ['css-loader'],
            },
            {
                test: /\.(ogg|mp3|wav|mpe?g)$/i,
                loader: 'file-loader',
                options: {
                    name: '[path][name].[ext]',
                },
            },
        ],
    },
    optimization: {
        minimize: false,
    },
    plugins: COMMON_PLUGINS,
};
````

### Client Rendering Configuration

Client code is contained in one file below and only does one thing, 
it is [hydrating](https://18.react.dev/reference/react-dom/hydrate#hydrating-server-rendered-html)
HTML which has been produced by server-side React environment:

````typescript jsx title="src/client/index.jsx"
import * as React from 'react';
import * as ReactDom from 'react-dom';
import { App } from '@/App';

window.addEventListener('load', () => {
  ReactDom.hydrate(<App />, document.getElementById('react_root'));
});
````
Webpack configuration file for the client side is similar for the server side, 
except for it adds `webpack-hot-middleware` and `style-loader` plugins, 
which are not necessary on the server, since they are needed for visual representation 
of the layout and for work in browsers. 

Also, there is a DEV/PROD switch (from `process.env.NODE_ENV`) configured as well:

````javascript title="cfg/webpack.client.config.js"
/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const { HotModuleReplacementPlugin, DefinePlugin } = require('webpack');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const NODE_ENV = process.env.NODE_ENV;
const IS_DEV = NODE_ENV === 'development';
const IS_PROD = NODE_ENV === 'production';
//..
const DEV_PLUGINS = [
  new CleanWebpackPlugin(),
  new HotModuleReplacementPlugin(),
];
const COMMON_PLUGINS = [
  new DefinePlugin({ 'process.env.CLIENT_ID': `'${process.env.CLIENT_ID}'` }),
];

function setupDevtool() {
  if (IS_DEV) {
    return 'eval';
  }

  if (IS_PROD) {
    return false;
  }
}

function getEntry() {
  if (IS_PROD) {
    return [path.resolve(__dirname, '../src/client/index.jsx')];
  }
 // adding HMR support for development configuration
  return [
    path.resolve(__dirname, '../src/client/index.jsx'),
    'webpack-hot-middleware/client?path=http://localhost:3001/static/__webpack_hmr',
  ];
}

module.exports = {
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
    alias: {
      'react-dom': IS_DEV ? '@hot-loader/react-dom' : 'react-dom',
      '@/*': path.resolve(__dirname, '../src/*'),
    },
  },
  mode: NODE_ENV || 'development',
  entry: getEntry(),
  output: {
    path: path.resolve(__dirname, '../dist/client'),
    filename: 'client.js',
    publicPath: '/static/',
  },
  module: {
    rules: [
      {
        test: /\.[tj]sx?$/,
        use: ['ts-loader'],
      },
      //..
      {
        test: /\.less$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              modules: {
                mode: 'local',
                localIdentName: '[name]__[local]--[hash:base64:5]',
              },
            },
          },
          'less-loader',
        ],
      },
      {
        test: GLOBAL_CSS_REGEXP,
        use: ['style-loader', 'css-loader'],
      }
      //..
    ],
  },
  devtool: setupDevtool(),
  plugins: IS_DEV ? DEV_PLUGINS.concat(COMMON_PLUGINS) : COMMON_PLUGINS,
};

````


### Project Layout

This is a short version of the full layout:
1. `client` folder contains code only for client side.
2. `server` folder is for server side.
3. `shared` folder contains code for both, this is where components are put.

````
src
 ├─ client
 │ └─ index.jsx
 ├─ server
 │ ├─ indexTemplate.js
 │ └─ server.js
 ├─ shared
 │ ├─ Header
 │ │ ├─ Stats
 │ │ ├─ Title
 │ │ ├─ __tests__
 │ │ │ ├─ __snapshots__
 │ │ │ │ └─ header.test.tsx.snap
 │ │ │ └─ header.test.tsx
 │ │ ├─ Header.tsx
 │ │ ├─ header.less
 │ │ └─ index.ts
 │ │ ...
 ├─ ...
 ├─ App.tsx
 └─ main.global.css
````

:::info[Single Page Application]
In addition to this SSR configuration, there is a typical
Clematis Webpack SPA configuration in [The Recipes Book](../recipes-book/Webpack/spa.md)
:::

## Cosmic

Cosmic has chosen Vite not to speed up the development process, but also to be
a React/Vite sandbox. 

### Vite Configuration 

Vite requires the following set of dependencies to be included into a project:

````json title="package.json"
{
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.4",
    "vite": "^6.0.11",
    "vite-plugin-eslint2": "^5.0.3",
    "vite-tsconfig-paths": "^5.1.4"
  }
}
````
It is easy to start off with this configuration:
````typescript title="vite.config.ts"
/** @type {import('vite').UserConfig} */

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  server: {
    port: 3030,
  },
  preview: {
    port: 3000,
  },
});

````
However, it is more convenient to use scaffolding:
````bash
npm create vite@latest
````
Vite uses two plugins:
1. [@vitejs/plugin-react](https://www.npmjs.com/package/@vitejs/plugin-react) contains
fast refresh for development, uses the automatic JSX runtime, uses custom Babel plugins and
presets.
2. [vite-tsconfig-paths](https://www.npmjs.com/package/vite-tsconfig-paths) the ability to resolve imports using TypeScript's path mapping.

