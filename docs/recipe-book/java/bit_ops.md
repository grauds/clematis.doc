---
tags:
  - bit_ops
  - cheat_sheet
---

# Bit Ops Cheat Sheet

| Operation | Symbol   | Meaning                              | Example      |
| --------- | -------- | ------------------------------------ | ------------ |
| AND       | `a & b`  | Bit = 1 if both bits = 1             | `6 & 3 = 2`  |
| OR        | `a \| b` | Bit = 1 if at least one bit = 1      | `6 \| 3 = 7` |
| XOR       | `a ^ b`  | Bit = 1 if bits differ               | `6 ^ 3 = 5`  |
| NOT       | `~a`     | Bitwise inversion (two’s complement) | `~5 = -6`    |

| Operation              | Symbol    | Description                     |
| ---------------------- | --------- | ------------------------------- |
| Left shift             | `a << k`  | Multiplies by `2^k`             |
| Arithmetic right shift | `a >> k`  | Divides by `2^k`, sign-extended |
| Logical right shift    | `a >>> k` | Shifts right with zero fill     |

## Bit Manipulation

Check the i-th bit
```java
((x >> i) & 1) == 1
```
Set the i-th bit
```java
x |= (1 << i);
```
Clear the i-th bit
```java
x &= ~(1 << i);
```
Toggle the i-th bit
```java
x ^= (1 << i);
```
## Common Bit Tricks

Check if x is even
```java
(x & 1) == 0
```
Get the lowest set bit (LSB)
```java
int lsb = x & -x;
```
Remove the lowest set bit
```java
x &= (x - 1);
```
Check if x is a power of two
```java
(x > 0) && ((x & (x - 1)) == 0)
```
XOR swap (not recommended in practice)
```java
a ^= b;
b ^= a;
a ^= b;
```

## Masks

   0xFF — lowest 8 bits
   0xFFFF — lowest 16 bits
   0xFFFFFFFF — all 32 bits (int)

Extract an 8-bit value:
```java
int b = x & 0xFF;
```

## Java-Specific Notes
* Bitwise operations on byte and short promote to int. Cast back if needed:
```java
byte b = (byte)(b << 1);
```
* ```>>>``` Works only on int and long as an unsigned shift.

## Extract the Lowest Set Bit (LSB)

```java
int lsb = x & -x;
```

## Unique Value In Array (XOR)

```java
int x = 0;
for (int v : arr) {
    x ^= v;
}
return x;
```
