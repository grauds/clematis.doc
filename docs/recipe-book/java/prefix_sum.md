---
tags:
  - prefix sum
  - algorithms
  - difference array
---

# Prefix Sum

## Definition 

:::info The source of confusion
Given ```int[] sum;``` is a prefix sum for an array, the sum between ```l``` 
and ```r``` indexes of the array would be ```sum[r] - sum[l]```.

Example:
* n = \[1 2 3 4 2 5\] -> prefix sum \[0 1 3 6 10 12 17\]
* l = 1 and r = 4 -> sum\[l\] = 1, sum\[r\] = 10
* sum\[r\] - sum\[l\] = 9
* Counting naively, the sum including r index is 12, the sum including l index is 3, 
* 12 - 3 \= 9.
:::

## Effective Modification of Counters' Interval 

The uniform modification of values in an array of counters: 

```java
int[] a = new int[n]; // arrays of values to work with
for (int i = 0; i < q; i++) { 
    int l = queries[i][0] - 1; // the left border of the interval
    int r = queries[i][1] - 1; // the right border of the interval
    a[l]++; // the first index of the range is gaining 1
    if (r + 1 < n) { // the last + 1 index of the range is losing 1
        a[r + 1]--;
    }
}

// compose the prefix sum
for (int i = 1; i < n; i++) {
    a[i] += a[i - 1];
}

```
Example:

* Given the array: \[0, 0, 0, 0, 0, 0\]
* Need to add 1 to numbers from 2 to 4
* Add 1 to l + 1: \[0, 0, 1, 0, 0, 0\]
* Subtract 1 from the next index to r: \[0, 0, 1, 0, 0, -1\]
* Need to add 1 to numbers from 1 to 3
* Add 1 to l + 1: \[0, 1, 1, 0, 0, -1\]
* Subtract 1 from the next index to r: \[0, 1, 1, 0, -1, -1\]

Always the last step after all operations are done
* Compose the prefix sum \[0, 1, 2, 2, 1, 0\]