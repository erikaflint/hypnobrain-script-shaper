# How to Get API Keys for HypnoBrain Analyzer

## Quick Method (Recommended)

1. **Generate key on Script Shaper server:**
   ```bash
   npx tsx generate-api-key.ts
   ```

2. **Copy the API key** (starts with `sk_live_...`)

3. **Add to your other app** (HypnoBrain Analyzer):
   ```bash
   # In your .env file
   SCRIPT_SHAPER_API_KEY=sk_live_xxxxxxxxxxxxx
   SCRIPT_SHAPER_URL=https://your-script-shaper.replit.app
   ```

4. **That's it!** Your analyzer can now generate scripts via API.

## What This Key Does

The API key gives your HypnoBrain Analyzer app access to:
- `POST /api/generate/clinical` - Generate therapeutic scripts
- `POST /api/generate/dream` - Generate sleep/meditation scripts
- `GET /api/archetypes` - List narrative archetypes
- `GET /api/styles` - List writing styles

## Security Notes

- Keys are SHA-256 hashed in the database
- Each key has specific scopes (generate:clinical, generate:dream)
- Keys can be revoked anytime
- Never commit keys to git repositories

## See Full Integration Guide

Download: http://localhost:5000/static/API_INTEGRATION_GUIDE.md
