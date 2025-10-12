import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Play, Pause, Square, Volume2 } from "lucide-react";

interface VoicePlayerProps {
  text: string;
  title?: string;
}

export function VoicePlayer({ text, title = "Voice Narration" }: VoicePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>("");
  const [speed, setSpeed] = useState(0.6); // Default 60% speed for hypnosis
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Load available voices - filtered to English only (UK, US, India, AU)
  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      
      // Filter to only English variants we want: UK, US, India, Australia
      // Look for both language codes and common voice name patterns
      const curatedVoices = availableVoices.filter(voice => {
        const lang = voice.lang.toLowerCase();
        const name = voice.name.toLowerCase();
        
        // Accept these English language codes
        const acceptedLangs = ['en-us', 'en-gb', 'en-uk', 'en-in', 'en-au'];
        const hasAcceptedLang = acceptedLangs.some(l => lang.includes(l));
        
        // Also accept voices with these country indicators in name
        const hasAcceptedName = name.includes('us ') || name.includes('uk ') || 
                                 name.includes('british') || name.includes('india') || 
                                 name.includes('australia') || name.includes('american');
        
        return hasAcceptedLang || (lang.startsWith('en') && hasAcceptedName);
      });
      
      // Limit to max 10 voices - prefer diverse genders/regions
      const limitedVoices = curatedVoices.slice(0, 10);
      setVoices(limitedVoices);
      
      // Try to select a good default voice (prefer female voices for hypnosis)
      const preferredVoice = limitedVoices.find(v => 
        v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('woman')
      ) || limitedVoices[0];
      
      if (preferredVoice) {
        setSelectedVoice(preferredVoice.name);
      }
    };

    loadVoices();
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices);

    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
    };
  }, []);

  // Cleanup on unmount - stop any playing speech
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const handlePlay = () => {
    if (isPaused) {
      // Resume if paused
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
    } else {
      // Start new playback
      window.speechSynthesis.cancel(); // Stop any existing speech
      
      const utterance = new SpeechSynthesisUtterance(text);
      const voice = voices.find(v => v.name === selectedVoice);
      
      if (voice) {
        utterance.voice = voice;
      }
      
      utterance.rate = speed;
      utterance.pitch = 1;
      utterance.volume = 1;
      
      utterance.onend = () => {
        setIsPlaying(false);
        setIsPaused(false);
      };
      
      utterance.onerror = () => {
        setIsPlaying(false);
        setIsPaused(false);
      };
      
      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
      setIsPlaying(true);
      setIsPaused(false);
    }
  };

  const handlePause = () => {
    window.speechSynthesis.pause();
    setIsPaused(true);
    setIsPlaying(false);
  };

  const handleStop = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Volume2 className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">{title}</h3>
      </div>

      <div className="space-y-3">
        {/* Voice Selection */}
        <div>
          <label className="text-sm text-muted-foreground mb-1 block">Voice</label>
          <Select value={selectedVoice} onValueChange={setSelectedVoice}>
            <SelectTrigger data-testid="select-voice">
              <SelectValue placeholder="Select a voice" />
            </SelectTrigger>
            <SelectContent>
              {voices.map((voice) => {
                // Extract region from language code
                const region = voice.lang.includes('-GB') || voice.lang.includes('-UK') ? '🇬🇧 UK' :
                              voice.lang.includes('-US') ? '🇺🇸 US' :
                              voice.lang.includes('-IN') ? '🇮🇳 India' :
                              voice.lang.includes('-AU') ? '🇦🇺 Australia' : voice.lang;
                
                // Detect gender from name
                const isFemale = voice.name.toLowerCase().includes('female') || 
                                voice.name.toLowerCase().includes('woman') ||
                                voice.name.toLowerCase().includes('samantha') ||
                                voice.name.toLowerCase().includes('victoria') ||
                                voice.name.toLowerCase().includes('karen');
                
                const isMale = voice.name.toLowerCase().includes('male') || 
                              voice.name.toLowerCase().includes('man') ||
                              voice.name.toLowerCase().includes('daniel') ||
                              voice.name.toLowerCase().includes('oliver');
                
                const gender = isFemale ? '♀' : isMale ? '♂' : '';
                
                return (
                  <SelectItem key={voice.name} value={voice.name}>
                    {gender} {region} - {voice.name}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        {/* Speed Control */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm text-muted-foreground">Speed</label>
            <span className="text-sm font-medium">{(speed * 100).toFixed(0)}%</span>
          </div>
          <Slider
            value={[speed]}
            onValueChange={(values) => setSpeed(values[0])}
            min={0.5}
            max={1.5}
            step={0.05}
            className="w-full"
            data-testid="slider-speed"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>50% (Slow)</span>
            <span>60% (Hypnosis)</span>
            <span>100% (Normal)</span>
            <span>150% (Fast)</span>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex gap-2">
          {!isPlaying && !isPaused && (
            <Button
              onClick={handlePlay}
              className="flex-1"
              data-testid="button-play-voice"
            >
              <Play className="w-4 h-4 mr-2" />
              Play Script
            </Button>
          )}
          
          {isPlaying && (
            <Button
              onClick={handlePause}
              variant="secondary"
              className="flex-1"
              data-testid="button-pause-voice"
            >
              <Pause className="w-4 h-4 mr-2" />
              Pause
            </Button>
          )}
          
          {isPaused && (
            <Button
              onClick={handlePlay}
              className="flex-1"
              data-testid="button-resume-voice"
            >
              <Play className="w-4 h-4 mr-2" />
              Resume
            </Button>
          )}
          
          {(isPlaying || isPaused) && (
            <Button
              onClick={handleStop}
              variant="outline"
              data-testid="button-stop-voice"
            >
              <Square className="w-4 h-4 mr-2" />
              Stop
            </Button>
          )}
        </div>

        {isPlaying && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <span>Playing at {(speed * 100).toFixed(0)}% speed...</span>
          </div>
        )}
      </div>
    </Card>
  );
}
