/**
 * Seed system templates into database
 * Run with: npx tsx server/seed-system-templates.ts
 */

import { db } from './db';
import { templates } from '@shared/schema';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function seedSystemTemplates() {
  console.log('🌱 Seeding system templates...\n');

  try {
    // Read templates from JSON file
    const templatesPath = path.join(__dirname, 'seed-templates.json');
    const templatesData = JSON.parse(fs.readFileSync(templatesPath, 'utf-8'));

    // Insert each template
    for (const templateJson of templatesData) {
      console.log(`📝 Inserting template: ${templateJson.name}`);
      
      // Insert with jsonData as main storage and denormalized fields for fast queries
      // Use onConflictDoUpdate to make idempotent (can re-run seed script)
      await db.insert(templates).values({
        templateId: templateJson.id,
        jsonData: templateJson,
        // Denormalized for fast queries
        name: templateJson.name,
        description: templateJson.description,
        category: templateJson.category,
        tags: templateJson.tags,
        // System template flags
        createdBy: "system",
        userId: null,
        isPublic: true,
        isSystem: true,
        usageCount: 0,
        ratingAvg: null
      }).onConflictDoUpdate({
        target: templates.templateId,
        set: {
          jsonData: templateJson,
          name: templateJson.name,
          description: templateJson.description,
          category: templateJson.category,
          tags: templateJson.tags,
          updatedAt: new Date()
        }
      });
      
      console.log(`✅ Inserted: ${templateJson.name} (ID: ${templateJson.id})\n`);
    }

    console.log('🎉 Successfully seeded all system templates!');
    console.log(`\n📊 Total templates inserted: ${templatesData.length}`);
    
  } catch (error) {
    console.error('❌ Error seeding templates:', error);
    throw error;
  } finally {
    process.exit(0);
  }
}

// Run the seed function
seedSystemTemplates();
