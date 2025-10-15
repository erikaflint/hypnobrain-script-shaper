import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { VoicePlayer } from "@/components/voice-player";
import { LoadingDream } from "@/components/loading-dream";
import { Moon, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { validateContent } from "@/lib/contentValidator";
import { AppHeader } from "@/components/app-header";
import { useLullaby } from "@/hooks/useLullaby";

const JOURNEY_EXAMPLES = [
  "Take me on a peaceful walk through an enchanted forest where I meet wise talking animals",
  "Guide me to a tranquil beach at sunset where the waves whisper ancient wisdom",
  "Lead me through a mystical garden where flowers share their secrets and butterflies guide my way",
  "Float me through a starlit sky where I can dance among the constellations",
  "Journey with me to a cozy mountain cabin where I find deep rest by a crackling fireplace",
];

interface Archetype {
  id: number;
  name: string;
  description: string;
  promptModifier: string | null;
}

export default function Dream() {
  const { toast } = useToast();
  const { user, isLoading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const [journeyIdea, setJourneyIdea] = useState("");
  const [selectedArchetypeId, setSelectedArchetypeId] = useState<number | null>(null);
  const [selectedArcId, setSelectedArcId] = useState<string>("");
  const [expandedStory, setExpandedStory] = useState<string | null>(null); // NEW: Story shaper result
  const [generatedScript, setGeneratedScript] = useState<string | null>(null);
  const [generationId, setGenerationId] = useState<number | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [revealingFinalImage, setRevealingFinalImage] = useState(false);
  
  // Lullaby music hook
  const lullaby = useLullaby();

  // Fetch blended archetypes for DREAM
  const { data: archetypes = [] } = useQuery<Archetype[]>({
    queryKey: ['/api/archetypes/blended'],
  });

  // Fetch DREAM narrative arcs
  const { data: narrativeArcs = [] } = useQuery<any[]>({
    queryKey: ['/api/narrative-arcs?type=dream'],
  });

  // Fetch ALL DREAM thumbnails for crowdsourced full-screen loading carousel
  const { data: dreamThumbnails = [] } = useQuery<string[]>({
    queryKey: ["/api/user/dream-thumbnails"],
  });

  // NEW: Shape story mutation (Step 1)
  const shapeStory = useMutation({
    mutationFn: async (data: { journeyIdea: string; archetypeId?: number; arcId?: string }) => {
      return await apiRequest('/api/shape-dream-story', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: (data) => {
      setExpandedStory(data.expandedStory);
      lullaby.stop(); // Stop lullaby when story is ready
      toast({
        title: "Story Shaped!",
        description: `Expanded to ${data.storyLength} words. Review and edit if needed.`,
      });
    },
    onError: (error: any) => {
      lullaby.stop(); // Stop lullaby on error
      
      // Handle authentication errors (consistent with Step 2)
      if (error.message?.includes('Unauthorized') || error.message?.includes('401')) {
        toast({
          title: "Login Required",
          description: "Please log in to shape your DREAM story",
          variant: "destructive",
        });
        setTimeout(() => navigate('/'), 2000);
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to shape story",
          variant: "destructive",
        });
      }
    },
  });

  // Generate DREAM script mutation (Step 2)
  const generateDreamScript = useMutation({
    mutationFn: async (data: { journeyIdea: string; expandedStory?: string; archetypeId?: number; arcId?: string }) => {
      return await apiRequest('/api/generate-dream-script', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: (data) => {
      setGeneratedScript(data.fullScript);
      setGenerationId(data.generationId);
      setThumbnailUrl(data.thumbnailUrl || null);
      
      // Start final image reveal if thumbnail exists
      if (data.thumbnailUrl) {
        setRevealingFinalImage(true);
        // Keep revealing for 3 seconds before showing the script
        setTimeout(() => {
          setRevealingFinalImage(false);
          lullaby.stop(); // Stop lullaby after reveal
          toast({
            title: "DREAM Script Created!",
            description: `"${data.title}" has been saved to your library`,
          });
        }, 3000);
      } else {
        lullaby.stop(); // Stop immediately if no thumbnail
        toast({
          title: "DREAM Script Created!",
          description: `"${data.title}" has been saved to your library`,
        });
      }
    },
    onError: (error: any) => {
      lullaby.stop(); // Stop lullaby on error
      
      // Handle authentication errors
      if (error.message?.includes('Unauthorized') || error.message?.includes('401')) {
        toast({
          title: "Login Required",
          description: "Please log in to save your DREAM journeys",
          variant: "destructive",
        });
        setTimeout(() => navigate('/'), 2000);
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to generate DREAM script",
          variant: "destructive",
        });
      }
    },
  });

  // Step 1: Shape the story from journey idea
  const handleShapeStory = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!journeyIdea.trim()) {
      toast({
        title: "Journey Idea Required",
        description: "Please describe your desired hypnotic journey",
        variant: "destructive",
      });
      return;
    }

    // Client-side content validation using centralized validator
    const validation = validateContent(journeyIdea);
    if (!validation.isValid) {
      toast({
        title: "Inappropriate Content Detected",
        description: validation.reason || "DREAM scripts are for peaceful sleep journeys only.",
        variant: "destructive",
      });
      return;
    }

    await shapeStory.mutateAsync({ 
      journeyIdea,
      archetypeId: selectedArchetypeId || undefined,
      arcId: selectedArcId || undefined
    });
  };

  // Step 2: Generate final script from shaped story
  const handleGenerateScript = async () => {
    if (!expandedStory) return;

    await generateDreamScript.mutateAsync({ 
      journeyIdea, // Original idea for title/metadata
      expandedStory, // Shaped story for script content
      archetypeId: selectedArchetypeId || undefined,
      arcId: selectedArcId || undefined
    });
  };

  const handleExampleClick = (example: string) => {
    setJourneyIdea(example);
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader 
        showBack={true}
        title="DREAM Hypnosis"
        showDreamLibrary={true}
        icon={<Moon className="w-5 h-5 text-primary" />}
        showDreamboard={true}
      />

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        {!generatedScript ? (
          <div className="space-y-8">
            {/* Title Section */}
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4">
                <Moon className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">30-Minute Sleep Journey</span>
              </div>
              <h1 className="text-4xl font-bold">DREAM Hypnosis</h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Bedtime stories for adults. Peaceful, non-prescriptive journeys designed for deep rest and beautiful sleep.
              </p>
            </div>

            {/* Loading state for Story Shaper */}
            {shapeStory.isPending ? (
              <LoadingDream 
                message="Your story is being shaped"
                onToggleSound={lullaby.toggle}
                isSoundPlaying={lullaby.isPlaying}
                userThumbnails={dreamThumbnails}
              />
            ) : !expandedStory ? (
              // Step 1: Journey Idea Form
              <Card className="p-8">
                <form onSubmit={handleShapeStory} className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="journey-idea" className="text-lg">
                    Describe Your Journey
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Where would you like to go? What would you like to experience? Let your imagination guide you.
                  </p>
                  <Textarea
                    id="journey-idea"
                    data-testid="textarea-journey-idea"
                    value={journeyIdea}
                    onChange={(e) => setJourneyIdea(e.target.value)}
                    placeholder="Example: Take me on a walk through a moonlit garden where fireflies dance and gentle music plays..."
                    className="min-h-[120px] text-base"
                    disabled={generateDreamScript.isPending}
                  />
                </div>

                {/* Archetype Selection */}
                <div className="space-y-3">
                  <Label htmlFor="archetype" className="text-lg">
                    Choose Your Guide Voice
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Select the narrative voice that will guide your journey to sleep
                  </p>
                  <Select 
                    value={selectedArchetypeId?.toString() || ""} 
                    onValueChange={(value) => setSelectedArchetypeId(Number(value))}
                    disabled={generateDreamScript.isPending}
                  >
                    <SelectTrigger id="archetype" data-testid="select-archetype">
                      <SelectValue placeholder="Select a guide voice..." />
                    </SelectTrigger>
                    <SelectContent>
                      {archetypes.map((archetype) => (
                        <SelectItem key={archetype.id} value={archetype.id.toString()}>
                          <div className="flex flex-col">
                            <span className="font-medium">{archetype.name}</span>
                            <span className="text-xs text-muted-foreground">{archetype.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Narrative Arc Selection */}
                <div className="space-y-3">
                  <Label htmlFor="arc-selection" className="text-lg">
                    Narrative Arc (Optional)
                    <span className="ml-2 text-xs text-muted-foreground">
                      Manual selection - overrides auto-selection
                    </span>
                  </Label>
                  <Select 
                    value={selectedArcId} 
                    onValueChange={setSelectedArcId}
                    disabled={shapeStory.isPending}
                  >
                    <SelectTrigger id="arc-selection" data-testid="select-dream-arc">
                      <SelectValue placeholder="Auto-select based on journey (recommended)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="" data-testid="arc-option-auto">
                        Auto-select based on journey (recommended)
                      </SelectItem>
                      {narrativeArcs.map((arc: any) => (
                        <SelectItem 
                          key={arc.id} 
                          value={arc.id}
                          data-testid={`arc-option-${arc.id}`}
                        >
                          {arc.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedArcId && (
                    <p className="text-xs text-muted-foreground">
                      {narrativeArcs.find((arc: any) => arc.id === selectedArcId)?.description}
                    </p>
                  )}
                </div>

                {/* Example Ideas */}
                <div className="space-y-3">
                  <Label className="text-sm text-muted-foreground">
                    <Sparkles className="w-3 h-3 inline mr-1" />
                    Need inspiration? Try one of these:
                  </Label>
                  <div className="grid gap-2">
                    {JOURNEY_EXAMPLES.map((example, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleExampleClick(example)}
                        className="text-left p-3 rounded-lg border bg-card hover-elevate active-elevate-2 transition-colors text-sm"
                        data-testid={`button-example-${idx}`}
                        disabled={shapeStory.isPending}
                      >
                        {example}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={shapeStory.isPending}
                  data-testid="button-shape-story"
                >
                  {shapeStory.isPending ? (
                    <>
                      <Sparkles className="w-4 h-4 mr-2 animate-pulse" />
                      Shaping Your Story...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Shape Story
                    </>
                  )}
                </Button>
              </form>
            </Card>
            ) : generateDreamScript.isPending || revealingFinalImage ? (
              // Loading state for DREAM Script Generation + Final Image Reveal
              <LoadingDream 
                message={revealingFinalImage ? "✨ Behold your DREAM ✨" : "Your DREAM is coming to life"}
                onToggleSound={lullaby.toggle}
                isSoundPlaying={lullaby.isPlaying}
                userThumbnails={dreamThumbnails}
                finalImage={revealingFinalImage ? thumbnailUrl || undefined : undefined}
              />
            ) : (
              // Step 2: Story Editor
              <Card className="p-8">
                <div className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="expanded-story" className="text-lg">
                        Your Shaped Story
                      </Label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setExpandedStory(null)}
                        data-testid="button-back-to-journey"
                      >
                        ← Back to Journey Idea
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Review and edit your story before generating the final hypnosis script
                    </p>
                    <Textarea
                      id="expanded-story"
                      data-testid="textarea-expanded-story"
                      value={expandedStory || ""}
                      onChange={(e) => setExpandedStory(e.target.value)}
                      className="min-h-[400px] text-base font-mono"
                      disabled={generateDreamScript.isPending}
                    />
                  </div>

                  <Button
                    onClick={handleGenerateScript}
                    size="lg"
                    className="w-full"
                    disabled={generateDreamScript.isPending}
                    data-testid="button-generate-script"
                  >
                    {generateDreamScript.isPending ? (
                      <>
                        <Moon className="w-4 h-4 mr-2 animate-pulse" />
                        Generating DREAM Script...
                      </>
                    ) : (
                      <>
                        <Moon className="w-4 h-4 mr-2" />
                        Generate DREAM Script (30 min)
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            )}

            {/* Info Card */}
            <Card className="p-6 bg-primary/5 border-primary/20">
              <div className="space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <Moon className="w-5 h-5 text-primary" />
                  What Makes DREAM Hypnosis Different?
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span><strong>Non-prescriptive:</strong> No therapeutic goals, just peaceful journeys</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span><strong>Longer duration:</strong> 30-minute immersive experiences</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span><strong>Sleep-optimized:</strong> Designed to drift you into natural sleep</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span><strong>Richly metaphorical:</strong> Somatic and symbolic journeys</span>
                  </li>
                </ul>
              </div>
            </Card>
          </div>
        ) : (
          // Generated Script Display with Full Background
          <div className="fixed inset-0 z-40">
            {/* Full-screen background image */}
            {thumbnailUrl && (
              <div className="absolute inset-0">
                <img 
                  src={thumbnailUrl} 
                  alt="DREAM Journey Background"
                  className="w-full h-full object-cover"
                />
                {/* Dark overlay for text readability */}
                <div className="absolute inset-0 bg-black/40" />
              </div>
            )}

            {/* Content overlay - scrollable */}
            <div className="relative z-10 h-full overflow-y-auto">
              <div className="container max-w-4xl mx-auto p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white">Your DREAM Journey</h2>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setGeneratedScript(null);
                      setExpandedStory(null); // Reset story shaper
                      setJourneyIdea("");
                      setThumbnailUrl(null);
                    }}
                    data-testid="button-create-another"
                    className="bg-background/80 backdrop-blur-sm hover:bg-background/90"
                  >
                    Create Another
                  </Button>
                </div>

                {/* Thumbnail Image Hero */}
                {thumbnailUrl && (
                  <Card className="overflow-hidden">
                    <img 
                      src={thumbnailUrl} 
                      alt="DREAM Journey Visualization"
                      className="w-full h-auto"
                      data-testid="img-dream-thumbnail"
                    />
                  </Card>
                )}

                {/* Voice Player */}
                <VoicePlayer text={generatedScript} title="Listen to Your Journey" />

                {/* Script Display */}
                <Card className="p-8 bg-background/95 backdrop-blur-sm">
                  <div className="prose prose-lg max-w-none dark:prose-invert">
                    <pre className="whitespace-pre-wrap font-sans text-base leading-relaxed">
                      {generatedScript}
                    </pre>
                  </div>
                </Card>

                {/* Download Options */}
                <div className="flex gap-4 pb-6">
                  <Button
                    variant="outline"
                    className="flex-1 bg-background/80 backdrop-blur-sm hover:bg-background/90"
                    onClick={() => {
                      const blob = new Blob([generatedScript], { type: 'text/plain' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'dream-hypnosis-journey.txt';
                      a.click();
                    }}
                    data-testid="button-download-txt"
                  >
                    Download as TXT
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 bg-background/80 backdrop-blur-sm hover:bg-background/90"
                    onClick={() => {
                      navigator.clipboard.writeText(generatedScript);
                      toast({
                        title: "Copied!",
                        description: "Script copied to clipboard",
                      });
                    }}
                    data-testid="button-copy"
                  >
                    Copy to Clipboard
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
