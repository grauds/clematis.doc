---
sidebar_position: 11
tags:
  - spring
  - spring-boot
  - gradle
---

# Server Application

All server applications use the latest versions of [Gradle](https://gradle.org/)
build tool and [Spring Boot](https://spring.io/projects/spring-boot).

## Microservices Architecture

Each backend application has only one data source for it and has its own,
pretty limited functionality. This is done to make the applications comply
with microservices criteria:

1. Backend applications are small, manageable, self-contained
2. Can be deployed independently of others

:::info
More documentation on microservices themselves is available at canonical
[https://microservices.io/](https://microservices.io/). Also supported
by [Spring Cloud](https://spring.io/cloud).
:::


## Gradle Build File

The basic zero setup for a typical project is as follows:

````gradle title="build.gradle"
plugins {
    id 'java'    
}

group = 'org.clematis'
version = '1.0.0-SNAPSHOT'

java {
    sourceCompatibility = '17'
}

dependencies {
 //...
}    
````
Gradle version is in the `gradle-wrapper.properties` file:
````
distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\://services.gradle.org/distributions/gradle-8.13-bin.zip
networkTimeout=10000
validateDistributionUrl=true
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists

````
The minimal project layout is:
````
/.
 ...
 ├─ gradle
 │ └─ wrapper
 │   ├─ gradle-wrapper.jar
 │   └─ gradle-wrapper.properties
 ... 
 ├─ src
 │ ├─ docs
 │ ├─ main
 │ └─ test
 ...
 build.gradle 
````
Every next chapter will add settings to this file.

## Spring Boot Dependencies

There are some dependencies to be added to the build file:

````gradle title="build.gradle"
plugins {
    id 'org.springframework.boot' version '3.4.3'
    id 'io.spring.dependency-management' version '1.1.7'   
}

dependencies {
    annotationProcessor 'org.springframework.boot:spring-boot-configuration-processor'
    developmentOnly 'org.springframework.boot:spring-boot-devtools'
}  
````
Installing [Spring Gradle dependency management plugin](https://plugins.gradle.org/plugin/io.spring.dependency-management)
will allow [autoconfiguration of projects dependencies](https://docs.spring.io/spring-boot/gradle-plugin/managing-dependencies.html)
by applying Spring Maven BOMs to the project's dependencies.    

:::tip[Can be done better]
Using Gradle’s [native bom support](https://docs.spring.io/spring-boot/gradle-plugin/managing-dependencies.html#managing-dependencies.gradle-bom-support) instead can help resolve
[some issues](https://nexocode.com/blog/posts/spring-dependencies-in-gradle/) with 
security patching.
:::

