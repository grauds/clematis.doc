---
sidebar_position: 2
tags:
  - dto
  - model-mapper
---

# Data Transfer Objects

## DTO Pattern

This pattern is used to convey the data requirements
from client applications to the presentation layer of the backend application.
DTO is a value-object which hides the implementation of the server-side
and allows to decouple the domain data access layer from
the representational logic of client applications.

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

## Model Mapper

Due to separation of concerns described above, there could be situations when
DTO classes are similar to model classes or to entity classes.
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
