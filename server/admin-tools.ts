/**
 * Admin Tools for API Key Management
 * Use these functions to generate and manage API keys for integrations
 */

import { db } from "./db";
import { apiKeys, users } from "@shared/schema";
import { generateApiKey, hashApiKey } from "./apiKeyAuth";
import { eq } from "drizzle-orm";

export interface CreateApiKeyParams {
  userId: string;
  name: string;
  scopes: string[];
}

export interface ApiKeyInfo {
  id: number;
  key: string; // Only returned once during creation!
  name: string;
  scopes: string[];
  isActive: boolean;
  createdAt: Date;
  lastUsedAt: Date | null;
}

/**
 * Create a new API key for a user
 * WARNING: The raw key is only returned once - store it securely!
 */
export async function createApiKey(params: CreateApiKeyParams): Promise<ApiKeyInfo> {
  const { userId, name, scopes } = params;

  // Verify user exists
  const [user] = await db.select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) {
    throw new Error(`User not found: ${userId}`);
  }

  // Generate the API key (this is the only time we'll see the raw key)
  const rawKey = generateApiKey('sk_live');
  const hashedKey = hashApiKey(rawKey);

  // Store the hashed key
  const [apiKey] = await db.insert(apiKeys).values({
    key: hashedKey,
    userId,
    name,
    scopes,
    isActive: true,
  }).returning();

  console.log('✅ API Key Created Successfully!');
  console.log('─────────────────────────────────────────────────────');
  console.log(`Name: ${name}`);
  console.log(`User: ${user.email}`);
  console.log(`Scopes: ${scopes.join(', ')}`);
  console.log('─────────────────────────────────────────────────────');
  console.log('⚠️  IMPORTANT: Store this key securely - it will not be shown again!');
  console.log('─────────────────────────────────────────────────────');
  console.log(`API Key: ${rawKey}`);
  console.log('─────────────────────────────────────────────────────');

  return {
    id: apiKey.id,
    key: rawKey, // Only returned here!
    name: apiKey.name,
    scopes: apiKey.scopes,
    isActive: apiKey.isActive,
    createdAt: apiKey.createdAt,
    lastUsedAt: apiKey.lastUsedAt,
  };
}

/**
 * List all API keys for a user (keys are hashed, so raw keys won't be shown)
 */
export async function listApiKeys(userId: string): Promise<Omit<ApiKeyInfo, 'key'>[]> {
  const keys = await db.select()
    .from(apiKeys)
    .where(eq(apiKeys.userId, userId));

  return keys.map(key => ({
    id: key.id,
    name: key.name,
    scopes: key.scopes,
    isActive: key.isActive,
    createdAt: key.createdAt,
    lastUsedAt: key.lastUsedAt,
  }));
}

/**
 * Revoke an API key (sets isActive to false)
 */
export async function revokeApiKey(keyId: number): Promise<void> {
  await db.update(apiKeys)
    .set({ isActive: false })
    .where(eq(apiKeys.id, keyId));

  console.log(`✅ API Key #${keyId} has been revoked`);
}

/**
 * Reactivate a previously revoked API key
 */
export async function reactivateApiKey(keyId: number): Promise<void> {
  await db.update(apiKeys)
    .set({ isActive: true })
    .where(eq(apiKeys.id, keyId));

  console.log(`✅ API Key #${keyId} has been reactivated`);
}

/**
 * Delete an API key permanently
 */
export async function deleteApiKey(keyId: number): Promise<void> {
  await db.delete(apiKeys)
    .where(eq(apiKeys.id, keyId));

  console.log(`✅ API Key #${keyId} has been permanently deleted`);
}

// Example usage (uncomment to run):
// Run this with: npx tsx server/admin-tools.ts

/*
async function example() {
  // Create an API key for your admin user
  const apiKey = await createApiKey({
    userId: 'your-user-id-here', // Replace with your actual user ID
    name: 'HypnoBrain Analyzer Integration',
    scopes: ['analyze:clinical', 'analyze:dream'],
  });

  console.log('\nAPI Key created! Use this in your Authorization header:');
  console.log(`Authorization: Bearer ${apiKey.key}`);

  // List all keys
  const keys = await listApiKeys('your-user-id-here');
  console.log('\nAll API keys:', keys);
}

// Uncomment to run:
// example().catch(console.error);
*/
