# Stage 1

## Notification Priority Inbox - System Design

### Problem
Users get too many notifications and lose track of the important ones. We need a Priority Inbox that shows the top N most important unread notifications based on type weight and how recent they are.

### Approach
1. **Priority Scoring**: Each notification gets a score based on two factors:
   - **Type Weight**: Placement (3) > Result (2) > Event (1)
   - **Recency**: Newer notifications score higher. I normalize the age to a 0-1 range over a 7-day window
   Formula: `score = (typeWeight * 10) + (recencyScore * 5)`

2. **Sorting**: Since N is small and the dataset size is manageable, the application calculates the scores and uses a standard array sort (`.sort()`) to arrange them in descending order based on score.

3. **Handling New Notifications**: When new notifications come in, they are assigned a score immediately upon fetch and inserted into the sorted state array.

### Trade-offs
- I chose combined scoring (weight + recency) over strict category ordering because a very old placement notification shouldn't always beat a brand new result notification.
- The 7-day window for recency is arbitrary but reasonable for a campus setting.
