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
        
        // While the current element 'a' is smaller than the element corresponding
        // to the index on the top of the stack, it means we have found
        // the next smaller element for that index.
        while (!stack.isEmpty() && arr[stack.peek()] > a) {
            result[stack.peek()] = r; // store the index of the next smaller element
            stack.pop(); // remove that index from the stack
        }
        
        // Push the current index onto the stack to process it later
        stack.push(r);
        r++;
    }

    return result;
}
```

### Minimum In The Moving Window

The window of size k is moving from the left to the right, 
and we are looking for the minimum element in the window. The key idea is to 
drop the oldest element from the stack when the window moves while reusing the
Monotonic Stack Pattern from the previous problem.

```java
static int[] minInWindow(int[] a, int k) {

    int[] mins = new int[a.length - k + 1];
    int l = 0;
    int r = 0;
    Deque<Integer> stack = new ArrayDeque<>(k);

    while (r < a.length) {
    
        // Expand window to size k by adding elements until r == l + k
        while (r < l + k) {
            int number = a[r];
            
            // Remove all indices from the top whose corresponding values
            // are greater than the current number — they can never be a minimum again            
            while (!stack.isEmpty() && a[stack.peek()] > number) {
                stack.pop();
            }
            
            // Push current index — since all bigger ones were removed,
            // elements in stack are now in non-decreasing order (by value)
            stack.push(r);
            
            r++;
        }

        // If the stack is not empty, the smallest element’s index is at the *back* (peekLast)
        if (!stack.isEmpty()) {
            // Save the minimum for the current window (we have just processed it)
            mins[l] = a[stack.peekLast()]; // <-- min goes here
            
            // Before moving the window, check if the element going out (a[l])
            // is exactly the minimum stored at the back of the deque.
            // If so, remove it because it will no longer belong to the next window.
            if (a[stack.peekLast()] == a[l]) { // we are moving window next, a[l]
                stack.pollLast();
            }
        }
        
        // Slide the window one step to the right
        l++;
    }

    return mins;
}
```