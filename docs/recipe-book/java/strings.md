---
tags:
  - strings
  - algorithms
---
# Strings

## Levenshtein Distance

Uses DP to calculate the minimum number of operations needed to transform one string into another:

```java
int n = a.length();
int m = b.length();
/*
   The minimal number of operations required to transform
   the first i characters of string S into the first j characters of string T.
 */
int[][] dp = new int[n + 1][m + 1];
for (int i = 0; i < n; i++) {
    dp[i][0] = i; // i - to make the first i characters of S into an empty string, delete i characters.
}
for (int j = 0; j < m; j++) {
    dp[0][j] = j; // j — to get the first j characters of T from an empty string, insert j characters.
}

/*
 To transform S into T, we can:
     delete the last character from S → look at D[i-1][j]
     insert the last character of T → look at D[i][j-1]
     replace the last character in S with that of T → look at D[i-1][j-1]
 */
for (int i = 1; i <= n; i++) {
    for (int j = 1; j <= m; j++) {
        int costDel = dp[i - 1][j] + 1;
        int costAdd = dp[i][j - 1] + 1;
        int costReplace = dp[i - 1][j - 1] + (a.charAt(i - 1) == b.charAt(j - 1) ? 0 : 1);
        dp[i][j] = Math.min(costDel, Math.min(costAdd, costReplace));
    }
}
```