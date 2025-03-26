"use strict";(self.webpackChunkclematis_doc=self.webpackChunkclematis_doc||[]).push([[3083],{94657:(e,n,t)=>{t.r(n),t.d(n,{assets:()=>c,contentTitle:()=>a,default:()=>p,frontMatter:()=>o,metadata:()=>s,toc:()=>l});const s=JSON.parse('{"id":"web-applications/testing/cosmic","title":"Cosmic And Vitest","description":"Cosmic doesn\'t use Enzyme, since","source":"@site/docs/web-applications/testing/cosmic.md","sourceDirName":"web-applications/testing","slug":"/web-applications/testing/cosmic","permalink":"/clematis.doc/docs/web-applications/testing/cosmic","draft":false,"unlisted":false,"tags":[{"inline":true,"label":"vitest","permalink":"/clematis.doc/docs/tags/vitest"},{"inline":true,"label":"testing-library","permalink":"/clematis.doc/docs/tags/testing-library"},{"inline":true,"label":"mock-service-worker","permalink":"/clematis.doc/docs/tags/mock-service-worker"},{"inline":true,"label":"coverage","permalink":"/clematis.doc/docs/tags/coverage"},{"inline":true,"label":"istanbul","permalink":"/clematis.doc/docs/tags/istanbul"},{"inline":true,"label":"jsdom","permalink":"/clematis.doc/docs/tags/jsdom"}],"version":"current","sidebarPosition":4,"frontMatter":{"sidebar_position":4,"tags":["vitest","testing-library","mock-service-worker","coverage","istanbul","jsdom"]},"sidebar":"tutorialSidebar","previous":{"title":"Pomodoro And Jest","permalink":"/clematis.doc/docs/web-applications/testing/pomodoro"},"next":{"title":"Documenting Backend API","permalink":"/clematis.doc/docs/web-applications/backend-api"}}');var i=t(74848),r=t(28453);const o={sidebar_position:4,tags:["vitest","testing-library","mock-service-worker","coverage","istanbul","jsdom"]},a="Cosmic And Vitest",c={},l=[{value:"Installation",id:"installation",level:2},{value:"A Shallow Test",id:"a-shallow-test",level:2},{value:"Testing DOM",id:"testing-dom",level:2},{value:"Accessibility Tree",id:"accessibility-tree",level:3},{value:"Testing Dialogs",id:"testing-dialogs",level:2},{value:"Using Redux Store",id:"using-redux-store",level:2},{value:"Mock Server Communication",id:"mock-server-communication",level:3},{value:"Test Example",id:"test-example",level:3},{value:"Coverage",id:"coverage",level:2}];function d(e){const n={a:"a",admonition:"admonition",code:"code",h1:"h1",h2:"h2",h3:"h3",header:"header",li:"li",ol:"ol",p:"p",pre:"pre",...(0,r.R)(),...e.components};return(0,i.jsxs)(i.Fragment,{children:[(0,i.jsx)(n.header,{children:(0,i.jsx)(n.h1,{id:"cosmic-and-vitest",children:"Cosmic And Vitest"})}),"\n",(0,i.jsxs)(n.p,{children:["Cosmic doesn't use ",(0,i.jsx)(n.a,{href:"https://enzymejs.github.io/enzyme/",children:"Enzyme"}),", since\nthe Enzyme library is ",(0,i.jsx)(n.a,{href:"https://dev.to/wojtekmaj/enzyme-is-dead-now-what-ekl",children:"discontinued"}),";\nthe official replacement is\n",(0,i.jsx)(n.a,{href:"https://testing-library.com/docs/react-testing-library/intro/",children:"React Testing Library"})," with ",(0,i.jsx)(n.a,{href:"https://vitest.dev/",children:"Vitest"}),"."]}),"\n",(0,i.jsx)(n.h2,{id:"installation",children:"Installation"}),"\n",(0,i.jsx)(n.p,{children:"There are a few dependencies that need to be installed for Vitest and Testing Library:"}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-json",metastring:'title="package.json"',children:'{\n  "devDependencies": {\n    "@testing-library/jest-dom": "^5.16.1",\n    "@testing-library/react": "^16.1.0",\n    "@testing-library/user-event": "^14.5.2",\n    "vitest": "^2.1.8"\n  }\n}\n'})}),"\n",(0,i.jsxs)(n.p,{children:["The configuration file for Vitest contains paths resolving and ",(0,i.jsx)(n.a,{href:"https://vitest.dev/guide/environment",children:"the choice of\nenvironment"}),":"]}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-typescript",metastring:'title="vitest.config.ts"',children:"import { defineConfig } from 'vitest/config';\nimport path from 'path';\n\nexport default defineConfig({\n  resolve: {\n    alias: {\n      '@': path.resolve(__dirname, 'src'),\n    },\n  },\n  test: {\n    globals: true,\n    environment: 'jsdom',\n  },\n});\n\n"})}),"\n",(0,i.jsx)(n.admonition,{title:"Documentation",type:"info",children:(0,i.jsxs)(n.p,{children:["The ",(0,i.jsx)(n.a,{href:"https://github.com/jsdom/jsdom",children:"jsdom"})," environment is the same as for\nJest tests, meaning there will be no real browsers running these tests.\njsdom package simulates a DOM environment as if you were in the browser."]})}),"\n",(0,i.jsx)(n.h2,{id:"a-shallow-test",children:"A Shallow Test"}),"\n",(0,i.jsx)(n.p,{children:"To test a component in isolation, it is enough to utilize the following template:"}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-typescript",metastring:"jsx",children:"import { describe, it, expect } from 'vitest';\nimport { render } from '@testing-library/react';\nimport Component from './Component';\n\ndescribe('App Component', () => {\n    it('should render without crashing', () => {\n        const {container} = render(<Component />);\n        expect(container).toBeDefined();\n    });\n})\n"})}),"\n",(0,i.jsxs)(n.p,{children:["The key function is ",(0,i.jsx)(n.a,{href:"https://testing-library.com/docs/react-testing-library/api/#render",children:(0,i.jsx)(n.code,{children:"render"})}),"\nwhich writes the component being tested to virtual DOM returning the object which can be used in the tests."]}),"\n",(0,i.jsx)(n.h2,{id:"testing-dom",children:"Testing DOM"}),"\n",(0,i.jsxs)(n.p,{children:["More complex components tests require more context to be implemented. To explore the rendered\nDOM and assert various facts, one will have to use ",(0,i.jsx)(n.a,{href:"https://github.com/testing-library/jest-dom",children:(0,i.jsx)(n.code,{children:"@testing-library/jest-dom"})}),",\nfor example, to make sure the element found by a ",(0,i.jsx)(n.code,{children:"screen"})," query exists\nin the virtual DOM:"]}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-typescript",metastring:'jsx title="src/App.test.tsx"',children:"import { describe, it, expect } from 'vitest';\n//...\nimport { render, screen } from '@testing-library/react';\nimport '@testing-library/jest-dom';\n//...\nimport App from './App';\n//...\ndescribe('App Component', () => {\n    it('should render HeaderContainer', () => {\n        render(<App/>);\n        expect(screen.getByRole('banner')).toBeInTheDocument();\n    });\n})\n\n"})}),"\n",(0,i.jsx)(n.h3,{id:"accessibility-tree",children:"Accessibility Tree"}),"\n",(0,i.jsxs)(n.p,{children:["The preferred way to find the element in the DOM according to testing library documentation is\nto use ",(0,i.jsx)(n.a,{href:"https://testing-library.com/docs/queries/byrole",children:(0,i.jsx)(n.code,{children:"getByRole"})})," query. This\nquery uses ",(0,i.jsx)(n.a,{href:"https://developer.mozilla.org/en-US/docs/Glossary/Accessibility_tree",children:"Accessibility Tree"}),"\nwhich is computed automatically by browsers, so\ndevelopers don't have to care about setting up any additional attributes. In some real\ncases though such explicit ARIA attributes are required, for instance, if ",(0,i.jsx)(n.code,{children:"<button />"})," element can't\nbe used in place of ",(0,i.jsx)(n.code,{children:"<div />"})," element but some user interaction is happening."]}),"\n",(0,i.jsx)(n.h2,{id:"testing-dialogs",children:"Testing Dialogs"}),"\n",(0,i.jsx)(n.p,{children:"Dialogs require an additional element to be inserted into the DOM tree, so the tests should\ncreate one:"}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-typescript",metastring:'jsx title="src/components/Dialog/Dialog.test.tsx"',children:"import { vi } from 'vitest';\nimport { render, screen, fireEvent } from '@testing-library/react';\nimport '@testing-library/jest-dom';\n\nimport { Dialog } from './Dialog';\n\ndescribe('Dialog Component', () => {\n    const modalRoot = document.createElement('div');\n    modalRoot.setAttribute('id', 'modal_root');\n    document.body.appendChild(modalRoot);\n    //...\n})\n"})}),"\n",(0,i.jsxs)(n.p,{children:["In this example, ",(0,i.jsx)(n.code,{children:"Dialog"})," uses ",(0,i.jsx)(n.code,{children:"<div id='modal_root' />"})," as a host element, and it is created\nbefore tests."]}),"\n",(0,i.jsx)(n.h2,{id:"using-redux-store",children:"Using Redux Store"}),"\n",(0,i.jsxs)(n.p,{children:["Since Cosmic application uses Redux Toolkit,\nit also uses ",(0,i.jsx)(n.a,{href:"https://redux.js.org/usage/writing-tests",children:"the recommended way"})," of\ntesting components with Redux store."]}),"\n",(0,i.jsx)(n.h3,{id:"mock-server-communication",children:"Mock Server Communication"}),"\n",(0,i.jsxs)(n.p,{children:["The idea is to have the same store as in production, not a mocked one, and to only mock communication\nwith the server with the help of ",(0,i.jsx)(n.a,{href:"https://mswjs.io",children:"Mock Service Worker"}),". It needs to be installed first:"]}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-bash",children:"npm install msw@latest --save-dev\n"})}),"\n",(0,i.jsxs)(n.p,{children:["Some server responses can be fetched from a real backend too and saved to separate\nfiles in ",(0,i.jsx)(n.code,{children:"__test__"})," directory, for example:"]}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-typescript",metastring:'title="src/containers/ProjectsContainer/__test__/projectsResponse.ts"',children:"export const projectsResponse = {\n  _embedded: {\n    data: [\n      {\n        id: '47ef2eb2-4fd3-47bf-9b9d-3724e8218850',\n        name: '/01/\u0422\u0435\u0441\u0442\u043e\u0432\u044b\u0439 \u043f\u0440\u043e\u0435\u043a\u0442',\n        description: '\u0422\u0435\u0441\u0442\u043e\u0432\u044b\u0439 \u043d\u043e\u0432\u044b\u0439 \u043f\u0440\u043e\u0435\u043a\u0442',\n        _links: {\n          self: {\n            href: 'http://192.168.1.118:18089/api/projects/47ef2eb2-4fd3-47bf-9b9d-3724e8218850',\n          },\n          project: {\n            href: 'http://192.168.1.118:18089/api/projects/47ef2eb2-4fd3-47bf-9b9d-3724e8218850',\n          },\n          runs: {\n            href: 'http://192.168.1.118:18089/api/projects/47ef2eb2-4fd3-47bf-9b9d-3724e8218850/runs',\n          },\n        },\n      }\n      //...\n    ],\n  },\n  _links: {\n    first: {\n      href: 'http://192.168.1.118:18089/api/projects/search/filter?searchText=&page=0&size=7&sort=name,asc',\n    },\n    self: {\n      href: 'http://192.168.1.118:18089/api/projects/search/filter?searchText=&page=0&size=7&sort=name,asc',\n    },\n    next: {\n      href: 'http://192.168.1.118:18089/api/projects/search/filter?searchText=&page=1&size=7&sort=name,asc',\n    },\n    last: {\n      href: 'http://192.168.1.118:18089/api/projects/search/filter?searchText=&page=217&size=7&sort=name,asc',\n    },\n  },\n  page: {\n    size: 7,\n    totalElements: 1524,\n    totalPages: 218,\n    number: 0,\n  },\n};\n"})}),"\n",(0,i.jsx)(n.p,{children:"Next, this file can be used to return a response to a proper query.\nNote that backend domain name should also be taken into account while mocking via some\nhigh order function:"}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-typescript",metastring:'title=""',children:"const qa = (path: string) => {\n  return new URL(path, 'http://192.168.1.118:18089').toString();\n};\n"})}),"\n",(0,i.jsx)(n.p,{children:"The following code can be put to some shared place for all the tests to reach it:"}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-typescript",children:"import {\n  projectsResponse,\n} from './__test__/projectsResponse';\n\nexport const handlers = [\n  http.get(qa('api/projects/search/filter'), async () => {\n    await delay(150);\n    return HttpResponse.json(projectsResponse);\n  })\n  //...  \n];\n\nconst server = setupServer(...handlers);\n// Enable API mocking before tests.\nbeforeAll(() => server.listen());\n// Reset any runtime request handlers we may add during the tests.\nafterEach(() => server.resetHandlers());\n// Disable API mocking after the tests are done.\nafterAll(() => server.close());\n"})}),"\n",(0,i.jsxs)(n.p,{children:["The line ",(0,i.jsx)(n.code,{children:"afterEach(() => server.resetHandlers());"})," is needed if tests want any additional\nhandlers to be installed or some existing ones modified locally and forgotten after\nparticular test:"]}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-typescript",metastring:'title="src/containers/ProjectsContainer/ProjectsContainer.test.tsx"',children:"server.use(\n  http.get(qa('api/projects/search/filter'), async () => {\n    await delay(150);\n    return HttpResponse.json({});\n  }),\n);\n"})}),"\n",(0,i.jsx)(n.admonition,{title:"Switching parameters",type:"tip",children:(0,i.jsxs)(n.p,{children:["There is no need to make placeholders for switching parameters in handlers,\nsee ",(0,i.jsx)(n.a,{href:"https://mswjs.io/docs/recipes/query-parameters",children:"https://mswjs.io/docs/recipes/query-parameters"})]})}),"\n",(0,i.jsx)(n.h3,{id:"test-example",children:"Test Example"}),"\n",(0,i.jsxs)(n.p,{children:["This example works with a ",(0,i.jsx)("i",{children:"connected"})," component."]}),"\n",(0,i.jsxs)(n.ol,{children:["\n",(0,i.jsxs)(n.li,{children:["First, mocking returns\nan empty list of projects to allow ",(0,i.jsx)(n.code,{children:"ProjectsContainer"})," to display controls\nto display a dialog for a new project."]}),"\n",(0,i.jsx)(n.li,{children:"After the button which calls up the dialog\nis clicked in the test, a dialog is displayed."}),"\n",(0,i.jsx)(n.li,{children:"Test searches for new\nproject name text field and provides a name for the new project"}),"\n",(0,i.jsxs)(n.li,{children:["After the name is filled in, test clicks the Save button and validates\nthat ",(0,i.jsx)(n.code,{children:"onSelectProject"})," callback which selects the newly created project is called."]}),"\n"]}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-typescript",metastring:'jsx title="src/containers/ProjectsContainer/ProjectsContainer.test.tsx"',children:"it('calls onSelectProject when NewProjectDialog is confirmed', async () => {\n    server.use(\n      http.get(qa('api/projects/search/filter'), async () => {\n        await delay(150);\n        return HttpResponse.json({});\n      }),\n    );\n    const props: IProjectsContainerProps = {\n      onSelectProject: vi.fn(),\n    };\n    renderComponent(props);\n    fireEvent.click(\n      await waitFor(\n        () => {\n          return screen.getByText('\u041d\u043e\u0432\u044b\u0439 \u043f\u0440\u043e\u0435\u043a\u0442');\n        },\n        { timeout: 3000 },\n      ),\n    );\n    const input = screen.getByRole('textbox', { name: '\u0418\u043c\u044f*' });\n    fireEvent.change(input, { target: { value: 'test' } });\n    fireEvent.click(screen.getByRole('button', { name: '\u0421\u043e\u0445\u0440\u0430\u043d\u0438\u0442\u044c' }));\n\n    await waitFor(() => {\n      expect(props.onSelectProject).toHaveBeenCalled();\n    });\n  });\n"})}),"\n",(0,i.jsx)(n.h2,{id:"coverage",children:"Coverage"}),"\n",(0,i.jsx)(n.p,{children:"Vitest is configured to report coverage in the same format as the other projects:"}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-typescript",children:"import { defineConfig } from 'vitest/config';\nimport path from 'path';\n\nexport default defineConfig({\n//...\n  test: {\n    globals: true,\n    environment: 'jsdom',\n    coverage: {\n      reporter: ['cobertura'],\n      provider: 'istanbul', // or 'v8'\n    },\n  },\n});\n\n"})}),"\n",(0,i.jsx)(n.p,{children:"Note that this setup requires another dependency to be added:"}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-json",metastring:'title="package.json"',children:'{\n  "devDependencies": {\n    "@vitest/coverage-istanbul": "^3.0.6"\n  }\n}\n'})})]})}function p(e={}){const{wrapper:n}={...(0,r.R)(),...e.components};return n?(0,i.jsx)(n,{...e,children:(0,i.jsx)(d,{...e})}):d(e)}},28453:(e,n,t)=>{t.d(n,{R:()=>o,x:()=>a});var s=t(96540);const i={},r=s.createContext(i);function o(e){const n=s.useContext(r);return s.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function a(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(i):e.components||i:o(e.components),s.createElement(r.Provider,{value:n},e.children)}}}]);