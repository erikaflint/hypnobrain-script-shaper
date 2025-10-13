import OpenAI from 'openai';

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
    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt,
      n: 1,
      size,
      quality,
      style,
    });

    const imageUrl = response.data[0]?.url;
    
    if (!imageUrl) {
      throw new Error('No image URL returned from DALL-E');
    }

    return imageUrl;
  } catch (error: any) {
    console.error('DALL-E image generation error:', error);
    throw new Error(`Failed to generate image: ${error.message}`);
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
  const basePrompt = `Create a serene, dreamlike illustration for a guided meditation journey: ${journeyIdea}. 
Style: Soft, ethereal, calming colors with gentle gradients. Peaceful and inviting atmosphere. 
High-quality digital art with soothing visual elements perfect for relaxation and sleep.`;

  const archetypeModifier = archetypeName 
    ? ` Incorporate the essence of "${archetypeName}" archetype in the visual style.`
    : '';

  const fullPrompt = basePrompt + archetypeModifier;

  return generateImage({
    prompt: fullPrompt,
    size: '1024x1024',
    quality: 'standard',
    style: 'natural', // 'natural' style is better for calm, peaceful imagery
  });
}
