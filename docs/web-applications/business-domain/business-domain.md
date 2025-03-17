---
sidebar_position: 13

tags:
  - web-controller
  - model-mapper
  - collection-of-requirements
  - wireframes
  - cucumber
---

# Business Domain

This paragraph is a part of the <i>collection of requirements</i> process,
which also includes [wireframing](../wireframes) and modeling 
with UML. 

:::info
Worth mentioning that DDD implies the domain becomes familiar to 
developers during discussion and modeling, so it may replace formal requirements with
a domain model and universal language for it.
:::

According to Eric Evans' 'Domain-Driven Design' definition:

> Domain Layer: This layer contains information about the domain. This
> is the heart of the business software. The state of
> business objects is held here. Persistence of the
> business objects and possibly their state is delegated to
> the infrastructure layer.

The implementation of this layer is different in all the projects, since the requirements
are different and the business domains are different by their nature.

## Money Tracker

The specific requirements of this project are the following:

1. Money Tracker business logic is done in the original desktop application,
the web application is only trying to extend the data analysis.
2. Money Tracker web application is not changing any data in the database since
the desktop application is used for that and the database is regularly synchronized.

Therefore, the package `org.clematis.mt.model` is bound to the database schema.

### Native Queries

The solution is to give the business domain to Spring Data and to use more complex queries
to generate data for presentation in charts. Native JPA queries are used to 
select all required data in one request to the underlying database. For example:

````java title="src/main/java/org/clematis/mt/repository/CommodityGroupRepository.java"
@RepositoryRestResource(path = "commodityGroups")
public interface CommodityGroupRepository
        extends PagingAndSortingAndFilteringByNameRepository<CommodityGroup, Integer> {
    @Query(
            value = """
                SELECT * FROM (WITH RECURSIVE w1(id, parent, name) AS
                (SELECT c.id, c.parent, c.name
                    FROM COMMGROUP as c
                    WHERE c.id = :id
                UNION ALL
                SELECT c2.id, c2.parent, c2.name
                    FROM w1 JOIN COMMGROUP as c2 ON c2.id=w1.parent
                )
                SELECT * FROM w1 WHERE w1.id <> :id)""",
            nativeQuery = true
    )
    @RestResource(path = "pathById")
    List<CommodityGroup> findPathById(@Param("id") Integer id);
````
This example uses a recursive query to get the path in the group of commodities.

### Stored Procedures

Some calculations in queries are repeated many times and should be as quick as possible. For example,
this is a procedure to find cross-rate for two currencies on some date. If the pair is not the main
pair with exchange rate known in the database, the cross-rate calculation is used.

### Solution Estimation

The business domain is driven by the legacy database schema, and some
business logic leaks to stored procedures and complex queries.
Business domain classes are also DAO classes:

````mermaid
block-beta
    columns 4    
   
    db[("Legacy DB")]:3
    space:3
    block:DDD:2
        columns 2
        DAO Domain
    end
    DTO space DDD
    db --> DDD
    DDD --> db
    DDD --> DTO
````
Pros:
+ Complex native queries and stored procedures give a significant performance boost.
+ The combination of Data Access Objects and business domain classes saved from some boilerplate code.

Cons:
+ Native queries are harder to write and debug.
+ Stored procedures steal some business logic and hide it under wraps.
+ Database vendor lock-up.
+ Fragile DDD, since any change of presentation requirements will lead to changes in the 
business domain.
+ The combination of Data Access Objects and business domain classes imposes limitations on.

## Cosmic

:::info[NDA]
Unfortunately, the source code and business domain for the project are under the Non-disclosure agreement, so it 
is only possible to describe the general principles of domain design.
:::

The requirements for the project are quite commonly seen in other projects:

1. Users are working on projects.
2. Each project has its own settings and data.
3. Each project has a list of calculation results. 
4. Results can be downloaded in text format.
5. Input/Output of Fortran module should be stored in the persistent storage.


### Solution Estimation

The business domain drives the Database schema in this project. However, the complex business
logic is in the legacy code module and the application is using that module as a [black box](https://en.wikipedia.org/wiki/Black_box).
DTO are required to communicate with that black box, and they reflect the data
requirements of scientific software.

````mermaid
block-beta
    columns 3    
       
    m("Legacy Code"):2
    space:2
    
    db[("Web Database")]:3   
    space:2
    
    legacy_dto("Legacy DTO") 
    space:2
    
    block:DDD:2
        columns 2
        DAO Domain
    end
    
    dto("Web DTO")
    
    m --> legacy_dto
    legacy_dto --> m
    legacy_dto --> DAO
    
    dto space DAO
    db --> DAO
    DAO --> db
    DDD --> dto
````

Pros:
+ DDD principles are satisfied, the solution has a Presentation Layer and a Domain Layer.
+ The combination of Data Access Objects and business domain classes saved from some boilerplate code.

Cons:
+ The combination of Data Access Objects and business domain classes imposes limitations on 
business domain modification during software maintenance.

## Conclusion

It is advisable to have business logic separated from data access related classes, however, it
is also possible to keep them together since [Spring Data allows that](https://docs.spring.io/spring-data/relational/reference/jdbc/domain-driven-design.html). 
Keeping that in mind during discussion of requirements may help avoid creating boilerplate code.