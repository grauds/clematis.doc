---
tags:
  - arrays
  - algorithms
---
# Arrays

## Monotonic Stack Pattern

### Next Smaller Element To The Right

How it works
1. For each element in the array, find the index of the next smaller element to its right. 
If none exists, return -1.
2. Go through the array.
3. Maintain a stack of indices whose next smaller element has not been found yet.
   * The stack is monotonic increasing, meaning the elements corresponding to the 
   indices in the stack increase from bottom to top.
4. For the current element arr[r]:
   * While the stack is not empty, and the element at the top of the stack is greater than arr[r]:
     * We have found the next smaller element for arr[stack.peek()].
     * Set result[stack.pop()] = r.
5. Push the current index r onto the stack for future comparison.
6. After the loop finishes, any indices remaining in the stack have 
no smaller element to the right, so they remain -1.

```java
int[] nextSmaller(int[] arr) {
    int[] result = new int[arr.length]; 
    Arrays.fill(result, -1);

    Deque<Integer> stack = new ArrayDeque<>();
    int r = 0;

    while (r < arr.length) {
        int a = arr[r];
        while (!stack.isEmpty() && arr[stack.peek()] > a) {
            result[stack.peek()] = r;
            stack.pop();
        }
        stack.push(r);
        r++;
    }

    return result;
}
```