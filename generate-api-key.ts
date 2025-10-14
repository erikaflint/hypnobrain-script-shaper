/**
 * Quick API Key Generator
 * Run: npx tsx generate-api-key.ts
 */

import { createApiKey } from './server/admin-tools';
import { db } from './db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';

async function main() {
  console.log('\n🔑 HypnoBrain API Key Generator\n');
  console.log('════════════════════════════════════════════════════════════════\n');

  // Step 1: Find your user account
  console.log('Looking for your user account...');
  
  // Try to find the first admin user (most likely you)
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

  // Step 2: Generate API key
  console.log('\nGenerating API key for HypnoBrain Analyzer...\n');

  const apiKey = await createApiKey({
    userId: selectedUser.id,
    name: 'HypnoBrain Analyzer Integration',
    scopes: ['analyze:clinical', 'analyze:dream'],
  });

  console.log('\n════════════════════════════════════════════════════════════════');
  console.log('\n✅ SUCCESS! Your API is ready to use.\n');
  console.log('Next steps:');
  console.log('1. Copy the API key shown above (starts with sk_live_)');
  console.log('2. Add it to your HypnoBrain Analyzer app as an environment variable');
  console.log('3. See API_INTEGRATION_GUIDE.md for usage examples\n');
  console.log('════════════════════════════════════════════════════════════════\n');

  process.exit(0);
}

main().catch((error) => {
  console.error('❌ Error generating API key:', error);
  process.exit(1);
});
