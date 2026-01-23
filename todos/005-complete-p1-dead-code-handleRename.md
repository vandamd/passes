---
status: pending
priority: p1
issue_id: "005"
tags: [code-review, dead-code, cleanup]
dependencies: []
---

# Unused handleRename Function

## Problem Statement

The `handleRename` function in qrDisplay.tsx is defined but never used in the component. This is dead code that should be removed or wired up to UI.

## Findings

**File:** `app/add/qrDisplay.tsx:202-210`

```typescript
const handleRename = useCallback(() => {
    router.push({
        pathname: "/rename",
        params: {
            currentName: currentPassName,
            passId: existingPass?.id,
        },
    });
}, [router, currentPassName, existingPass?.id]);
```

This function is never called anywhere in the component.

## Proposed Solutions

### Option A: Remove the function (Recommended)
- Delete the unused code
- **Pros:** Cleaner codebase, smaller bundle
- **Cons:** None
- **Effort:** Trivial
- **Risk:** None

### Option B: Wire up to UI
- Add a rename button to the screen
- **Pros:** Enables rename functionality from display screen
- **Cons:** May not be needed if rename is accessed elsewhere
- **Effort:** Small
- **Risk:** Low

## Acceptance Criteria

- [ ] No unused functions in the file
- [ ] TypeScript/ESLint doesn't report unused variables
