---
tags:
  - algorithms
  - search
---

# Binary Search

Binary search includes both limits of an interval.

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

The last value which makes ```check``` procedure return true.

```java

   int[] a = new int[n];
   //...
   int l = 0;
   int r = n - 1;
   
   while (l < r) {
       int m = (l + r + 1) / 2; // rounding up
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