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

  // Mock data (will be replaced with API calls in Phase 2)
  const mockDimensions = [
    { id: 1, name: "Somatic", description: "Body awareness, physical sensations, embodied experience", enabled: true, sortOrder: 1 },
    { id: 2, name: "Language", description: "Hypnotic language patterns, linguistic precision, embedded suggestions", enabled: true, sortOrder: 2 },
    { id: 3, name: "Symbolic", description: "Metaphors, imagery, archetypal themes and stories", enabled: true, sortOrder: 3 },
    { id: 4, name: "Psychological", description: "Inner architecture, cognitive patterns, beliefs, parts work", enabled: true, sortOrder: 4 },
    { id: 5, name: "Temporal", description: "Time-based work, regression, progression, time perception", enabled: false, sortOrder: 5 },
    { id: 6, name: "Perspective", description: "Point of view shifts, observer mode, future self perspective", enabled: false, sortOrder: 6 },
    { id: 7, name: "Relational", description: "Connection, dialogue, self-relationship, interpersonal dynamics", enabled: false, sortOrder: 7 },
    { id: 8, name: "Spiritual", description: "Transpersonal connection, meaning, purpose, higher self", enabled: false, sortOrder: 8 },
  ];

  const mockArchetypes = [
    { id: 1, name: "Hero's Journey", description: "Classic transformation narrative", enabled: true, sortOrder: 1 },
    { id: 2, name: "Garden/Growth", description: "Nurturing and organic development", enabled: true, sortOrder: 2 },
    { id: 3, name: "Mountain Climbing", description: "Achievement and overcoming challenges", enabled: true, sortOrder: 3 },
    { id: 4, name: "River Flow", description: "Natural movement and change", enabled: true, sortOrder: 4 },
    { id: 5, name: "Inner Child", description: "Connecting with younger self", enabled: true, sortOrder: 5 },
    { id: 6, name: "Custom", description: "Define your own archetype", enabled: true, sortOrder: 6 },
  ];

  const mockStyles = [
    { id: 1, name: "Direct/Authoritarian", description: "Clear commands and direct suggestions", enabled: true, sortOrder: 1 },
    { id: 2, name: "Permissive/Ericksonian", description: "Indirect suggestions and metaphors", enabled: true, sortOrder: 2 },
    { id: 3, name: "Conversational/Informal", description: "Natural, friendly approach", enabled: true, sortOrder: 3 },
  ];

  const handleAnalyzeScript = async () => {
    if (!originalScript.trim()) return;

    setAnalyzing(true);
    
    // Simulate API call
    setTimeout(() => {
      // Mock analysis results
      const mockAnalysis = {
        dimensions: {
          Language: 80,
          Psychological: 60,
          Somatic: 30,
          Symbolic: 20,
          Temporal: 10,
          Perspective: 15,
          Relational: 25,
          Spiritual: 5,
        },
        detectedStyle: "Direct/Authoritarian",
        detectedArchetype: "Problem-solving framework",
        summary: "This script heavily emphasizes direct linguistic patterns with moderate psychological framing."
      };

      setAnalysisData(mockAnalysis);
      setDimensions(mockAnalysis.dimensions);
      setAnalyzed(true);
      setAnalyzing(false);

      toast({
        title: "Script Analyzed",
        description: "Dimension sliders have been set to match your script's emphasis",
      });
    }, 2000);
  };

  const handleGeneratePreview = () => {
    if (mode === "create" && (!presentingIssue || !desiredOutcome)) {
      toast({
        title: "Missing Information",
        description: "Please fill in at least the presenting issue and desired outcome",
        variant: "destructive",
      });
      return;
    }

    setPreviewLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const mockPreview = mode === "remix" 
        ? "As you close your eyes and settle into this moment, notice how your breathing naturally deepens... [This remixed version emphasizes somatic awareness through gentle body scanning, weaving symbolic imagery of a garden blooming with each breath. The metaphor of roots growing deeper connects to psychological grounding, while maintaining the therapeutic intent of your original script.]"
        : "Close your eyes and take a deep breath... Feel the weight of your body settling into the chair... Notice the gentle rhythm of your breathing... [Preview continues with emphasized dimensions based on your slider settings. This is a 150-word preview showing the style and approach of your full script.]";
      
      setPreviewText(mockPreview);
      setPreviewLoading(false);
    }, 2000);
  };

  const handleGenerateFull = () => {
    setPaymentModalOpen(true);
  };

  const handlePaymentProceed = () => {
    toast({
      title: "Generation Queued",
      description: "Your script generation has been queued with pending_payment status",
    });
    setPaymentModalOpen(false);
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
                  
                  {mockDimensions.sort((a, b) => a.sortOrder - b.sortOrder).map((dim) => (
                    <DimensionSlider
                      key={dim.id}
                      name={dim.name}
                      description={dim.description}
                      value={dimensions[dim.name] || 50}
                      enabled={dim.enabled}
                      onChange={(value) => setDimensions(prev => ({ ...prev, [dim.name]: value }))}
                    />
                  ))}
                </Card>

                <ArchetypeSelector
                  archetypes={mockArchetypes}
                  selectedId={selectedArchetypeId}
                  customArchetype={customArchetype}
                  onSelectArchetype={setSelectedArchetypeId}
                  onCustomArchetype={setCustomArchetype}
                />

                <StyleSelector
                  styles={mockStyles}
                  selectedIds={selectedStyleIds}
                  onToggleStyle={handleToggleStyle}
                />
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
      />
    </div>
  );
}
