---
tags:
  - streams
---

# Streaming API

Some streaming tricks for routine tasks:

## Reading a file line by line and flatting words out to an array

```java
    String[] words = reader
        .lines()
        .map(l -> l.split("\\s+"))
        .flatMap(Arrays::stream)
        .map(w -> w.replaceAll("[^a-zA-Z]",""))
        .map(String::toLowerCase)
        .filter(w -> !w.isEmpty())
        .toArray(String[]::new);
```

## Reading a line and turning it to numbers

```java
    int[] numbers = Arrays.stream(reader.readLine().split("\\s+"))
                     .mapToInt(Integer::parseInt)
                     .toArray();
```

## Counting the same numbers in the array

...and displaying a histogram (assuming no positions are skipped):

```java
    int[] n = Arrays.stream(reader.readLine().split("\\s+"))
        .mapToInt(Integer::parseInt)
        .boxed() // convert int to Integer
        .collect(Collectors.toMap(
            i -> i,   // key: the number itself
            i -> 1,   // counter value = +1
            Integer::sum   // merge function: sum values with the same key
        ))
        .entrySet().stream() // iterate over map entries
        .sorted(Map.Entry.comparingByKey())  // sort by key
        .mapToInt(Map.Entry::getValue) // extract values
        .toArray();
```

Example:

* \[1 2 3 4 5 6 5 4 7 8\] -> \[1, 1, 1, 2, 2, 1, 1, 1\]

## Counting the same numbers in the array with positions

A slightly different example with positions preserved, for example, pos. #7 and #8 are
missing, so they are missing from the result too:

```java
    int[][] n = Arrays.stream(reader.readLine().split("\\s+"))
        .mapToInt(Integer::parseInt)
        .boxed() // convert int to Integer
        .collect(Collectors.toMap(
            i -> i,          // key: the number itself
            i -> 1,                // value = +1
            Integer::sum                   // merge function: sum values with the same key
        ))
        .entrySet().stream()
        .sorted(Map.Entry.comparingByKey())
        .map(e -> new int[]{e.getKey(), e.getValue()})
        .toArray(int[][]::new); 
```

Example:

* \[1 4 5 6 2 3 4 2 6 9\] -> \[\[1, 1\],\[2, 2\], \[3, 1\], \[4, 2\], \[5, 1\], \[6, 2\], \[9, 1\]\]