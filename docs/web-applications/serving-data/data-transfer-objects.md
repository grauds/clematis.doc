---
sidebar_position: 2
tags:
  - dto
  - model-mapper
  - domain-driven-design
---

# Data Transfer Objects

## DTO Pattern

This pattern is used to convey the data requirements
from <i>client applications</i> to the <i>presentation layer</i> of the backend application.
DTO is a value-object that hides the implementation of the server-side
and allows to decouple the domain data access layer from
the representational logic of client applications, thus
adhering to Domain Driven Design principles.

The DTO classes are kept in `org.clematis.*.dto` packages, the controllers
are in the different packages `org.clematis.*.web`, for instance:

````java title="src/main/java/org/clematis/cosmic/web/RuntimeController.java"
@RestController
public class RuntimeController {

    private final Calculator calculator;

    public RuntimeController(Calculator calculator) {
        this.calculator = calculator;
    }

    @PostMapping("/copy")
    public InputDataDTO copy(@RequestBody CalculationDTO calculationDTO) {
        return this.calculator.copy(calculationDTO.getProject(), calculationDTO.getInputData());
    }
}
````
DTO often have their [identical counterparts](../data-querying/cosmic#typed-responses) in the TypeScript world on the other end of the
communication line.

:::info[Read on]
An interesting [article](https://blog.scottlogic.com/2020/01/03/rethinking-the-java-dto.html)
on DTO practice with a follow-up on [Domain-Driven Design](https://blog.scottlogic.com/2018/03/28/domain-driven-design.html).
:::

## Jackson Annotations

Spring uses
[Jackson](https://docs.spring.io/spring-framework/reference/web/webmvc-view/mvc-jackson.html)
to serialize and to deserialize the
objects to and from JSON during request processing. [Jackson annotations](https://github.com/FasterXML/jackson)
may help configure the representation:

````
@EqualsAndHashCode(callSuper = true)
@JsonIgnoreProperties(ignoreUnknown = true)
@Data
public class SampleDTO { 
   private UUID id;
   private String name;
   private String year;
}
````

:::info
Clematis Web applications use JSON to exchange data that's why Jackson is selected 
among all the pluggable MVC view [alternatives](https://docs.spring.io/spring-framework/reference/web/webmvc-view.html).
:::

## Web Controllers

Spring uses `org.springframework.web.bind.annotation.RestController` annotation to 
mark up a controller class. Such REST controllers are working with DTOs to receive 
requests and to send responses.

For example, a typical controller may look like below:

````java title="src/main/java/org/clematis/mt/web/ExpenseController.java"
//...
import org.springframework.web.bind.annotation.RestController;

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

        List<AgentCommodityGroup> groups = this.expenseRepository.getAgentCommodityGroups(
            code, moisStart, anStart, moisEnd, anEnd
        );
        Pageable pageRequest = Pageable.ofSize(groups.size());
        Page<AgentCommodityGroup> p = new PageImpl<>(groups, pageRequest, groups.size());

        HttpHeaders headers = new HttpHeaders();
        headers.add("X-Page-Number", String.valueOf(p.getNumber()));
        headers.add("X-Page-Size", String.valueOf(p.getSize()));

        return ResponseEntity
                .ok()
                .headers(headers)
                .body(p);
    }
}
````

Controllers use repositories for complex business scenarios during request processing.


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
public ExpenseController(ModelMapper modelMapper,
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
