# Typescript absolute imports remapped

To have wonderful and consize import like these:

```typescript
import { RootState, addTask, toggleInfo } from '@/store/reducer';
import { ETaskStatus } from "@/types/model";
```

Use `tsconfig.json` with the following config lines:

```json title="tsconfig.json"
{
  "compilerOptions": {
   //...
    "baseUrl": "./src",  // Specify the base directory to resolve non-relative module names. 
    "paths": {  // Specify a set of entries that re-map imports to additional lookup locations.    
      "@/*": ["./*"]
    },
    //...   
  }
}

```
