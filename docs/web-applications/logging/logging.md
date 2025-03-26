---
sidebar_position: 15
tags:
  - logging
  - mdc
---

# Runtime Management

There is a pool of useful diagnostics available for the running Spring applications. 

## Logback

Logging is being done with the help of [Logback](https://logback.qos.ch/) library. Spring brings in Logback with
`spring-jcl` which is set up with a `spring-boot-starter-logging` starter,
and the latter is in turn a dependency for some other Spring Boot starters, for example `spring-boot-starter-web`.

### Configuration

Clematis applications use `logback-spring.xml` configuration file to be able to add Spring Boot 
[Logback Extensions](https://docs.spring.io/spring-boot/reference/features/logging.html#features.logging.logback-extensions).

The full configuration file is below. It includes configuration for console and file logging, history settings,
MDC settings, the ability to change configuration on runtime with JMX and for level of logging:

````xml title="src/main/resources/logback-spring.xml"
<configuration>
    
    <springProperty name="LOG_PATH" source="logging.file.path" defaultValue="logs/" />
    <jmxConfigurator/>

    <conversionRule conversionWord="mdc" converterClass="org.clematis.logging.CustomMDCConverter" />

    <appender name="stdout" class="ch.qos.logback.core.ConsoleAppender">
        <target>System.out</target>
        <filter class="ch.qos.logback.core.filter.EvaluatorFilter">
            <evaluator>
                <matcher>
                    <Name>first_retry</Name>
                    <!-- filter out initial retry messages -->
                    <regex>Retry: count=0</regex>
                </matcher>
                <expression>first_retry.matches(formattedMessage)</expression>
            </evaluator>
            <OnMismatch>NEUTRAL</OnMismatch>
            <OnMatch>DENY</OnMatch>
        </filter>
        <encoder>
            <pattern>[%date{"yyyy-MM-dd'T'HH:mm:ss,SSSXXX"}] [%thread] %level %logger{5} - %mdc %msg%n</pattern>
        </encoder>
    </appender>

    <property name="LOG_HISTORY" value="7" />
    <property name="LOG_LEVEL" value="INFO" />

    <appender name="file" class="ch.qos.logback.core.rolling.RollingFileAppender">

        <file>${LOG_PATH}/api.log</file>
        <rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
            <!-- daily rollover -->
            <fileNamePattern>${LOG_PATH}/api.%d.log</fileNamePattern>
            <maxHistory>${LOG_HISTORY}</maxHistory>
        </rollingPolicy>

        <filter class="ch.qos.logback.core.filter.EvaluatorFilter">
            <evaluator>
                <matcher>
                    <Name>first_retry</Name>
                    <!-- filter out initial retry messages -->
                    <regex>Retry: count=0</regex>
                </matcher>

                <expression>first_retry.matches(formattedMessage)</expression>
            </evaluator>
            <OnMismatch>NEUTRAL</OnMismatch>
            <OnMatch>DENY</OnMatch>
        </filter>
        <encoder>
            <pattern>[%date{"yyyy-MM-dd'T'HH:mm:ss,SSSXXX"}] [%thread] %level %logger{5} - %mdc %msg%n</pattern>
        </encoder>
    </appender>

    <root level="${LOG_LEVEL}">
        <appender-ref ref="file"/>
        <appender-ref ref="stdout" />
    </root>

    <logger name="org.clematis" level="${LOG_LEVEL}"/>
    <logger name="jworkspace" level="${LOG_LEVEL}"/>
    <logger name="org.springframework" level="${LOG_LEVEL}"/>

</configuration>
````

The configuration of target directory for logs in the file
above depends on `logging.file.path` variable from Spring application properties:

````yaml title="src/main/resources/application.yml"
logging:
  file:
    path:
      ${LOG_PATH}
````
This variable in turn depends on the presence of environment variable `LOG_PATH`. 

### Log Annotations

Lombok helps with logging by providing a number of [annotations](https://projectlombok.org/features/log). The 
`@Log` annotation, which is used accross Clematis applications, is for `java.util.logging` which can be used with Spring because 
[`jul-to-slf4j`](https://www.slf4j.org/legacy.html#jul-to-slf4j) bridge is present
if [Spring Boot with dependencies management](https://docs.spring.io/spring-boot/appendix/dependency-versions/coordinates.html)
is on.

:::tip
It is encouraged to use Lombok `@slf4j` annotation for classes.
:::

Additional configuration for Java Util Logging is required in Logback, because of the following
default behavior:

:::tip[Important tip from Spring]
For an application in a servlet container or application server, 
logging performed with the Java Util Logging API is not routed into your application’s logs. 
This prevents logging performed by the container or other applications that have been deployed to 
it from appearing in your application’s logs.
:::

:::info
Slf4J, Log4J, Logback are the projects with [QOS.ch Sarl](https://www.qos.ch/)
as a founding contributor. 
:::

## Mapped Diagnostic Context (MDC)

As it is noted in the previous paragraph, it's preferable to use `@slf4j` logging. This is 
mainly because [MDC feature](https://www.slf4j.org/manual.html#mdc) relies on it. For 
`java.util.logging` the information will need to be retrieved by a user code. 

### Transaction Identifiers

Clematis applications need only a small portion of information to be shared in MDC,
and a transaction identifier is the most important case:

1. **org.clematis.logging.web.TransactionIdFilter**: intercepts client queries and checks for presence of
transaction identifiers in HTTP headers. If no identifier is found, a new one is
created and added to an MDC context:
````java title="org.clematis.logging.web.TransactionIdFilter"
@Component(value = "transactionIdFilter")
public class TransactionIdFilter extends OncePerRequestFilter {

    @Value("${clematis.transactionId.httpHeader}")
    private String transactionIdHeader;

    @Autowired
    private TransactionIdService transactionIdService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
        throws IOException, ServletException {

        final String transactionId = request.getHeader(transactionIdHeader);
        try (
            TransactionIdService.Transaction transaction = transactionIdService.startTransaction(transactionId)) {
            response.addHeader(transactionIdHeader,
                URLEncoder.encode(transaction.id(), StandardCharsets.UTF_8.displayName()));
            filterChain.doFilter(request, response);
        }
    }
}
````
2. **org.clematis.logging.service.TransactionIdService**: generates a new transaction id,
uses MDC to store the id and deletes it after id is no longer used. This is being done 
for every running request thread in the Spring application:

````java title="org.clematis.logging.service.impl.TransactionIdServiceImpl"
@Component(value = TransactionIdService.BEAN)
public class TransactionIdServiceImpl implements TransactionIdService {

    @Value("${clematis.transactionId.logKey}")
    private String transactionIdLogKey;

    @Override
    public Transaction startTransaction(@Nullable String id) {
        final String transactionId = StringUtils.isBlank(id) ? generateId() : id;
        return new TransactionImpl(transactionIdLogKey, transactionId);
    }

    @Override
    public String getCurrentTransactionId() {
        return MDC.get(transactionIdLogKey);
    }

    private static String generateId() {
        return UUID.randomUUID().toString();
    }

    private record TransactionImpl(String mdcKey, String id) implements Transaction {

        private TransactionImpl(String mdcKey, String id) {
            this.mdcKey = mdcKey;
            this.id = id;
            MDC.put(mdcKey, id);
        }

        @Override
        public void close() {
            MDC.remove(mdcKey);
        }

        @Override
        public String toString() {
            return "TransactionImpl{id='" + id + "'}";
        }
    }
}
````
3.  **org.clematis.logging.CustomMDCConverter**: is used with Logback configuration 
to format MDC information and to actually insert a transaction identifier into logs:
````xml title="src/main/resources/logback-spring.xml"
<configuration>
    <conversionRule conversionWord="mdc" converterClass="org.clematis.logging.CustomMDCConverter" />

    <encoder>
      <pattern>[%date{"yyyy-MM-dd'T'HH:mm:ss,SSSXXX"}] [%thread] %level %logger{5} - %mdc %msg%n</pattern>
    </encoder>
    
</configuration>
````
:::info
These classes will soon be available as a shared library.
:::

## Runtime Diagnostic With JMX

Clematis applications use Spring JMX [to create, 
start, and expose](https://docs.spring.io/spring-framework/reference/integration/jmx/jsr160.html#jmx-jsr160-server)
a [JSR-160](https://jcp.org/en/jsr/detail?id=160) 
[connector](https://docs.oracle.com/cd/E19698-01/816-7609/connectors-116/index.html):
````
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jmx.support.ConnectorServerFactoryBean;

/**
 * JMXMP configuration 
 */
@Configuration
public class ConnectorServiceFactoryBeanProvider {

    @Value("${spring.jmx.url}")
    private String url;

    @Bean
    public ConnectorServerFactoryBean connectorServerFactoryBean() {
        final ConnectorServerFactoryBean connectorServerFactoryBean = new ConnectorServerFactoryBean();
        connectorServerFactoryBean.setServiceUrl(url);
        return connectorServerFactoryBean;
    }
}
````
The `spring.jmx.url` is a variable from Spring application properties, in turn
it depends on environment variables `JMXMP_HOST` and `JMXMP_PORT`:

````yaml title="src/main/resources/application.yml"
spring:
  jmx:
    enabled: true
    url: service:jmx:jmxmp://${JMXMP_HOST}:${JMXMP_PORT}/
management:
  endpoints:
    jmx:
      exposure:
        include: "health,info,env,beans"
    web:
      exposure:
        include: "health,info,env,beans"
````
The management section provides configuration for beans exposure over JMX or HTTP protocols.

:::warning
Clematis JMXMP Connectors are being used without optional SSL and SASL, however, it
can be turned on in no time if used outside the sandbox. 
:::

### Configure VisualVM for JMXMP 

[VisualVM](https://visualvm.github.io/) doesn't work with JMXMP protocol out of the box; however, it can be added to it.

1. Download `jmxremote_optional-repackaged-5.0.jar` from Maven:
````bash 
curl --output jmxremote_optional-repackaged-5.0.jar "https://repo1.maven.org/maven2/org/glassfish/main/external/jmxremote_optional-repackaged/5.0/jmxremote_optional-repackaged-5.0.jar"
````
2. Install VisualVM for your platform
3. Add `jmxremote_optional-repackaged-5.0.jar` to VisualVM classpath, for example, for macOS:
````bash
mv jmxremote_optional-repackaged-5.0.jar /Applications/VisualVM.app/Contents/Resources/visualvm/platform/lib/
````
4. Run VisualVM and create a JMXMP connection leaving fields for credentials blank and do not
require SSL connection this time:

<img src={require('@site/static/img/jmxmp.png').default} style={{width: '500px'}} alt={''}/>

5. Click OK and the connection should be established:

<img src={require('@site/static/img/visualvm.png').default} style={{width: '500px'}} alt={''}/>
