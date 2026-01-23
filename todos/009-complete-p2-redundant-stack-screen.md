---
status: pending
priority: p2
issue_id: "009"
tags: [code-review, cleanup, dead-code]
dependencies: []
---

# Redundant Stack.Screen Components

## Problem Statement

Multiple screens have empty `<Stack.Screen />` components with no props that serve no purpose.

## Findings

**Files with redundant Stack.Screen:**
- `app/scan.tsx:83, 98`
- `app/rename.tsx:54`
- `app/add/name.tsx:45`
- `app/add/camera.tsx:59, 74`
- `app/add/qrDisplay.tsx:234`

```typescript
<Stack.Screen />  // No props, does nothing
```

## Proposed Solutions

### Option A: Remove all redundant Stack.Screen (Recommended)
- Delete all `<Stack.Screen />` tags that have no props
- **Effort:** Trivial
- **Risk:** None

## Acceptance Criteria

- [ ] No empty Stack.Screen components
- [ ] Navigation still works correctly
