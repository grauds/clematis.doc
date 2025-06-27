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

