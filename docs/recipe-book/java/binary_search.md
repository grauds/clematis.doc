---
tags:
  - search
  - algorithms
---

# Binary Search

:::info
Binary search includes both limits of an interval.
:::
:::warning
Binary search works with arrays of more than one element.
:::

## Edge Cases

* It is reasonable to check if the element we search for is less or equal than the first element of the array.
* It is also reasonable to check if the element we search for is greater or equal than the last element of the array.
* The search returns `0` index if the element is not found. In this case, an additional check is required: `check(m, params)`.
For instance, in array `[2, 4, 6, 8]`, if we search for elements `< 2`, the pointers will end up at 0. 
* The same with the last element, the condition should be validated once again.

## Left Binary Search

The first value which makes ```check``` procedure return true. 

```java
 
   int[] a = new int[n];
   //...
   int l = 0;
   int r = n - 1;
   
   while (l < r) {
       int m = (l + r) / 2;
       if (check(m, params)) {
            r = m;                   
       } else {
            l = m + 1;
       }
   }
   
   return l;
```
Justification:

* Array of two elements, pointers are set as displayed: \{ L, R \}
* If ```check``` is OK => \{ Lm, R \} => \{ LR, ... \}
* If ```check``` is not OK => \{ Lm, R \} => \{ ..., LR \} => would've been an endless loop if L is not m + 1,
in other words \{ L, R \} again.


## Right Binary Search

The last value which makes ```check``` procedure return true or ```n - 1```.

```java

   int[] a = new int[n];
   //...
   int l = 0;
   int r = n - 1;
   
   while (l < r) {
       int m = (l + r + 1) / 2; // rounding up
       if (m >= n) {
          break;
       }
       if (check(m, params)) {
           l = m;
       } else {
           r = m - 1;        
       }   
   }
 
   return l;
```

Justification:

* Array of two elements, pointers are set as displayed: \{ L, R \}
* If ```check``` is OK => \{ L, Rm \} => \{ ..., LR \}, m is rounding up.
* If ```check``` is not OK => \{ L, Rm \} => \{ LR, ... \} => would've been an endless loop if L is not m - 1,
  in other words \{ L, R \} again.