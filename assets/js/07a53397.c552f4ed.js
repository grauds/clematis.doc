"use strict";(self.webpackChunkclematis_doc=self.webpackChunkclematis_doc||[]).push([[8564],{45991:(e,n,s)=>{s.r(n),s.d(n,{assets:()=>r,contentTitle:()=>c,default:()=>d,frontMatter:()=>i,metadata:()=>t,toc:()=>l});const t=JSON.parse('{"id":"recipe-book/webpack/spa","title":"Webpack Single Page Application","description":"This type of projects requires the following list of dependencies:","source":"@site/docs/recipe-book/webpack/spa.md","sourceDirName":"recipe-book/webpack","slug":"/recipe-book/webpack/spa","permalink":"/docs/recipe-book/webpack/spa","draft":false,"unlisted":false,"tags":[{"inline":true,"label":"webpack","permalink":"/docs/tags/webpack"},{"inline":true,"label":"spa","permalink":"/docs/tags/spa"}],"version":"current","sidebarPosition":1,"frontMatter":{"sidebar_position":1,"tags":["webpack","spa"]},"sidebar":"tutorialSidebar","previous":{"title":"Webpack"},"next":{"title":"What is a fullstack developer?","permalink":"/docs/outro"}}');var o=s(74848),a=s(28453);const i={sidebar_position:1,tags:["webpack","spa"]},c="Webpack Single Page Application",r={},l=[];function p(e){const n={a:"a",admonition:"admonition",code:"code",h1:"h1",header:"header",p:"p",pre:"pre",...(0,a.R)(),...e.components};return(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)(n.header,{children:(0,o.jsx)(n.h1,{id:"webpack-single-page-application",children:"Webpack Single Page Application"})}),"\n",(0,o.jsx)(n.p,{children:"This type of projects requires the following list of dependencies:"}),"\n",(0,o.jsx)(n.pre,{children:(0,o.jsx)(n.code,{className:"language-json",metastring:'title="package.json"',children:'{\n  "devDependencies": {\n    "@hot-loader/react-dom": "^17.0.1",\n    "clean-webpack-plugin": "^4.0.0",\n    "html-webpack-plugin": "^4.5.2",\n    "webpack": "^4.42.0",\n    "webpack-cli": "^3.3.11",\n    "webpack-dev-middleware": "^3.7.3",\n    "webpack-dev-server": "^3.10.3",\n    "webpack-hot-middleware": "^2.25.0"\n  }\n}\n'})}),"\n",(0,o.jsx)(n.p,{children:"Single page application has only one Webpack configuration file:"}),"\n",(0,o.jsx)(n.pre,{children:(0,o.jsx)(n.code,{className:"language-javascript",metastring:'title="webpack.config.js"',children:'const path = require(\'path\');\nconst HTMLWebpackPlugin = require(\'html-webpack-plugin\');\nconst { DefinePlugin } = require("webpack");\nconst { CleanWebpackPlugin } = require("clean-webpack-plugin");\n\nconst NODE_ENV = process.env.NODE_ENV;\nconst IS_DEV = NODE_ENV === "development";\nconst IS_PROD = NODE_ENV === "production";\nconst GLOBAL_CSS_REGEXP = /\\.global\\.css$/;\nconst DEV_PLUGINS = [ new CleanWebpackPlugin() ];\nconst COMMON_PLUGINS = [ \n  new HTMLWebpackPlugin({ template: path.resolve(__dirname, \'index.html\')}), \n  new DefinePlugin({\'process.env.CLIENT_ID\': `\'${process.env.CLIENT_ID}\'`}) \n]\n\nfunction setupDevtool() {\n  if (IS_DEV) {\n    return "eval";\n  }\n\n  if (IS_PROD) {\n    return false;\n  }\n}\n\nmodule.exports = {\n   resolve: {\n     extensions: [\'.js\', \'.jsx\', \'.ts\', \'.tsx\', \'.json\']\n   }, \n   mode: NODE_ENV || \'development\',\n   entry: path.resolve(__dirname, \'src/index.jsx\'), \n   output: {\n    path: path.resolve(__dirname, \'dist\'),\n    filename: \'index.js\'\n  },\n   module: {\n    rules: [{\n          test: /\\.[tj]sx?$/,\n          use: [\'ts-loader\']\n        },\n        {\n          test: /\\.css$/,\n          use: [\n            "style-loader",\n            {\n              loader: "css-loader",\n              options: {\n                modules: {\n                  mode: "local",\n                  localIdentName: "[name]__[local]--[hash:base64:5]",\n                }\n              }\n            }\n          ],\n          exclude: GLOBAL_CSS_REGEXP\n        },\n        {\n          test: /\\.less$/,\n          use: [\n            "style-loader",\n            {\n              loader: "css-loader",\n              options: {\n                modules: {\n                  mode: "local",\n                  localIdentName: "[name]__[local]--[hash:base64:5]",\n                },\n              },\n            },\n            "less-loader"\n          ]\n        },\n        {\n          test: GLOBAL_CSS_REGEXP,\n          use: [\n            "style-loader",\n            "css-loader"\n          ]\n        }\n      ]\n   },\n   plugins: IS_DEV ? DEV_PLUGINS.concat(COMMON_PLUGINS) : COMMON_PLUGINS,\n   devServer: {\n    port: 3000,\n    open: true,\n    hot: IS_DEV\n   },\n   devtool: setupDevtool()\n};\n'})}),"\n",(0,o.jsx)(n.admonition,{title:"Dev Server",type:"info",children:(0,o.jsxs)(n.p,{children:["Development server is SPA is ",(0,o.jsx)(n.a,{href:"https://webpack.js.org/configuration/dev-server/",children:"Webpack DevServer"})]})})]})}function d(e={}){const{wrapper:n}={...(0,a.R)(),...e.components};return n?(0,o.jsx)(n,{...e,children:(0,o.jsx)(p,{...e})}):p(e)}},28453:(e,n,s)=>{s.d(n,{R:()=>i,x:()=>c});var t=s(96540);const o={},a=t.createContext(o);function i(e){const n=t.useContext(a);return t.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function c(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(o):e.components||o:i(e.components),t.createElement(a.Provider,{value:n},e.children)}}}]);