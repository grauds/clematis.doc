---
sidebar_position: 4
tags:
  - dao
  - jpa
  - persistence-manager
---

# Data Access Objects

The [Data Access Objects](https://en.wikipedia.org/wiki/Data_Access_Object)
is the pattern to provide access to the underlying persistent storage. 

:::info[Shortcut]
Spring Data REST is designed to [automatically create](https://docs.spring.io/spring-data/rest/reference/representations.html)
Data Access Objects representations for the Web. 
Due to specifics of the client applications 
requirements, the majority of work to deliver the data from the storage
to the clients is done with Spring Data REST.
:::

## Configuration 

A simple configuration is done in a Spring main configuration file, like:

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

## Repository Resources

The core functionality of Spring Data REST is to export the [repositories](https://docs.spring.io/spring-data/rest/reference/repository-resources.html).
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

:::info[Can be done differently]
Another approach is to keep Data Access Objects simple, without any
business logic and to have a separate package with POJO classes following
Domain Driven Design pattern. This, however, would need exchanging Spring Data REST
for a set Spring Web controllers.
:::

## Model Mapper

Mapping data between DTO and DAO layers is a common task due to separation of 
concerns. In many cases in Clematis applications, this task is straightforward.

A helper library [Model Mapper](https://modelmapper.org/) is used to map data in such cases.
Dependency is like the following:

````gradle title="build.gradle"
dependencies {
   implementation "org.modelmapper:modelmapper:3.2.0"
}
````
Often mapping needs to be customized. For that purpose a type map can be created with
`modelMapper.createTypeMap` method, like below:

````
public Calculator(ModelMapper modelMapper,
                  //...
) {
    this.modelMapper = modelMapper;
    
    this.createNewProjectTypeMap = this.modelMapper.createTypeMap(
            ProjectDTO.class, Project.class, "createNewProjectTypeMap"
        ).addMappings(mapper -> mapper.skip(Project::setId));
        
    this.createNewInputDataTypeMap = this.modelMapper.createTypeMap(
            InputDataDTO.class, InputData.class, "createNewInputDataTypeMap"
        ).addMappings(mapper -> {
            mapper.skip(InputData::setId);
            mapper.skip(InputData::setStatus);
            mapper.skip(InputData::setFailed);
        });
        
    // ...    
}
````
In this cases `Project` and `InputData` entities will not get some fields during mapping.

## JPA Configuration

Spring Data JPA can be tuned up in regard to JPA and 
Hibernate specific [settings](https://docs.spring.io/spring-boot/appendix/application-properties/index.html#appendix.application-properties.data):

````yaml
spring:
  jpa:
    show-sql: true
    generate-ddl: true
    hibernate:
      ddl-auto: create-drop
      naming:
        physical-strategy: org.hibernate.boot.model.naming.PhysicalNamingStrategyStandardImpl
````


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



