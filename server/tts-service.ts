import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface TTSOptions {
  voice: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
  speed: number; // 0.25 to 4.0
  model?: 'tts-1' | 'tts-1-hd';
}

export class TTSService {
  /**
   * Generate speech audio from text using OpenAI TTS
   * Returns audio buffer
   */
  async generateSpeech(
    text: string,
    options: TTSOptions
  ): Promise<Buffer> {
    const response = await openai.audio.speech.create({
      model: options.model || 'tts-1-hd',
      voice: options.voice,
      input: text,
      speed: options.speed,
    });

    const buffer = Buffer.from(await response.arrayBuffer());
    return buffer;
  }

  /**
   * Get available voices with descriptions
   */
  getAvailableVoices() {
    return [
      {
        id: 'alloy',
        name: 'Alloy',
        description: 'Neutral and balanced',
        gender: 'neutral',
        recommended: false,
      },
      {
        id: 'echo',
        name: 'Echo',
        description: 'Warm and calm male voice',
        gender: 'male',
        recommended: true,
      },
      {
        id: 'fable',
        name: 'Fable',
        description: 'Soft and soothing',
        gender: 'neutral',
        recommended: false,
      },
      {
        id: 'onyx',
        name: 'Onyx',
        description: 'Deep and authoritative male',
        gender: 'male',
        recommended: false,
      },
      {
        id: 'nova',
        name: 'Nova',
        description: 'Gentle and reassuring female',
        gender: 'female',
        recommended: true,
      },
      {
        id: 'shimmer',
        name: 'Shimmer',
        description: 'Soft and calming female',
        gender: 'female',
        recommended: true,
      },
    ];
  }
}

export const ttsService = new TTSService();
