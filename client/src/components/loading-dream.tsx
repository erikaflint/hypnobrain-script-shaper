import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Moon, Sparkles, Star, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";

// Peaceful thumbnail placeholders - curated serene landscapes for calming DREAM experience
const PEACEFUL_IMAGES = [
  { url: "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=1920&h=1080&fit=crop", alt: "Misty purple mountains" },
  { url: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1920&h=1080&fit=crop", alt: "Foggy forest path" },
  { url: "https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?w=1920&h=1080&fit=crop", alt: "Serene sunset lake" },
  { url: "https://images.unsplash.com/photo-1444080748397-f442aa95c3e5?w=1920&h=1080&fit=crop", alt: "Soft starfield" },
  { url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop", alt: "Mountain landscape" },
  { url: "https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=1920&h=1080&fit=crop", alt: "Calm ocean beach" },
];

interface LoadingDreamProps {
  message?: string;
  onToggleSound?: () => void;
  isSoundPlaying?: boolean;
  userThumbnails?: string[]; // User's previously generated DREAM thumbnails
}

export function LoadingDream({ 
  message = "Your DREAM is being created...", 
  onToggleSound,
  isSoundPlaying = false,
  userThumbnails = []
}: LoadingDreamProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [dots, setDots] = useState("");

  // Use user's DREAM thumbnails if available, otherwise fallback to Unsplash
  const imagesToShow = userThumbnails.length > 0 
    ? userThumbnails 
    : PEACEFUL_IMAGES.map(img => img.url);

  // Rotate through images every 3 seconds (slower for immersive experience)
  useEffect(() => {
    const imageInterval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % imagesToShow.length);
    }, 3000);

    return () => clearInterval(imageInterval);
  }, [imagesToShow.length]);

  // Animate dots (., .., ...)
  useEffect(() => {
    const dotInterval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);

    return () => clearInterval(dotInterval);
  }, []);

  return (
    <div className="fixed inset-0 z-50">
      {/* Full-screen background carousel */}
      <div className="absolute inset-0">
        {imagesToShow.map((imageUrl, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              idx === currentImageIndex ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src={imageUrl}
              alt={`DREAM journey ${idx + 1}`}
              className="w-full h-full object-cover"
              data-testid={`img-loading-bg-${idx}`}
            />
            {/* Dark overlay for text readability */}
            <div className="absolute inset-0 bg-black/40" />
          </div>
        ))}
      </div>

      {/* Centered content overlay */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <Card className="p-8 max-w-lg w-full bg-background/95 backdrop-blur-sm border-primary/20">
          <div className="space-y-8">
            {/* Animated header */}
            <div className="text-center space-y-4">
              <div className="relative inline-block">
                <Moon className="w-16 h-16 text-primary animate-pulse" />
                <Sparkles className="w-6 h-6 text-primary absolute -top-1 -right-1 animate-spin" style={{ animationDuration: '3s' }} />
                <Star className="w-4 h-4 text-primary absolute -bottom-1 -left-1 animate-pulse" style={{ animationDelay: '0.5s' }} />
              </div>
              
              <h2 className="text-2xl font-semibold">
                {message}{dots}
              </h2>
              
              <p className="text-muted-foreground">
                {userThumbnails.length > 0 
                  ? `Surrounded by ${imagesToShow.length} peaceful journey${imagesToShow.length === 1 ? '' : 's'} from our community`
                  : 'Weaving together gentle landscapes and soothing imagery just for you'
                }
              </p>
            </div>

            {/* Lullaby toggle button */}
            {onToggleSound && (
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onToggleSound}
                  className="gap-2"
                  data-testid="button-toggle-lullaby"
                >
                  {isSoundPlaying ? (
                    <>
                      <Volume2 className="w-4 h-4" />
                      Playing gentle music
                    </>
                  ) : (
                    <>
                      <VolumeX className="w-4 h-4" />
                      Play gentle music
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Progress dots */}
            <div className="flex justify-center gap-2">
              {[...Array(Math.min(imagesToShow.length, 6))].map((_, idx) => (
                <div
                  key={idx}
                  className={`w-2 h-2 rounded-full transition-all ${
                    idx === (currentImageIndex % 6) ? 'bg-primary scale-125' : 'bg-muted-foreground/30'
                  }`}
                />
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
