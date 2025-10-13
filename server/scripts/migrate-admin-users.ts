/**
 * Migration script to mark existing admin_users as isAdmin=true in users table
 * Usage: npx tsx server/scripts/migrate-admin-users.ts
 */

import { db } from "../db";
import { users, adminUsers } from "@shared/schema";
import { eq, inArray } from "drizzle-orm";

async function migrateAdminUsers() {
  try {
    // Get all admin emails from admin_users table
    const admins = await db.select().from(adminUsers);
    
    if (admins.length === 0) {
      console.log("ℹ️  No admin users found in admin_users table");
      return;
    }

    const adminEmails = admins.map(a => a.email);
    console.log(`Found ${adminEmails.length} admin emails:`, adminEmails);

    // Update users table to mark them as admin
    const result = await db
      .update(users)
      .set({ isAdmin: true })
      .where(inArray(users.email, adminEmails as string[]))
      .returning();

    console.log(`✅ Successfully migrated ${result.length} admin users:`);
    result.forEach(user => {
      console.log(`  - ${user.email} (ID: ${user.id})`);
    });

    if (result.length < adminEmails.length) {
      console.warn(`⚠️  Warning: ${adminEmails.length - result.length} admin emails not found in users table`);
      const foundEmails = result.map(u => u.email);
      const missingEmails = adminEmails.filter(e => !foundEmails.includes(e));
      console.warn(`  Missing: ${missingEmails.join(', ')}`);
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Error migrating admin users:", error);
    process.exit(1);
  }
}

migrateAdminUsers();
