# Page snapshot

```yaml
- generic [ref=e3]:
  - banner [ref=e4]:
    - heading "Goal Tracker" [level=1] [ref=e5]
    - generic [ref=e6]:
      - generic [ref=e7]: test@example.com
      - button "Logout" [ref=e8] [cursor=pointer]
  - main [ref=e9]:
    - generic [ref=e10]:
      - heading "Your Goals" [level=2] [ref=e11]
      - button "+ New Goal" [ref=e12] [cursor=pointer]
    - generic [ref=e14]:
      - generic [ref=e15]:
        - generic [ref=e16]:
          - 'generic "Goal Color: #667eea" [ref=e17]'
          - generic [ref=e18]:
            - heading "E2E Test Goal" [level=3] [ref=e19]
            - paragraph [ref=e20]: Daily • 5 units
        - generic [ref=e21]:
          - button "Edit goal" [ref=e22] [cursor=pointer]: ✏️
          - button "Delete goal" [ref=e23] [cursor=pointer]: 🗑️
      - paragraph [ref=e24]: Test goal for E2E validation
      - generic [ref=e28]:
        - generic [ref=e29]: 0 / 5 units
        - generic [ref=e30]: 0%
      - generic [ref=e31]:
        - button "Log Progress" [ref=e32] [cursor=pointer]
        - generic [ref=e33]: Active
```