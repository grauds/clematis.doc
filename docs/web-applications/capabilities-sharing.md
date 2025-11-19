---
sidebar_position: 18
tags:
  - feign
---
# Sharing Capabilities

Once a RESTful API is built, it can be used by the other RESTful APIs to combine data from other sources with
the data from the current database. For instance, Cosmic API and Money Tracker API can use
Clematis Storage API to store images and other files.

## Storage API Feign Client

Following the tradition, the client for the Storage API is built 
with [Spring Cloud Open Feign](https://docs.spring.io/spring-cloud-openfeign/docs/current/reference/html/).

:::tip
Spring recommends its own 
[REST Clients](https://docs.spring.io/spring-framework/reference/integration/rest-clients.html) for new projects.
:::

There is a GitHub repository with the client code:
[Clematis Storage Feign Client](https://github.com/grauds/clematis.storage.api.client). 

### Building the Client

Since this is the most recent project, I've decided to use Kotlin for the Gradle build file to get better  
type safety and IDE support. The plugins are specific for a Spring Boot library project:

```kotlin title="build.gradle.kts"
plugins {
    id("org.springframework.boot") version "3.3.5" apply false // do not apply this, it's a library
    id("io.spring.dependency-management") version "1.1.6"
    id("java-library")
    id("checkstyle")
    id("maven-publish")
}

// Apply Spring Boot dependency management without applying the full Spring Boot plugin
// This ensures we get all the version management without the application packaging features
apply(plugin = "io.spring.dependency-management")
```
Then the library uses a starter to configure the Feign client:
```kotlin title="build.gradle.kts"
dependencies {
    implementation("org.springframework.cloud:spring-cloud-starter-openfeign")
}
```
The Java code example is below:
```java title="java/com/github/grauds/clematis/storage/api/client/StorageApiClient.java"
@FeignClient(
    name = "storageApiClient",
    url = "${storage.api.url}"
)
public interface StorageApiClient {
// ...
}
```
The variable `storage.api.url` has to be defined in the `application.yml` file in the library to test it, and
in the project that uses the client (see below).

### Using the Client in Another Project

The library is published to GitHub Packages, so it can be used in other projects as a dependency. 
Node that the credentials for accessing the GitHub Packages are required, so they can be placed in a file 
or environment variables. The example of the `build.gradle` file for the project 
with a Storage API client is below:

```gradle title="build.gradle"
plugins {
   id 'org.springframework.boot' version '3.3.5' // keep in sync with Spring Cloud (we use Feign)
}

// load GitHub credentials from file or environment variables
if (file('config/build/github.env').exists()) {
    Properties properties = new Properties()
    file('config/build/github.env').withInputStream { properties.load(it) }
    ext.username = properties.getProperty('USERNAME')
    ext.token = properties.getProperty('TOKEN')
} else {
    ext.username = System.getenv("USERNAME")
    ext.token = System.getenv("TOKEN")
}

repositories {
    mavenCentral()
    maven {
        name = "GitHubPackages"
        url = URI.create("https://maven.pkg.github.com/grauds/clematis.storage.api.client")
        credentials {
            username = project.ext.username
            password = project.ext.token
        }
    }
}

dependencies {
   implementation 'com.github.grauds:clematis.storage.api.client:1.0.2'
}
```
The client then can be used in the project as follows, for example, for downloading a file. This
might not be the best way to demo the usage, since the client can just use the direct link to 
the Storage API. However, in case if Cosmic API wants to add something in between or transform the response,
it can be used:
```java title="java/org/clematis/cosmic/web/StorageController.java"
@RestController
@RequestMapping("/api/storage")
public class StorageController {

    // ...
        
    private final StorageApiClient storageApiClient;

    public StorageController(StorageApiClient storageApiClient) {
        this.storageApiClient = storageApiClient;
    }
    
    /**
     * Download a file by its full path (as stored in the storage system).
     */
    @GetMapping("/files/download")
    public ResponseEntity<byte[]> downloadFile(
        @RequestParam("id") String id
    ) {
        byte[] content = storageApiClient.getFile(id).getBody();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
        return new ResponseEntity<>(content, headers, HttpStatus.OK);
    }
    // ...
}
````

The target URL variable has to be defined in the `application.yml` file:
```yaml title="application.yml"
storage:
  api:
    url: http://localhost:8081/api/storage
```
:::info
Useful article on Medium [How Spring Boot Implements Feign Clients for REST APIs](https://medium.com/@AlexanderObregon/how-spring-boot-implements-feign-clients-for-rest-apis-8a4108fa248c)
:::