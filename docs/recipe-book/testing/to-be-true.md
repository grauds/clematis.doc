---
tags:
  - jasmine
  - testing
---

# The Difference Between toBe, toBeTruthy and toBeTrue

These methods are coming from [Jasmine](https://jasmine.github.io) testing framework.

## toBe

Jasmine defines [toBe](https://github.com/jasmine/jasmine/blob/4097718b6682f643833f5435b63e4f590f22919f/lib/jasmine-core/jasmine.js#L2779)
as:

````typescript
getJasmineRequireObj().toBe = function() {
  function toBe() {
    return {
      compare: function(actual, expected) {
        return {
          pass: actual === expected
        };
      }
    };
  }

  return toBe;
};
````
This check is passed only if the variables comply with the following 
[conditions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Strict_equality#description).

## toBeTruthy

Jasmine defines [toBeTruthy](https://github.com/jasmine/jasmine/blob/4097718b6682f643833f5435b63e4f590f22919f/lib/jasmine-core/jasmine.js#L2908)
as:

````typescript
getJasmineRequireObj().toBeTruthy = function() {

  function toBeTruthy() {
    return {
      compare: function(actual) {
        return {
          pass: !!actual
        };
      }
    };
  }

  return toBeTruthy;
};
````
A value is truthy if the [coercion](https://developer.mozilla.org/en-US/docs/Glossary/Type_coercion) 
of the given value to a boolean yields the value true.

## toBeTrue 

Jasmine defines [toBeTrue](https://github.com/jasmine/jasmine/blob/2a7a1577139196d9f678a1749f640f8efbf7402b/lib/jasmine-core/jasmine.js#L6091)
as follows:

````typescript
getJasmineRequireObj().toBeTrue = function() {
  /**
   * {@link expect} the actual value to be `true`.
   * @function
   * @name matchers#toBeTrue
   * @since 3.5.0
   * @example
   * expect(result).toBeTrue();
   */
  function toBeTrue() {
    return {
      compare: function(actual) {
        return {
          pass: actual === true
        };
      }
    };
  }

  return toBeTrue;
};
````
The difference with `toBeTrue` and `toBe` is 
that `toBeTrue` tests the argument for the Boolean type.