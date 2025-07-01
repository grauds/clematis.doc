---
tags:
  - hashmap
  - hashset
---

# Math Operations

## Modular exponentiation

The implementation of modular exponentiation 
(also known as "binary exponentiation" or "fast power modulo").
It efficiently computes ```(a^b) % mod``` for large values of a and b without causing integer overflow.

```java
    long res = 1;
    a %= mod;
    while (b > 0) {
        if ((b & 1) == 1) { // if b is odd
            res = (res * a) % mod; // extra multiplication for b to become even
        }
        a = (a * a) % mod; // get a square
        b >>= 1; // divide by two 
    }
    return res;
```

How it works:

* The variable res is initialized to 1.
* While b > 0, it checks if the lowest bit of b is set (i.e., if b is odd). If so, it multiplies res by a modulo mod.
* Then, a is squared modulo mod and b is shifted right by 1 (divided by 2).
* This repeats until b becomes 0.
* The result is returned.