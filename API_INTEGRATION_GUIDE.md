# HypnoBrain External API - Integration Guide

## Overview
The HypnoBrain Script Shaper provides external REST API endpoints for analyzing hypnosis scripts. This allows your other applications (like HypnoBrain Analyzer) to leverage the AI-powered analysis engine.

## Available Endpoints

### 1. Clinical Script Analysis
```
POST /api/analyze/clinical
```
Analyzes clinical hypnosis scripts using Erika Flint's 8-Dimensional Framework.

### 2. DREAM Script Analysis
```
POST /api/analyze/dream
```
Analyzes DREAM sleep/meditation scripts with focus on sensory immersion and journey quality.

---

## Getting Your API Key

### Step 1: Get Your User ID
You need your user ID from the database. You can find this by:
1. Log into the app
2. Open browser console
3. Run: `fetch('/api/auth/user').then(r => r.json()).then(console.log)`
4. Copy your `id` field

### Step 2: Generate API Key
Run this command in the Replit Shell:

```bash
npx tsx -e "
import { createApiKey } from './server/admin-tools';

createApiKey({
  userId: 'YOUR_USER_ID_HERE',
  name: 'HypnoBrain Analyzer Integration',
  scopes: ['analyze:clinical', 'analyze:dream'],
}).then(() => process.exit(0));
"
```

**⚠️ IMPORTANT:** The API key will only be displayed ONCE. Save it immediately!

---

## Using the API

### Authentication
All requests require an API key in the Authorization header:

```
Authorization: Bearer YOUR_API_KEY_HERE
```

### Example: Clinical Analysis

**Request:**
```bash
curl -X POST https://your-replit-app.replit.app/api/analyze/clinical \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk_live_abc123..." \
  -d '{
    "script": "Close your eyes and take a deep breath. As you settle into this comfortable position, allow yourself to relax more deeply with each breath..."
  }'
```

**Response:**
```json
{
  "success": true,
  "analysis": {
    "dimensions": {
      "cognitive": 75,
      "emotional": 68,
      "somatic": 85,
      "behavioral": 45,
      "symbolic": 60,
      "perspective": 55,
      "relational": 30,
      "spiritual": 40
    },
    "narrativeArcs": ["Inner Sanctuary", "Progressive Relaxation", "Future Self"],
    "qualityMetrics": {
      "wordCount": 1523,
      "avgSentenceLength": 18.5,
      "hypnoticLanguageScore": 82,
      "metaphorDensity": 65,
      "suggestionsCount": 18
    },
    "emergenceType": "regular",
    "tranceDepth": "medium",
    "primaryMetaphor": "Peaceful garden sanctuary",
    "strengths": [
      "Strong somatic focus with detailed body awareness",
      "Effective use of progressive relaxation",
      "Clear therapeutic suggestions"
    ],
    "improvements": [
      "Could increase behavioral suggestions for post-hypnotic action",
      "Consider adding more relational elements"
    ]
  },
  "metadata": {
    "apiKeyId": 1,
    "analyzedAt": "2025-01-14T14:42:00.000Z"
  }
}
```

### Example: DREAM Analysis

**Request:**
```bash
curl -X POST https://your-replit-app.replit.app/api/analyze/dream \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk_live_abc123..." \
  -d '{
    "script": "You find yourself standing at the edge of a tranquil forest. The air is warm and gentle..."
  }'
```

**Response:**
```json
{
  "success": true,
  "analysis": {
    "dimensions": {
      "cognitive": 25,
      "emotional": 70,
      "somatic": 95,
      "behavioral": 15,
      "symbolic": 90,
      "perspective": 65,
      "relational": 40,
      "spiritual": 75
    },
    "narrativeArcs": ["Nature Immersion", "Cosmic Journey"],
    "qualityMetrics": {
      "wordCount": 2847,
      "avgSentenceLength": 22.3,
      "hypnoticLanguageScore": 88,
      "metaphorDensity": 92,
      "suggestionsCount": 12
    },
    "emergenceType": "sleep",
    "tranceDepth": "deep",
    "primaryMetaphor": "Forest journey into peaceful rest",
    "strengths": [
      "Exceptional sensory detail and imagery",
      "Strong symbolic journey structure",
      "Effective sleep emergence"
    ],
    "improvements": [
      "Already highly optimized for sleep induction"
    ]
  },
  "metadata": {
    "apiKeyId": 1,
    "analyzedAt": "2025-01-14T14:45:00.000Z"
  }
}
```

---

## Integration in HypnoBrain Analyzer

### TypeScript/JavaScript Example

```typescript
interface AnalysisRequest {
  script: string;
}

interface AnalysisResponse {
  success: boolean;
  analysis: {
    dimensions: {
      cognitive: number;
      emotional: number;
      somatic: number;
      behavioral: number;
      symbolic: number;
      perspective: number;
      relational: number;
      spiritual: number;
    };
    narrativeArcs: string[];
    qualityMetrics: {
      wordCount: number;
      avgSentenceLength: number;
      hypnoticLanguageScore: number;
      metaphorDensity: number;
      suggestionsCount: number;
    };
    emergenceType: 'regular' | 'sleep';
    tranceDepth: 'light' | 'medium' | 'deep';
    primaryMetaphor?: string;
    strengths: string[];
    improvements: string[];
  };
  metadata: {
    apiKeyId: number;
    analyzedAt: string;
  };
}

class HypnoBrainAPI {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string, baseUrl: string = 'https://your-app.replit.app') {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  async analyzeClinical(script: string): Promise<AnalysisResponse> {
    const response = await fetch(`${this.baseUrl}/api/analyze/clinical`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({ script }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Analysis failed');
    }

    return response.json();
  }

  async analyzeDream(script: string): Promise<AnalysisResponse> {
    const response = await fetch(`${this.baseUrl}/api/analyze/dream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({ script }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Analysis failed');
    }

    return response.json();
  }
}

// Usage
const client = new HypnoBrainAPI('sk_live_your_api_key_here');

const result = await client.analyzeClinical(myScript);
console.log('8D Dimensions:', result.analysis.dimensions);
console.log('Strengths:', result.analysis.strengths);
console.log('Quality Score:', result.analysis.qualityMetrics.hypnoticLanguageScore);
```

---

## Error Handling

### Common Error Responses

**401 Unauthorized - Missing API Key:**
```json
{
  "error": "Unauthorized",
  "message": "Missing or invalid API key. Include 'Authorization: Bearer YOUR_API_KEY' header"
}
```

**401 Unauthorized - Invalid API Key:**
```json
{
  "error": "Unauthorized",
  "message": "Invalid or inactive API key"
}
```

**403 Forbidden - Missing Scopes:**
```json
{
  "error": "Forbidden",
  "message": "API key missing required scopes: analyze:clinical"
}
```

**400 Bad Request - Validation Error:**
```json
{
  "error": "Validation error",
  "details": [
    {
      "code": "too_small",
      "minimum": 100,
      "message": "Script must be at least 100 characters"
    }
  ]
}
```

---

## Rate Limiting & Best Practices

1. **Store API keys securely** - Use environment variables, never commit to git
2. **Handle errors gracefully** - Implement retry logic with exponential backoff
3. **Minimum script length** - Scripts must be at least 100 characters
4. **Response time** - Analysis typically takes 3-8 seconds depending on script length
5. **Cache results** - Analysis results don't change, so cache them if analyzing the same script multiple times

---

## API Key Management

### List Your API Keys
```bash
npx tsx -e "
import { listApiKeys } from './server/admin-tools';
listApiKeys('YOUR_USER_ID').then(console.log).then(() => process.exit(0));
"
```

### Revoke an API Key
```bash
npx tsx -e "
import { revokeApiKey } from './server/admin-tools';
revokeApiKey(KEY_ID).then(() => process.exit(0));
"
```

### Reactivate an API Key
```bash
npx tsx -e "
import { reactivateApiKey } from './server/admin-tools';
reactivateApiKey(KEY_ID).then(() => process.exit(0));
"
```

---

## Security Notes

- API keys are hashed with SHA-256 before storage
- Keys are only shown once during creation
- Scopes control which endpoints can be accessed
- Keys can be revoked instantly if compromised
- Usage is tracked (last used timestamp)

---

## Support

For issues or questions about the API, check the server logs or contact the development team.
