import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { VoicePlayer } from "@/components/voice-player";
import { ArrowLeft } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import type { Generation } from "@shared/schema";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

export default function DreamView() {
  const [, params] = useRoute("/dream/:id/view");
  const dreamId = params?.id;
  const autoplayPlugin = useRef(
    Autoplay({ delay: 8000, stopOnInteraction: false })
  );

  const { data: dream, isLoading } = useQuery<Generation>({
    queryKey: [`/api/generations/${dreamId}`],
    enabled: !!dreamId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your dream journey...</p>
        </div>
      </div>
    );
  }

  if (!dream) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl mb-4">Dream not found</p>
          <Link href="/dashboard">
            <Button>Return to Dreamboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Check if we have multiple images for cinematic experience
  const hasMultipleImages = dream.imageUrls && dream.imageUrls.length > 1;
  const displayImages = hasMultipleImages ? dream.imageUrls : (dream.imageUrl ? [dream.imageUrl] : []);

  return (
    <div className="relative min-h-screen">
      {/* Full-screen background with cinematic carousel */}
      {displayImages.length > 0 && (
        <div className="fixed inset-0">
          {hasMultipleImages ? (
            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              plugins={[autoplayPlugin.current]}
              className="w-full h-full"
            >
              <CarouselContent className="h-screen">
                {displayImages.map((imageUrl, index) => (
                  <CarouselItem key={index} className="h-screen">
                    <div 
                      className="w-full h-full bg-cover bg-center transition-all duration-1000"
                      style={{ backgroundImage: `url(${imageUrl})` }}
                    >
                      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2">
                <CarouselPrevious className="relative inset-0 transform-none bg-background/80 backdrop-blur-sm" />
                <CarouselNext className="relative inset-0 transform-none bg-background/80 backdrop-blur-sm" />
              </div>
            </Carousel>
          ) : (
            <div 
              className="w-full h-full bg-cover bg-center"
              style={{ backgroundImage: `url(${displayImages[0]})` }}
            >
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            </div>
          )}
        </div>
      )}

      {/* Header */}
      <div className="relative z-10">
        <AppHeader showDreamboard={true} />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Back Button */}
          <Link href="/dashboard">
            <Button variant="outline" className="bg-background/80 backdrop-blur-sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dreamboard
            </Button>
          </Link>

          {/* Title Card */}
          <Card className="p-8 bg-background/80 backdrop-blur-md">
            <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
              {dream.title || dream.presentingIssue || "Dream Journey"}
            </h1>
            <p className="text-lg text-muted-foreground">
              {dream.desiredOutcome || "Experience a peaceful, restful journey into natural sleep"}
            </p>
          </Card>

          {/* Script Card with Voice Player */}
          {dream.fullScript && (
            <Card className="p-6 bg-background/80 backdrop-blur-md space-y-4">
              <div>
                <h2 className="text-xl font-semibold mb-4">Your Dream Journey</h2>
                <div className="prose prose-sm max-w-none dark:prose-invert whitespace-pre-wrap bg-muted/30 p-4 rounded-md max-h-96 overflow-y-auto">
                  {dream.fullScript}
                </div>
              </div>

              {/* Voice Player */}
              <div className="border-t pt-4">
                <VoicePlayer 
                  text={dream.fullScript} 
                  title="Listen to Your Dream Journey" 
                />
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
