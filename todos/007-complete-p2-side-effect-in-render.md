---
status: pending
priority: p2
issue_id: "007"
tags: [code-review, react, best-practices]
dependencies: []
---

# Side Effect in Render Path

## Problem Statement

Calling `router.replace()` during render violates React's render purity. This can cause unpredictable behavior and double navigation in StrictMode.

## Findings

**File:** `app/add/qrDisplay.tsx:227-230`

```typescript
if (!currentData) {
    router.replace("/");
    return null;
}
```

## Proposed Solutions

### Option A: Move to useEffect (Recommended)
```typescript
useEffect(() => {
    if (!currentData) {
        router.replace("/");
    }
}, [currentData, router]);

if (!currentData) {
    return null;
}
```
- **Effort:** Trivial
- **Risk:** Low

## Acceptance Criteria

- [ ] No side effects during render
- [ ] Navigation still works correctly when no data
