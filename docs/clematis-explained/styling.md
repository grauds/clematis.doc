---
sidebar_position: 2
---

# Styling

## Money Tracker

This application uses Nx and Angular with Tailwind CSS / Sass to style components, although Angular works with any tool that outputs CSS. 

### Tailwind

[Tailwind CSS](https://tailwindcss.com) dependency is included for the whole project:

```json title="package.json"
dependencies: {
    ...
    "tailwindcss": "^3.4.12"
    ...
}
```

The main configuration file is in the main web application source directory in it's default form, see [Nx docs](https://nx.dev/recipes/angular/using-tailwind-css-with-angular-projects):

```typescript title="apps/money-tracker-ui/tailwind.config.js"
const { createGlobPatternsForDependencies } = require('@nrwl/angular/tailwind');
const { join } = require('path');

module.exports = {
  content: [
    join(__dirname, 'src/**/!(*.stories|*.spec).{ts,html}'),
    ...createGlobPatternsForDependencies(__dirname),
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

```

### Sass

[Sass aka Syntactically Awesome Style Sheets](https://sass-lang.com) dependency is included for the whole project as well:

```json title="package.json"
dependencies: {
    ...
    "sass": "^1.79.3",
    "sass-loader": "^13.3.3"
    ...
}
```

Tailwind CSS is imported in `styles.sass`:

```sass title="apps/money-tracker-ui/src/styles.sass"
@tailwind base
@tailwind components
@tailwind utilities
```

So the both preprocessors are available in the project and in its components.


### Material UI Theme

The Material Indigo theme is included in `project.json` with other CSS files, for example with styles.css and styles.sass:

```json title="apps/money-tracker-ui/project.json"
"styles": [
    "./node_modules/@angular/material/prebuilt-themes/indigo-pink.css",
    "apps/money-tracker-ui/src/styles.css",
    "apps/money-tracker-ui/src/styles.sass"
],
```

### View Encapsulation

By default, Angular uses emulated encapsulation so that a component's styles only apply to elements defined in that component's template. 

More information: [Angular Styling Components] (https://angular.dev/guide/components/styling#)


## Pomodoro

The application is using React and Webpack, therefore the latter takes care of the [Leaner Style Sheets aka Less](https://lesscss.org) configuration. Less allows variables, mixins, nested classes, operations, functions and many more if compared to convensional CSS. 

### Less

We have CSS and Less files configured for loading and processing in Webpack, but it would be possible to configure Sass or any other pre-processor in the same manner:

```json title="cfg/webpack.server.config.js"
 module: {
    rules: [
      {
        test: /\.less$/,
        use: [
          {
            loader: "css-loader",
            options: {
              modules: {
                mode: "local",
                localIdentName: "[name]__[local]--[hash:base64:5]",
              },
              onlyLocals: true
            }
          },
          "less-loader"
        ]
      },
      ...
```

The configuration uses `css-loader` library which is enlisted in dev dependencies of `package.json` file:

```json title="package.json"
devDependencies: {
    ...
    "css-loader": "^3.6.0",
    ...
}
```

### CSS Modules

Components styles encapsulation is done with a help of CSS modules in the Webpack excerpt above, see [Webpack CSS-Loader](https://webpack.js.org/loaders/css-loader/#modules) for more options:

```json 
options: {
    modules: {
        mode: "local",
        localIdentName: "[name]__[local]--[hash:base64:5]",
    },
    onlyLocals: true
}
```


### CSS Variables and Themes

Pomodoro extensively uses [CSS Variables](https://www.w3schools.com/css/css3_variables.asp) in the global CSS file, using them to create switchable themes, which override the variables with values from the theme pallettes:

```css title="src/main.global.css"
:root {
  --OFF: ; 
  --ON: initial;

  --black: #333333;
  --whitelightness: 100%;
  --white: hsl(0, 0%, var(--whitelightness));
  --greyF3: #f3f3f3;
  --grey33: #333;
  --greyEC: #ececec;
  --greyCC: #cccccc;
  --greyF4: hsl(0, 0%, calc(var(--whitelightness) - 4%));
  --greyDE: #DEDEDE;
  --greyEE: #EEEEEE;
  ...
```

For instance, a theme could be put down like below, note how `var()` works when it chooses a correct colour for the active theme:

```css
@media (prefers-color-scheme: light) {
  :root {
    --background: var(--light, var(--white)) var(--dark, var(--grey33)) var(--system, var(--white));
    --backgroundSecondary: var(--light, var(--greyF4)) var(--dark, var(--grey66)) var(--system, var(--greyF4));
    --foreground: var(--light, var(--grey33)) var(--dark, var(--white)) var(--system, var(--grey33));
    --accent: var(--light, var(--red)) var(--dark, var(--brightBlue)) var(--system, var(--red));
  }
}
```
It then can be switched to dark or back to light using Redux store variables:

```typescript 
export type RootState = {
  ...
  theme: ETheme;
  ...
}
```

The actual switch in the DOM tree happens in one of the wrapper components - `<Layout />`:

```typescript title="src/shared/components/Layout/Layout.tsx"
useLayoutEffect(() => {
    if (theme === ETheme.LIGHT) {
      document.documentElement.classList.remove(themeDark);
      document.documentElement.classList.add(themeLight);
      document.documentElement.classList.remove(themeSystem); 
    } else if (theme === ETheme.DARK) {
      document.documentElement.classList.remove(themeLight);
      document.documentElement.classList.add(themeDark);  
      document.documentElement.classList.remove(themeSystem); 
    } else {
      document.documentElement.classList.remove(themeLight); 
      document.documentElement.classList.remove(themeDark);  
      document.documentElement.classList.add(themeSystem);         
    }
  }, [theme]);

```



## Cosmic


 
