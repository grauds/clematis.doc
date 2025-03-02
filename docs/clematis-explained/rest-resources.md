---
sidebar_position: 10
tags:
  - swagger
  - openapi
  - hateoas
  - rest
---

# Server Side Resources

## REST And Hateoas Implementation

With HATEOAS clients need to know only the 
entrypoint of the API, and then the information
about the resources is received via [hypermedia](https://en.wikipedia.org/wiki/Hypermedia)
follow-up links. All the Clematis API are using Hateoas specification.

## Money Tracker API 

This API is documented with [SpringDoc Open API](https://springdoc.org/v1/)
version 1.8.0 which is the last compatible with the Spring Boot 2.

### SpringDoc OpenAPI

The support for Spring Data Rest and Hateoas is available with the 
following dependencies:

````groovy title="build.gradle"
dependencies {
    implementation 'org.springdoc:springdoc-openapi-ui:1.8.0'
    implementation 'org.springdoc:springdoc-openapi-hateoas:1.8.0'
    implementation 'org.springdoc:springdoc-openapi-data-rest:1.8.0'
}
````
Also, a [springdoc-openapi-gradle-plugin](https://github.com/springdoc/springdoc-openapi-gradle-plugin)
is added to generate documentation on every build:

````groovy title="build.gradle"
plugins {
    id("org.springdoc.openapi-gradle-plugin") version "1.9.0"
}

// settings are for the resulting file 
openApi {
    outputDir.set(file("docs"))
    outputFileName.set("swagger.json")
    waitTimeInSeconds.set(10)
}
````
The generation of documentation also can be started manually with command:
````bash
./gradlew generateOpenApiDocs
````
It will start the SpringBoot application and will try to query all the endpoints
by itself. In the case of Money Tracker API, the environment variables have to be provided.

### Swagger Authentication

Since Money Tracker API is not open for non-registered users, each request should have
a JWT token provided. Money Tracker UI takes that token from Keycloak API. Here, for 
OpenAPI documentation, a simple option to provide such JWT token is configured. 

````java title="src/main/java/org/clematis/mt/config/SwaggerConfig.java"
@Configuration
@SecurityScheme(
    name = "Bearer Authentication",
    type = SecuritySchemeType.HTTP,
    bearerFormat = "JWT",
    scheme = "bearer"
)
public class SwaggerConfig {
 //...
}
````

The token can be retrieved with the following request to Clematis Auth API with
`clematis-money-tracker-ui` client id and registered username and password:

````bash
curl --location 'http://[__keycloak_server__]:[__port__]/auth/realms/clematis/protocol/openid-connect/token' \
--header 'Content-Type: application/x-www-form-urlencoded' \
--data-urlencode 'grant_type=password' \
--data-urlencode 'client_id=clematis-money-tracker-ui' \
--data-urlencode 'client_secret=p6BgCWlV1sqZbor8e4S6BceQSsaGICfr' \
--data-urlencode 'username=[__username__]' \
--data-urlencode 'password=[__password__]'
````

## Cosmic API (Weather API, Storage API etc.)

### SpringDoc OpenAPI v2

The APIs with Spring Boot 3, version 3.4 and above, use another branch of [`springdoc-openapi`](https://springdoc.org/#Introduction)
java library:

````groovy title="build.gradle"
dependencies {
    implementation 'org.springdoc:springdoc-openapi-starter-common:2.8.5'
    implementation 'org.springdoc:springdoc-openapi-starter-webmvc-ui:2.8.5'
}
````
The rest of configuration in gradle is the same as for the version 1. 

:::info[Migration guide]

The Spring configuration bean is slightly different in terms of imported paths.
Migration guide from the version 1 is [available here](https://springdoc.org/#migrating-from-springdoc-v1).
:::

## Postman Collections

Postman can [import](https://learning.postman.com/docs/getting-started/importing-and-exporting/importing-from-swagger/)
the `swagger.json` file that has been generated in the previous step. The Postman collections
are available in Git repositories in the `doc` folders.

:::info[Postman variables]
Please note, that the collections are using `baseUrl` variable which can be set 
for the whole collection with another environment variable, for instance `baseUrl = {{mt_host}}`.

Also, Bearer Token authorization is set for the entire collection and the token should be updated manually.
:::

## Spring REST Docs Pipeline

