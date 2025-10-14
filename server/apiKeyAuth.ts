import { Request, Response, NextFunction } from "express";
import { db } from "./db";
import { apiKeys } from "@shared/schema";
import { eq, and } from "drizzle-orm";
import crypto from "crypto";

/**
 * Middleware to authenticate requests using API key
 * Expects header: Authorization: Bearer sk_live_...
 */
export const requireApiKey = (requiredScopes: string[] = []) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ 
          error: "Unauthorized",
          message: "Missing or invalid API key. Include 'Authorization: Bearer YOUR_API_KEY' header" 
        });
      }

      const providedKey = authHeader.substring(7); // Remove 'Bearer '
      
      // Hash the provided key to compare with stored hash
      const keyHash = crypto.createHash('sha256').update(providedKey).digest('hex');
      
      // Look up the API key
      const [apiKey] = await db.select()
        .from(apiKeys)
        .where(and(
          eq(apiKeys.key, keyHash),
          eq(apiKeys.isActive, true)
        ))
        .limit(1);

      if (!apiKey) {
        return res.status(401).json({ 
          error: "Unauthorized",
          message: "Invalid or inactive API key" 
        });
      }

      // Check scopes if required
      if (requiredScopes.length > 0) {
        const hasRequiredScopes = requiredScopes.every(scope => 
          apiKey.scopes.includes(scope)
        );
        
        if (!hasRequiredScopes) {
          return res.status(403).json({ 
            error: "Forbidden",
            message: `API key missing required scopes: ${requiredScopes.join(', ')}` 
          });
        }
      }

      // Update last used timestamp
      await db.update(apiKeys)
        .set({ lastUsedAt: new Date() })
        .where(eq(apiKeys.id, apiKey.id));

      // Attach API key info to request
      (req as any).apiKey = apiKey;
      
      next();
    } catch (error) {
      console.error('API key authentication error:', error);
      res.status(500).json({ 
        error: "Internal server error",
        message: "Failed to authenticate API key" 
      });
    }
  };
};

/**
 * Generate a new API key (returns unhashed key - only shown once)
 */
export function generateApiKey(prefix: string = 'sk_live'): string {
  const randomBytes = crypto.randomBytes(32).toString('hex');
  return `${prefix}_${randomBytes}`;
}

/**
 * Hash an API key for storage
 */
export function hashApiKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex');
}
