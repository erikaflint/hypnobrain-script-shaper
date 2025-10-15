# HypnoBrain Script Generator API - Integration Guide

## Overview
The HypnoBrain Script Shaper provides external REST API endpoints for **generating** hypnosis scripts. This allows your HypnoBrain Analyzer application to request fully customized clinical and DREAM scripts with rich parameter control.

## Available Endpoints

### 1. Clinical Script Generation
```
POST /api/generate/clinical
```
Generates clinical hypnosis scripts using professionally curated templates with customizable parameters.

### 2. DREAM Script Generation
```
POST /api/generate/dream
```
Generates DREAM sleep/meditation scripts (3000 words, sleep emergence, high sensory immersion).

### 3. List Archetypes
```
GET /api/archetypes
```
Returns available archetypes and blended archetypes for script personalization.

### 4. List Styles
```
GET /api/styles
```
Returns available writing styles for clinical scripts.

---

## Getting Your API Key

### Step 1: Generate Your API Key
Run this command in the Replit Shell:

```bash
npx tsx generate-api-key.ts
```

This will:
1. Find your user account automatically
2. Generate a production API key (starts with `sk_live_...`)
3. Grant `generate:clinical` and `generate:dream` scopes
4. Display the key **once** (save it immediately!)

**⚠️ IMPORTANT:** The API key will only be displayed ONCE. Save it immediately!

---

## Using the API

### Authentication
All requests require an API key in the Authorization header:

```
Authorization: Bearer YOUR_API_KEY_HERE
```

---

## Clinical Script Generation

### Request Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `presentingIssue` | string | Yes | The client's presenting issue (min 10 chars) |
| `desiredOutcome` | string | Yes | The desired therapeutic outcome (min 10 chars) |
| `additionalNotes` | string | No | Additional client context or notes |
| `voiceProfileId` | number | No | Voice/tone profile ID |
| `archetypeId` | number | No | Narrative archetype ID |
| `styleId` | number | No | Writing style ID |
| `templateId` | number | No | Use a specific template directly by ID |
| `emergenceType` | string | No | 'regular' or 'sleep' (default: 'regular') |
| `targetWordCount` | number | No | Target word count (default: 1800) |

**Template Selection:**
- If `templateId` is provided, that specific template will be used
- If `templateId` is omitted, the system automatically recommends the most suitable template using AI-powered semantic matching based on the presenting issue and desired outcome
- The selected template's ID and name are returned in the response metadata

### Example Request

```bash
curl -X POST https://your-replit-app.replit.app/api/generate/clinical \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk_live_abc123..." \
  -d '{
    "presentingIssue": "Chronic anxiety and worry about future events",
    "desiredOutcome": "Feel calm, confident, and present in the moment",
    "additionalNotes": "Client prefers gentle language, avoid medical terms",
    "voiceProfileId": 1,
    "archetypeId": 2,
    "styleId": 1,
    "emergenceType": "regular",
    "targetWordCount": 1800
  }'
```

### Response

```json
{
  "success": true,
  "script": {
    "title": "Feel calm, confident, and present in the moment Hypnosis Script",
    "text": "Close your eyes and take a deep breath...",
    "wordCount": 1847,
    "emergenceType": "regular"
  },
  "metadata": {
    "apiKeyId": 1,
    "generatedAt": "2025-10-14T15:42:00.000Z",
    "archetypeUsed": "The Healer",
    "styleUsed": "Conversational",
    "templateUsed": "Cognitive Reframe + Somatic Grounding",
    "templateId": 5
  }
}
```

---

## DREAM Script Generation

### Request Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `journeyIdea` | string | Yes | The sleep journey concept (min 20 chars) |
| `archetypeId` | number | No | Archetype ID (defaults to first blended) |
| `targetWordCount` | number | No | Target word count (default: 3000) |

### Example Request

```bash
curl -X POST https://your-replit-app.replit.app/api/generate/dream \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk_live_abc123..." \
  -d '{
    "journeyIdea": "A peaceful walk through an ancient forest at twilight, where each tree holds a different dream",
    "archetypeId": 5,
    "targetWordCount": 3000
  }'
```

### Response

```json
{
  "success": true,
  "script": {
    "title": "Whispers of the Dream Forest",
    "text": "You find yourself standing at the edge of a tranquil forest...",
    "wordCount": 2987,
    "emergenceType": "sleep"
  },
  "metadata": {
    "apiKeyId": 1,
    "generatedAt": "2025-10-14T15:45:00.000Z",
    "archetypeUsed": "The Mystic Explorer",
    "templateUsed": "DREAM: Nature Immersion"
  }
}
```

---

## Get Available Options

### Get Archetypes

```bash
curl -X GET https://your-replit-app.replit.app/api/archetypes \
  -H "Authorization: Bearer sk_live_abc123..."
```

**Response:**
```json
{
  "success": true,
  "archetypes": [
    {
      "id": 1,
      "name": "The Healer",
      "description": "Nurturing, compassionate, restorative energy"
    },
    {
      "id": 2,
      "name": "The Guide",
      "description": "Wise, patient, illuminating presence"
    }
  ],
  "blendedArchetypes": [
    {
      "id": 10,
      "name": "Healer + Explorer",
      "description": "Nurturing journey through discovery"
    }
  ]
}
```

### Get Styles

```bash
curl -X GET https://your-replit-app.replit.app/api/styles \
  -H "Authorization: Bearer sk_live_abc123..."
```

**Response:**
```json
{
  "success": true,
  "styles": [
    {
      "id": 1,
      "name": "Conversational",
      "description": "Natural, flowing, everyday language"
    },
    {
      "id": 2,
      "name": "Poetic",
      "description": "Lyrical, metaphorical, evocative"
    }
  ]
}
```

---

## TypeScript Client Example

```typescript
interface GenerateClinicalRequest {
  presentingIssue: string;
  desiredOutcome: string;
  additionalNotes?: string;  // Additional client context
  voiceProfileId?: number;   // Voice/tone profile
  archetypeId?: number;      // Narrative archetype
  styleId?: number;          // Writing style
  templateId?: number;       // Optional: use specific template
  emergenceType?: 'regular' | 'sleep';
  targetWordCount?: number;
}

interface GenerateDreamRequest {
  journeyIdea: string;
  archetypeId?: number;
  targetWordCount?: number;
}

interface ScriptResponse {
  success: boolean;
  script: {
    title: string;
    text: string;
    wordCount: number;
    emergenceType: 'regular' | 'sleep';
  };
  metadata: {
    apiKeyId: number;
    generatedAt: string;
    archetypeUsed?: string;
    styleUsed?: string;
    templateUsed: string;
    templateId: number;
  };
}

class ScriptShaperAPI {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string, baseUrl: string = 'https://your-app.replit.app') {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  async generateClinical(request: GenerateClinicalRequest): Promise<ScriptResponse> {
    const response = await fetch(`${this.baseUrl}/api/generate/clinical`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Generation failed');
    }

    return response.json();
  }

  async generateDream(request: GenerateDreamRequest): Promise<ScriptResponse> {
    const response = await fetch(`${this.baseUrl}/api/generate/dream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Generation failed');
    }

    return response.json();
  }

  async getArchetypes() {
    const response = await fetch(`${this.baseUrl}/api/archetypes`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
    });

    if (!response.ok) throw new Error('Failed to fetch archetypes');
    return response.json();
  }

  async getStyles() {
    const response = await fetch(`${this.baseUrl}/api/styles`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
    });

    if (!response.ok) throw new Error('Failed to fetch styles');
    return response.json();
  }
}

// Usage in HypnoBrain Analyzer
const client = new ScriptShaperAPI(process.env.SCRIPT_SHAPER_API_KEY!);

// Example 1: Auto-recommendation (no templateId specified)
const clinicalScript = await client.generateClinical({
  presentingIssue: "Chronic anxiety and worry",
  desiredOutcome: "Feel calm and present",
  additionalNotes: "Client responds well to nature metaphors",
  voiceProfileId: 1,
  archetypeId: 2,
  styleId: 1,
  targetWordCount: 1800,
});

console.log('Generated script:', clinicalScript.script.text);
console.log('Word count:', clinicalScript.script.wordCount);
console.log('Template used:', clinicalScript.metadata.templateUsed);

// Example 2: Using specific template
const specificScript = await client.generateClinical({
  presentingIssue: "Sleep difficulties",
  desiredOutcome: "Deep, restful sleep",
  additionalNotes: "Avoid references to clocks or time pressure",
  templateId: 7,  // Use specific template by ID
  emergenceType: 'sleep',
});

// Generate a DREAM script
const dreamScript = await client.generateDream({
  journeyIdea: "A peaceful walk through an ancient forest",
  archetypeId: 5,
  targetWordCount: 3000,
});

console.log('Dream title:', dreamScript.script.title);
console.log('Dream script:', dreamScript.script.text);
```

---

## Error Handling

### Common Error Responses

**401 Unauthorized - Missing API Key:**
```json
{
  "error": "Unauthorized",
  "message": "Missing or invalid API key"
}
```

**403 Forbidden - Missing Scopes:**
```json
{
  "error": "Forbidden",
  "message": "API key missing required scopes: generate:clinical"
}
```

**400 Bad Request - Validation Error:**
```json
{
  "error": "Validation error",
  "details": [
    {
      "code": "too_small",
      "minimum": 10,
      "path": ["presentingIssue"],
      "message": "Presenting issue must be at least 10 characters"
    }
  ]
}
```

**500 Internal Server Error:**
```json
{
  "error": "Generation failed",
  "message": "An unexpected error occurred"
}
```

---

## Rate Limiting & Best Practices

1. **Store API keys securely** - Use environment variables, never commit to git
2. **Handle errors gracefully** - Implement retry logic with exponential backoff
3. **Minimum input lengths** - presentingIssue/desiredOutcome: 10 chars, journeyIdea: 20 chars
4. **Response time** - Generation typically takes 8-15 seconds depending on complexity
5. **Cache results** - Store generated scripts to avoid regenerating the same request

---

## Security Notes

- API keys are hashed with SHA-256 before storage
- Keys are only shown once during creation
- Scopes control which endpoints can be accessed (`generate:clinical`, `generate:dream`)
- Keys can be revoked instantly if compromised
- Usage is tracked (last used timestamp)

---

## Support

For issues or questions about the API, check the server logs or contact the development team.

## Key Differences from Analysis API

❌ **This is NOT an analysis API** - It does not analyze existing scripts  
✅ **This is a generation API** - It creates NEW scripts based on parameters

**Correct Flow:**
```
User fills form in HypnoBrain Analyzer
  ↓
Send parameters to Script Shaper API
  ↓
Receive freshly generated script
  ↓
Display in Analyzer app
```
