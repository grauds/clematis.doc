---
tags:
  - hashmap
  - hashset
---

# Maps And Sets

The most commonly used pieces of code related to the topic in competitive programming.

## Counting with a dictionary

### Merge

Even if there is no key, merging can be used:
````java
    Map<String, Integer> dict = new HashMap<>();
    for (int c = 0; c < str.length(); i++) {
        String s = String.valueOf(str.charAt(c));
        dict.merge(s, 1, Integer::sum);
    }
````

### AtomicInteger

Not quite the fastest way:
````java 
    Map<Character, AtomicInteger> dict = new HashMap<>();
    for (int c = 0; c < str.length(); c++) {
        dict.computeIfAbsent(str.charAt(c), k-> new AtomicInteger(0)).incrementAndGet();
    }
````

### Sum up integer dictionary values

Quickly count the values, with additional filtering can apply in the stream:
````java
    Map<String, Integer> dict = new HashMap<>();
    //...
    dict.values().stream().mapToInt(Integer::intValue).sum();
````

## Printing a set

Simply with enhanced 'for', see [JSR 201](https://docs.oracle.com/cd/E19253-01/817-7970/features-forloop/index.html):
````java
    for (String s : set) {
        writer.write(s);
    }
````

## Printing a map

With enhanced 'for':
````java
    for (Map.Entry<String, Object> entry : map.entrySet()) {
        writer.write(entry.getKey() + ":" + entry.getValue().toString());
    }
````