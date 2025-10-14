# HypnoBrain Testing Guide

## 🚀 Quick Start

### Production Readiness Check (30 seconds)
```bash
./run-tests.sh smoke
```

### Run All Tests (5-10 minutes)
```bash
./run-tests.sh
```

## 📋 Test Suite Overview

We have **4 test files** organized by scope:

### 1. 🚀 **Smoke Test** (Production Readiness)
**File**: `tests/smoke-test.ts`  
**Duration**: 30 seconds  
**Purpose**: Quick validation before deployment

**Tests**:
- ✅ Pattern detection catches repetitive language
- ✅ Grammar checker catches robotic language  
- ✅ Strict thresholds enforce quality (3 missing articles = fail)
- ✅ Natural scripts pass validation

**Run**: `./run-tests.sh smoke`

---

### 2. 🔄 **Stage-by-Stage Test** (E2E Pipeline)
**File**: `tests/stage-by-stage-test.ts`  
**Duration**: 3-5 minutes  
**Purpose**: Test entire DREAM pipeline, identify exact failure point

**Tests All 4 Stages**:
- **Stage 1 - Story Shaper**: Journey → 800-1200 word story
  - Word count validation
  - Grammar score ≥70%
  - Natural language

- **Stage 2 - Dream Maker**: Story → 3000-word script
  - Word count 2700-3300
  - Grammar ≥70%
  - Sleep emergence (no counting up)

- **Stage 3 - Pattern Refiner**: Detect patterns
  - Diversity ≥85%
  - Fix overused openers

- **Stage 4 - Quality Guard**: Final validation
  - All quality checks pass
  - Grammar ≥70%, Diversity ≥85%

**Run**: `./run-tests.sh stages`

**Output**: Stops at first failure + saves artifacts for each stage

---

### 3. 🎨 **Pattern Detection Test** (Unit Test)
**File**: `tests/pattern-detection-test.ts`  
**Duration**: 5 seconds  
**Purpose**: Validate pattern detection logic

**Tests**:
- ✅ Good variety (100% diversity)
- ✅ Repetitive "You might" (detects 9+ uses)
- ✅ Repetitive "As you" (detects 9+ uses)
- ✅ Mid-paragraph repetition (critical fix)

**Run**: `./run-tests.sh patterns`

---

### 4. 📝 **Context Preservation Test** (Integration)
**File**: `tests/dream-context-test.ts`  
**Duration**: 2-3 minutes  
**Purpose**: Ensure specific context flows through pipeline

**Tests**:
- ✅ Story Shaper preserves context
- ✅ Script Generator maintains details
- ✅ Identifies degradation point

**Test Case**: "Walden Pond 1854" with historical details

**Run**: `./run-tests.sh context`

---

## 📊 Test Commands Reference

```bash
# All tests (recommended before deployment)
./run-tests.sh

# Quick production check (30 seconds)
./run-tests.sh smoke

# Full pipeline debugging
./run-tests.sh stages

# Pattern detection only
./run-tests.sh patterns

# Context preservation only
./run-tests.sh context
```

## 📁 Test Artifacts

All tests save outputs to `tests/artifacts/` for inspection:
- Story outlines (`*_story.txt`)
- Generated scripts (`*_script.txt`)
- Final polished scripts (`*_final.txt`)

**Clean artifacts**:
```bash
rm -rf tests/artifacts/*
```

## ✅ Production Checklist

Before deploying to production:

- [ ] **Run smoke test**: `./run-tests.sh smoke` → All pass
- [ ] **Run full suite**: `./run-tests.sh` → All pass
- [ ] **Grammar threshold**: Scripts with 3+ missing articles fail (score <70%)
- [ ] **Pattern diversity**: Scripts with 12%+ repetition fail (score <85%)
- [ ] **Sleep emergence**: No "counting up" in DREAM scripts
- [ ] **Word count**: Within ±15% tolerance (3000 words target)

## 🐛 Debugging Guide

### Issue: Robotic language in production
1. Run: `./run-tests.sh smoke`
2. Check: Grammar checker catches it?
3. If yes → Investigate AI prompts
4. If no → Adjust grammar thresholds

### Issue: Scripts sound repetitive
1. Run: `./run-tests.sh patterns`
2. Check: Pattern detection working?
3. Run: `./run-tests.sh stages`
4. Identify: Which stage introduced repetition?

### Issue: Context loss (dates, names missing)
1. Run: `./run-tests.sh context`
2. Check: Story Shaper (Step 1) or Script Generator (Step 2)?
3. Review: Prompts in `server/ai-service.ts`

## 🎯 Test Coverage Summary

| Component | Coverage | Test File |
|-----------|----------|-----------|
| Story Shaper | ✅ Full | `stage-by-stage-test.ts` |
| Dream Maker | ✅ Full | `stage-by-stage-test.ts` |
| Pattern Refiner | ✅ Full | `pattern-detection-test.ts`, `stage-by-stage-test.ts` |
| Quality Guard | ✅ Full | `stage-by-stage-test.ts` |
| Grammar Checker | ✅ Full | `smoke-test.ts`, `stage-by-stage-test.ts` |
| Context Preservation | ✅ Full | `dream-context-test.ts` |
| Production Readiness | ✅ Full | `smoke-test.ts` |

## 📈 Quality Metrics

- **Grammar Threshold**: 70% (3+ missing articles = fail)
- **Pattern Diversity**: 85% (12%+ repetition = fail)
- **Word Count Tolerance**: ±15% of target
- **Missing Articles Threshold**: >2 instances = fail (-35 points)
- **Awkward Constructions**: >1 instance = fail (-35 points)
- **Generic Plurals**: >3 instances = fail (-25 points)

## 🔍 What Each Test Validates

### Smoke Test (30s)
- ✅ Pattern detection working
- ✅ Grammar checker working
- ✅ Thresholds enforced
- ✅ Natural scripts pass

### Stage Test (3-5min)
- ✅ Complete pipeline health
- ✅ Each stage quality
- ✅ Failure point identification
- ✅ Real AI generation

### Pattern Test (5s)
- ✅ Detection logic correct
- ✅ Mid-paragraph patterns caught
- ✅ Thresholds accurate

### Context Test (2-3min)
- ✅ Historical context preserved
- ✅ No genericization
- ✅ Details flow through pipeline

## 💡 Tips

1. **Before deployment**: Always run `./run-tests.sh smoke` (30 seconds)
2. **Debugging issues**: Use `./run-tests.sh stages` to find exact failure point
3. **After prompt changes**: Run full suite `./run-tests.sh`
4. **Weekly validation**: Run all tests to catch regressions

---

**Last Updated**: October 2025  
**Test Suite Version**: 2.0 (4-Stage Pipeline)
