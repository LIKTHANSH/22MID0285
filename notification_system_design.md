# Stage 1

## Notification Priority Inbox - System Design

### Problem
Users get too many notifications and lose track of the important ones. We need a Priority Inbox that shows the top N most important unread notifications based on type weight and how recent they are.

### Approach

I used a **Min-Heap** data structure to efficiently maintain the top N notifications. Heres how it works:

1. **Priority Scoring**: Each notification gets a score based on two factors:
   - **Type Weight**: Placement (3) > Result (2) > Event (1) — placements are most urgent since they have deadlines
   - **Recency**: Newer notifications score higher. I normalize the age to a 0-1 range over a 7-day window

   Formula: `score = (typeWeight * 10) + (recencyScore * 5)`

2. **Min-Heap for Top N**: Instead of sorting all notifications (O(n log n)), I use a min-heap of size N:
   - Insert first N notifications into heap
   - For each remaining notification, compare with heap minimum
   - If new notification has higher score, replace the minimum
   - This gives O(n log k) complexity where k = N, which is better when N << total notifications

3. **Handling New Notifications**: When new notifications come in:
   - Calculate their priority score
   - Try to insert into the heap
   - The heap automatically evicts the lowest priority item if full
   - This means we dont need to re-sort everything, just a single O(log k) operation

### Why Min-Heap?

- A max-heap would give us the highest priority first but we'd need all items in it
- Min-heap of size N lets us efficiently track just the top N
- When a new notification arrives, we only compare against the minimum (root) of our top N
- If its higher priority, we swap and heapify - O(log N)
- If its lower, we skip it - O(1)

### Data Flow
```
API (fetch notifications) -> Calculate scores -> Min-Heap (size N) -> Sorted output
```

### Time Complexity
- Building initial top N: O(n log k)  
- Inserting one new notification: O(log k)
- Getting sorted top N: O(k log k)

Where n = total notifications, k = N (size of priority inbox)

### Trade-offs
- I chose combined scoring (weight + recency) over strict category ordering because a very old placement notification shouldn't always beat a brand new result notification
- The 7-day window for recency is arbitrary but reasonable for a campus setting
- In production you'd want persistent storage for read/unread state, but for this stage we just handle the ranking logic
