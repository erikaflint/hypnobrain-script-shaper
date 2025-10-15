import { describe, it, expect } from 'vitest';
import { StrategyPlanner } from '../../server/script-engine/strategy-planner';
import narrativeArcsConfig from '../../server/script-engine/config/narrative-arcs.json';
import type { ArcJourney, ArcStage } from '@shared/schema';

/**
 * ARC JOURNEYS TEST SUITE
 * Tests the multi-stage therapeutic flow system:
 * - Journey validation (5-10 stages, weights sum to 100%)
 * - All 32 narrative arcs coverage
 * - Strategy Planner journey planning
 * - Word budget distribution
 * - Journey contract generation
 */

describe('Arc Journeys', () => {
  
  describe('Narrative Arc Coverage', () => {
    it('should have exactly 32 narrative arcs in the library', () => {
      expect(narrativeArcsConfig.arcs).toHaveLength(32);
    });

    it('should include all foundation arcs (always included)', () => {
      const foundationArcs = ['effortlessness', 're-minding', 'two-tempos'];
      const arcIds = narrativeArcsConfig.arcs.map((a: any) => a.id);
      
      foundationArcs.forEach(foundationArc => {
        expect(arcIds).toContain(foundationArc);
      });
    });

    it('should include all 13 new strategic arcs', () => {
      const newArcs = [
        'signal-decoding',
        'post-traumatic-growth',
        'attention-direction',
        'boundary-reframing',
        'forgiveness-protocol',
        'shame-dissolution',
        'internal-sanctuary',
        'energy-reclamation',
        'open-future',
        'upward-spiral',
        'cycle-breaker',
        'ancestral-healing',
        'self-actualization-cycle' // Full ID includes "-cycle"
      ];

      const arcIds = narrativeArcsConfig.arcs.map((a: any) => a.id);
      
      newArcs.forEach(newArc => {
        expect(arcIds).toContain(newArc);
      });
    });

    it('should have valid structure for each arc', () => {
      narrativeArcsConfig.arcs.forEach((arc: any) => {
        expect(arc).toHaveProperty('id');
        expect(arc).toHaveProperty('name');
        expect(arc).toHaveProperty('description');
        expect(arc).toHaveProperty('core_message');
        expect(arc).toHaveProperty('key_language');
        expect(arc).toHaveProperty('prompt_integration');
        
        // Key language should be array with content
        expect(Array.isArray(arc.key_language)).toBe(true);
        expect(arc.key_language.length).toBeGreaterThan(0);
        
        // Prompt integration should not be empty
        expect(arc.prompt_integration.length).toBeGreaterThan(10);
      });
    });
  });

  describe('Journey Validation', () => {
    it('should validate journey with 5 stages', () => {
      const journey: ArcJourney = {
        stages: [
          { arcId: 'effortlessness', weight: 20 },
          { arcId: 're-minding', weight: 20 },
          { arcId: 'two-tempos', weight: 20 },
          { arcId: 'signal-decoding', weight: 20 },
          { arcId: 'upward-spiral', weight: 20 }
        ],
        totalStages: 5
      };

      const totalWeight = journey.stages.reduce((sum, s) => sum + s.weight, 0);
      expect(totalWeight).toBe(100);
      expect(journey.stages.length).toBeGreaterThanOrEqual(5);
      expect(journey.stages.length).toBeLessThanOrEqual(10);
    });

    it('should validate journey with 10 stages', () => {
      const journey: ArcJourney = {
        stages: [
          { arcId: 'effortlessness', weight: 10 },
          { arcId: 're-minding', weight: 10 },
          { arcId: 'two-tempos', weight: 10 },
          { arcId: 'signal-decoding', weight: 10 },
          { arcId: 'post-traumatic-growth', weight: 10 },
          { arcId: 'attention-direction', weight: 10 },
          { arcId: 'boundary-reframing', weight: 10 },
          { arcId: 'forgiveness-protocol', weight: 10 },
          { arcId: 'shame-dissolution', weight: 10 },
          { arcId: 'upward-spiral', weight: 10 }
        ],
        totalStages: 10
      };

      const totalWeight = journey.stages.reduce((sum, s) => sum + s.weight, 0);
      expect(totalWeight).toBe(100);
      expect(journey.stages.length).toBe(10);
    });

    it('should support transition goals for each stage', () => {
      const journey: ArcJourney = {
        stages: [
          { 
            arcId: 'signal-decoding', 
            weight: 25, 
            transitionGoal: 'Client recognizes physical tension as valuable signal' 
          },
          { 
            arcId: 'boundary-reframing', 
            weight: 25, 
            transitionGoal: 'Client sees boundaries as self-care, not selfishness' 
          },
          { 
            arcId: 'energy-reclamation', 
            weight: 25, 
            transitionGoal: 'Client reclaims energy from past drains' 
          },
          { 
            arcId: 'upward-spiral', 
            weight: 25, 
            transitionGoal: 'Client experiences momentum toward desired state' 
          }
        ],
        totalStages: 4
      };

      journey.stages.forEach(stage => {
        expect(stage.transitionGoal).toBeDefined();
        expect(stage.transitionGoal!.length).toBeGreaterThan(10);
      });
    });

    it('should support dimension overrides per stage', () => {
      const journey: ArcJourney = {
        stages: [
          { 
            arcId: 'signal-decoding', 
            weight: 50, 
            dimensionOverrides: { somatic: 80, cognitive: 20 } 
          },
          { 
            arcId: 'upward-spiral', 
            weight: 50, 
            dimensionOverrides: { symbolic: 70, emotional: 30 } 
          }
        ],
        totalStages: 2
      };

      expect(journey.stages[0].dimensionOverrides).toEqual({ somatic: 80, cognitive: 20 });
      expect(journey.stages[1].dimensionOverrides).toEqual({ symbolic: 70, emotional: 30 });
    });
  });

  describe('Strategy Planner - Journey Mode', () => {
    const planner = new StrategyPlanner();

    it('should detect journey mode and plan accordingly', async () => {
      const journey: ArcJourney = {
        stages: [
          { arcId: 'signal-decoding', weight: 30, transitionGoal: 'Recognize signals' },
          { arcId: 'boundary-reframing', weight: 30, transitionGoal: 'Set healthy boundaries' },
          { arcId: 'upward-spiral', weight: 40, transitionGoal: 'Build momentum' }
        ],
        totalStages: 3
      };

      const contract = await planner.plan({
        presentingIssue: 'chronic stress and boundary issues',
        desiredOutcome: 'healthy boundaries and peace',
        arcJourney: journey,
        targetWordCount: 2000
      });

      expect(contract.isJourney).toBe(true);
      expect(contract.journeyStages).toBeDefined();
      expect(contract.journeyStages!.length).toBe(3);
    });

    it('should calculate word budgets correctly for each stage', async () => {
      const journey: ArcJourney = {
        stages: [
          { arcId: 'signal-decoding', weight: 25 },
          { arcId: 'boundary-reframing', weight: 25 },
          { arcId: 'energy-reclamation', weight: 25 },
          { arcId: 'upward-spiral', weight: 25 }
        ],
        totalStages: 4
      };

      const contract = await planner.plan({
        presentingIssue: 'exhaustion and boundary issues',
        desiredOutcome: 'restored energy and clear boundaries',
        arcJourney: journey,
        targetWordCount: 2000
      });

      const stages = contract.journeyStages!;
      
      // Each stage should have 25% of 2000 words = 500 words
      expect(stages[0].wordBudget).toBe(500);
      expect(stages[1].wordBudget).toBe(500);
      expect(stages[2].wordBudget).toBe(500);
      expect(stages[3].wordBudget).toBe(500);
    });

    it('should calculate cumulative word targets correctly', async () => {
      const journey: ArcJourney = {
        stages: [
          { arcId: 'signal-decoding', weight: 20 },
          { arcId: 'boundary-reframing', weight: 30 },
          { arcId: 'energy-reclamation', weight: 30 },
          { arcId: 'upward-spiral', weight: 20 }
        ],
        totalStages: 4
      };

      const contract = await planner.plan({
        presentingIssue: 'exhaustion',
        desiredOutcome: 'restored energy',
        arcJourney: journey,
        targetWordCount: 3000
      });

      const stages = contract.journeyStages!;
      
      // Stage 1: 20% of 3000 = 600, cumulative = 600
      expect(stages[0].cumulativeWordTarget).toBe(600);
      
      // Stage 2: 30% of 3000 = 900, cumulative = 600 + 900 = 1500
      expect(stages[1].cumulativeWordTarget).toBe(1500);
      
      // Stage 3: 30% of 3000 = 900, cumulative = 1500 + 900 = 2400
      expect(stages[2].cumulativeWordTarget).toBe(2400);
      
      // Stage 4: 20% of 3000 = 600, cumulative = 2400 + 600 = 3000
      expect(stages[3].cumulativeWordTarget).toBe(3000);
    });

    it('should include arc metadata in journey stages', async () => {
      const journey: ArcJourney = {
        stages: [
          { arcId: 'signal-decoding', weight: 50, transitionGoal: 'Decode body signals' },
          { arcId: 'upward-spiral', weight: 50, transitionGoal: 'Build momentum' }
        ],
        totalStages: 2
      };

      const contract = await planner.plan({
        presentingIssue: 'chronic tension',
        desiredOutcome: 'peace and flow',
        arcJourney: journey,
        targetWordCount: 2000
      });

      const stage1 = contract.journeyStages![0];
      const stage2 = contract.journeyStages![1];
      
      expect(stage1.arcId).toBe('signal-decoding');
      expect(stage1.arcName).toBe('Signal Decoding / Need Translation'); // Actual name from config
      expect(stage1.transitionGoal).toBe('Decode body signals');
      expect(stage1.keyLanguage).toBeDefined();
      expect(stage1.keyLanguage.length).toBeGreaterThan(0);
      expect(stage1.promptIntegration).toBeDefined();
      expect(stage1.promptIntegration.length).toBeGreaterThan(10);
      
      expect(stage2.arcId).toBe('upward-spiral');
      expect(stage2.arcName).toBe('Upward Spiral'); // Actual name from config (no "The")
      expect(stage2.transitionGoal).toBe('Build momentum');
    });

    it('should generate reasoning log for journey', async () => {
      const journey: ArcJourney = {
        stages: [
          { arcId: 'post-traumatic-growth', weight: 40 },
          { arcId: 'upward-spiral', weight: 60 }
        ],
        totalStages: 2
      };

      const contract = await planner.plan({
        presentingIssue: 'trauma recovery',
        desiredOutcome: 'growth and resilience',
        arcJourney: journey,
        targetWordCount: 2000
      });

      expect(contract.reasoningLog).toBeDefined();
      expect(contract.reasoningLog.length).toBeGreaterThan(0);
      
      // Should mention journey mode
      const journeyLog = contract.reasoningLog.find(log => 
        log.includes('ARC JOURNEY MODE') || log.includes('stages')
      );
      expect(journeyLog).toBeDefined();
    });
  });

  describe('Journey Contract Output', () => {
    const planner = new StrategyPlanner();

    it('should mark contract as journey type', async () => {
      const journey: ArcJourney = {
        stages: [
          { arcId: 'signal-decoding', weight: 100 }
        ],
        totalStages: 1
      };

      const contract = await planner.plan({
        presentingIssue: 'chronic tension',
        desiredOutcome: 'peace',
        arcJourney: journey,
        targetWordCount: 2000
      });

      expect(contract.isJourney).toBe(true);
    });

    it('should not use selectedArcs for journey mode', async () => {
      const journey: ArcJourney = {
        stages: [
          { arcId: 'boundary-reframing', weight: 50 },
          { arcId: 'energy-reclamation', weight: 50 }
        ],
        totalStages: 2
      };

      const contract = await planner.plan({
        presentingIssue: 'boundary issues',
        desiredOutcome: 'clear boundaries',
        arcJourney: journey,
        targetWordCount: 2000
      });

      // Journey mode should use journeyStages instead of selectedArcs
      expect(contract.journeyStages).toBeDefined();
      expect(contract.journeyStages!.length).toBe(2);
      
      // selectedArcs should be empty or have just journey arc IDs
      expect(contract.selectedArcs.length).toBeLessThanOrEqual(2);
    });
  });

  describe('Real-World Journey Examples', () => {
    const planner = new StrategyPlanner();

    it('should handle trauma recovery journey (5 stages)', async () => {
      const journey: ArcJourney = {
        stages: [
          { arcId: 'signal-decoding', weight: 15, transitionGoal: 'Recognize trauma responses as information' },
          { arcId: 'internal-sanctuary', weight: 20, transitionGoal: 'Create internal safe space' },
          { arcId: 'post-traumatic-growth', weight: 25, transitionGoal: 'Reframe trauma as catalyst for growth' },
          { arcId: 'energy-reclamation', weight: 20, transitionGoal: 'Reclaim energy from past' },
          { arcId: 'upward-spiral', weight: 20, transitionGoal: 'Experience positive momentum' }
        ],
        totalStages: 5
      };

      const contract = await planner.plan({
        presentingIssue: 'PTSD from childhood trauma',
        desiredOutcome: 'healing and resilience',
        arcJourney: journey,
        targetWordCount: 2000
      });

      expect(contract.isJourney).toBe(true);
      expect(contract.journeyStages!.length).toBe(5);
      
      // Check cumulative targets build to 2000
      const finalStage = contract.journeyStages![4];
      expect(finalStage.cumulativeWordTarget).toBe(2000);
    });

    it('should handle shame dissolution journey (6 stages)', async () => {
      const journey: ArcJourney = {
        stages: [
          { arcId: 'signal-decoding', weight: 15, transitionGoal: 'Recognize shame signals' },
          { arcId: 'shame-dissolution', weight: 25, transitionGoal: 'Dissolve shame patterns' },
          { arcId: 'forgiveness-protocol', weight: 20, transitionGoal: 'Forgive self and others' },
          { arcId: 'boundary-reframing', weight: 15, transitionGoal: 'Establish healthy boundaries' },
          { arcId: 'energy-reclamation', weight: 15, transitionGoal: 'Reclaim energy' },
          { arcId: 'self-actualization-cycle', weight: 10, transitionGoal: 'Move toward authentic self' }
        ],
        totalStages: 6
      };

      const contract = await planner.plan({
        presentingIssue: 'deep shame and self-criticism',
        desiredOutcome: 'self-acceptance and authenticity',
        arcJourney: journey,
        targetWordCount: 3000
      });

      expect(contract.isJourney).toBe(true);
      expect(contract.journeyStages!.length).toBe(6);
      
      // Verify word distribution
      const totalWords = contract.journeyStages!.reduce((sum, s) => sum + (s.wordBudget || 0), 0);
      expect(totalWords).toBe(3000);
    });

    it('should handle ancestral healing journey (7 stages)', async () => {
      const journey: ArcJourney = {
        stages: [
          { arcId: 'signal-decoding', weight: 10, transitionGoal: 'Recognize inherited patterns' },
          { arcId: 'ancestral-healing', weight: 20, transitionGoal: 'Connect with ancestral wisdom' },
          { arcId: 'cycle-breaker', weight: 20, transitionGoal: 'Break generational patterns' },
          { arcId: 'forgiveness-protocol', weight: 15, transitionGoal: 'Forgive ancestors' },
          { arcId: 'energy-reclamation', weight: 15, transitionGoal: 'Reclaim inherited energy' },
          { arcId: 'open-future', weight: 10, transitionGoal: 'Open to new possibilities' },
          { arcId: 'self-actualization-cycle', weight: 10, transitionGoal: 'Step into authentic lineage' }
        ],
        totalStages: 7
      };

      const contract = await planner.plan({
        presentingIssue: 'generational trauma and family patterns',
        desiredOutcome: 'break cycles and heal lineage',
        arcJourney: journey,
        targetWordCount: 3000
      });

      expect(contract.isJourney).toBe(true);
      expect(contract.journeyStages!.length).toBe(7);
      expect(contract.journeyStages![1].arcName).toBe('Ancestral Healing'); // Actual name from config
      expect(contract.journeyStages![2].arcName).toBe('Cycle Breaker'); // Actual name from config
    });
  });

  describe('Edge Cases & Validation', () => {
    const planner = new StrategyPlanner();

    it('should handle single-stage journey', async () => {
      const journey: ArcJourney = {
        stages: [
          { arcId: 'upward-spiral', weight: 100 }
        ],
        totalStages: 1
      };

      const contract = await planner.plan({
        presentingIssue: 'stuck in negative spiral',
        desiredOutcome: 'positive momentum',
        arcJourney: journey,
        targetWordCount: 2000
      });

      expect(contract.isJourney).toBe(true);
      expect(contract.journeyStages!.length).toBe(1);
      expect(contract.journeyStages![0].wordBudget).toBe(2000);
      expect(contract.journeyStages![0].cumulativeWordTarget).toBe(2000);
    });

    it('should handle unequal weight distribution', async () => {
      const journey: ArcJourney = {
        stages: [
          { arcId: 'signal-decoding', weight: 10 },
          { arcId: 'shame-dissolution', weight: 50 },
          { arcId: 'upward-spiral', weight: 40 }
        ],
        totalStages: 3
      };

      const contract = await planner.plan({
        presentingIssue: 'deep shame',
        desiredOutcome: 'self-acceptance',
        arcJourney: journey,
        targetWordCount: 2000
      });

      const stages = contract.journeyStages!;
      
      // 10% of 2000 = 200
      expect(stages[0].wordBudget).toBe(200);
      
      // 50% of 2000 = 1000
      expect(stages[1].wordBudget).toBe(1000);
      
      // 40% of 2000 = 800
      expect(stages[2].wordBudget).toBe(800);
      
      // Total should be 2000
      const total = stages.reduce((sum, s) => sum + (s.wordBudget || 0), 0);
      expect(total).toBe(2000);
    });

    it('should handle arc not found gracefully', async () => {
      const journey: ArcJourney = {
        stages: [
          { arcId: 'non-existent-arc', weight: 50 },
          { arcId: 'upward-spiral', weight: 50 }
        ],
        totalStages: 2
      };

      const contract = await planner.plan({
        presentingIssue: 'test',
        desiredOutcome: 'test',
        arcJourney: journey,
        targetWordCount: 2000
      });

      expect(contract.isJourney).toBe(true);
      expect(contract.journeyStages!.length).toBe(2);
      
      // Should still create stage even if arc not found
      expect(contract.journeyStages![0].arcId).toBe('non-existent-arc');
      expect(contract.journeyStages![0].arcName).toBe('non-existent-arc'); // Fallback to ID
    });
  });
});
