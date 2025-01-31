---
sidebar_position: 1
tags:
  - typescript
  - webpack
  - jest
---
# Absolute Imports Mapping

To have wonderful and concise import like these:

```typescript
import { RootState, addTask, toggleInfo } from '@/store/reducer';
import { ETaskStatus } from "@/types/model";
```

Use `tsconfig.json` with the following config lines, where `path`
specifies a set of entries that re-map imports to additional lookup locations and
`baseUrl` specifies the base directory to resolve non-relative module names:

```json title="tsconfig.json"
{
  "compilerOptions": {
    "baseUrl": "./src",   
    "paths": {     
      "@/*": ["./*"]
    }    
  }
}

```
Also, if the project uses [Webpack](https://webpack.js.org/), the module paths must be updated:

````javascript title="cfg/webpack.server.config.js"
/* eslint-disable @typescript-eslint/no-var-requires */
const path = require("path");

module.exports = {
    target: "node",
    //..
    resolve: {
        extensions: [".js", ".jsx", ".ts", ".tsx", ".json"],
        alias: {
            '@/*': path.resolve(__dirname, "../src/*"),
        }
    },
    //..
};
````
For projects using [Jest](https://jestjs.io/), another change has to be made:

````javascript
const path = require("path");
module.exports = {
    //..
    moduleNameMapper: {
        //..
        '^@/(.*)$': ['<rootDir>/src/$1'],
    }
    //..
}
````
