---
tags:
  - prefix_sum
  - algorithms
---

# Prefix Sum

## Effective Modification of Counters' Interval 

The uniform modification of values in an array of counters: 

```java
int[] a = new int[n]; // arrays of values to work with
for (int i = 0; i < q; i++) { 
    int l = queries[i][0] - 1; // the left border of the interval
    int r = queries[i][1] - 1; // th
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
* Add 1 to l: \[0, 0, 1, 0, 0, 0\]
* Subtract 1 from the next index to r: \[0, 0, 1, 0, 0, -1\]
* Need to add 1 to numbers from 1 to 3
* Add 1 to l: \[0, 1, 1, 0, 0, -1\]
* Subtract 1 from the next index to r: \[0, 1, 1, 0, -1, -1\]

Always the last step after all operations are done
* Compose the prefix sum \[0, 1, 2, 2, 1, 0\]