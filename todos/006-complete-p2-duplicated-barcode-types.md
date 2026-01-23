---
status: pending
priority: p2
issue_id: "006"
tags: [code-review, dry, maintainability]
dependencies: []
---

# Duplicated Barcode Types Arrays

## Problem Statement

Barcode types are hardcoded inline in camera.tsx and scan.tsx while `SUPPORTED_BARCODE_TYPES` is already exported from `types/pass.ts`. This violates DRY.

## Findings

**File:** `app/add/camera.tsx:86-100`
**File:** `app/scan.tsx:110` (only uses "qr" but could reference constant)

```typescript
barcodeScannerSettings={{
    barcodeTypes: [
        "aztec",
        "ean13",
        // ... hardcoded list
    ],
}}
```

## Proposed Solutions

### Option A: Import and use centralized constant (Recommended)
```typescript
import { SUPPORTED_BARCODE_TYPES } from "@/types/pass";

barcodeScannerSettings={{
    barcodeTypes: [...SUPPORTED_BARCODE_TYPES],
}}
```
- **Effort:** Trivial
- **Risk:** None

## Acceptance Criteria

- [ ] Barcode types defined in one place only
- [ ] Changes to supported types apply everywhere
