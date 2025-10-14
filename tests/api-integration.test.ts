/**
 * External API Integration Tests
 * Tests the /api/analyze/* endpoints with API key authentication
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { db } from '../db';
import { apiKeys, users } from '../shared/schema';
import { generateApiKey, hashApiKey } from '../server/apiKeyAuth';
import { eq } from 'drizzle-orm';

describe('External API - Script Analysis', () => {
  let testApiKey: string;
  let testUserId: string;

  beforeAll(async () => {
    // Create a test user
    const [user] = await db.insert(users).values({
      email: 'test-api-user@example.com',
      firstName: 'API',
      lastName: 'Tester',
    }).returning();
    testUserId = user.id;

    // Generate an API key
    testApiKey = generateApiKey('sk_test');
    const hashedKey = hashApiKey(testApiKey);

    await db.insert(apiKeys).values({
      key: hashedKey,
      userId: testUserId,
      name: 'Test API Key',
      scopes: ['analyze:clinical', 'analyze:dream'],
      isActive: true,
    });
  });

  describe('POST /api/analyze/clinical', () => {
    it('should reject requests without API key', async () => {
      const response = await fetch('http://localhost:5000/api/analyze/clinical', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          script: 'This is a test clinical hypnosis script that is longer than 100 characters to pass validation. It contains therapeutic suggestions and positive affirmations.'
        }),
      });

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toBe('Unauthorized');
    });

    it('should reject requests with invalid API key', async () => {
      const response = await fetch('http://localhost:5000/api/analyze/clinical', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer sk_invalid_key_12345',
        },
        body: JSON.stringify({
          script: 'This is a test clinical hypnosis script that is longer than 100 characters to pass validation.'
        }),
      });

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.message).toContain('Invalid or inactive API key');
    });

    it('should reject requests with missing scope', async () => {
      // Create a key with only dream scope
      const limitedKey = generateApiKey('sk_test');
      const hashedLimitedKey = hashApiKey(limitedKey);

      await db.insert(apiKeys).values({
        key: hashedLimitedKey,
        userId: testUserId,
        name: 'Limited API Key',
        scopes: ['analyze:dream'], // Missing analyze:clinical
        isActive: true,
      });

      const response = await fetch('http://localhost:5000/api/analyze/clinical', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${limitedKey}`,
        },
        body: JSON.stringify({
          script: 'This is a test clinical hypnosis script that is longer than 100 characters to pass validation.'
        }),
      });

      expect(response.status).toBe(403);
      const data = await response.json();
      expect(data.message).toContain('missing required scopes');
    });

    it('should reject scripts that are too short', async () => {
      const response = await fetch('http://localhost:5000/api/analyze/clinical', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${testApiKey}`,
        },
        body: JSON.stringify({
          script: 'Too short'
        }),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe('Validation error');
    });

    it.skip('should successfully analyze a clinical script with valid API key', async () => {
      // Skipped because it requires real AI call - use for manual testing
      const sampleScript = `
        Close your eyes and take a deep breath. As you settle into this comfortable position,
        allow yourself to relax more deeply with each breath. Notice the sensations in your body,
        the gentle rise and fall of your chest. You are safe here, and you can let go of any tension.
        
        Imagine a peaceful place, somewhere you feel completely at ease. See the colors, hear the sounds,
        feel the temperature on your skin. With each moment in this place, you feel more relaxed,
        more centered, more in control of your thoughts and feelings.
        
        Now, as you continue to breathe deeply, I want you to imagine a version of yourself who has
        already overcome the challenge you're facing. See how confident they are, how easily they
        handle situations that once seemed difficult. This is you - your future self.
        
        And as you breathe out, release any doubt. Breathe in confidence and capability. You have
        everything you need within you already. Your subconscious mind is already working on solutions,
        creating new pathways of thinking and being that serve you better.
      `;

      const response = await fetch('http://localhost:5000/api/analyze/clinical', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${testApiKey}`,
        },
        body: JSON.stringify({
          script: sampleScript
        }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      
      expect(data.success).toBe(true);
      expect(data.analysis).toBeDefined();
      expect(data.analysis.dimensions).toBeDefined();
      expect(data.analysis.dimensions.cognitive).toBeGreaterThanOrEqual(0);
      expect(data.analysis.dimensions.cognitive).toBeLessThanOrEqual(100);
      expect(data.metadata.apiKeyId).toBeDefined();
      expect(data.metadata.analyzedAt).toBeDefined();
    });
  });

  describe('POST /api/analyze/dream', () => {
    it('should reject requests without API key', async () => {
      const response = await fetch('http://localhost:5000/api/analyze/dream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          script: 'This is a test DREAM script that is longer than 100 characters for validation purposes.'
        }),
      });

      expect(response.status).toBe(401);
    });

    it.skip('should successfully analyze a DREAM script with valid API key', async () => {
      // Skipped because it requires real AI call - use for manual testing
      const sampleDreamScript = `
        You find yourself standing at the edge of a tranquil forest. The air is warm and gentle,
        carrying with it the sweet scent of wildflowers and pine. As you step forward onto the
        soft moss-covered path, you feel the earth beneath your feet, supporting you with each step.
        
        The trees around you are ancient and wise, their branches swaying gently in the breeze,
        creating a soft, rhythmic sound that seems to match your breathing. Sunlight filters through
        the canopy above, creating dancing patterns of light and shadow on the forest floor.
        
        As you walk deeper into this peaceful place, you notice a small stream running alongside
        the path. The water is crystal clear, bubbling over smooth stones, creating a soothing melody.
        You pause for a moment, listening to the water, feeling the cool mist on your skin.
        
        With each step deeper into the forest, you feel more relaxed, more at peace. Your body
        feels lighter, your mind quieter. Time seems to slow down here. There's nowhere you need
        to be, nothing you need to do. Just this moment, this breath, this peaceful journey deeper
        into rest and relaxation.
      `;

      const response = await fetch('http://localhost:5000/api/analyze/dream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${testApiKey}`,
        },
        body: JSON.stringify({
          script: sampleDreamScript
        }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      
      expect(data.success).toBe(true);
      expect(data.analysis).toBeDefined();
      expect(data.analysis.emergenceType).toBe('sleep');
    });
  });

  describe('API Key Usage Tracking', () => {
    it('should update lastUsedAt timestamp when API key is used', async () => {
      const beforeUse = new Date();
      
      await fetch('http://localhost:5000/api/analyze/clinical', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${testApiKey}`,
        },
        body: JSON.stringify({
          script: 'This is a test clinical hypnosis script that is longer than 100 characters to pass validation.'
        }),
      });

      // Wait a moment for the update
      await new Promise(resolve => setTimeout(resolve, 100));

      const hashedKey = hashApiKey(testApiKey);
      const [key] = await db.select()
        .from(apiKeys)
        .where(eq(apiKeys.key, hashedKey))
        .limit(1);

      expect(key.lastUsedAt).toBeDefined();
      expect(new Date(key.lastUsedAt!).getTime()).toBeGreaterThanOrEqual(beforeUse.getTime());
    });
  });
});
