---
sidebar_position: 3
tags:
  - angular
  - keycloak
  - nginx
---

# Frontend Migration 

Since Keycloak LXC is running with the latest version of Keycloak and will be maintained
to run the latest version as much as possible, the keycloak client adapter for Angular in our case
should also be updated.

## Migration of Angular Frontend to Angular v19 and Keycloak v19

Angular and Keycloak adapter are tightly coupled together, 
and the Keycloak adapter version follows the version of Angular, for instance:

```json title="package.json"
{
  "dependencies": {
    "@angular/animations": "^19.2.13",
    "@angular/cdk": "^19.2.13",
    "@angular/common": "^19.2.13",
    "@angular/compiler": "^19.2.13",
    "@angular/core": "^19.2.13",
    "@angular/forms": "^19.2.13",
    "@angular/localize": "^19.2.13",
    "@angular/material": "^19.2.13",
    "@angular/material-moment-adapter": "^19.2.13",
    "@angular/platform-browser": "^19.2.13",
    "@angular/platform-browser-dynamic": "^19.2.13",
    "@angular/router": "^19.2.13",
    "keycloak-angular": "^19.0.2",
    "keycloak-js": "^26.2.0"
  },
  "devDependencies": {
    "@angular-devkit/build-angular": "^19.2.13",
    "@angular-devkit/core": "^19.2.13",
    "@angular-devkit/schematics": "^19.2.13",
    "@angular/cli": "^19.2.13",
    "@angular/compiler-cli": "^19.2.13",
    "@angular/language-service": "^19.2.13",
    "@types/keycloak-js": "^3.4.1"
  }
}
```

:::tip
Before everything, please check the Node version used, 
since Angular 19 supports Node.js versions 18.19.1, 20.11.1, and 22.0.0 (and newer).
Also, TypeScript version 5.6 or higher and RxJS version ^6.5.3 or ^7.5.
:::


### Migration to Angular v19

The process is described in detail in this manual [migration of Angular to version 19](https://angular.dev/update-guide?v=18.0-19.0&l=2).
In addition to these steps, I had to do the following:

1. Environment configuration replaces ```browserTarget``` with ```buildTarget``` in project.json:
````json title="projest.json"
{
    "serve": {
      "executor": "@angular-devkit/build-angular:dev-server",
      "configurations": {
        "default": {
          "buildTarget": "money-tracker-ui:build:default"
        },
        "demo": {
          "buildTarget": "money-tracker-ui:build:demo"
        }
      },
      "defaultConfiguration": "development"
    }
 }
````
2. Removed the application bootstrapping from ```app.module.ts``` file, it now only imports non-standalone components from
   the application package and acts as a module:
````typescript jsx title="apps/money-tracker-ui/src/app/app.module.ts"
// imports for the application components and third-party components
@NgModule({
   declarations: [
      // declarations for the application components
   ],
   imports: [
      // third-party component dependencies for the module
   ],
   exports: [
      HeaderComponent
   ],
   providers: []
})
export class AppModule {
   constructor(
           hateoasConfig: NgxHateoasClientConfigurationService,
           environmentService: EnvironmentService
   ) {
      hateoasConfig.configure({
         http: {
            defaultRoute: {
               rootUrl: environmentService.getValue('apiUrl'),
            },
         },
         useTypes: {
            resources: [
               AccountBalance,
               Entity,
               CommodityGroup,
               Commodity,
               MoneyExchange,
               MoneyType,
               MonthlyDelta,
               OrganizationGroup,
               Organization,
               ExpenseItem,
               UnitType,
            ],
         },
      });
   }
}

export class AppComponentsModule {}
````
3. The AppComponent is standalone and is bootstrapped in ``main.ts`` file now:
````typescript jsx title="apps/money-tracker-ui/src/main.ts"
// imports requires for third-party providers and the main application component
if (environment.production) {
   enableProdMode();
}

bootstrapApplication(AppComponent, {
   providers: [
      provideRouter(routes),
      provideHttpClient(),
      provideAnimations(),
      importProvidersFrom(
              // third-party providers
              SharedComponentsModule,
              AppComponentsModule // note, that the components specific for the application are the 
                      // same module as the shared components and other modules
      ),
      // to add Keycloak providers in the next step
      provideRouter(routes),
      {
         provide: ENVIRONMENT,
         useValue: environment,
      },
      provideHttpClient(withInterceptors([includeBearerTokenInterceptor]))
   ],
}).catch((err) => console.error(err));

````
As a result, the new configuration is more concise and logical than before.

### TypeScript changes

Angular v19 requires some updates for TypeScript compiler settings:

```json  title="tsconfig.base.json"
{
  "compilerOptions": {
    "target": "es2022",
    "module": "es2022",
    "strict": true
  },
  "angularCompilerOptions": {
    "strictInjectionParameters": true,
    "strictTemplates": true,
    "compilationMode": "partial"
  }
}
```

### Migration to Keycloak v19

This version came out in December'24 and has some breaking changes as it's seen in the
[Release Notes](https://github.com/mauriciovigolo/keycloak-angular/releases/tag/v19.0.0).
Let's open the [Migration Guide](https://github.com/mauriciovigolo/keycloak-angular/blob/main/docs/migration-guides/v19.md):

1. Direct usage of the ```keycloak-js``` client eliminates the need for a wrapper service. However,
   to be able to use imports from ```keycloak-js```, TypeScript module resolution has to be changed to allow such imports:

````json title="tsconfig.base.json"
{
   "compilerOptions": {
     "moduleResolution": "bundler",
     "lib": ["es2021", "dom"]
   }
}
````
Note that this change can potentially break the other libraries' imports, so do it with caution. In my case, I
had to sacrifice only one import from Lagoshny's library:
```typescript
import { PageParam } from "@lagoshny/ngx-hateoas-client";
```
and go without this type for now.

2. Keycloak provider has been added to Angular configuration:
````typescript jsx title="apps/money-tracker-ui/src/main.ts"
//...
import {
    provideKeycloak,
    createInterceptorCondition,
    IncludeBearerTokenCondition,
    INCLUDE_BEARER_TOKEN_INTERCEPTOR_CONFIG,
    includeBearerTokenInterceptor
} from "keycloak-angular";
// ...

if (environment.production) {
   enableProdMode();
}

// only calls to API require token headers
const urlCondition = createInterceptorCondition<IncludeBearerTokenCondition>({
    urlPattern: /^(.*\/api\/.*)?$/i,
    bearerPrefix: 'Bearer'
});

bootstrapApplication(AppComponent, {
   providers: [
      provideRouter(routes),
      provideHttpClient(),
      provideAnimations(),
      importProvidersFrom(
          //...
              SharedComponentsModule,
              AppComponentsModule 
      ),
      // keycloak provider 
      provideKeycloak({
         config: {
             url: environment.authUrl,
             realm: 'clematis',
             clientId: 'clematis-money-tracker-ui',
         },
         initOptions: {
             onLoad: 'check-sso',
             silentCheckSsoRedirectUri: `${window.location.origin}/assets/silent-check-sso.html`
         }
      }),
      {
         provide: INCLUDE_BEARER_TOKEN_INTERCEPTOR_CONFIG,
         useValue: [urlCondition]
      },
      provideZoneChangeDetection({ eventCoalescing: true }),
      provideRouter(routes),
      {
         provide: ENVIRONMENT,
         useValue: environment,
      },
      provideHttpClient(withInterceptors([includeBearerTokenInterceptor]))
   ],
}).catch((err) => console.error(err));

````
:::info
The URL condition above configures the path to send jwt token along, see [the manual](https://github.com/mauriciovigolo/keycloak-angular#httpclient-interceptors).
:::
3. AuthGuard has been replaced with ````canActivate```` function:
````typescript jsx
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';

import { AuthGuardData, createAuthGuard } from "keycloak-angular";

const isAccessAllowed =  async (
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
    authData: AuthGuardData
  ): Promise<boolean | UrlTree> => {

    const { authenticated, grantedRoles } = authData;

    // Get the roles required from the route.
    const requiredRole = route.data['role'];

    // Allow the user to proceed if no roles are required to access the route.
    if (!requiredRole) {
      return authenticated;
    }

    const hasRequiredRole = (role: string): boolean =>
        Object.values(grantedRoles.resourceRoles).some((roles) => roles.includes(role));

    // Allow the user to proceed if all the required roles are present.
    return authenticated && hasRequiredRole(requiredRole);
  }

export const canActivate = createAuthGuard<CanActivateFn>(isAccessAllowed);
````
Roles were added as well, since I believe there will be a need for them soon in this and the other applications.

4. Application main component is the only component now that deals with
   [Keycloak signals](https://github.com/mauriciovigolo/keycloak-angular?tab=readme-ov-file#keycloak-events-signal);
   the similar logic has been removed from the other components:
````typescript jsx
//...
export class AppComponent {

    //...
    isLoggedIn = false;
    userProfile: KeycloakProfile | undefined = undefined;
    private readonly keycloakSignal = inject(KEYCLOAK_EVENT_SIGNAL);

    constructor(
        protected readonly keycloak: Keycloak,
        private readonly router: Router,
        private readonly route: ActivatedRoute
    ) {

        // subscription to updates
        effect(() => {

                const keycloakEvent: KeycloakEvent = this.keycloakSignal();

                // synchronize the state with Keycloak lifecycle
                this.isLoggedIn = typeEventArgs<ReadyArgs>(keycloakEvent.args);
                this.keycloak.loadUserProfile().then((profile) => {
                    this.userProfile = profile;
                }).catch((error) => {
                    this.userProfile = undefined;
                    this.keycloak.login();
                });

                if (keycloakEvent.type == KeycloakEventType.AuthSuccess) {
                    
                    // redirect to the required route after Keycloak login screen
                    if (this.route.snapshot.queryParams['redirect']) {
                        const params: HttpParams = Utils.moveQueryParametersFromRedirectUrl(
                            this.route.snapshot.queryParams
                        );
                        this.router.navigate([params.get('redirect')], {
                            queryParams: Utils.parseRedirectParameters(params),
                        });
                    }

                } else if (
                    keycloakEvent.type == KeycloakEventType.AuthError
                    ||
                    keycloakEvent.type == KeycloakEventType.AuthLogout
                    ||
                    keycloakEvent.type == KeycloakEventType.TokenExpired
                ) {

                    this.userProfile = undefined;
                    this.keycloak.logout(); // close the application session

                }
            }
        )
    }
}
````
