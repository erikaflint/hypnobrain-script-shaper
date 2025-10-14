# HypnoBrain Test Suite

## 📋 Test Overview

Production-ready test suite for the DREAM Hypnosis pipeline. All tests validate the 4-stage quality pipeline that prevents robotic language and ensures natural, hypnotic scripts.

## 🧪 Test Files

### 1. **Stage-by-Stage Test** (Recommended for debugging)
**File**: `stage-by-stage-test.ts`  
**Purpose**: Tests each stage of the DREAM pipeline independently to identify exactly where quality breaks down.

**What it tests**:
- ✅ **Stage 1 - Story Shaper**: Journey → 800-1200 word story outline
  - Word count validation
  - Grammar score ≥70%
  - Natural language (no missing articles)

- ✅ **Stage 2 - Dream Maker**: Story → 3000-word hypnosis script
  - Word count 2700-3300
  - Grammar score ≥70%
  - Sleep emergence (no counting up)

- ✅ **Stage 3 - Pattern Refiner**: Detects repetitive sentence patterns
  - Diversity score ≥85%
  - Identifies overused openers ("You might", "As you", etc.)

- ✅ **Stage 4 - Quality Guard**: Final validation
  - Grammar ≥70%
  - Pattern diversity ≥85%
  - Word count within 15% of target
  - Emergence type validation

**Run**:
```bash
tsx tests/stage-by-stage-test.ts
```

**Output**: Stops at first failure, saves artifacts for each stage

---

### 2. **Pattern Detection Test** (Unit test)
**File**: `pattern-detection-test.ts`  
**Purpose**: Unit test for pattern detection logic - validates the Pattern Refiner can detect repetitive sentence openers.

**What it tests**:
- ✅ Good variety scripts (100% diversity)
- ✅ Repetitive "You might" patterns (detects 9+ occurrences)
- ✅ Repetitive "As you" patterns (detects 9+ occurrences)
- ✅ Mid-paragraph repetition (critical fix - detects patterns within paragraphs, not just line starts)

**Run**:
```bash
tsx tests/pattern-detection-test.ts
```

**Expected**: All overused patterns detected correctly

---

### 3. **Context Preservation Test** (Integration test)
**File**: `dream-context-test.ts`  
**Purpose**: Tests whether specific context (historical dates, names, places) flows through the entire pipeline without degradation.

**What it tests**:
- ✅ Story Shaper preserves context (Step 1)
- ✅ Script Generator preserves context (Step 2)
- ✅ Identifies degradation point if context is lost

**Test Cases**:
- Historical Context: "Walden Pond 1854" with Thoreau, cabin, autumn, loons

**Run**:
```bash
tsx tests/dream-context-test.ts
```

**Output**: Shows context preservation scores for each stage, identifies where degradation occurs

---

## 🚀 Quick Test Commands

### Using Shell Script (Recommended)
```bash
# Run all tests
./run-tests.sh

# Quick smoke test (30 seconds - production readiness)
./run-tests.sh smoke

# Full pipeline test (recommended for debugging)
./run-tests.sh stages

# Pattern detection only
./run-tests.sh patterns

# Context preservation only  
./run-tests.sh context
```

### Direct Execution
```bash
# All tests
tsx tests/run-all-tests.ts

# Smoke test
tsx tests/smoke-test.ts

# Individual tests
tsx tests/stage-by-stage-test.ts
tsx tests/pattern-detection-test.ts
tsx tests/dream-context-test.ts
```

---

## 📊 Test Artifacts

All tests save artifacts to `tests/artifacts/` for manual inspection:
- Story outlines
- Generated scripts
- Refined scripts
- Final polished scripts

**Clean artifacts**:
```bash
rm -rf tests/artifacts/*
```

---

## ✅ Production Readiness Checklist

Before deploying to production, ensure:

- [ ] **All stage tests pass** (`npm run test:stages`)
- [ ] **Pattern detection works** (`npm run test:patterns`)
- [ ] **Context preservation ≥83%** (`npm run test:context`)
- [ ] **Grammar checker catches robotic language** (score <70% fails)
- [ ] **No counting up in sleep emergence** scripts
- [ ] **Word counts within tolerance** (±15%)

---

## 🔧 Troubleshooting

### Test fails at Stage 1 (Story Shaper)
- Check Story Shaper prompt in `server/ai-service.ts` → `shapeDreamStory()`
- Verify grammar rules are included
- Check word count targets

### Test fails at Stage 2 (Dream Maker)
- Check Dream Maker prompt in `server/ai-service.ts` → `generateFullScript()`
- Verify emergence type is set correctly
- Check metaphor consistency

### Test fails at Stage 3 (Pattern Refiner)
- Check pattern detection logic in `server/pattern-refiner.ts`
- Verify sentence boundary splitting works
- Check thresholds (12% per pattern)

### Test fails at Stage 4 (Quality Guard)
- Check grammar thresholds in `server/grammar-checker.ts`
- Verify deduction logic (35pts for missing articles/awkward constructions)
- Check 70% pass threshold

---

## 📝 Adding New Tests

To add a new test:

1. Create `tests/your-test-name.ts`
2. Add executable permissions: `chmod +x tests/your-test-name.ts`
3. Add npm script to `package.json`:
   ```json
   "test:your-test": "tsx tests/your-test-name.ts"
   ```
4. Document in this README

---

## 🎯 Test Coverage

| Component | Test File | Coverage |
|-----------|-----------|----------|
| Story Shaper (Stage 1) | `stage-by-stage-test.ts` | ✅ Full |
| Dream Maker (Stage 2) | `stage-by-stage-test.ts` | ✅ Full |
| Pattern Refiner (Stage 3) | `pattern-detection-test.ts`, `stage-by-stage-test.ts` | ✅ Full |
| Quality Guard (Stage 4) | `stage-by-stage-test.ts` | ✅ Full |
| Grammar Checker | `stage-by-stage-test.ts` | ✅ Full |
| Context Preservation | `dream-context-test.ts` | ✅ Full |

---

## 🐛 Known Issues

None - all tests passing as of latest commit.

---

## 📈 Test Metrics

- **Grammar threshold**: 70% (scripts with 3+ missing articles fail)
- **Pattern diversity**: 85% minimum
- **Word count tolerance**: ±15% of target
- **Context preservation**: 83%+ expected
