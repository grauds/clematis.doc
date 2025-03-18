---
sidebar_position: 4
tags:
  - dao
  - jpa
  - persistence-manager
---

# Data Access Objects

The [Data Access Objects](https://en.wikipedia.org/wiki/Data_Access_Object)
is the pattern to provide access to the underlying persistent storage. Spring Data JPA
(built on Hibernate) is responsible for this layer. 

## JPA Configuration

Spring Data JPA can be tuned up in regard to JPA and
Hibernate specific [settings](https://docs.spring.io/spring-boot/appendix/application-properties/index.html#appendix.application-properties.data).

:::info[Link to documentation]
Spring Data JPA [documentation](https://docs.spring.io/spring-data/jpa/reference/jpa.html).
:::

## Repository Resources

All repositories are kept in the packages like `org.clematis.*.repository` and are
annotated classes themselves:

````java title="src/main/java/org/clematis/cosmic/repository/ProjectRepository.java"
@RepositoryRestResource(path = "projects")
public interface ProjectRepository extends JpaRepository<Project, UUID> {
   // ...
}
````

Each repository needs a domain entity object, in the example above, it is `Project` class:

````java title="src/main/java/org/clematis/cosmic/model/Project.java"
@Table(name = "projects")
@Relation(collectionRelation = "data")
@Entity
@Data
@ToString(exclude = {"runs"})
@EqualsAndHashCode(callSuper = true)
public class Project extends IdEntity {

    private String name;
    private String description;

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

    public void add(InputData sampleData) {
        if (sampleData != null) {
            getRuns().add(sampleData);
            sampleData.setProject(this);
        }
    }
}
````
:::tip[Anemic domain model]
An entity class with JPA annotations only is an [antipattern](https://martinfowler.com/bliki/AnemicDomainModel.html).
Clematis domain classes often have some business logic in the classes.
:::

## Data REST Configuration

The core functionality of Spring Data REST is to export the [repositories](https://docs.spring.io/spring-data/rest/reference/repository-resources.html).

:::info[Shortcut]
Spring Data REST is designed to [automatically create](https://docs.spring.io/spring-data/rest/reference/representations.html)
DTOs for the Web. 
:::

A simple configuration is done in a Spring main configuration file, for example:

````yaml title="src/main/resources/application.yml"
spring:
  data:
    rest:
      basePath: /api
````
:::info[More customization]
There are several tips on how to customize repository exposure and supported HTTP methods
in the [documentation](https://docs.spring.io/spring-data/rest/reference/customizing-sdr.html).
:::

:::tip[Can be done differently]
As discussed before, another approach is to keep Data Access Objects only with data related annotations,
without any business logic and to have a separate package with POJO classes following
Domain Driven Design. 

This, however, would mean adding
Spring Web controllers capabilities to project to process business use cases.
In Clematis applications, the mixed approach is used.
:::


## Database Connections Pool

Spring bundles [Hikari](https://github.com/brettwooldridge/HikariCP) an implementation 
of a database connections pool. The pool doesn't require any configuration, 
but probably for some pool sizes:

````yaml title="src/main/resources/application.yml"
spring:
  datasource:
    initialization-mode: always

    hikari:
      maximum-pool-size: 25
      minimum-idle: 1

    username: SA
    password: password
    url: jdbc:h2:./data/dev
    driver-class-name: org.h2.Driver
````
Datasource is sending requests to the database instances so it needs to know the
addresses. Usually they are taken from the environment profiles.



