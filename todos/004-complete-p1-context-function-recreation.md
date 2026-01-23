---
status: pending
priority: p1
issue_id: "004"
tags: [code-review, performance, react]
dependencies: []
---

# PassesContext Functions Recreated Every Render

## Problem Statement

Every render of `PassesProvider` creates new function instances for `addPass`, `deletePass`, `updatePassName`, and `getPassById`. This causes unnecessary re-renders in consuming components.

## Findings

**File:** `contexts/PassesContext.tsx:53-75`

```typescript
const addPass = (name: string, data: string, type: string) => { ... };
const deletePass = (id: string) => { ... };
const updatePassName = (id: string, newName: string) => { ... };
const getPassById = (id: string) => { ... };
```

Also, the context value object is recreated on every render (line 78).

## Proposed Solutions

### Option A: Wrap functions in useCallback (Recommended)
- Memoize all context functions
- Memoize context value object
- **Pros:** Prevents cascading re-renders
- **Cons:** Slightly more code
- **Effort:** Small
- **Risk:** Low

```typescript
const addPass = useCallback((name: string, data: string, type: BarcodeType) => {
    setPasses((prev) => [...prev, { id, name, data, type }]);
}, []);

const contextValue = useMemo(
    () => ({ passes, addPass, deletePass, updatePassName, getPassById }),
    [passes, addPass, deletePass, updatePassName, getPassById]
);
```

## Acceptance Criteria

- [ ] Context functions have stable references
- [ ] Context value is memoized
- [ ] Consuming components don't re-render unnecessarily
