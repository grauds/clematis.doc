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

* The variable `res` is initialized to 1.
* While ```b > 0```, it checks if the lowest bit of ```b``` is set (i.e., if ```b``` is odd). 
If so, it multiplies ```res``` by a modulo ```mod```.
* Then, ```a``` is squared modulo mod and ```b``` is shifted right by 1 (divided by 2).
* This repeats until ```b``` becomes 0.
* The result is returned.

## GCD (The Greatest Common Divisor)

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

## LCM (The Least Common Multiple)

Least common multiple of two numbers:
```java
int lcm(int a, int b) {
    return (a * b) / gcd(a, b);
}
```

## Integer Division Reminder (Positive and Negative Numbers)

How it works:
1. ```a % b``` gives the remainder when ```a``` is divided by ```b```, for instance,
-1 % 3 = -1, while we want -1 % 3 = 2.
2. To get the correct answer, we add ```b``` to the remainder, for instance,
-1 % 3 + 3 = 2.
3. Then, we take the remainder again just in case the first number was positive. For instance,
2 % 3 = 2.
This works for any integer ```a``` and positive ```b```.
```java
int mod(int a, int b) {
    return ((a % b) + b) % b;
}  
```

## Integer Division With Rounding to The Nearest Integer

The core logic ```(a % b) * 2 >= b``` is a clever way to check if the 
fractional part is 0.5 or greater without using double.
How it works:
1. ```a / b``` gives the integer part of the division.
2. ```a % b``` gives the reminder.
3. ``` * 2 >= b``` doubles the reminder and checks if it is greater than or equal to ```b```.
4. If the condition is true, the reminder is incremented.

```java
int round(int a, int b) {
    int d = a / b;
    if ((a % b) * 2 >= b) {
        d++;
    }
    return d;
}
```

### The catch with the negative numbers
The above implementation is not correct for negative numbers. For instance,
1. If ```a = -7``` and ```b = 4```, then ```a / b = -3```.
2. The check ```(-3 * 2) >= 4``` is false, so it stays at ```-1```.
3. However, ```-1.75``` rounded to the nearest integer is ```-2```.

### The version for both positive and negative numbers

For positive numbers, we add ```b / 2```, if the fraction
is ```>= 0.5```, it pushes the number to the next multiple of ```b```.
For negative numbers, we subtract ```b / 2```, if the fraction
is ```<= 0.5```, it pushed the number firther down.

```java
int round(int a, int b) {
    if (a >= 0) {
        return (a + b / 2) / b;
    } else {
        return (a - b / 2) / b;
    }
}
```


## Integer Ceil Division (Positive Numbers, Always Rounds Up)

Integer division rounded up to the nearest integer.
```java
int ceilDiv(int B, int N) {
    return (B + N - 1) / N;
}
```

### The version for both positive and negative numbers

```java
int ceilDiv(int a, int b) {
    int res = a / b;
    // If there's a remainder and the result is positive, round up
    if ((a % b != 0) && ((a ^ b) >= 0)) {
        res++;
    }
    return res;
}
```
:::tip
It is recommended to use ```Math.ceilDiv(a, b)``` for production code to handle all cases. The
above implementation is only for educational purposes.
:::

### Log2 (a / b)

Calculates the smallest power of 2 that is greater than or equal to ```x```:
1. Subtracting 1 handles the case where `x` is already a perfect power of 2 
(but also valid for the smaller numbers, 
since a perfect power of 2 steps up to the next position of the highest bit).
2. For example, if `x = 8` (binary 1000, a perfect power of 2, length 4), we still 
want the answer to be 3, like for `7` and `6` and etc. 
3. By using `x - 1 = 7` (binary 0111), the highest bit moves down to address this 'off-by-one'
logic in <b>zero indexed</b> bits positions and powers of 2.
4. A long number in Java is 64 bits, so the method counts how many `0` bits are to the 
left of the highest set bit.
5. By substracting ```64 - number of leading zeros``` we find the position of the highest `1` bit,
which is the power of 2.
```java
long log2(long a, long b) {
    if (a <= b) {
        return 0;
    }
    long x = ceilDiv(a, b);
    return 64 - Long.numberOfLeadingZeros(x - 1);
}
```