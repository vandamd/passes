---
status: pending
priority: p1
issue_id: "002"
tags: [code-review, security, error-handling]
dependencies: []
---

# Unsafe JSON.parse Without Validation

## Problem Statement

Parsing stored SecureStore data directly without validation is risky. If the stored data is corrupted or from a previous schema version, this will crash or produce invalid state.

## Findings

**File:** `contexts/PassesContext.tsx:29`

```typescript
setPasses(JSON.parse(stored));
```

No try-catch around JSON.parse, and no schema validation on the parsed data.

## Proposed Solutions

### Option A: Add schema validation (Recommended)
- Wrap in try-catch and validate each pass object
- Filter out invalid entries instead of crashing
- **Pros:** Graceful degradation, data recovery
- **Cons:** More code
- **Effort:** Small
- **Risk:** Low

```typescript
const parseStoredPasses = (stored: string): Pass[] => {
    try {
        const parsed = JSON.parse(stored);
        if (!Array.isArray(parsed)) return [];
        return parsed.filter(
            (item): item is Pass =>
                typeof item === "object" &&
                typeof item.id === "string" &&
                typeof item.name === "string" &&
                typeof item.data === "string" &&
                SUPPORTED_BARCODE_TYPES.includes(item.type)
        );
    } catch {
        return [];
    }
};
```

## Acceptance Criteria

- [ ] Corrupted JSON doesn't crash the app
- [ ] Invalid pass entries are filtered out
- [ ] Valid passes are preserved
