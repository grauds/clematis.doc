---
sidebar_position: 13
tags:
  - spring-data-rest
  - spring-web
  - domain-driven-design
  - dao
  - spring-jpa
  - cors
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
they are [Spring Data JPA](https://spring.io/projects/spring-data-jpa) and
[Spring Data REST](https://spring.io/projects/spring-data-rest). Also, the 
third starter is responsible for [Spring Web Application](https://docs.spring.io/spring-boot/reference/web/servlet.html)
with embedded servlet container and additional REST capabilities. This layer is used to 
work with DTO.

## Configuring CORS

Since there are two Spring Web technologies are utilized, 
[Cross-Origin Resource Sharing (CORS)](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS)
should be configured twice.

### CORS for Spring Web

This configuration is done with a configuration bean, like below:

````java title="src/main/java/org/clematis/*/config/SpringWebCorsConfig.java"
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
public class SpringWebCorsConfig {

    public static final String ALL_REGEXP = "/**";
    public static final String ORIGINS = "*";

    @Bean(name = "corsConfigurationSource")
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of(ORIGINS));
        configuration.setAllowedMethods(List.of(HttpMethod.GET.name(),
                HttpMethod.POST.name(),
                HttpMethod.PUT.name(),
                HttpMethod.PATCH.name(),
                HttpMethod.DELETE.name(),
                HttpMethod.OPTIONS.name(),
                HttpMethod.HEAD.name()));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration(ALL_REGEXP, configuration);
        return source;
    }
}
````

### CORS for Spring Data REST

Another configuration works with Spring Data REST endpoints:

````java title="src/main/java/org/clematis/*/config/SpringDataRestCorsConfig.java"
package org.clematis.cosmic.config;

import org.clematis.cosmic.model.InputData;
import org.clematis.cosmic.model.Project;
import org.springframework.data.rest.core.config.RepositoryRestConfiguration;
import org.springframework.data.rest.webmvc.config.RepositoryRestConfigurer;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.config.annotation.CorsRegistry;

@Component
public class SpringDataRestCorsConfig implements RepositoryRestConfigurer {

    public static final String ALL_REGEXP = "/**";
    public static final String ORIGINS = "*";

    @SuppressWarnings("checkstyle:MagicNumber")
    @Override
    public void configureRepositoryRestConfiguration(RepositoryRestConfiguration config, CorsRegistry cors) {

        cors.addMapping(ALL_REGEXP)
            .allowedOrigins(ORIGINS)
            .allowedMethods(HttpMethod.GET.name(),
                HttpMethod.POST.name(),
                HttpMethod.PUT.name(),
                HttpMethod.PATCH.name(),
                HttpMethod.DELETE.name(),
                HttpMethod.OPTIONS.name(),
                HttpMethod.HEAD.name())
            .allowCredentials(false)
            .maxAge(3600);

        config.exposeIdsFor(Project.class);
        config.exposeIdsFor(InputData.class);
    }
}
````