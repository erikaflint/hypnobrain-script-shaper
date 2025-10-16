import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Play, Pause, Square, Volume2, Download, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface VoicePlayerProProps {
  text: string;
  title?: string;
}

interface Voice {
  id: string;
  name: string;
  description: string;
  gender: string;
  recommended: boolean;
}

export function VoicePlayerPro({ text, title = "Professional Voice Narration" }: VoicePlayerProProps) {
  const { toast } = useToast();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<string>("nova");
  const [speed, setSpeed] = useState(0.6); // Default 60% speed for hypnosis
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Fetch available voices
  const { data: voices = [] } = useQuery<Voice[]>({
    queryKey: ['/api/tts/voices'],
  });

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const generateAudio = async (): Promise<string | null> => {
    try {
      setIsGenerating(true);

      const response = await fetch('/api/tts/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          voice: selectedVoice,
          speed,
          model: 'tts-1-hd', // Use HD model for best quality
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to generate audio');
      }

      const audioBlob = await response.blob();
      const url = URL.createObjectURL(audioBlob);

      // Cleanup previous audio
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }

      setAudioUrl(url);
      setIsGenerating(false);

      toast({
        title: "Audio Generated",
        description: `Professional voice ready with ${selectedVoice} voice`,
      });

      return url;
    } catch (error: any) {
      setIsGenerating(false);
      toast({
        title: "Generation Failed",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }
  };

  const handlePlay = async () => {
    // Generate audio if not already cached
    let playUrl = audioUrl;
    if (!playUrl) {
      playUrl = await generateAudio();
      if (!playUrl) return; // Generation failed
    }

    // Always recreate audio element if we have a new URL
    // This ensures voice/speed changes are reflected
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    const audio = new Audio(playUrl);
    audioRef.current = audio;

    audio.onended = () => {
      setIsPlaying(false);
    };

    audio.onerror = () => {
      setIsPlaying(false);
      toast({
        title: "Playback Error",
        description: "Failed to play audio",
        variant: "destructive",
      });
    };

    // Play the audio
    audioRef.current.play();
    setIsPlaying(true);
  };

  const handlePause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleStop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  const handleDownload = () => {
    if (audioUrl) {
      const a = document.createElement('a');
      a.href = audioUrl;
      a.download = `hypnosis-script-${selectedVoice}.mp3`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      toast({
        title: "Downloaded",
        description: "Audio file saved to your device",
      });
    }
  };

  // Regenerate when voice or speed changes
  const handleVoiceChange = (value: string) => {
    setSelectedVoice(value);
    setAudioUrl(null); // Clear audio to force regeneration
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsPlaying(false);
  };

  const handleSpeedChange = (value: number[]) => {
    setSpeed(value[0]);
    setAudioUrl(null); // Clear audio to force regeneration
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsPlaying(false);
  };

  const recommendedVoices = voices.filter(v => v.recommended);
  const otherVoices = voices.filter(v => !v.recommended);

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Volume2 className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">{title}</h3>
      </div>

      <div className="space-y-3">
        {/* Voice Selection */}
        <div>
          <label className="text-sm text-muted-foreground mb-1 block">Professional Voice</label>
          <Select value={selectedVoice} onValueChange={handleVoiceChange}>
            <SelectTrigger data-testid="select-voice-pro">
              <SelectValue placeholder="Select a voice" />
            </SelectTrigger>
            <SelectContent>
              {recommendedVoices.length > 0 && (
                <>
                  <div className="px-2 py-1 text-xs font-semibold text-muted-foreground">
                    Recommended for Hypnosis
                  </div>
                  {recommendedVoices.map((voice) => (
                    <SelectItem key={voice.id} value={voice.id}>
                      {voice.gender === 'female' ? '♀' : voice.gender === 'male' ? '♂' : '◆'} {voice.name} - {voice.description}
                    </SelectItem>
                  ))}
                </>
              )}
              {otherVoices.length > 0 && (
                <>
                  <div className="px-2 py-1 text-xs font-semibold text-muted-foreground border-t mt-1 pt-1">
                    Other Voices
                  </div>
                  {otherVoices.map((voice) => (
                    <SelectItem key={voice.id} value={voice.id}>
                      {voice.gender === 'female' ? '♀' : voice.gender === 'male' ? '♂' : '◆'} {voice.name} - {voice.description}
                    </SelectItem>
                  ))}
                </>
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Speed Control */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm text-muted-foreground">Narration Speed</label>
            <span className="text-sm font-medium">{(speed * 100).toFixed(0)}%</span>
          </div>
          <Slider
            value={[speed]}
            onValueChange={handleSpeedChange}
            min={0.5}
            max={1.5}
            step={0.05}
            className="w-full"
            data-testid="slider-speed-pro"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>Slow (Hypnotic)</span>
            <span>Normal</span>
          </div>
        </div>

        {/* Status Indicator */}
        {isGenerating && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Generating professional audio...</span>
          </div>
        )}

        {audioUrl && !isGenerating && (
          <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <span>Audio ready - {selectedVoice} voice at {(speed * 100).toFixed(0)}%</span>
          </div>
        )}

        {/* Playback Controls */}
        <div className="flex gap-2">
          {!isPlaying ? (
            <Button
              onClick={handlePlay}
              disabled={isGenerating}
              className="flex-1"
              data-testid="button-play-voice-pro"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  {audioUrl ? 'Play' : 'Generate & Play'}
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={handlePause}
              variant="secondary"
              className="flex-1"
              data-testid="button-pause-voice-pro"
            >
              <Pause className="w-4 h-4 mr-2" />
              Pause
            </Button>
          )}
          
          {(isPlaying || audioUrl) && (
            <Button
              onClick={handleStop}
              variant="outline"
              data-testid="button-stop-voice-pro"
            >
              <Square className="w-4 h-4" />
            </Button>
          )}

          {audioUrl && !isGenerating && (
            <Button
              onClick={handleDownload}
              variant="outline"
              data-testid="button-download-voice-pro"
            >
              <Download className="w-4 h-4" />
            </Button>
          )}
        </div>

        {isPlaying && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <span>Playing professional narration...</span>
          </div>
        )}

        <div className="text-xs text-muted-foreground border-t pt-3">
          <p>✨ Powered by OpenAI TTS - Professional quality hypnosis narration</p>
        </div>
      </div>
    </Card>
  );
}
