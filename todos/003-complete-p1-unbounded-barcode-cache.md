---
status: pending
priority: p1
issue_id: "003"
tags: [code-review, performance, memory-leak]
dependencies: []
---

# Unbounded Barcode Cache Memory Leak

## Problem Statement

The module-level `barcodeCache` Map grows indefinitely with no eviction strategy. Each unique barcode adds to the cache permanently, risking memory exhaustion on mobile devices.

## Findings

**File:** `app/add/qrDisplay.tsx:86`

```typescript
const barcodeCache = new Map<string, DataURL>();
```

With 100+ passes and frequent viewing, this cache could consume significant memory (each DataURL contains base64 image data).

## Proposed Solutions

### Option A: Remove cache entirely
- Barcode generation is fast enough without caching
- **Pros:** Simplest, no memory risk
- **Cons:** Slightly slower repeated renders
- **Effort:** Trivial
- **Risk:** Low

### Option B: Add LRU eviction (Recommended)
- Limit cache to 20-50 entries with oldest-first eviction
- **Pros:** Keeps performance benefit, bounded memory
- **Cons:** More code
- **Effort:** Small
- **Risk:** Low

```typescript
const MAX_CACHE_SIZE = 50;
const barcodeCache = new Map<string, DataURL>();

const setCacheWithEviction = (key: string, value: DataURL) => {
    if (barcodeCache.size >= MAX_CACHE_SIZE) {
        const firstKey = barcodeCache.keys().next().value;
        barcodeCache.delete(firstKey);
    }
    barcodeCache.set(key, value);
};
```

## Acceptance Criteria

- [ ] Cache has a maximum size limit
- [ ] Memory usage stays bounded
- [ ] Barcode display performance remains acceptable
