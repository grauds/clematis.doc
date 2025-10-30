---
sidebar_position: 6
tags:
  - spring-boot
  - keycloak
---
# Migration off Keycloak Spring Adapter

Keycloak provided adapters for an application that needs to interact with a Keycloak instance. 
There are adapters for WildFly/EAP, NodeJS, Javascript and of course for Spring Boot. However,
the company announced the deprecation of Keycloak adapters in 2022, 
with a plan to stop delivering most adapters in Keycloak 19. So now the time has come for 
Clematis Money Tracker API to remove the adapter too.

## Changes In Configuration

The process is relatively easy, however, there can be some questions along the way. Let's 
describe it in detail.

### Dependencies for Spring Security OAuth2

Add new dependencies:
````gradle title="build.gradle"
    implementation 'org.springframework.boot:spring-boot-starter-oauth2-resource-server'
    implementation 'org.springframework.boot:spring-boot-starter-oauth2-client'
````
### New Settings for Keycloak Server

Replace settings for Keycloak adapter
````yaml title="application.yml"
keycloak:
  auth-server-url: "${KEYCLOAK_URL}:${KEYCLOAK_PORT}"
  realm: clematis
  resource: ${KEYCLOAK_CLIENT}
  bearer-only: true
  cors: true
````
with settings for Spring Security:
````yaml title="application.yml"
spring:
  security:
    oauth2:
      resourceserver:
        jwt:
          issuer-uri: "${KEYCLOAK_URL}:${KEYCLOAK_PORT}/realms/clematis"
          jwk-set-uri: "${KEYCLOAK_URL}:${KEYCLOAK_PORT}/realms/clematis/protocol/openid-connect/certs"
````
### Remove Keycloak Beans

The lines which are commented out for clarity should be removed:
````java title="ClematisMoneyTrackerApplication.java"
//import org.keycloak.adapters.springboot.KeycloakSpringBootConfigResolver;

@SpringBootApplication
public class ClematisMoneyTrackerApplication {
//....
/*
    @Bean
    public KeycloakSpringBootConfigResolver keycloakConfigResolver() {
        return new KeycloakSpringBootConfigResolver();
    }
*/  
//....
}
````
### A New `SecurityConfig`

The main changes are in the `SecurityConfig` class where Keycloak dependencies and superclass
are removed and OAuth2 dependencies added. Note that this configuration is for Spring Boot 2:
````java
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Conditional;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtValidators;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

@Configuration
@EnableWebSecurity
@Conditional(NotLocalEnvironment.class)
public class SecurityConfig {

    public static final String ALL_REGEXP = "/**";

    private static final String[] SWAGGER_WHITELIST = {
        "/v3/api-docs/**",
        "/swagger-ui/**",
        "/swagger-ui.html",
    };

    @Value("${spring.security.oauth2.resourceserver.jwt.jwk-set-uri}")
    private String jwkSetUri;

    @Value("${KEYCLOAK_CLIENT}")
    private String clientId;

    private final JwtDebugFilter jwtDebugFilter;

    private final CorsConfigurationSource corsConfigurationSource;

    public SecurityConfig(JwtDebugFilter jwtDebugFilter,
                          CorsConfigurationSource corsConfigurationSource
    ) {
        this.jwtDebugFilter = jwtDebugFilter;
        this.corsConfigurationSource = corsConfigurationSource;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf().disable()
            .cors().configurationSource(corsConfigurationSource)
            .and()
            .authorizeRequests()
            .antMatchers(HttpMethod.OPTIONS, ALL_REGEXP).permitAll()
            .antMatchers(SWAGGER_WHITELIST).permitAll()
            .antMatchers("/api" + ALL_REGEXP).authenticated()
            .antMatchers(ALL_REGEXP).permitAll()
            .and()
            .oauth2ResourceServer()
            .jwt()
            .jwtAuthenticationConverter(jwtAuthenticationConverter());

        return http.build();
    }

    @SuppressWarnings("checkstyle:ReturnCount")
    @Bean
    public OAuth2TokenValidator<Jwt> audienceValidator() {
        return token -> {
            // Check authorized party (azp) claim
            String azp = token.getClaimAsString("azp");
            if ("clematis-money-tracker-ui".equals(azp)) {
                return OAuth2TokenValidatorResult.success();
            }

            // You can also check for your API client ID as a fallback
            if (this.clientId.equals(azp)) {
                return OAuth2TokenValidatorResult.success();
            }

            return OAuth2TokenValidatorResult.failure(
                new OAuth2Error("invalid_token", "Invalid authorized party", null)
            );
        };
    }

    @Bean
    public JwtDecoder jwtDecoder(OAuth2TokenValidator<Jwt> audienceValidator) {
        NimbusJwtDecoder jwtDecoder = NimbusJwtDecoder.withJwkSetUri(jwkSetUri).build();

        OAuth2TokenValidator<Jwt> defaultValidators = JwtValidators.createDefault();
        OAuth2TokenValidator<Jwt> combinedValidator = new DelegatingOAuth2TokenValidator<>(
            defaultValidators, audienceValidator
        );

        jwtDecoder.setJwtValidator(combinedValidator);
        return jwtDecoder;
    }

    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {
        // If you need role conversion logic, add it here
        return new JwtAuthenticationConverter();
    }

}

````
The `audienceValidator` bean is optional, however it can be used to validate authorized party (azp) claim.

### Remove Keycloak Starter

Finally, the Spring Boot Keycloak starter should be removed:
````gradle title="build.gradle"
 //   implementation 'org.keycloak:keycloak-spring-boot-starter:25.0.3'
````

## Changes In Tests

Application tests are configured the same way as the production code, the same change is required here:

### Dependencies for Spring Security OAuth2

Add new dependencies:
````gradle title="build.gradle"
    testImplementation 'org.springframework.security:spring-security-test'
````

### New Settings for Keycloak Server

Replace settings for Keycloak adapter in tests
````yaml title="application-test.yml"
keycloak:
  auth-server-url: "${KEYCLOAK_URL}:${KEYCLOAK_PORT}"
  realm: clematis
  resource: ${KEYCLOAK_CLIENT}
  bearer-only: true
  cors: true
````
with settings for Spring Security:
````yaml title="application-test.yml"
spring:
  security:
    oauth2:
      resourceserver:
        jwt:
          issuer-uri: "${KEYCLOAK_URL}:${KEYCLOAK_PORT}/realms/clematis"
          jwk-set-uri: "${KEYCLOAK_URL}:${KEYCLOAK_PORT}/realms/clematis/protocol/openid-connect/certs"
````
That's it for the tests! They should continue working with `com.tngtech.keycloakmock:mock-junit5:0.16.0'` as before, which is pretty logical as we are 
changing only Keycloak client layer.