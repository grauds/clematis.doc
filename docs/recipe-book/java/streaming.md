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
