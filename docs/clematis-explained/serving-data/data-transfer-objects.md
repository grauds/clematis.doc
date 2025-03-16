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
