---
sidebar_position: 3
tags:
  - proxmox
  - keycloak
  - openresty
  - openssh
  - ssl
  - nginx
---

# Web Applications Security

Security in the [Money Tracker](https://github.com/grauds/money.tracker.ui) application was implemented using 
an embedded Keycloak server instance and adapters for Spring Boot 2 and for several major versions of Angular. 
This architecture has been working for over three years. 
I was about to put it to documentation when new versions came out for both Keycloak and Angular,
which brought up significant changes and made the story more complex.

## Cost of Maintenance

The embedded instance of Keycloak (Clematis Auth API) is actually a Gradle-based interpretation 
of [Thomas Darimont's project](https://github.com/thomasdarimont/embedded-spring-boot-keycloak-server), which is
stopped at Keycloak version 18.x and probably won't be maintained any longer; Clematis Auth API supports Keycloak version 20. 
The project required development efforts every time a Keycloak version is updated.
It would require even more effort to 
[update the application to Spring Boot 3](https://github.com/thomasdarimont/embedded-spring-boot-keycloak-server/issues/87).

## Decommissioning Embedded Keycloak Server

It was decided to discontinue the maintenance of Clematis Auth API beyond May 30, 2025, and to delete the project.

## Migration to Keycloak Proxmox CT VM

Since Clematis applications have been living in Proxmox box for one year already, there is a good chance to 
give Proxmox an opportunity to bridge the gap and to host Keycloak as a virtual machine instance. There is no
official template, but the Proxmox community 
has it: [Keycloak Template](https://community-scripts.github.io/ProxmoxVE/scripts?id=keycloak).

The first step is to open Proxmox VE Shell and use the following to build a CT template:

````bash
bash -c "$(curl -fsSL https://raw.githubusercontent.com/community-scripts/ProxmoxVE/main/ct/keycloak.sh)"
````
The next step is to open Proxmox Web Admin UI to [create a new LXC Container](https://pve.proxmox.com/wiki/Linux_Container).
The new Keycloak template was created in the previous step, and it is just required to specify the hardware resources 
depending on the particular server configuration.

After the container is started, the new instance of Keycloak is available at container IP address and port 8080. But
before the login page can be used, it is necessary to configure temporary admin access to the server using the
steps [on this page](https://github.com/community-scripts/ProxmoxVE/discussions/193):

````bash title="SSH login to the container IP address"
systemctl stop keycloak.service
cd /opt/keycloak/bin
./kc.sh bootstrap-admin user
systemctl start keycloak.service
````
Follow the onscreen instructions to create a new admin user when running ```./kc.sh bootstrap-admin user```. 

:::tip
It is a wise move to migrate the configuration from the existing installation of Keycloak. However, be prepared
in this case to regenerate all the clients' passwords and secrets.
:::

## Spring Boot 2 Backend  

After a new instance of Keycloak is up and running, Spring Boot 2 backend will work with the new instance after 
the Keycloak URL and the application shared secret are updated.

As a reminder, the following dependency is being used:

````groovy title="build.gradle"
dependencies {
//...
    implementation 'org.keycloak:keycloak-spring-boot-starter:25.0.3'
//...    
}
````

Checking the application configuration:

````yaml title="src/main/resources/application.yml"
spring:
  auth:
    authServer: "http://${KEYCLOAK_URL}:${KEYCLOAK_PORT}/realms/${keycloak.realm}/protocol/openid-connect"
    clientSecret: ${KEYCLOAK_SECRET}
````
The placeholders are properties taken from the environment variables for the Docker container, for example:
````
KEYCLOAK_URL=192.168.1.157
KEYCLOAK_PORT=8080
KEYCLOAK_SECRET=${KEYCLOAK_SECRET}
KEYCLOAK_CLIENT=clematis-money-tracker-api
````

And I also had to update Jenkins secret named ```MT_API_KEYCLOAK_SECRET``` which is being fused into the ```KEYCLOAK_SECRET``` 
during the build.

:::tip[Can Be Done Better]
Keycloak adapter won't support Spring Boot 3, so migration off this dependency is planned, also improving 
maintainability of the security layer.
:::

## Migration of Angular Frontend to Angular v19 and Keycloak v19

Angular and Keycloak adapter are tightly coupled together, and a Keycloak adapter version follows the one of Angular,
for instance:

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
But before everything, please check the Node version used, since Angular 19 supports Node.js versions 18.19.1, 20.11.1, and 22.0.0 (and newer).
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

## Local Network Connection Encryption

Keycloak checks storage access during authentication to know if it is able to work with the local storage of the client's
browser. If the connection is not secured, development console will show a message ```Access to storage is not allowed from this context```.
There is also a definitive bias towards excluding non-secure connections from support in Keycloak, for example in the
following thread: 
[enforce security on Keycloak users](https://github.com/keycloak/keycloak/discussions/32087). 
Having said that, it is a good practice to enable HTTPS for Keycloak and the applications which use it even
if the server and the applications are on the local network.

### Generating A Certificate

To create a self-signed certificate for our local network using [OpenSSL](https://www.openssl.org)
and a private key in the ```nginx/ssl``` directory:

````bash
mkdir -p nginx/ssl
openssl req -x509 -newkey rsa:2048 \
    -keyout nginx/ssl/private.key \
    -out nginx/ssl/certificate.crt
````

:::info
* X.509 is a standard format for public key certificates. Each X.509 certificate includes a public key, 
identifying information, and a digital signature.
* -newkey rsa:2048: Generates a new private key using the RSA algorithm with a 2048-bit length
:::

### Jenkins Configuration

Since the builds and deploys are handled by Jenkins, the ultimate destination for these files is the
internal [Jenkins storage for secret files](https://www.jenkins.io/doc/book/using/using-credentials/).
For example, the names can be: ```nginx-ssl-cert``` and ```nginx-ssl-key```.

### Adding SSL To Nginx in Openresty

Money Tracker Web Application is using [Openresty](https://openresty.org/en/) image for deployment;
this affects the paths needed to install certificates and configuration file.

The configuration file:

```nginx configuration title="/etc/nginx/conf.d/default.conf"
server {
    # Redirect HTTP to HTTPS
    listen 80 default_server;
    server_name _;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl default_server;
    server_name _;
    root /var/www/money-tracker-ui;

    # SSL configuration for OpenResty
    ssl_certificate /usr/local/openresty/nginx/ssl/certificate.crt;
    ssl_certificate_key /usr/local/openresty/nginx/ssl/private.key;

    # Recommended SSL settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # SSL session settings
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:50m;
    ssl_session_tickets off;

    # HSTS (uncomment if you're sure)
    # add_header Strict-Transport-Security "max-age=63072000" always;

    # Disabled caching so the browser won't cache the site.
    expires           0;
    add_header        Cache-Control private;

    location ~* ^/auth/(.*) {
        proxy_http_version 1.1;
        proxy_pass http://192.168.1.157:8080/$1; # connection to Proxmox Keycloak to fix later
        proxy_set_header X-Forwarded-Proto https;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Host $host;
    }

    location ~* ^/api/ {
        proxy_http_version 1.1;
        proxy_pass http://192.168.1.118:18085;
        proxy_set_header X-Forwarded-Proto https;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Host $host;
    }
   
    # ... 
 
    location / {
        index index.html;
        try_files $uri $uri/ /index.html;
    }
}
```
As a result, Nginx expects to find a certificate in its local container path:

```
/usr/local/openresty/nginx/ssl
```

### Docker Compose Modification

The next step is to make sure the Docker container will get the files in the directory it expects.
One of the best approaches is to create a Docker volume and to copy the files from Jenkins 
credentials storage there; then it should be mounted to the application container,
for example:

```
volumes:
    - ssl_certs:/usr/local/openresty/nginx/ssl:ro
```
The full example:

``` title="apps/money-tracker-ui/jenkins/docker-compose.yml"
services:
  money-tracker-ui:
    container_name: clematis-money-tracker-ui
    image: money.tracker.ui.uat:latest
    ports:
      - '18081:80'
      - '18443:443'
    volumes:
      - "/home/jenkins/workspace/Money Tracker UI Deployment/apps/money-tracker-ui/jenkins/nginx-default.conf:/etc/nginx/conf.d/default.conf"
      - ssl_certs:/usr/local/openresty/nginx/ssl:ro
    networks:
      - clematis
    restart: unless-stopped
    
```
:::info
Since Jenkins is running in a Docker container, the path for ```nginx-default.conf``` has to be given
relative to the host machine file system. The shortcut is to hardcode it, since it is immutable if
the name of the job is not changed.
:::


### Storing The Certificate In A Docker Volume

Now the Jenkins pipeline can be used to re/create the volume and to copy the certificate files to it:

``` title="Jenkinsfile"
pipeline {
    agent any
    environment {
      CERT_DIR = "${WORKSPACE}/docker/nginx/ssl"
    }
   
    stages {
    
        # The rest of the pipeline
    
        stage('Prepare Directories') {
            steps {
                sh '''
                   # Create directory structure with proper permissions
                    mkdir -p "${CERT_DIR}"
                    chmod 700 "${CERT_DIR}"
                    ls -al "${CERT_DIR}"
                '''
            }
        }
    
        stage('Deploy Certificates') {
        
            steps {
                script {
                     // Using secret files
                      withCredentials([
                         file(credentialsId: 'nginx-ssl-cert', variable: 'SSL_CERT'),
                         file(credentialsId: 'nginx-ssl-key', variable: 'SSL_KEY')
                      ]) {
                          sh """
                              # Copy certificates
                              cp "$SSL_CERT" "${CERT_DIR}/certificate.crt"
                              cp "$SSL_KEY" "${CERT_DIR}/private.key"
                    
                              # Set proper permissions
                              chmod 644 "${CERT_DIR}/certificate.crt"
                              chmod 600 "${CERT_DIR}/private.key"
                    
                          """
                     }
                }
            }
        }
        
        stage('Prepare SSL Volume') {
            steps {
                script {
                    sh '''
                        # First create or clear the volume
                        docker run --rm -v jenkins_ssl_certs:/ssl alpine sh -c "rm -rf /ssl/* && mkdir -p /ssl"
    
                        # Then copy the certificates from the workspace
                        docker cp "${CERT_DIR}/." $(docker create --rm -v jenkins_ssl_certs:/ssl alpine sh):/ssl/
    
                        # Finally set the permissions
                        docker run --rm -v jenkins_ssl_certs:/ssl alpine sh -c "
                            chmod 644 /ssl/certificate.crt && \
                            chmod 600 /ssl/private.key
                        "
    
                    '''
                }
            }
        }

        stage("Build and start docker compose services") {
          steps {
            sh '''
               cd ./apps/money-tracker-ui/jenkins
               docker compose stop
               docker stop clematis-money-tracker-ui || true && docker rm clematis-money-tracker-ui || true
               docker stop clematis-money-tracker-ui-demo || true && docker rm clematis-money-tracker-ui-demo || true
               docker compose build
               docker compose up -d
            '''
          }
        }

    }
    
    post {
        always {
           // Clean up sensitive files after use
          sh '''
              if [ -d "${CERT_DIR}" ]; then rm -rf "${CERT_DIR}"; fi
           '''
        }
    }
}
```
To recap:

* Create the directory to store certificate in the workspace
* Copy the certificate to the directory created above
* Prepare an SSL volume and copy the certificate to it.
* Deploy the applications to the Docker containers 
* Remove the directory with certificates from the workspace

