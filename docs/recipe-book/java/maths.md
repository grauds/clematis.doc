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

## GCD

Greatest common divisor of two numbers:

```java
int gcd(int a, int b) {
    if (b == 0) {
        return a;
    }
    return gcd(b, a % b);
}
````

The same without recursion:

````java
    static int gcd(int a, int b) {
        a = Math.abs(a);
        b = Math.abs(b);
        if (a == 0) {
            return b;
        }
        if (b == 0) {
            return a;
        }
        while (b != 0) {
            int t = a % b;
            a = b;
            b = t;
        }
        return a;
    }
````

## LCM

Least common multiple of two numbers:
```java
int lcm(int a, int b) {
    return (a * b) / gcd(a, b);
}
```

## Integer Ceil Division

Integer division rounded up to the nearest integer.
```java
int ceilDiv(int B, int N) {
    return (B + N - 1) / N;
}
`````
