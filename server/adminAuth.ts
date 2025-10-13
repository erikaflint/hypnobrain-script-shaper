import { Request, Response, NextFunction, RequestHandler } from "express";
import { db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";

/**
 * Middleware to check if the authenticated user has admin privileges
 * Must be used AFTER isAuthenticated middleware
 */
export const isAdmin: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as any;
    
    // Replit Auth stores user data in claims
    const userId = user?.claims?.sub;
    
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Check if user is admin using their ID
    const dbUser = await db.select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!dbUser || dbUser.length === 0 || !dbUser[0].isAdmin) {
      return res.status(403).json({ message: "Forbidden: Admin access required" });
    }

    next();
  } catch (error) {
    console.error("Admin check error:", error);
    res.status(500).json({ message: "Server error during admin verification" });
  }
};
