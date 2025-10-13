import { useEffect, useRef, useState } from 'react';

/**
 * Hook for playing a gentle lullaby sound during DREAM generation
 * Uses a simple, soothing melody generated with Web Audio API
 */
export function useLullaby() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const loopIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Play a single melody loop
  const playMelody = () => {
    if (!audioContextRef.current) return;

    const audioContext = audioContextRef.current;
    
    // Create gain node for volume control
    const gainNode = audioContext.createGain();
    gainNode.gain.value = 0.15; // Gentle volume
    gainNode.connect(audioContext.destination);

    // Simple lullaby melody (frequencies in Hz)
    // C4, E4, G4, A4 - peaceful major chord progression
    const melody = [
      { freq: 261.63, duration: 1.5 }, // C4
      { freq: 329.63, duration: 1.5 }, // E4
      { freq: 392.00, duration: 1.5 }, // G4
      { freq: 440.00, duration: 2.0 }, // A4
    ];

    let startTime = audioContext.currentTime;

    // Create oscillators for each note
    melody.forEach((note) => {
      const oscillator = audioContext.createOscillator();
      oscillator.type = 'sine'; // Soft, gentle tone
      oscillator.frequency.value = note.freq;
      
      // Fade in and out for smoothness
      const noteGain = audioContext.createGain();
      noteGain.gain.setValueAtTime(0, startTime);
      noteGain.gain.linearRampToValueAtTime(0.3, startTime + 0.1);
      noteGain.gain.linearRampToValueAtTime(0, startTime + note.duration - 0.1);
      
      oscillator.connect(noteGain);
      noteGain.connect(gainNode);
      
      oscillator.start(startTime);
      oscillator.stop(startTime + note.duration);
      
      startTime += note.duration;
    });
  };

  const play = () => {
    if (isPlaying) return;

    try {
      // Create audio context
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;

      // Play first melody immediately
      playMelody();

      // Calculate total melody duration
      const melodyDuration = 1.5 + 1.5 + 1.5 + 2.0; // Sum of all note durations

      // Set up loop interval to replay melody
      loopIntervalRef.current = setInterval(() => {
        playMelody();
      }, melodyDuration * 1000);

      setIsPlaying(true);
    } catch (error) {
      console.error('Failed to play lullaby:', error);
    }
  };

  const stop = () => {
    if (!isPlaying) return;

    // Clear loop interval
    if (loopIntervalRef.current) {
      clearInterval(loopIntervalRef.current);
      loopIntervalRef.current = null;
    }

    // Close audio context
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    setIsPlaying(false);
  };

  const toggle = () => {
    if (isPlaying) {
      stop();
    } else {
      play();
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stop();
    };
  }, []);

  return { isPlaying, play, stop, toggle };
}
