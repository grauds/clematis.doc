---
sidebar_position: 16
tags:
  - junit-jupiter
  - spotbugs
  - lombok
  - rest-assured
  - spring-rest-docs
  - test-containers
  - spring-doc-open-api
---

# Backend Testing

The basic dependencies for testing are the same for all the projects:

````gradle title="build.gradle"
dependencies {
    testAnnotationProcessor 'org.projectlombok:lombok:1.18.34'
    testCompileOnly (
        "org.projectlombok:lombok",
        "com.github.spotbugs:spotbugs:4.8.4",
        "com.google.code.findbugs:annotations:3.0.1u2"
    )
}
````
As for the rest of the code, tests use [Lombok](https://projectlombok.org/) annotations, for
compilation time we need [SpotBugs](https://spotbugs.github.io/)
and accompanying Findbugs annotations to exclude some cases. Checkstyle will be working
as it has been configured for the entire codebase earlier.

## Unit Tests

All the backend projects share the same [junit5](https://junit.org/junit5/) platform for unit tests.
It is configured as follows:

````gradle title="build.gradle"
dependencies {
    testImplementation platform('org.junit:junit-bom:5.9.1')
    testImplementation 'org.junit.jupiter:junit-jupiter'
}

test {
    useJUnitPlatform()
}
````
Only Jupiter engine is used, and `junit-bom` ('bill of materials') manages all the dependencies.

The example of the simple unit tests may be like below:

````java
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

public class ValidAnagramTest {

    @Test
    public void testHash() {
        Assertions.assertFalse(ValidAnagram.isAnagram("cat", "rat"));
    }
}
````
The imports are from `org.junit.jupiter` package.

## Persistence Tests

It is often useful to test the JPA layer in isolation, apart from any other environments.
Hibernate can work with plain Java code, in desktop or command line applications, so we
can add, for example, a testing dependency for an [H2](https://www.h2database.com/html/main.html)
database and work with it:

````gradle title="build.gradle"
dependencies {
    testImplementation "com.h2database:h2"
}   
````
The base class for such tests would be:

````java 
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.hibernate.cfg.Configuration;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;

/**
 * For tests without Spring Boot
 */
public class PersistenceTests {

    protected static SessionFactory sessionFactory;
    protected static Session session = null;

    @BeforeAll
    static void before() {
        // set up the session factory
        Configuration configuration = new Configuration();

        // add your JPA model classes
        // configuration.addAnnotatedClass(...)

        configuration.setProperty("hibernate.dialect", "org.hibernate.dialect.H2Dialect");
        configuration.setProperty("hibernate.connection.driver_class", "org.h2.Driver");
        configuration.setProperty("hibernate.connection.url", "jdbc:h2:./src/test/resources/db/mem");
        configuration.setProperty("hibernate.hbm2ddl.auto", "create");
        sessionFactory = configuration.buildSessionFactory();
        session = sessionFactory.openSession();
    }

    @AfterAll
    static void after() {
        session.close();
        sessionFactory.close();
    }
}
````
It opens a session for all the tests in our case, and tests will use the session to 
work with in-memory database instance. Such tests are quick and light, so they come in handy
during database related development.

## Spring Application Tests

Spring tests are required to test the application in a server environment. 
The tests are configured with another Spring Boot starter:
````gradle title="build.gradle"
dependencies {
    testImplementation ('org.springframework.boot:spring-boot-starter-test') {
        exclude group: 'org.junit.vintage', module: 'junit-vintage-engine'
    }
}
````
The junit-vintage engine can be safely excluded from the project dependencies
as the tests don't need it.

### Basic Test Class

The base class for application tests can be quite simple:

````java
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest(
    classes = Application.class,
    webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT
)
@ActiveProfiles("test")
public class ApplicationTests {

}
````
An example test class is below:

````java 
public class SomeRepositoryTest extends ApplicationTests {

    @Autowired
    private SomeRepository someRepository;

    @SuppressWarnings("checkstyle:MagicNumber")
    @Test
    public void testSearchByString() {
        Page<SomeData> result = someRepository.findDataListBySearchText(
            "test",
            Pageable.ofSize(20)
        );
        Assertions.assertEquals(1, result.getTotalElements());
    }
}
````

### In-Memory Database 

A typical test now can inject any repositories configured to work with a test datasource,
for example, the same as in pure persistence tests above:

````yaml
spring:
  datasource:
    url: jdbc:h2:mem:testdb
    driver-class-name: org.h2.Driver
    username: sa
    password: password
````

## Spring REST Tests

Another important layer of tests is for the application REST API. They are also built
with the Spring Boot Test; however, some additional dependencies should be added.


### With Spring REST Docs

As described in [Documenting Backend API](backend-api.md#using-spring-rest-docs),
all Clematis projects are being migrated to REST-assured:

````gradle title="build.gradle"
dependencies {
    testImplementation 'io.rest-assured:rest-assured:5.5.1'
    testImplementation 'io.rest-assured:json-path:5.5.1'
}
````

The base class for tests becomes a little more complex:

````java
@SpringBootTest(
    classes = Application.class, 
    webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT
)
@ActiveProfiles("test")
@ExtendWith({RestDocumentationExtension.class, SpringExtension.class})
public class ApplicationTests {

    @LocalServerPort
    int port;

    protected RequestSpecification spec;

    @BeforeEach
    public void setUp(RestDocumentationContextProvider restDocumentation) {
        RestAssured.port = port;
        this.spec = new RequestSpecBuilder()
            .addFilter(documentationConfiguration(restDocumentation))
            .build();
    }

    @Test
    void contextLoads() {}

}
````

### REST Test Example

For instance, in Cosmic Storage tests now are using [RestAssured](https://rest-assured.io/) 
to send queries to real endpoints, using some file mocks for multipart file upload:

````java 
public class DownloadTests extends ApplicationTests {

    public static final String HELLO_WORLD = "Hello, world!";

    public static Resource mockMultipartFile() throws IOException {
        Path testFile = Files.createTempFile("test", ".txt");
        Files.writeString(testFile, HELLO_WORLD);
        return new FileSystemResource(testFile.toFile());
    }

    @Test
    public void testFileDownloadDatabase() throws IOException {

        RequestResponse response =
            given(this.spec).
                multiPart(mockMultipartFile().getFile()).
                filter(document("dbupload")).
            when().
                post("/api/db/upload").
            andReturn().
                body().
                as(RequestResponse.class);

        Assertions.assertNotNull(response);

        byte[] file
            = given(this.spec)
                .filter(document("index"))
            .when()
                .get(response.getDownloadUrl())
            .asByteArray();

        Assertions.assertNotNull(file);
        Assertions.assertEquals(HELLO_WORLD, new String(file, StandardCharsets.UTF_8));
    }
}
````
These tests help verify DTO classes and their serialization with Jackson, plus
successful tests generate API documentation.

## Integration Tests

Setting up tests with the database which is to be used in production is a bit more
challenging; given that, for example, an instance of [MySQL](https://www.mysql.com/)
database should be started somewhere. Ideally, this stage should also be runnable
in a Jenkins pipeline. Clematis API applications use
[Testcontainers](https://testcontainers.com/) to do the job.

### Gradle Setup

There are some dependencies to be added to a project to start with Testcontainers:

````gradle title="build.gradle"
dependencies {
    testImplementation 'org.springframework.boot:spring-boot-testcontainers'
    testImplementation 'org.testcontainers:junit-jupiter'
    testImplementation 'org.testcontainers:mysql'
}
````
The dependencies above add throwaway instances of MySQL database. However, the ideal option
would be to put integration tests aside of unit tests, i.e., to configure another 
[source root in the Gradle project](https://docs.gradle.org/current/userguide/java_testing.html#sec:configuring_java_integration_tests):

````gradle title="build.gradle"
sourceSets {
    intTest {
        compileClasspath += sourceSets.main.output
        runtimeClasspath += sourceSets.main.output
    }
}

configurations {
    intTestCompileOnly.extendsFrom testCompileOnly
    intTestImplementation.extendsFrom testImplementation
    intTestRuntimeOnly.extendsFrom testRuntimeOnly
}

dependencies {
    intTestAnnotationProcessor 'org.projectlombok:lombok:1.18.34'

    intTestImplementation 'io.rest-assured:rest-assured'
    intTestImplementation 'org.junit.jupiter:junit-jupiter:5.7.1'
    intTestRuntimeOnly 'org.junit.platform:junit-platform-launcher'
}

idea {
    module {
        testSources.from(sourceSets.intTest.java.srcDirs)
    }
}
````
The dependencies above may be different, they are there just to demo that they are appendable
to ones imported from the test source root.

### With Testcontainers

The next step is to add a database instance to the integration tests. There are some tricky moments,
which may not be quite visible from the documentation. Let's start with a basic test class:

````java 
@Testcontainers
@Log
public class ApplicationIntegrationTest {
    static final Network SHARED_NETWORK = Network.newNetwork();
    @Container
    private static final GenericContainer<?> CONTAINER;
    private static final DockerImageName MYSQL_IMAGE = DockerImageName.parse("mysql:8.0.36");
    @Container
    private static final MySQLContainer<?> MYSQL_CONTAINER;
}
````
First, the network, the generic container and the image are specified in the test base class.
The second step is to create and start the database instance, and after that to start the 
application container instance:

````java 
@Testcontainers
@Log
public class ApplicationIntegrationTest {
   //...
   static {
        MYSQL_CONTAINER = new MySQLContainer<>(MYSQL_IMAGE)
            .withUsername("clematis")
            .withPassword("password")
            .withNetwork(SHARED_NETWORK)
            .withNetworkAliases("mysql");
        MYSQL_CONTAINER.start();

        CONTAINER
            = new GenericContainer<>(
                new ImageFromDockerfile()
                .withFileFromClasspath("Dockerfile", "Dockerfile_int")
                .withFileFromClasspath("Makefile", "Makefile")
                .withFileFromFile("app.jar",
                    new File("build/libs/app.jar")
                )
        ).withNetwork(SHARED_NETWORK)
            .dependsOn(MYSQL_CONTAINER)
            .withEnv("SPRING_DATASOURCE_URL", "jdbc:mysql://mysql:"
                + MYSQL_PORT
                + "/"
                + MYSQL_CONTAINER.getDatabaseName()
            )
            .withEnv("SPRING_DATASOURCE_USERNAME", MYSQL_CONTAINER.getUsername())
            .withEnv("SPRING_DATASOURCE_PASSWORD", MYSQL_CONTAINER.getPassword())
            .withEnv("JMXMP_HOST", "localhost")
            .withEnv("JMXMP_PORT", "5005")
            .withLogConsumer(LogConsumer::log)
            .withExposedPorts(8080)
            .waitingFor(Wait
                .defaultWaitStrategy()
                .withStartupTimeout(Duration.ofSeconds(60))
            );
        CONTAINER.start();
    }  
}
````
The fragment above creates a [generic container](https://java.testcontainers.org/features/creating_container/)
based on the Docker image which can be [<i>dynamically</i> built](https://java.testcontainers.org/features/creating_images/)
from the project Dockerfile. After that, the application container is being put on the same
network as the MySQL container, and what is most important for successful connection, the
address of the database is configured by the test via `withEnv` method.

The last part is to communicate the database address to the Spring application within the 
application container:

````java
@Testcontainers
@Log
public class ApplicationIntegrationTest {
    
    //...
    
    @DynamicPropertySource
    static void init(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", MYSQL_CONTAINER::getJdbcUrl);
        registry.add("spring.datasource.password", MYSQL_CONTAINER::getPassword);
        registry.add("spring.datasource.username", MYSQL_CONTAINER::getUsername);
    }    
}    
````
The `DynamicPropertyRegistry` can be configured for that and 
[Spring will understand](https://docs.spring.io/spring-framework/reference/testing/annotations/integration-spring/annotation-dynamicpropertysource.html)
it when the application tries to read datasource URL and credentials.

### Integration Test Example

The last piece of the puzzle is that the integration tests use `CONTAINER.getMappedPort(8080)`
port to send requests, for example:

````java
@Test
public void testInfo() {
    given()
        .port(CONTAINER.getMappedPort(8080))
        .when()
        .get("/info")
        .then()
        .statusCode(200);
}
````
This is done this way because we've created the application container with internal
port 8080 exposed to the outer network, i.e. `withExposedPorts(8080)`, and now the test
needs to know which external random port has been allocated, 
i.e. `getMappedPort(8080)` will tell us.

:::info[Useful link]
More info on [Testcontainers networking](https://java.testcontainers.org/features/networking/).
:::

:::tip[Gherkin integration]
The integration tests can contribute to the process of collection 
and validation of the [requirements](cucumber-playwright.md#testing-a-feature) if the
feature is an endpoint.
:::

## Coverage

All tests, except for integration ones, measure coverage in the same terms as
client side applications, for example, [Pomodoro](./testing/pomodoro.md#coverage).
The coverage report is then can be 
[shown by Jenkins](continuous-deployment/continuous-deployment.md#coverage-report).

### Gradle Setup

Clematis APIs use [Gradle JaCoCo plugin](https://docs.gradle.org/current/userguide/jacoco_plugin.html)
and configure `jacocoTestReport` as a final stage for `test` task:

````gradle title="build.gradle"
plugins {
    id "jacoco"
}

test {
    outputs.dir snippetsDir
    useJUnitPlatform()
    testLogging.showStandardStreams = true
    finalizedBy jacocoTestReport
    jacoco {
        destinationFile = file("jacoco/jacocoTest.exec")
        classDumpDir = file("jacoco/classpathdumps")
    }
}

jacocoTestReport {
    dependsOn test // tests are required to run before generating the report
    reports {
        xml.required = true
        csv.required = false
        html.outputLocation = file('jacoco/html')
        xml.outputLocation = file('jacoco/jacoco.xml')
    }
    subprojects.each {
        sourceSets it.sourceSets.main
    }
    executionData fileTree(project.rootDir.absolutePath).include("jacoco/*.exec")
}
````

### Docker Build

Worth noting, that the directory with the JaCoCo reports is copied from the Docker build
stage is the build and the tests for the project run in a Docker build stage:

````docker
# ------------------------------------------------------------------------------
# COPY COVERAGE STAGE (after build)
# ------------------------------------------------------------------------------

FROM scratch AS jacoco
COPY --from=build /workspace/coverage .
````

Jenkins will work with this data later:

````
{
    //...
    stage('Publish tests') {
        steps {
            recordCoverage(tools: [[parser: 'JACOCO']],
                    id: 'jacoco', name: 'JaCoCo Coverage',
                    sourceCodeRetention: 'EVERY_BUILD',
                    qualityGates: [
                            [threshold: 60.0, metric: 'LINE', baseline: 'PROJECT', unstable: true],
                            [threshold: 60.0, metric: 'BRANCH', baseline: 'PROJECT', unstable: true]])
        }
    }
    //...
}
````
More info on Jenkins pipeline is in the next chapter.