---
sidebar_position: 2
tags:
  - jest
  - angular
  - nx
  - jsdom
---

# Money Tracker Testing

By default, Angular uses [Jasmine Testing Framework](https://jasmine.github.io/). This
is a BDD testing framework with [Karma Tests Runner](https://karma-runner.github.io/latest/index.html).
However, Money Tracker has replaced this bundle with [Jest](https://jestjs.io/docs/getting-started).

## Installation

Jest needs the following dev dependencies, along with a [plugin to Nx](https://nx.dev/nx-api/jest):

````json title="package.json"
{
  "devDependencies": {
    "@nx/jest": "19.5.7",
    "@types/jest": "^29.5.13",
    "jest": "^29.7.0",
    "jest-environment-jsdom": "^29.7.0",
    "jest-preset-angular": "^14.2.4",
    "ts-jest": "^29.2.5"
  }
}
````

## Jest And Nx

Jest is configured individually for every application or library within Nx mono repository,
Nx collides all the configurations into one root configuration.

>Nx 18+ provides a utility function called getJestProjectsAsync which retrieves
>a list of paths to all the Jest config files from subprojects
(jump to [docs](https://nx.dev/nx-api/jest#jest)):

````typescript title="jest.config.ts"
import { getJestProjectsAsync } from '@nx/jest';

export default async () => ({
  projects: await getJestProjectsAsync(),
});
````
Also, Nx provides a default base configuration for Jest:

````typescript title="jest.preset.ts"
const nxPreset = require('@nx/jest/preset').default;

module.exports = {
    ...nxPreset,
    coverageReporters: ['clover', 'json', 'text', 'cobertura', 'html'],
    coveragePathIgnorePatterns: [
        'index.js',
        'index.jsx',
        'index.ts',
        '/node_modules/',
    ],
};
````
... and subproject use this [preset](https://jestjs.io/docs/configuration#preset-string),
see the line with `preset: '../../jest.preset.js'` in the following
paragraph.

## Configuration In Subprojects

This example is for `apps/money-tracker-ui` application. The same configuration
is copied to other modules with respect to `displayName`:

````typescript title="apps/money-tracker-ui/jest.config.ts"
/* eslint-disable */
export default {
  displayName: 'money-tracker-ui',
  preset: '../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../coverage/apps/money-tracker-ui/',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': ['jest-preset-angular', {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
    }],
  },
  transformIgnorePatterns: [
    'node_modules/(?!.*\\.mjs$|lodash-es|uri-templates-es)',
  ],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
````
:::info[More info on Jest config]
Note, this `jest.config.ts` uses
[jest-preset-angular](https://thymikee.github.io/jest-preset-angular/) for
Angular components tests. More info on configuration options is in the [docs](https://thymikee.github.io/jest-preset-angular/docs/getting-started/options#brief-explanation-of-config).
:::
For every test Jest is repeating Angular
tests initialization with [TestBed.initTestEnvironment](https://github.com/tinymce/tinymce-angular/blob/main/tinymce-angular-component/src/test/ts/alien/InitTestEnvironment.ts)
to remove the old dependencies for the new component test:

````typescript title="apps/money-tracker-ui/src/test-setup.ts"
import 'jest-preset-angular/setup-jest';
````

## Jest And Typescript 

Next important piece of configuration is in the
[`ts-jest`](https://github.com/kulshekhar/ts-jest) section.

:::info
`ts-jest` is a Jest transformer with source map support that lets use Jest to test projects written in TypeScript.
:::

This configuration will collect files containing tests and required Typescript declarations and feed them
back to Jest:

````json title="apps/money-tracker-ui/tsconfig.spec.json"
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2016",
    "types": ["jest", "node"]
  },
  "files": ["src/test-setup.ts", "src/polyfills.ts"],
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
````

## Testing Plain Code

The most straightforward testing is with plain typescript code, as in utility classes:

````typescript title="libs/model/src/utils/utils.spec.ts"
describe('Utils', () => {
  it('should create an instance', () => {
    expect(new Utils()).toBeTruthy();
  });
//...
})
````
The data can be imported from the other files, for example:
````typescript title="libs/model/src/utils/utils.spec.ts"
import { token, url, url2, url3 } from './utils.data';

describe('Utils', () => {
    it('should parse a token', () => {
        const user = Utils.parseJwt(token);
        expect(user.email).toEqual('some@qa.com');
        expect(user.userid).toEqual('some');
    });

})
````

## Testing With TestBed

Angular tests are thoroughly described in [Angular Testing Guide](https://angular.dev/guide/testing).
The principal class is [`TestBed`](https://angular.dev/guide/testing)
which has a vast API and does almost all testing tasks. 

For example, almost all components have this basic test - to try to create the component
and validate if it is created successfully: 

````typescript
describe('HeaderComponent', () => {
    let component: HeaderComponent;
    let fixture: ComponentFixture<HeaderComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [HeaderComponent],
            imports: [
                MatSidenavModule,
                BrowserAnimationsModule,
                MatSidenavModule,
                MatToolbarModule,
                MatIconModule,
                MatListModule,
            ],
            providers: [KeycloakService],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(HeaderComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

````
Here, `TestBed.configureTestingModule` function configures module context for the component,
with dependencies like library classes and services. Also, it declares the component to test:
`declarations: [HeaderComponent]`.

:::info[More info]
These tests are being generated by Angular CLI components scaffolding, however, usually they require more 
dependencies to be added manually to the `imports` section. 
More info on how to use [ComponentFixture](https://angular.dev/api/core/testing/ComponentFixture).
:::

## Providing Service Test Doubles

If components talk to the other systems they do it via services, and in most of the cases
it is not possible to use real services in these unit tests. By default, Angular offers [Jasmine test doubles](https://angular.dev/guide/testing/components-scenarios#provide-service-test-doubles),
however, for Money Tracker, [Jest Mocking Functions](https://jestjs.io/docs/mock-functions) are used.

For example, in the following example, `TestSearchService` is created for tests:

````typescript title="libs/shared-components/src/lib/service/search.service.spec.ts"
class TestResource extends Resource {}

class TestSearchService extends SearchService<TestResource> {
    
    // can return examples of some real data here
    searchPage(options?: PagedGetOption,
               queryName?: string | null): Observable<PagedResourceCollection<TestResource>> {
        return of({} as PagedResourceCollection<TestResource>);
    }

    // can return examples of some real data here
    getPage(options?: PagedGetOption): Observable<PagedResourceCollection<TestResource>> {
        return of({} as PagedResourceCollection<TestResource>);
    }
}
````
If only a signature of a method is required, Jest mock function can create one:

````typescript
keycloakServiceMock = {
    keycloakEvents$: of(),
    loadUserProfile: jest.fn().mockResolvedValue({}),
    login: jest.fn().mockResolvedValue({}),
}
````


:::tip[Try Copilot]
It makes sense to use Copilot or any other generative AI to make such tests. For example, `apps/money-tracker-ui/src/app/app.component.spec.ts`
was generated by Copilot, it was able to correctly detect authentication scenarios for Keycloak.
However, it is always a good idea to trim the tests manually after generation.
:::

