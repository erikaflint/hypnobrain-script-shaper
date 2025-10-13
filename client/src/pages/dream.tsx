import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { VoicePlayer } from "@/components/voice-player";
import { ArrowLeft, Moon, Sparkles, Volume2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";

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
  const [generatedScript, setGeneratedScript] = useState<string | null>(null);
  const [generationId, setGenerationId] = useState<number | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);

  // Fetch blended archetypes for DREAM
  const { data: archetypes = [] } = useQuery<Archetype[]>({
    queryKey: ['/api/archetypes/blended'],
  });

  // Generate DREAM script mutation
  const generateDreamScript = useMutation({
    mutationFn: async (data: { journeyIdea: string; archetypeId?: number }) => {
      return await apiRequest('/api/generate-dream-script', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: (data) => {
      setGeneratedScript(data.fullScript);
      setGenerationId(data.generationId);
      setThumbnailUrl(data.thumbnailUrl || null);
      toast({
        title: "DREAM Script Created!",
        description: `"${data.title}" has been saved to your library`,
      });
    },
    onError: (error: any) => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!journeyIdea.trim()) {
      toast({
        title: "Journey Idea Required",
        description: "Please describe your desired hypnotic journey",
        variant: "destructive",
      });
      return;
    }

    // Client-side content validation - block obviously inappropriate content
    const inappropriateKeywords = [
      'sex', 'sexy', 'nude', 'naked', 'porn', 'explicit', 'adult',
      'violent', 'kill', 'murder', 'blood', 'gore', 'death',
      'hate', 'racist', 'discrimination',
      'drug', 'cocaine', 'heroin', 'meth',
    ];

    const lowerInput = journeyIdea.toLowerCase();
    const foundBadWord = inappropriateKeywords.find(word => lowerInput.includes(word));
    
    if (foundBadWord) {
      toast({
        title: "Inappropriate Content Detected",
        description: "DREAM scripts are for peaceful sleep journeys only. Please revise your journey idea.",
        variant: "destructive",
      });
      return;
    }

    await generateDreamScript.mutateAsync({ 
      journeyIdea,
      archetypeId: selectedArchetypeId || undefined 
    });
  };

  const handleExampleClick = (example: string) => {
    setJourneyIdea(example);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" data-testid="link-back-home">
            <Button variant="ghost" size="sm" data-testid="button-back">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Moon className="w-5 h-5 text-primary" />
            <span className="font-medium">DREAM Hypnosis</span>
          </div>
          <Link href="/dashboard" data-testid="link-dashboard">
            <Button variant="outline" size="sm" data-testid="button-dashboard">
              My Scripts
            </Button>
          </Link>
        </div>
      </header>

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

            {/* Journey Idea Form */}
            <Card className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
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
                        disabled={generateDreamScript.isPending}
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
                  disabled={generateDreamScript.isPending}
                  data-testid="button-generate-dream"
                >
                  {generateDreamScript.isPending ? (
                    <>
                      <Moon className="w-4 h-4 mr-2 animate-pulse" />
                      Creating Your Journey...
                    </>
                  ) : (
                    <>
                      <Moon className="w-4 h-4 mr-2" />
                      Create DREAM Journey (30 min)
                    </>
                  )}
                </Button>
              </form>
            </Card>

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
          /* Generated Script Display */
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Your DREAM Journey</h2>
              <Button
                variant="outline"
                onClick={() => {
                  setGeneratedScript(null);
                  setJourneyIdea("");
                  setThumbnailUrl(null);
                }}
                data-testid="button-create-another"
              >
                Create Another
              </Button>
            </div>

            {/* Thumbnail Image */}
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
            <Card className="p-8">
              <div className="prose prose-lg max-w-none dark:prose-invert">
                <pre className="whitespace-pre-wrap font-sans text-base leading-relaxed">
                  {generatedScript}
                </pre>
              </div>
            </Card>

            {/* Download Options */}
            <div className="flex gap-4">
              <Button
                variant="outline"
                className="flex-1"
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
                className="flex-1"
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
        )}
      </main>
    </div>
  );
}
