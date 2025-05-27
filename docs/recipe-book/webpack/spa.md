---
sidebar_position: 1
tags:
  - webpack
  - spa
---

# Webpack Single Page Application

This type of projects requires the following list of dependencies:
````json title="package.json"
{
  "devDependencies": {
    "@hot-loader/react-dom": "^17.0.1",
    "clean-webpack-plugin": "^4.0.0",
    "html-webpack-plugin": "^4.5.2",
    "webpack": "^4.42.0",
    "webpack-cli": "^3.3.11",
    "webpack-dev-middleware": "^3.7.3",
    "webpack-dev-server": "^3.10.3",
    "webpack-hot-middleware": "^2.25.0"
  }
}
````

A single-page application has only one Webpack configuration file:

````javascript title="webpack.config.js"
const path = require('path');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const { DefinePlugin } = require("webpack");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

const NODE_ENV = process.env.NODE_ENV;
const IS_DEV = NODE_ENV === "development";
const IS_PROD = NODE_ENV === "production";
const GLOBAL_CSS_REGEXP = /\.global\.css$/;
const DEV_PLUGINS = [ new CleanWebpackPlugin() ];
const COMMON_PLUGINS = [ 
  new HTMLWebpackPlugin({ template: path.resolve(__dirname, 'index.html')}), 
  new DefinePlugin({'process.env.CLIENT_ID': `'${process.env.CLIENT_ID}'`}) 
]

function setupDevtool() {
  if (IS_DEV) {
    return "eval";
  }

  if (IS_PROD) {
    return false;
  }
}

module.exports = {
   resolve: {
     extensions: ['.js', '.jsx', '.ts', '.tsx', '.json']
   }, 
   mode: NODE_ENV || 'development',
   entry: path.resolve(__dirname, 'src/index.jsx'), 
   output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'index.js'
  },
   module: {
    rules: [{
          test: /\.[tj]sx?$/,
          use: ['ts-loader']
        },
        {
          test: /\.css$/,
          use: [
            "style-loader",
            {
              loader: "css-loader",
              options: {
                modules: {
                  mode: "local",
                  localIdentName: "[name]__[local]--[hash:base64:5]",
                }
              }
            }
          ],
          exclude: GLOBAL_CSS_REGEXP
        },
        {
          test: /\.less$/,
          use: [
            "style-loader",
            {
              loader: "css-loader",
              options: {
                modules: {
                  mode: "local",
                  localIdentName: "[name]__[local]--[hash:base64:5]",
                },
              },
            },
            "less-loader"
          ]
        },
        {
          test: GLOBAL_CSS_REGEXP,
          use: [
            "style-loader",
            "css-loader"
          ]
        }
      ]
   },
   plugins: IS_DEV ? DEV_PLUGINS.concat(COMMON_PLUGINS) : COMMON_PLUGINS,
   devServer: {
    port: 3000,
    open: true,
    hot: IS_DEV
   },
   devtool: setupDevtool()
};
````
:::info[Dev Server]
Development server is SPA is [Webpack DevServer](https://webpack.js.org/configuration/dev-server/)
:::
