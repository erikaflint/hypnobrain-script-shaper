# Regression Test Suite

## Overview
This document explains our regression testing strategy and how we prevent bugs from reoccurring.

## The `require()` Bug Incident (October 2025)

### What Happened
The clinical API crashed with `ReferenceError: require is not defined` in production. The bug was in `quality-guard.ts`:

```typescript
// ❌ BAD: require() doesn't work in ES modules
function checkEgoStrengtheningDistribution(script: string): QualityCheck {
  const { EgoModule } = require('./script-engine/modules/ego-module');
  const result = EgoModule.validateDistribution(script);
  // ...
}
```

**Fix:**
```typescript
// ✅ GOOD: Proper ES6 import at top of file
import { EgoModule } from './script-engine/modules/ego-module';

function checkEgoStrengtheningDistribution(script: string): QualityCheck {
  const result = EgoModule.validateDistribution(script);
  // ...
}
```

### Why Our Tests Didn't Catch It

**The Problem:**
- ✅ Unit tests called `validateScriptQuality()` (simplified test function)
- ❌ Unit tests did NOT call `runQualityGuard()` (actual production function)
- ❌ No integration test exercised the full pipeline with Quality Guard

**The Gap:**
```typescript
// validateScriptQuality() - What tests called (no ego check)
export function validateScriptQuality() {
  const emergenceCheck = checkEmergence(...);
  const grammarCheck = checkNaturalGrammar(...);
  // ❌ Missing: checkEgoStrengtheningDistribution()
}

// runQualityGuard() - What production called (has ego check)
export async function runQualityGuard() {
  const checks = [
    checkEmergence(...),
    checkNaturalGrammar(...),
    checkEgoStrengtheningDistribution(script) // ✅ Has the require() bug
  ];
}
```

## New Regression Tests

### 1. Pipeline Smoke Test (Fast - No AI)
**File:** `tests/integration/pipeline-smoke-test.test.ts`

**What it tests:**
- All module imports work correctly
- No `require()` in ES modules
- No circular dependencies
- EgoModule integration with Quality Guard

**Run with:**
```bash
npm test -- tests/integration/pipeline-smoke-test.test.ts
```

**Duration:** ~2 seconds

✅ **This WOULD have caught the `require()` bug!**

### 2. Full Clinical Pipeline (Expensive - Real AI)
**File:** `tests/integration/full-clinical-pipeline.test.ts`

**What it tests:**
- Complete end-to-end pipeline with real AI calls
- Template assembly → ScriptEngine → Pattern Refiner → Quality Guard
- Both wake and sleep emergence
- Ego strengthening integration
- Marketing asset generation

**Run with:**
```bash
npm test -- tests/integration/full-clinical-pipeline.test.ts
```

**Duration:** 60-90 seconds per test (makes real AI API calls)

**Note:** Skipped by default (use `describe.only` or run file directly)

✅ **This DEFINITELY would have caught the `require()` bug!**

## Testing Strategy

### Fast Tests (Run on Every Commit)
1. **Unit Tests** - Test individual functions
2. **Smoke Tests** - Test imports and module structure
3. **Mocked Integration** - Test pipeline logic without AI

### Slow Tests (Run Before Deploy)
1. **Full Pipeline** - Real AI calls, full validation
2. **E2E Tests** - Browser automation with Playwright

## How to Prevent Similar Bugs

### For Developers
1. **Always import at top of file** - Never use `require()` in ES modules
2. **Test the production code path** - Not just simplified test functions
3. **Run smoke tests before commit** - Catches import issues immediately

### For CI/CD
```bash
# Fast checks (every commit)
npm run test:unit
npm run test:smoke

# Full validation (before deploy)
npm run test:integration
npm run test:e2e
```

## Test Checklist

When adding new functionality that touches the pipeline:

- [ ] Unit tests for individual functions
- [ ] Smoke test verifies imports work
- [ ] Integration test calls production code path
- [ ] Consider E2E test for user-facing features

## Key Learnings

1. **Test what runs in production** - Not just test-only code paths
2. **Import issues are sneaky** - Smoke tests catch them early
3. **Fast feedback is critical** - Smoke tests run in 2 seconds
4. **Expensive tests have value** - But skip by default, run manually

---

**Last Updated:** October 2025  
**Bug Fixed:** `require()` in ES module (quality-guard.ts line 158)  
**Prevention:** Added pipeline smoke tests
