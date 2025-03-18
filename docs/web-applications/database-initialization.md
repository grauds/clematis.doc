---
sidebar_position: 14
tags:
  - spring-data
  - hibernate
  - flyway
---

# Database Initialization

There are [several ways](https://docs.spring.io/spring-boot/how-to/data-initialization.html)
to import data to persistent storage. Almost all Clematis projects
deal with some legacy data they need to import or modify first.

## Money Tracker 

Money Tracker uses Spring [`schema.sql`](https://github.com/grauds/money.tracker.api/blob/master/src/main/resources/schema.sql)
file to add SQL views and stored procedures 
to existing data tables, see [documentation](https://docs.spring.io/spring-boot/how-to/data-initialization.html#howto.data-initialization.using-basic-sql-scripts):

````sql title="src/main/resources/schema.sql"
CREATE OR ALTER VIEW ...
                
CREATE OR ALTER PROCEDURE ...                
````

The file is checking for presence of views and procedures so 
run on an already prepared database.

## Cosmic

The Clematis Cosmic application uses [Hibernate to initialize](https://docs.spring.io/spring-boot/how-to/data-initialization.html#howto.data-initialization.using-hibernate)
a database with the following settings:

````yaml title="src/main/resources/application.yml"
spring:
  jpa:
    show-sql: true
    generate-ddl: true
    hibernate:
      ddl-auto: create-drop
      naming:
        physical-strategy: org.hibernate.boot.model.naming.PhysicalNamingStrategyStandardImpl
````

This approach has required a careful expression of the desired target schema 
since the result may not be exactly as expected, especially for 
join tables and many-to-one, many-to-many relations, etc. For example:

````java
@OneToMany(fetch = FetchType.EAGER, cascade = {
    CascadeType.MERGE, CascadeType.REFRESH, CascadeType.DETACH, CascadeType.REMOVE
})
@JoinTable(
    name = "project_runs",
    joinColumns = @JoinColumn(
        name = "project_id",
        referencedColumnName = "id"
    ),
    inverseJoinColumns = @JoinColumn(
        name = "input_id",
        referencedColumnName = "id"
    )
)
@OrderBy("date ASC")
private final List<InputData> runs = new ArrayList<>();
````
The above code fragment describes the specification of join
columns and reverse join columns to generate a proper 
join table `project_runs`.

## Clematis Weather 

The application requires a massive initial import of the data, plus
the database schema is exposed not only to the application itself but 
also to the Groovy script, which uses plain [Hibernate](https://hibernate.org/)
to store data.

Therefore, a high-level migration tool [Flyway](https://www.red-gate.com/products/flyway/) is used.
Spring Boot [supports](https://docs.spring.io/spring-boot/how-to/data-initialization.html#howto.data-initialization.migration-tool)
this type of migration and provides a special resource folder for the migraton
files, called `classpath:db/migration`.

### Configuration

A Gradle plugin and a few additional dependencies are added to the project:

````groovy title="build.gradle"
plugins {
    id "org.flywaydb.flyway" version "9.8.1"
}

dependencies {
    implementation "org.flywaydb:flyway-core:10.15.2"
    implementation "org.flywaydb:flyway-mysql:10.15.2"
}
````
The migration folder looks like below:
````
tools
 └─ parser 
    └─ src
       └─ main
          └─ resources
             └─ db
                └─ migration
                   └─ h2
                      ├─ V1_1__added_weather_image.sql
                      └─ V1__init.sql
 ...
````
Then Spring Boot will automatically apply this migration on every
application start and before tests.

### Data Import

Clematis Weather application is using a configuration bean to 
import textual and photo weather data:

````java title="src/main/groovy/org/clematis/weather/config/DataImporterConfig.groovy"
@Component
@SuppressFBWarnings
@Profile(value = "staging")
class DataImporterConfig {

    @Value('${jworkspace.weather.images.dir}')
    private String path

    @Bean
    CommandLineRunner importWeather(EntityManager entityManager, TransactionTemplate transactionTemplate) {
        return (args) -> transactionTemplate.execute(new TransactionCallbackWithoutResult() {
            @Override
            protected void doInTransactionWithoutResult(TransactionStatus status) {
                Session session = entityManager.unwrap(Session.class)
                WeatherImporter.loadWeatherData(session)
            }
        })
    }

    @Bean
    CommandLineRunner importWeatherImages(EntityManager entityManager, TransactionTemplate transactionTemplate) {
        return (args) -> transactionTemplate.execute(new TransactionCallbackWithoutResult() {
            @Override
            protected void doInTransactionWithoutResult(TransactionStatus status) {
                WeatherImagesImporter.loadWeatherImages(Path.of(path), entityManager.unwrap(Session.class))
            }
        })
    }
}
````
Both beans are instances of [`CommandLineRunner`](https://docs.spring.io/spring-boot/api/java/org/springframework/boot/CommandLineRunner.html)
interface to run a standalone data importer tool on application start.

## Dependable Components

:::tip
There is an annotation @DependsOnDatabaseInitialization 
for every [component dependable](https://docs.spring.io/spring-boot/how-to/data-initialization.html#howto.data-initialization.dependencies.depends-on-initialization-detection)
on the database initialization. 
:::