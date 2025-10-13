/**
 * Utility script to set a user as admin
 * Usage: npx tsx server/scripts/set-admin.ts <email>
 */

import { db } from "../db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";

const email = process.argv[2];

if (!email) {
  console.error("Usage: npx tsx server/scripts/set-admin.ts <email>");
  process.exit(1);
}

async function setAdmin() {
  try {
    const result = await db
      .update(users)
      .set({ isAdmin: true })
      .where(eq(users.email, email))
      .returning();

    if (result.length === 0) {
      console.error(`No user found with email: ${email}`);
      process.exit(1);
    }

    console.log(`✅ Successfully set ${email} as admin`);
    console.log(`User:`, result[0]);
    process.exit(0);
  } catch (error) {
    console.error("Error setting admin:", error);
    process.exit(1);
  }
}

setAdmin();
