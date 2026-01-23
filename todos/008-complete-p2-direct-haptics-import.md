---
status: pending
priority: p2
issue_id: "008"
tags: [code-review, consistency, accessibility]
dependencies: []
---

# Direct Haptics Import Bypasses HapticContext

## Problem Statement

name.tsx and rename.tsx directly import and call `expo-haptics` instead of using the established `HapticContext`. This violates architectural boundaries and makes global haptic settings impossible.

## Findings

**Files:** `app/add/name.tsx:8`, `app/rename.tsx:8`

```typescript
import * as Haptics from "expo-haptics";
// Uses Medium impact
Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
```

vs HapticContext uses Light impact:
```typescript
Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
```

## Proposed Solutions

### Option A: Use useHaptic() hook (Recommended)
- Replace direct Haptics import with context hook
- Extend HapticContext to support different feedback styles if needed
- **Effort:** Small
- **Risk:** Low

## Acceptance Criteria

- [ ] All haptic feedback goes through HapticContext
- [ ] Haptics can be disabled globally (accessibility)
- [ ] Consistent feedback style throughout app
