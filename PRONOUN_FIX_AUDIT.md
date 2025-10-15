# Personal Pronoun Fix - Complete Audit (Oct 2025)

## The Problem Discovered
Scripts were using impersonal command forms instead of personal pronouns:
- ❌ "Take a comfortable breath" 
- ❌ "Let eyes soften"
- ❌ "Shoulders soften"
- ❌ "Feel how breath"

This made scripts feel instructional rather than personal and hypnotic.

## Root Cause Analysis

The issue existed in **FOUR critical files** teaching the AI to remove "you/your":

### 1. Pattern Refiner (server/pattern-refiner.ts)
**Problem:**
- Limited "your" to only 8 uses in 1500-3000 word scripts
- Examples taught AI to REMOVE pronouns:
  ```
  "You might notice..." → "A gentle awareness may arise..." ❌
  ```

**Fix:**
- ✅ REMOVED "your" from pattern detection entirely
- ✅ Increased thresholds for "you might", "as you" (3 → 5)
- ✅ Updated examples to KEEP pronouns:
  ```
  "You might notice..." → "You may discover..." ✓
  "Take a breath" → "You take a breath" ✓
  ```

### 2. ScriptEngine Orchestrator (server/script-engine/prompt-orchestrator.ts)
**Problem:**
- Explicit instruction: "Scan for 'you...you...you' repetition and rewrite using body-as-subject"
- This told AI to replace "you feel" with passive forms like "a feeling arises"

**Fix:**
- ✅ REPLACED instruction with: "KEEP personal pronouns - this maintains connection!"
- ✅ Added explicit rule: "NEVER use bare imperatives"
- ✅ Emphasized: "Feel the breath" → "You feel the breath"

### 3. Language Mastery Config (server/script-engine/config/language-mastery.json)
**Problem:**
- "body_as_subject" rule with BAD examples:
  ```json
  "right_examples": [
    "Your breath deepens. Shoulders soften." ❌
  ]
  ```
- "Shoulders soften" drops the "your"!

**Fix:**
- ✅ Renamed to "sentence_variety" to clarify intent
- ✅ Fixed examples to ALWAYS include pronouns:
  ```json
  "right_examples": [
    "Your breath deepens. Your shoulders soften. Your heartbeat—steady, certain." ✓
  ]
  ```
- ✅ Added critical rule: "NEVER drop pronouns! Personal connection > Variety"

### 4. Principle Enforcer (server/script-engine/principle-enforcer.ts)
**Problem:**
- Body-as-subject technique showed: "Shoulders soften" (no pronoun)
- Teaching AI to make body the subject WITHOUT keeping personal connection

**Fix:**
- ✅ Updated all examples to include pronouns
- ✅ Changed "body-as-subject" to "sentence variety" focus
- ✅ Added: "CRITICAL: Personal connection > Variety. NEVER drop pronouns!"

### 5. Trance Depth Validator (server/script-engine/trance-depth-validator.ts)
**Problem:**
- Suggestions for fixing repetition included dropping pronouns:
  ```
  "Your breath deepens. Shoulders soften. Peace settles." ❌
  ```

**Fix:**
- ✅ Updated suggestions to keep pronouns:
  ```
  "Your breath deepens. Your shoulders soften. Peace settles within you." ✓
  ```

## The Core Insight

**"You" and "your" are NOT repetition in hypnosis - they're the CONNECTION!**

### Why This Matters:
1. **Personal pronouns keep the client engaged with themselves**
2. **This is hypnotic language, not redundancy**
3. **Commands without "you" feel instructional, not invitational**

### The Fix Philosophy:
- ✅ Vary sentence structure WHILE keeping pronouns
- ✅ "You take a breath" NOT "Take a breath"
- ✅ "Your eyes close" NOT "Let eyes close"
- ✅ "You feel the warmth" NOT "Feel the warmth"

## Files Changed:
1. `server/pattern-refiner.ts` - Removed "your" threshold, fixed examples
2. `server/script-engine/prompt-orchestrator.ts` - Removed "body-as-subject" instruction
3. `server/script-engine/config/language-mastery.json` - Fixed "sentence_variety" rule
4. `server/script-engine/principle-enforcer.ts` - Updated technique examples
5. `server/script-engine/trance-depth-validator.ts` - Fixed violation suggestions
6. `replit.md` - Documented the fix in system architecture

## Testing Recommendation

Generate new scripts and verify:
- [ ] Personal pronouns are present throughout
- [ ] No bare imperatives ("Take", "Let", "Feel" without "you")
- [ ] Sentences vary in structure BUT keep "you/your"
- [ ] Script feels personal, not instructional

## Key Takeaway for AI Development

When working with AI-generated content:
1. **Config files are source of truth** - Bad examples propagate everywhere
2. **Test the actual output** - Unit tests can miss production code paths
3. **Language patterns matter** - Seemingly small changes affect tone dramatically
4. **TDD is critical** - Regression tests catch config issues before production

---
**Date Fixed:** October 2025  
**Impact:** All future scripts will maintain personal connection through pronouns
