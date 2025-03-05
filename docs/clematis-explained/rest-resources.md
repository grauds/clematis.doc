---
sidebar_position: 10
tags:
  - swagger
  - openapi
  - hateoas
  - rest
  - restdocs
  - rest-assured
---

# Backend API

## REST And Hateoas Implementation

With HATEOAS clients need to know only the 
entrypoint of the API, and then the information
about the resources is received via [hypermedia](https://en.wikipedia.org/wiki/Hypermedia)
follow-up links. All the Clematis API are using Hateoas specification.

## SpringDoc OpenAPI

### Money Tracker 

This API is documented with [SpringDoc Open API](https://springdoc.org/v1/)
version 1.8.0 which is the last compatible with the Spring Boot 2.

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

````java title="src/main/java/org/clematis/mt/config/OpenAPIConfig.java"
import static org.springdoc.core.Constants.ALL_PATTERN;
import org.springdoc.core.GroupedOpenApi;
import org.springdoc.core.customizers.OpenApiCustomiser;

import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;

@Configuration
@SecurityScheme(
    name = "Bearer Authentication",
    type = SecuritySchemeType.HTTP,
    bearerFormat = "JWT",
    scheme = "bearer"
)
public class OpenAPIConfig {
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

### Cosmic, Weather, Storage etc.

These backend APIs are using Spring Boot 3.4 and above, and they need another branch of [`springdoc-openapi`](https://springdoc.org/#Introduction)
java library:

````groovy title="build.gradle"
dependencies {
    implementation 'org.springdoc:springdoc-openapi-starter-common:2.8.5'
    implementation 'org.springdoc:springdoc-openapi-starter-webmvc-ui:2.8.5'
}
````

The plugin configuration is the same as for the version 1:

````groovy title="build.gradle"
plugins {
    id("org.springdoc.openapi-gradle-plugin") version "1.9.0"
}

// settings are for the resulting file 
openApi {
    outputDir.set(file("docs"))
    outputFileName.set("swagger.json")
}
````
However, the Spring configuration bean differs in terms of imported paths:

:::info[Migration guide]
Migration guide from the version 1 is [available here](https://springdoc.org/#migrating-from-springdoc-v1).
:::

````java 
import static org.springdoc.core.utils.Constants.ALL_PATTERN;
import org.springdoc.core.models.GroupedOpenApi;
import org.springdoc.core.properties.SwaggerUiConfigProperties;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;

@Configuration
public class OpenAPIConfig {

//...

    @Bean
    public GroupedOpenApi filesApi() {
        return GroupedOpenApi.builder()
                .group("Files")
                .pathsToMatch("/api/files")
                .build();
    }
}
````

Cosmic API, Weather API and Storage API don't have any authentication, so Swagger UI doesn't use
authentication token configuration.

### Postman Collections

Postman can [import](https://learning.postman.com/docs/getting-started/importing-and-exporting/importing-from-swagger/)
the `swagger.json` file that has been generated in the previous step. The Postman collections
are available in Git repositories in the `doc` folders.

:::info[Postman variables]
Please note, that the collections are using `baseUrl` variable which can be set 
for the whole collection with another environment variable, for instance `baseUrl = {{mt_host}}`.

Also, Bearer Token authorization is set for the entire collection and the token should be updated manually.
:::

## Using Spring REST Docs

Another approach is to use [Spring Restdocs](https://docs.spring.io/spring-restdocs/docs/current/reference/htmlsingle/#introduction) library, which additionally helps to start with 
Test Driven Development for backend. The only requirement is that the library has to be combined with one
of the testing libraries: [MockMvc](https://spring.io/guides/gs/testing-web), 
[WebTestClient](https://docs.spring.io/spring-framework/reference/testing/webtestclient.html)
or [REST-assured](https://rest-assured.io). 

:::info
All Clematis API are being migrated to REST-assured from [TestRestTemplate](https://docs.spring.io/spring-boot//api/java/org/springframework/boot/test/web/client/TestRestTemplate.html).
:::

### Installation

It is enough to follow the documentation for [configuration](https://docs.spring.io/spring-restdocs/docs/current/reference/htmlsingle/#getting-started-build-configuration)
however there is an update to it, see below:

````groovy title="build.gradle"
plugins { 
    id "org.asciidoctor.jvm.convert" version "4.0.4"
}

configurations {
	asciidoctorExt 
}

dependencies {
	asciidoctorExt 'org.springframework.restdocs:spring-restdocs-asciidoctor' 
	testImplementation 'org.springframework.restdocs:spring-restdocs-mockmvc' 
}

ext { 
	snippetsDir = file('build/generated-snippets')
}

test { 
	outputs.dir snippetsDir
}
````
The plugin [`org.asciidoctor.jvm.convert`](https://github.com/asciidoctor/asciidoctor-gradle-plugin)
homepage also contains some useful information.

### Configuration

For `asciidoc` itself it is feasible to use a more sophisticated configuration to 
create a html book with queries examples:

````groovy title="build.gradle"
asciidoctor {
    dependsOn test
    options doctype: 'book'

    attributes = [
            'source-highlighter': 'highlightjs',
            'imagesdir'         : './images',
            'toc'               : 'left',
            'toclevels'         : 3,
            'numbered'          : '',
            'icons'             : 'font',
            'setanchors'        : '',
            'idprefix'          : '',
            'idseparator'       : '-',
            'docinfo1'          : '',
            'safe-mode-unsafe'  : '',
            'allow-uri-read'    : '',
            'snippets'          : snippetsDir,
            linkattrs           : true,
            encoding            : 'utf-8'
    ]

    inputs.dir snippetsDir
    outputDir "build/asciidoc"
    sourceDir 'src/docs/asciidocs'

// important since otherwise relative include files will be resolved 
// using gradle working directory
    baseDir sourceDir 
    
    sources {
        include 'api.adoc'
    }
}
````
The file `api.doc` mentioned in this configuration is an index
file which will be processed by asciidoc and all the snippets 
will be added to it. For example:

````adoc title="src/docs/asciidocs/api.adoc"
== Clematis Storage API
=== Endpoints

==== Get file by ID
===== Curl example
include::{snippets}/index/curl-request.adoc[]
===== HTTP Request
include::{snippets}/index/http-request.adoc[]
===== HTTP IE Request
include::{snippets}/index/httpie-request.adoc[]
===== HTTP Response
====== Success HTTP response
include::{snippets}/index/http-response.adoc[]
====== Response body
include::{snippets}/index/response-body.adoc[]

//...

== REST convention
include::rest_conv.adoc[]
````
The signs `=` are the nested headers, the result content tree will have these indents.
File `rest_conv.adoc` can be found in the same directory as `api.adoc` file. 

:::info
Unlike Swagger UI and Postman, the documentation here is focusing on completeness and 
tries to be as user-friendly as possible, therefore more human authored text is required
and snippets are to be included manually.
:::

### Testing And Documenting A Feature

REST-assured tests resemble [the ones with Gherkin and Playwright](cucumber-playwright.md) for frontend.
It is also possible to test a feature, just not in UI domain, since 
REST-assured offers BDD's given-when-then syntax, for example:

````java title="src/test/java/org/clematis/storage/controller/StorageControllerTests.java"
@Test
public void testFileUpload() throws IOException {

    RequestResponse responseEntity =
        given(this.spec)
            .multiPart(mockMultipartFile().getFile())
            .filter(document("upload"))
        .when()
            .post("/api/files/upload")
        .andReturn().as(RequestResponse.class);

    Assertions.assertNotNull(responseEntity);
    Assertions.assertNotNull(responseEntity.getDownloadUrl());
}
````
With Spring REST docs library, these tests also can generate snippets which in turn 
can be included into API documentation and updated on every project build. If API 
changes, tests will possibly fail and documentation will be updated once
tests are fixed automatically. The code fragments like below are responsible for intercepting 
the test requests `.filter(document("upload"))` and chained to REST-assured 
calls.

After deployment, the documentation is available at `server:port/docs/api.html`.


:::tip[Instead of Postman]
Spring REST docs library also provides methods for [HTTPie](https://httpie.io/) tool.
:::
