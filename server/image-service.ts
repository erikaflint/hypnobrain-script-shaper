import OpenAI from 'openai';
import { ObjectStorageService } from './objectStorage';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface ImageGenerationOptions {
  prompt: string;
  size?: '1024x1024' | '1024x1792' | '1792x1024';
  quality?: 'standard' | 'hd';
  style?: 'vivid' | 'natural';
}

export async function generateImage(options: ImageGenerationOptions): Promise<string> {
  const {
    prompt,
    size = '1024x1024',
    quality = 'standard',
    style = 'vivid'
  } = options;

  try {
    console.log('[IMAGE-SERVICE] Calling DALL-E with prompt:', prompt.substring(0, 100) + '...');
    console.log('[IMAGE-SERVICE] Settings:', { model: 'dall-e-3', size, quality, style });
    
    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt,
      n: 1,
      size,
      quality,
      style,
    });

    const tempImageUrl = response.data[0]?.url;
    console.log('[IMAGE-SERVICE] DALL-E response received, temp URL:', tempImageUrl ? 'YES' : 'NO');
    
    if (!tempImageUrl) {
      throw new Error('No image URL returned from DALL-E');
    }

    console.log('[IMAGE-SERVICE] ✓ Temp URL received, downloading image...');
    
    // Download the image from DALL-E (URLs expire after 1 hour)
    const imageResponse = await fetch(tempImageUrl);
    if (!imageResponse.ok) {
      throw new Error(`Failed to download image from DALL-E: ${imageResponse.statusText}`);
    }
    
    const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
    console.log('[IMAGE-SERVICE] ✓ Image downloaded, size:', imageBuffer.length, 'bytes');
    
    // Store permanently in object storage
    const objectStorageService = new ObjectStorageService();
    const permanentUrl = await objectStorageService.uploadDreamImage(imageBuffer);
    console.log('[IMAGE-SERVICE] ✓ Image stored permanently:', permanentUrl);
    
    return permanentUrl;
  } catch (error: any) {
    console.error('[IMAGE-SERVICE] ✗ Image generation/storage error:', error.message);
    console.error('[IMAGE-SERVICE] Error details:', error);
    throw new Error(`Failed to generate and store image: ${error.message}`);
  }
}

/**
 * Generate a DREAM script thumbnail image based on journey description
 * @param journeyIdea - The user's journey description
 * @param archetypeName - Optional archetype name for style influence
 * @returns URL of the generated image
 */
export async function generateDreamThumbnail(
  journeyIdea: string,
  archetypeName?: string
): Promise<string> {
  // Craft an artistic prompt optimized for sleep/meditation imagery
  // IMPORTANT: No people, no text, gentle and calming only
  const basePrompt = `Create a serene, dreamlike landscape illustration for a guided meditation journey: ${journeyIdea}. 
Style: Soft, ethereal, calming colors with gentle gradients. Peaceful, safe, and inviting atmosphere. 
View as if looking through a window at a beautiful natural setting.
CRITICAL REQUIREMENTS:
- Show ONLY the environment, landscape, and surroundings
- NO people, bodies, human figures, or essence of humans
- NO text, words, letters, or writing of any kind
- NO scary, dark, threatening, or unsettling elements
- ONLY gentle, peaceful, calming, and safe imagery
High-quality digital art with soothing visual elements perfect for relaxation and sleep.`;

  const archetypeModifier = archetypeName 
    ? ` Incorporate the essence of "${archetypeName}" archetype in the visual mood and atmosphere (keeping it gentle and peaceful).`
    : '';

  const fullPrompt = basePrompt + archetypeModifier;

  return generateImage({
    prompt: fullPrompt,
    size: '1024x1024',
    quality: 'standard',
    style: 'natural', // 'natural' style is better for calm, peaceful imagery
  });
}
