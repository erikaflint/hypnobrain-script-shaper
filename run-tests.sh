#!/bin/bash
# HypnoBrain Test Runner
# Easy commands to run production tests

case "$1" in
  "")
    echo "🧪 Running all tests..."
    tsx tests/run-all-tests.ts
    ;;
  "smoke")
    echo "🚀 Running smoke test (quick validation)..."
    tsx tests/smoke-test.ts
    ;;
  "stages")
    echo "🔄 Running stage-by-stage test..."
    tsx tests/stage-by-stage-test.ts
    ;;
  "patterns")
    echo "🎨 Running pattern detection test..."
    tsx tests/pattern-detection-test.ts
    ;;
  "context")
    echo "📝 Running context preservation test..."
    tsx tests/dream-context-test.ts
    ;;
  *)
    echo "Usage: ./run-tests.sh [smoke|stages|patterns|context]"
    echo ""
    echo "Commands:"
    echo "  ./run-tests.sh          - Run all tests"
    echo "  ./run-tests.sh smoke    - Quick production readiness check"
    echo "  ./run-tests.sh stages   - Full pipeline test (4 stages)"
    echo "  ./run-tests.sh patterns - Pattern detection only"
    echo "  ./run-tests.sh context  - Context preservation only"
    exit 1
    ;;
esac
