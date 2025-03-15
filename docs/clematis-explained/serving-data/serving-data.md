---
sidebar_position: 13
tags:
  - spring-data-rest
  - spring-web
  - domain-driven-design
  - dao
  - spring-jpa
---

# Serving Data

Server-side data access is covered by Spring and configured by Spring Boot in a few quite simple
steps.

## Spring Configuration

It is typical for all backend applications in Clematis to use Spring
means of data management. Hence, the configuration:

````gradle title="build.gradle"
dependencies {
   implementation 'org.springframework.boot:spring-boot-starter-data-jpa'
   implementation 'org.springframework.boot:spring-boot-starter-data-rest'
   implementation 'org.springframework.boot:spring-boot-starter-web'
}

````
Namely, there are two parts of a larger Spring Data family are configured above,
they are [Spring Data Jpa](https://spring.io/projects/spring-data-jpa) and
[Spring Data REST](https://spring.io/projects/spring-data-rest). Also, the 
third starter is responsible for [Spring Web Application](https://docs.spring.io/spring-boot/reference/web/servlet.html)
with embedded servlet container and additional REST capabilities. This layer is used to 
work with DTO.

