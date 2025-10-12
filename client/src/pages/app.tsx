import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ModeSwitcher } from "@/components/mode-switcher";
import { DimensionSlider } from "@/components/dimension-slider";
import { ClientContextForm } from "@/components/client-context-form";
import { ScriptInput } from "@/components/script-input";
import { ArchetypeSelector } from "@/components/archetype-selector";
import { StyleSelector } from "@/components/style-selector";
import { PreviewPanel } from "@/components/preview-panel";
import { DimensionAnalysis } from "@/components/dimension-analysis";
import { PaymentModal } from "@/components/payment-modal";
import { Card } from "@/components/ui/card";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { VoicePlayer } from "@/components/voice-player";

export default function App() {
  const [location] = useLocation();
  const { toast } = useToast();
  
  // Mode state
  const urlParams = new URLSearchParams(location.split('?')[1] || '');
  const initialMode = urlParams.get('mode') === 'remix' ? 'remix' : 'create';
  const [mode, setMode] = useState<"create" | "remix">(initialMode);

  // Create New mode state
  const [presentingIssue, setPresentingIssue] = useState("");
  const [desiredOutcome, setDesiredOutcome] = useState("");
  const [benefits, setBenefits] = useState("");
  const [customNotes, setCustomNotes] = useState("");

  // Remix mode state
  const [originalScript, setOriginalScript] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const [analysisData, setAnalysisData] = useState<any>(null);

  // Shared state
  const [dimensions, setDimensions] = useState<Record<string, number>>({
    Somatic: 50,
    Language: 50,
    Symbolic: 50,
    Psychological: 50,
    Temporal: 50,
    Perspective: 50,
    Relational: 50,
    Spiritual: 50,
  });

  const [selectedArchetypeId, setSelectedArchetypeId] = useState<number | null>(null);
  const [customArchetype, setCustomArchetype] = useState("");
  const [selectedStyleIds, setSelectedStyleIds] = useState<number[]>([]);

  // Preview state
  const [previewText, setPreviewText] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  // Payment modal
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  // Results dialog
  const [resultsDialogOpen, setResultsDialogOpen] = useState(false);
  const [generatedScript, setGeneratedScript] = useState<{ fullScript: string; marketingAssets: any } | null>(null);

  // Fetch dimensions from backend
  const { data: dimensionsData, isLoading: dimensionsLoading } = useQuery({
    queryKey: ['/api/dimensions'],
  });

  // Fetch archetypes from backend
  const { data: archetypesData, isLoading: archetypesLoading } = useQuery({
    queryKey: ['/api/archetypes'],
  });

  // Fetch styles from backend
  const { data: stylesData, isLoading: stylesLoading } = useQuery({
    queryKey: ['/api/styles'],
  });

  // Initialize dimension values and default selections from backend data
  useEffect(() => {
    if (dimensionsData && Array.isArray(dimensionsData) && !analyzed) {
      const initialDimensions: Record<string, number> = {};
      dimensionsData.forEach((dim: any) => {
        initialDimensions[dim.name] = dim.defaultValue || 50;
      });
      setDimensions(initialDimensions);
    }
  }, [dimensionsData, analyzed]);

  // Set default archetype and style selections when data loads
  useEffect(() => {
    if (archetypesData && Array.isArray(archetypesData) && archetypesData.length > 0 && !selectedArchetypeId) {
      setSelectedArchetypeId(archetypesData[0].id);
    }
  }, [archetypesData, selectedArchetypeId]);

  useEffect(() => {
    if (stylesData && Array.isArray(stylesData) && stylesData.length > 0 && selectedStyleIds.length === 0) {
      setSelectedStyleIds([stylesData[0].id]);
    }
  }, [stylesData, selectedStyleIds.length]);

  // Analyze script mutation
  const analyzeScriptMutation = useMutation({
    mutationFn: async (script: string) => {
      return await apiRequest('/api/analyze-script', {
        method: 'POST',
        body: JSON.stringify({ script }),
      });
    },
    onSuccess: (data) => {
      setAnalysisData(data);
      // Map detectedDimensions to frontend dimension state (capitalize first letter)
      const mappedDimensions: Record<string, number> = {};
      Object.entries(data.detectedDimensions).forEach(([key, value]) => {
        const capitalizedKey = key.charAt(0).toUpperCase() + key.slice(1);
        mappedDimensions[capitalizedKey] = value as number;
      });
      setDimensions(mappedDimensions);
      setAnalyzed(true);
      toast({
        title: "Script Analyzed",
        description: "Dimension sliders have been set to match your script's emphasis",
      });
    },
    onError: (error) => {
      toast({
        title: "Analysis Failed",
        description: (error as Error).message || "Failed to analyze script",
        variant: "destructive",
      });
    },
  });

  const handleAnalyzeScript = async () => {
    if (!originalScript.trim()) return;
    setAnalyzing(true);
    await analyzeScriptMutation.mutateAsync(originalScript);
    setAnalyzing(false);
  };

  // Preview generation mutation
  const generatePreviewMutation = useMutation({
    mutationFn: async (params: any) => {
      return await apiRequest('/api/generate-preview', {
        method: 'POST',
        body: JSON.stringify(params),
      });
    },
    onSuccess: (data) => {
      setPreviewText(data.preview);
      toast({
        title: "Preview Generated",
        description: `Estimated length: ${data.estimatedLength}`,
      });
    },
    onError: (error) => {
      toast({
        title: "Preview Failed",
        description: error.message || "Failed to generate preview",
        variant: "destructive",
      });
    },
  });

  const handleGeneratePreview = async () => {
    if (mode === "create" && (!presentingIssue || !desiredOutcome)) {
      toast({
        title: "Missing Information",
        description: "Please fill in at least the presenting issue and desired outcome",
        variant: "destructive",
      });
      return;
    }

    if (!selectedArchetypeId || selectedStyleIds.length === 0) {
      toast({
        title: "Missing Selection",
        description: "Please select an archetype and at least one style",
        variant: "destructive",
      });
      return;
    }

    setPreviewLoading(true);

    // Build dimension values for API using correct 8D Framework names
    const dimensionValues = {
      somatic: dimensions["Somatic"] || 50,
      temporal: dimensions["Temporal"] || 50,
      symbolic: dimensions["Symbolic"] || 50,
      psychological: dimensions["Psychological"] || 50,
      perspective: dimensions["Perspective"] || 50,
      spiritual: dimensions["Spiritual"] || 50,
      relational: dimensions["Relational"] || 50,
      language: dimensions["Language"] || 50,
    };

    await generatePreviewMutation.mutateAsync({
      mode,
      clientName: "Client",
      clientIssue: mode === "create" ? `${presentingIssue} - ${desiredOutcome}` : "",
      archetypeId: selectedArchetypeId,
      styleId: selectedStyleIds[0],
      dimensionValues,
      existingScript: mode === "remix" ? originalScript : undefined,
    });

    setPreviewLoading(false);
  };

  // Full script generation mutation (paid tier)
  const generateFullScriptMutation = useMutation({
    mutationFn: async () => {
      // Build dimension values for API
      const dimensionValues = {
        somatic: dimensions["Somatic"] || 50,
        temporal: dimensions["Temporal"] || 50,
        symbolic: dimensions["Symbolic"] || 50,
        psychological: dimensions["Psychological"] || 50,
        perspective: dimensions["Perspective"] || 50,
        spiritual: dimensions["Spiritual"] || 50,
        relational: dimensions["Relational"] || 50,
        language: dimensions["Language"] || 50,
      };

      const generationData = {
        mode,
        clientName: "Client",
        clientIssue: mode === "create" ? `${presentingIssue} - ${desiredOutcome}` : "",
        archetypeId: selectedArchetypeId,
        styleId: selectedStyleIds[0],
        dimensionValues,
        existingScript: mode === "remix" ? originalScript : undefined,
      };

      // Create payment intent (mock)
      const paymentIntent = await apiRequest('/api/create-payment-intent', {
        method: 'POST',
        body: JSON.stringify({
          tier: mode === 'create' ? 'create_new' : 'remix',
          generationData,
        }),
      });

      // Generate paid script
      const result = await apiRequest('/api/generate-paid-script', {
        method: 'POST',
        body: JSON.stringify({
          ...generationData,
          paymentIntentId: paymentIntent.id,
        }),
      });

      return result;
    },
    onSuccess: (data) => {
      setGeneratedScript({
        fullScript: data.fullScript,
        marketingAssets: data.marketingAssets,
      });
      setPaymentModalOpen(false);
      setResultsDialogOpen(true);
    },
    onError: (error) => {
      toast({
        title: "Generation Failed",
        description: (error as Error).message || "Failed to generate script",
        variant: "destructive",
      });
    },
  });

  const handleGenerateFull = () => {
    setPaymentModalOpen(true);
  };

  const handlePaymentProceed = async () => {
    await generateFullScriptMutation.mutateAsync();
  };

  const handleToggleStyle = (id: number) => {
    setSelectedStyleIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleRevert = () => {
    if (analysisData) {
      setDimensions(analysisData.dimensions);
      toast({
        title: "Reverted",
        description: "Sliders reset to original analysis",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b sticky top-0 bg-background z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" data-testid="link-back-to-home">
              <Button variant="ghost" size="sm" data-testid="button-back-to-home">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <ModeSwitcher mode={mode} onChange={setMode} />
            <div className="w-24" /> {/* Spacer for centering */}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8 text-center">
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
            {mode === "remix" ? "Remix Existing Script" : "Create New Script"}
          </h1>
          <p className="text-muted-foreground">
            {mode === "remix" 
              ? "Transform your script by adjusting dimensional emphasis"
              : "Mix eight dimensions to craft the perfect therapeutic script"
            }
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            {mode === "create" ? (
              <ClientContextForm
                presentingIssue={presentingIssue}
                desiredOutcome={desiredOutcome}
                benefits={benefits}
                customNotes={customNotes}
                onPresentingIssueChange={setPresentingIssue}
                onDesiredOutcomeChange={setDesiredOutcome}
                onBenefitsChange={setBenefits}
                onCustomNotesChange={setCustomNotes}
              />
            ) : (
              <>
                <ScriptInput
                  script={originalScript}
                  onScriptChange={setOriginalScript}
                  onAnalyze={handleAnalyzeScript}
                  analyzing={analyzing}
                />
                {analyzed && analysisData && (
                  <DimensionAnalysis
                    dimensions={Object.entries(analysisData.dimensions).map(([name, value]) => ({
                      name,
                      value: value as number,
                    }))}
                    detectedStyle={analysisData.detectedStyle}
                    detectedArchetype={analysisData.detectedArchetype}
                    summary={analysisData.summary}
                  />
                )}
              </>
            )}

            {(mode === "create" || analyzed) && (
              <>
                <Card className="p-6 space-y-6">
                  <div>
                    <h3 className="font-semibold mb-2">8D Dimension Mixer</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Adjust sliders to emphasize different approaches
                    </p>
                  </div>
                  
                  {dimensionsLoading ? (
                    <div className="text-center text-muted-foreground">Loading dimensions...</div>
                  ) : (
                    Array.isArray(dimensionsData) && dimensionsData.sort((a: any, b: any) => a.sortOrder - b.sortOrder).map((dim: any) => (
                      <DimensionSlider
                        key={dim.id}
                        name={dim.name}
                        description={dim.description || ""}
                        value={dimensions[dim.name] || 50}
                        enabled={dim.enabled}
                        onChange={(value) => setDimensions(prev => ({ ...prev, [dim.name]: value }))}
                      />
                    ))
                  )}
                </Card>

                {archetypesLoading ? (
                  <div className="text-center text-muted-foreground">Loading archetypes...</div>
                ) : (
                  <ArchetypeSelector
                    archetypes={Array.isArray(archetypesData) ? archetypesData : []}
                    selectedId={selectedArchetypeId}
                    customArchetype={customArchetype}
                    onSelectArchetype={setSelectedArchetypeId}
                    onCustomArchetype={setCustomArchetype}
                  />
                )}

                {stylesLoading ? (
                  <div className="text-center text-muted-foreground">Loading styles...</div>
                ) : (
                  <StyleSelector
                    styles={Array.isArray(stylesData) ? stylesData : []}
                    selectedIds={selectedStyleIds}
                    onToggleStyle={handleToggleStyle}
                  />
                )}
              </>
            )}
          </div>

          {/* Right Column - Preview */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            {(mode === "create" || analyzed) && (
              <PreviewPanel
                previewText={previewText}
                loading={previewLoading}
                mode={mode}
                dimensionsUsed={Object.entries(dimensions).map(([name, value]) => ({ name, value }))}
                onGeneratePreview={handleGeneratePreview}
                onGenerateFull={handleGenerateFull}
                onRemix={handleGeneratePreview}
                onRevert={handleRevert}
              />
            )}
          </div>
        </div>
      </div>

      <PaymentModal
        open={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        onProceed={handlePaymentProceed}
        loading={generateFullScriptMutation.isPending}
      />

      <Dialog open={resultsDialogOpen} onOpenChange={setResultsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Your Script is Ready! 🎉</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[70vh] pr-4">
            {generatedScript && (
              <div className="space-y-6">
                {/* Full Script */}
                <div className="space-y-2">
                  <h3 className="font-semibold">Full Hypnosis Script</h3>
                  <div className="prose prose-sm max-w-none">
                    <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded-lg">
                      {generatedScript.fullScript}
                    </pre>
                  </div>
                </div>

                {/* Voice Player */}
                <VoicePlayer text={generatedScript.fullScript} title="Listen to Your Script" />

                {/* Marketing Assets */}
                {generatedScript.marketingAssets && (
                  <div className="space-y-2">
                    <h3 className="font-semibold">Marketing Assets</h3>
                    <pre className="text-xs bg-muted p-3 rounded-lg overflow-x-auto">
                      {JSON.stringify(generatedScript.marketingAssets, null, 2)}
                    </pre>
                  </div>
                )}

                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={() => setResultsDialogOpen(false)}
                    variant="outline"
                    className="flex-1"
                    data-testid="button-close-results"
                  >
                    Close
                  </Button>
                  <Link href="/admin" data-testid="link-view-all-scripts">
                    <Button className="flex-1" data-testid="button-view-all-scripts">
                      View All Scripts
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
