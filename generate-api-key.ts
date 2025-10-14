/**
 * Quick API Key Generator for Script GENERATION
 * Run: npx tsx generate-api-key.ts
 */

import { createApiKey } from './server/admin-tools';
import { db } from './server/db';
import { users } from './shared/schema';

async function main() {
  console.log('\n🔑 HypnoBrain Script Generator API Key\n');
  console.log('════════════════════════════════════════════════════════════════\n');

  // Step 1: Find your user account
  console.log('Looking for your user account...');
  
  const allUsers = await db.select().from(users);
  
  if (allUsers.length === 0) {
    console.log('❌ No users found in database!');
    console.log('Please log into the app first to create your user account.');
    process.exit(1);
  }

  console.log(`\nFound ${allUsers.length} user(s):`);
  allUsers.forEach((user, index) => {
    console.log(`  ${index + 1}. ${user.email} (ID: ${user.id})`);
  });

  // Use the first user (typically the admin/owner)
  const selectedUser = allUsers[0];
  console.log(`\n✓ Using: ${selectedUser.email}`);

  // Step 2: Generate API key with GENERATION scopes
  console.log('\nGenerating API key for Script Generation...\n');

  const apiKey = await createApiKey({
    userId: selectedUser.id,
    name: 'HypnoBrain Analyzer → Script Shaper Integration',
    scopes: ['generate:clinical', 'generate:dream'], // GENERATION scopes, not analysis!
  });

  console.log('\n════════════════════════════════════════════════════════════════');
  console.log('\n✅ SUCCESS! Your Script Generation API is ready.\n');
  console.log('This API GENERATES scripts (not analyzes them)');
  console.log('\nEndpoints available:');
  console.log('  • POST /api/generate/clinical - Generate clinical scripts');
  console.log('  • POST /api/generate/dream - Generate DREAM sleep scripts');
  console.log('  • GET  /api/archetypes - List available archetypes');
  console.log('  • GET  /api/styles - List available styles');
  console.log('\nNext steps:');
  console.log('1. Copy the API key shown above (starts with sk_live_)');
  console.log('2. Add it to your HypnoBrain Analyzer app as SCRIPT_SHAPER_API_KEY');
  console.log('3. See API_INTEGRATION_GUIDE.md for usage examples\n');
  console.log('════════════════════════════════════════════════════════════════\n');

  process.exit(0);
}

main().catch((error) => {
  console.error('❌ Error generating API key:', error);
  process.exit(1);
});
