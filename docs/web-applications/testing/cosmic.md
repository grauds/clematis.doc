---
sidebar_position: 4
tags:
  - vitest
  - testing-library
  - mock-service-worker
  - coverage
  - istanbul
  - jsdom
---

# Cosmic And Vitest

Cosmic doesn't use [Enzyme](https://enzymejs.github.io/enzyme/), since
the Enzyme library is [discontinued](https://dev.to/wojtekmaj/enzyme-is-dead-now-what-ekl);
the official replacement is
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
The [jsdom](https://github.com/jsdom/jsdom) environment is the same as for 
Jest tests, meaning there will be no real browsers running these tests.
jsdom package simulates a DOM environment as if you were in the browser.
:::

## A Shallow Test

To test a component in isolation, it is enough to utilize the following template:

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
DOM and assert various facts, one will have to use [`@testing-library/jest-dom`](https://github.com/testing-library/jest-dom),
for example, to make sure the element found by a `screen` query exists
in the virtual DOM:

````typescript jsx title="src/App.test.tsx"
import { describe, it, expect } from 'vitest';
//...
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
//...
import App from './App';
//...
describe('App Component', () => {
    it('should render HeaderContainer', () => {
        render(<App/>);
        expect(screen.getByRole('banner')).toBeInTheDocument();
    });
})

````

### Accessibility Tree

The preferred way to find the element in the DOM according to testing library documentation is 
to use [`getByRole`](https://testing-library.com/docs/queries/byrole) query. This
query uses [Accessibility Tree](https://developer.mozilla.org/en-US/docs/Glossary/Accessibility_tree)
which is computed automatically by browsers, so 
developers don't have to care about setting up any additional attributes. In some real 
cases though such explicit ARIA attributes are required, for instance, if `<button />` element can't
be used in place of `<div />` element but some user interaction is happening.


##  Testing Dialogs

Dialogs require an additional element to be inserted into the DOM tree, so the tests should
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

## Using Redux Store

Since Cosmic application uses Redux Toolkit, 
it also uses [the recommended way](https://redux.js.org/usage/writing-tests) of 
testing components with Redux store.

### Mock Server Communication

The idea is to have the same store as in production, not a mocked one, and to only mock communication 
with the server with the help of [Mock Service Worker](https://mswjs.io). It needs to be installed first:

````bash
npm install msw@latest --save-dev
````

Some server responses can be fetched from a real backend too and saved to separate
files in `__test__` directory, for example:

````typescript title="src/containers/ProjectsContainer/__test__/projectsResponse.ts"
export const projectsResponse = {
  _embedded: {
    data: [
      {
        id: '47ef2eb2-4fd3-47bf-9b9d-3724e8218850',
        name: '/01/Тестовый проект',
        description: 'Тестовый новый проект',
        _links: {
          self: {
            href: 'http://192.168.1.118:18089/api/projects/47ef2eb2-4fd3-47bf-9b9d-3724e8218850',
          },
          project: {
            href: 'http://192.168.1.118:18089/api/projects/47ef2eb2-4fd3-47bf-9b9d-3724e8218850',
          },
          runs: {
            href: 'http://192.168.1.118:18089/api/projects/47ef2eb2-4fd3-47bf-9b9d-3724e8218850/runs',
          },
        },
      }
      //...
    ],
  },
  _links: {
    first: {
      href: 'http://192.168.1.118:18089/api/projects/search/filter?searchText=&page=0&size=7&sort=name,asc',
    },
    self: {
      href: 'http://192.168.1.118:18089/api/projects/search/filter?searchText=&page=0&size=7&sort=name,asc',
    },
    next: {
      href: 'http://192.168.1.118:18089/api/projects/search/filter?searchText=&page=1&size=7&sort=name,asc',
    },
    last: {
      href: 'http://192.168.1.118:18089/api/projects/search/filter?searchText=&page=217&size=7&sort=name,asc',
    },
  },
  page: {
    size: 7,
    totalElements: 1524,
    totalPages: 218,
    number: 0,
  },
};
````
Next, this file can be used to return a response to a proper query.
Note that backend domain name should also be taken into account while mocking via some
high order function:

````typescript title=""
const qa = (path: string) => {
  return new URL(path, 'http://192.168.1.118:18089').toString();
};
````
The following code can be put to some shared place for all the tests to reach it:

````typescript
import {
  projectsResponse,
} from './__test__/projectsResponse';

export const handlers = [
  http.get(qa('api/projects/search/filter'), async () => {
    await delay(150);
    return HttpResponse.json(projectsResponse);
  })
  //...  
];

const server = setupServer(...handlers);
// Enable API mocking before tests.
beforeAll(() => server.listen());
// Reset any runtime request handlers we may add during the tests.
afterEach(() => server.resetHandlers());
// Disable API mocking after the tests are done.
afterAll(() => server.close());
````
The line `afterEach(() => server.resetHandlers());` is needed if tests want any additional
handlers to be installed or some existing ones modified locally and forgotten after 
particular test:

````typescript title="src/containers/ProjectsContainer/ProjectsContainer.test.tsx"
server.use(
  http.get(qa('api/projects/search/filter'), async () => {
    await delay(150);
    return HttpResponse.json({});
  }),
);
````

:::tip[Switching parameters]
There is no need to make placeholders for switching parameters in handlers,
see https://mswjs.io/docs/recipes/query-parameters
:::

### Test Example

This example works with a <i>connected</i> component. 
1. First, mocking returns
an empty list of projects to allow `ProjectsContainer` to display controls
to display a dialog for a new project.
2. After the button which calls up the dialog
is clicked in the test, a dialog is displayed.
3. Test searches for new
project name text field and provides a name for the new project
4. After the name is filled in, test clicks the Save button and validates
that `onSelectProject` callback which selects the newly created project is called.

````typescript jsx title="src/containers/ProjectsContainer/ProjectsContainer.test.tsx"
it('calls onSelectProject when NewProjectDialog is confirmed', async () => {
    server.use(
      http.get(qa('api/projects/search/filter'), async () => {
        await delay(150);
        return HttpResponse.json({});
      }),
    );
    const props: IProjectsContainerProps = {
      onSelectProject: vi.fn(),
    };
    renderComponent(props);
    fireEvent.click(
      await waitFor(
        () => {
          return screen.getByText('Новый проект');
        },
        { timeout: 3000 },
      ),
    );
    const input = screen.getByRole('textbox', { name: 'Имя*' });
    fireEvent.change(input, { target: { value: 'test' } });
    fireEvent.click(screen.getByRole('button', { name: 'Сохранить' }));

    await waitFor(() => {
      expect(props.onSelectProject).toHaveBeenCalled();
    });
  });
````

## Coverage

Vitest is configured to report coverage in the same format as the other projects:

````typescript
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
//...
  test: {
    globals: true,
    environment: 'jsdom',
    coverage: {
      reporter: ['cobertura'],
      provider: 'istanbul', // or 'v8'
    },
  },
});

````
Note that this setup requires another dependency to be added:

````json title="package.json"
{
  "devDependencies": {
    "@vitest/coverage-istanbul": "^3.0.6"
  }
}
````