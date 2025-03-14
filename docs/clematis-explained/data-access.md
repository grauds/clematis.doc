---
sidebar_position: 13
tags:
  - dto
  - dao
  - spring-jpa
  - spring-data-rest
  - spring-web
  - domain-driven-design
---

# Data Access

Server-side data access is covered by Spring and configured by Spring Boot in a few quite simple
steps.

## Microservices Architecture

Each backend application has only one data source for it and has its own,
pretty limited functionality. This is done to make the applications comply
with microservices criteria:

1. Backend applications are small, manageable, self-contained
2. Can be deployed independently of others

:::info
More documentation on microservices themselves is available at canonical
[https://microservices.io/](https://microservices.io/). Also supported
by [Spring Cloud](https://spring.io/cloud).
:::

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

## Data Transfer Objects Pattern

Data Transfer Objects pattern (DTO) is used to convey the data requirements 
from client applications to the presentation layer of the backend application. 
DTO is a value-object which hides the implementation of the server-side
and allows to decouple the domain data access layer from 
the representational logic of client applications.

Being a financial reporting tool, Money Tracker uses different DTO quite
extensively to deliver the data to charts and tables. The classes are kept in
`org.clematis.mt.dto` package.

The controllers are in the different package `org.clematis.mt.web`, for instance:

````java title="src/main/java/org/clematis/mt/web/ExpenseController.java"
@RestController
public class ExpenseController {

    private final ExpenseRepository expenseRepository;

    public ExpenseController(ExpenseRepository expenseRepository) {
        this.expenseRepository = expenseRepository;
    }

    @GetMapping("/api/agentCommodityGroupExpenses")
    public ResponseEntity<Page<AgentCommodityGroup>> getAgentCommodityGroupExpenses(
            @RequestParam(value = "code") String code,
            @RequestParam(value = "moisStart") int moisStart,
            @RequestParam(value = "anStart") int anStart,
            @RequestParam(value = "moisEnd") int moisEnd,
            @RequestParam(value = "anEnd") int anEnd) {
            
            //...
    }
}
````
DTO can also be used to request parameters like below:

````java title="org/clematis/cosmic/web/RuntimeController.java"
@PostMapping("/copy")
public InputDataDTO copy(@RequestBody CalculationDTO calculationDTO) {
    return this.calculator.copy(calculationDTO.getProject(), calculationDTO.getInputData());
}
````
DTO often have their [almost identical counterparts](./data-querying/cosmic#typed-responses) in the TypeScript world on the other end of the
communication line.

:::info[Read on]
An interesting [article](https://blog.scottlogic.com/2020/01/03/rethinking-the-java-dto.html)
on DTO practice with a follow-up on [Domain-Driven Design](https://blog.scottlogic.com/2018/03/28/domain-driven-design.html).
:::




