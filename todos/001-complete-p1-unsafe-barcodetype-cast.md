---
status: pending
priority: p1
issue_id: "001"
tags: [code-review, typescript, type-safety]
dependencies: []
---

# Unsafe BarcodeType Cast

## Problem Statement

The `addPass` function in PassesContext accepts `type: string` but casts it directly to `BarcodeType` without validation. This defeats TypeScript's type safety and could store invalid barcode types.

## Findings

**File:** `contexts/PassesContext.tsx:58`

```typescript
type: type as BarcodeType,
```

Any string can be passed and cast, potentially storing invalid barcode types that will fail when rendering.

## Proposed Solutions

### Option A: Change function signature (Recommended)
- Change `addPass(name: string, data: string, type: string)` to accept `BarcodeType` directly
- **Pros:** Type-safe at compile time, simplest fix
- **Cons:** Requires updating call sites
- **Effort:** Small
- **Risk:** Low

### Option B: Add runtime validation
- Validate type against SUPPORTED_BARCODE_TYPES before saving
- **Pros:** Handles invalid types gracefully
- **Cons:** Runtime overhead, more code
- **Effort:** Small
- **Risk:** Low

## Acceptance Criteria

- [ ] Invalid barcode types cannot be stored
- [ ] TypeScript catches type errors at compile time
- [ ] Existing passes continue to work
