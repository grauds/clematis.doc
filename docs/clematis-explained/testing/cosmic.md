---
sidebar_position: 4
tags:
  - vitest
  - testing-library
---

# Cosmic And Vitest

Cosmic doesn't use [Enzyme](https://enzymejs.github.io/enzyme/), since
Enzyme library is [discontinued](https://dev.to/wojtekmaj/enzyme-is-dead-now-what-ekl),
the official replacement for it is
[React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) with [Vitest](https://vitest.dev/).


## Installation

There are a few dependencies that need to be installed for Vitest and Testing Library:

````json title="package.json"
{
  "devDependencies": {
    "@testing-library/jest-dom": "^5.16.1",
    "@testing-library/react": "^16.1.0",
    "@testing-library/user-event": "^14.5.2",
    "vitest": "^2.1.8"
  }
}
````
The configuration file for Vitest contains paths resolving and [the choice of
environment](https://vitest.dev/guide/environment):

````typescript title="vitest.config.ts"
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
  },
});

````
:::info[Documentation]
For reference, [jsdom](https://github.com/jsdom/jsdom) documentation.
:::

## A Shallow Test

To test a component in isolation it is enough to utilize the following template:

````typescript jsx
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import Component from './Component';

describe('App Component', () => {
    it('should render without crashing', () => {
        const {container} = render(<Component />);
        expect(container).toBeDefined();
    });
})
````
The key function is [`render`](https://testing-library.com/docs/react-testing-library/api/#render)
which writes the component being tested to virtual DOM returning the object which can be used in the tests.

## Testing DOM

More complex components tests require more context to be implemented. To explore the rendered
DOM and assert various facts one will have to use [`@testing-library/jest-dom`](https://github.com/testing-library/jest-dom).
The library is compatible with Vitest.

````typescript jsx title="src/App.test.tsx"
import { describe, it, expect } from 'vitest';

import { Provider } from 'react-redux';
import { MemoryRouter, Routes, Route } from 'react-router';

import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import App from './App';
import { store } from './lib/store';

const renderWithProviders = (ui: React.ReactElement, { route = '/' } = {}) => {
  window.history.pushState({}, 'Test page', route);

  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route path="/" element={ui} />
        </Routes>
      </MemoryRouter>
    </Provider>,
  );
};

describe('App Component', () => {
    it('should render HeaderContainer', () => {
        renderWithProviders(<App/>);
        expect(screen.getByRole('banner')).toBeInTheDocument();
    });
})

````
Also, the above example uses Redux provider with a real application store (can be replaced
with a mock one) and Routes provider from [React Router](https://reactrouter.com/) library.

## Dialogs Testing

Dialogs require an additional element to be inserted into DOM tree, so the tests should
create one:

````typescript jsx title="src/components/Dialog/Dialog.test.tsx"
import { vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

import { Dialog } from './Dialog';

describe('Dialog Component', () => {
    const modalRoot = document.createElement('div');
    modalRoot.setAttribute('id', 'modal_root');
    document.body.appendChild(modalRoot);
    //...
})
````
In this example, `Dialog` uses `<div id='modal_root' />` as a host element, and it is created
before tests.

## Mocking Redux Toolkit Queries

TBA