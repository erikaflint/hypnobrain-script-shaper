import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, ArrowRight, Sparkles, Check, Sliders, User, MessageSquare, Eye, Wand2 } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type Step = "intake" | "recommendations" | "mixer" | "results";

interface RecommendedTemplate {
  template: {
    id: number;
    templateId: string;
    name: string;
    description: string;
    category: string;
    jsonData: any;
  };
  matchScore: number;
  matchReasons: string[];
}

export default function AppV2() {
  const { toast } = useToast();
  const [step, setStep] = useState<Step>("intake");

  // Intake form state
  const [presentingIssue, setPresentingIssue] = useState("");
  const [desiredOutcome, setDesiredOutcome] = useState("");
  const [notes, setNotes] = useState("");

  // Recommendations state
  const [recommendations, setRecommendations] = useState<RecommendedTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<RecommendedTemplate | null>(null);
  
  // Mixer state - initialize from selectedTemplate or defaults
  const [dimensionValues, setDimensionValues] = useState<Record<string, number>>({});
  const [selectedArchetypeId, setSelectedArchetypeId] = useState<number | null>(null);
  const [selectedStyleId, setSelectedStyleId] = useState<number | null>(null);
  
  // Results state
  const [previewResult, setPreviewResult] = useState<{ preview: string; estimatedLength: string } | null>(null);
  const [fullScriptResult, setFullScriptResult] = useState<{ fullScript: string } | null>(null);
  
  // Load dimension values from selected template when it changes
  useEffect(() => {
    if (selectedTemplate?.template.jsonData) {
      const templateData = selectedTemplate.template.jsonData as any;
      if (templateData.dimensions) {
        // Extract dimension levels from template - normalize keys to lowercase
        const values: Record<string, number> = {};
        Object.keys(templateData.dimensions).forEach(dimName => {
          const dimData = templateData.dimensions[dimName];
          values[dimName.toLowerCase()] = dimData.level || 50;
        });
        setDimensionValues(values);
      }
    } else {
      // Default to 50% for all dimensions when starting from scratch
      setDimensionValues({
        somatic: 50,
        temporal: 50,
        symbolic: 50,
        psychological: 50,
        perspective: 50,
        spiritual: 50,
        relational: 50,
        language: 50
      });
    }
  }, [selectedTemplate]);

  // Fetch dimensions for sliders
  const { data: dimensions = [] } = useQuery<any[]>({
    queryKey: ['/api/dimensions'],
    enabled: step === "mixer"
  });
  
  // Fetch archetypes for dropdown
  const { data: archetypes = [] } = useQuery<any[]>({
    queryKey: ['/api/archetypes'],
    enabled: step === "mixer"
  });
  
  // Fetch styles for dropdown
  const { data: styles = [] } = useQuery<any[]>({
    queryKey: ['/api/styles'],
    enabled: step === "mixer"
  });

  // Get template recommendations mutation
  const getRecommendationsMutation = useMutation({
    mutationFn: async (data: { presentingIssue: string; desiredOutcome: string; clientNotes?: string }) => {
      return await apiRequest('/api/templates/recommend', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: (data) => {
      // API returns recommendations array directly
      const recommendationsArray = Array.isArray(data) ? data : [];
      setRecommendations(recommendationsArray);
      setStep("recommendations");
      toast({
        title: "Recommendations Ready",
        description: `Found ${recommendationsArray.length} matching template${recommendationsArray.length === 1 ? '' : 's'}`,
      });
    },
    onError: (error) => {
      toast({
        title: "Recommendation Failed",
        description: error.message || "Failed to get recommendations",
        variant: "destructive",
      });
    },
  });

  const handleGetRecommendations = () => {
    if (!presentingIssue.trim() || !desiredOutcome.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide both presenting issue and desired outcome",
        variant: "destructive",
      });
      return;
    }

    getRecommendationsMutation.mutate({
      presentingIssue,
      desiredOutcome,
      clientNotes: notes.trim() || undefined,
    });
  };

  // Generate preview mutation
  const generatePreviewMutation = useMutation({
    mutationFn: async () => {
      if (!selectedTemplate) throw new Error("No template selected");
      
      return await apiRequest(`/api/templates/${selectedTemplate.template.templateId}/preview`, {
        method: 'POST',
        body: JSON.stringify({
          presentingIssue,
          desiredOutcome,
          clientNotes: notes.trim() || undefined,
        }),
      });
    },
    onSuccess: (data) => {
      setPreviewResult(data);
      setStep("results");
      toast({
        title: "Preview Ready",
        description: "Your script preview has been generated",
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

  // Generate full script mutation
  const generateFullScriptMutation = useMutation({
    mutationFn: async () => {
      if (!selectedTemplate) throw new Error("No template selected");
      
      return await apiRequest(`/api/templates/${selectedTemplate.template.templateId}/generate`, {
        method: 'POST',
        body: JSON.stringify({
          presentingIssue,
          desiredOutcome,
          clientNotes: notes.trim() || undefined,
        }),
      });
    },
    onSuccess: (data) => {
      setFullScriptResult(data);
      setStep("results");
      toast({
        title: "Script Generated",
        description: "Your full hypnosis script is ready",
      });
    },
    onError: (error) => {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate script",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b sticky top-0 z-10 bg-background/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" data-testid="link-back-home">
              <Button variant="ghost" size="icon" data-testid="button-back">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="font-display text-xl font-semibold">HypnoBrain Script Shaper</h1>
              <p className="text-sm text-muted-foreground">
                {step === "intake" && "Step 1: Client Intake"}
                {step === "recommendations" && "Step 2: Choose Template"}
                {step === "mixer" && "Step 3: Customize Mix"}
                {step === "results" && "Your Script"}
              </p>
            </div>
          </div>
          
          {/* Progress indicator */}
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${step === "intake" ? "bg-primary" : "bg-muted"}`} />
            <div className={`w-2 h-2 rounded-full ${step === "recommendations" ? "bg-primary" : "bg-muted"}`} />
            <div className={`w-2 h-2 rounded-full ${step === "mixer" ? "bg-primary" : "bg-muted"}`} />
            <div className={`w-2 h-2 rounded-full ${step === "results" ? "bg-primary" : "bg-muted"}`} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        {step === "intake" && (
          <div className="space-y-8">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                <Sparkles className="w-4 h-4 text-primary" data-testid="icon-ai-badge" />
                <span className="text-sm text-primary">AI-Powered Template Recommendations</span>
              </div>
              <h2 className="font-display text-3xl font-bold mb-2">Tell Us About Your Client</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Share the presenting issue and desired outcome. Our AI will recommend the perfect templates for your therapeutic needs.
              </p>
            </div>

            <Card className="p-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="presenting-issue">
                    Presenting Issue <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="presenting-issue"
                    placeholder="e.g., Anxiety around public speaking"
                    value={presentingIssue}
                    onChange={(e) => setPresentingIssue(e.target.value)}
                    data-testid="input-presenting-issue"
                  />
                  <p className="text-xs text-muted-foreground">
                    What challenge is your client facing?
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="desired-outcome">
                    Desired Outcome <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="desired-outcome"
                    placeholder="e.g., Feel confident and relaxed when presenting"
                    value={desiredOutcome}
                    onChange={(e) => setDesiredOutcome(e.target.value)}
                    data-testid="input-desired-outcome"
                  />
                  <p className="text-xs text-muted-foreground">
                    What positive change are you working towards?
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Additional Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="e.g., Client responds well to nature metaphors, prefers gentle approach"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                    data-testid="textarea-notes"
                  />
                  <p className="text-xs text-muted-foreground">
                    Any preferences, sensitivities, or additional context
                  </p>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg border border-muted">
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">Privacy Note:</strong> Do not include client names or personally identifiable information. This helps maintain confidentiality.
                  </p>
                </div>
              </div>
            </Card>

            <div className="flex justify-end">
              <Button
                size="lg"
                onClick={handleGetRecommendations}
                disabled={getRecommendationsMutation.isPending}
                data-testid="button-get-recommendations"
              >
                {getRecommendationsMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                    Finding Templates...
                  </>
                ) : (
                  <>
                    Get Recommendations
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {step === "recommendations" && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="font-display text-3xl font-bold mb-2">Recommended Templates</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Based on your client's needs, here are {recommendations.length} template{recommendations.length === 1 ? '' : 's'} that match well.
              </p>
            </div>

            {/* Template Cards */}
            <div className="space-y-6">
              {recommendations.map((rec, index) => {
                const templateData = rec.template.jsonData;
                const dimensionValues = templateData?.dimension_values || {};
                
                return (
                  <Card key={rec.template.id} className="p-6" data-testid={`recommendation-${index}`}>
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                      {/* Left: Template Info */}
                      <div className="flex-1">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 shrink-0">
                            <Sparkles className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-xl mb-1" data-testid={`template-name-${index}`}>
                              {rec.template.name}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {rec.template.category} • Match Score: {rec.matchScore}
                            </p>
                          </div>
                        </div>
                        
                        <p className="text-muted-foreground mb-4" data-testid={`template-description-${index}`}>
                          {rec.template.description}
                        </p>
                        
                        {/* Match Reasons */}
                        {rec.matchReasons.length > 0 && (
                          <div className="space-y-2 mb-4">
                            <p className="text-sm font-medium">Why this template works:</p>
                            <ul className="space-y-1">
                              {rec.matchReasons.slice(0, 3).map((reason, i) => (
                                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                  <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                                  <span>{reason}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {/* Dimension Preview */}
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Dimension Emphasis:</p>
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(dimensionValues)
                              .filter(([_, value]) => (value as number) > 60)
                              .slice(0, 4)
                              .map(([dim, value]) => (
                                <div
                                  key={dim}
                                  className="px-3 py-1 rounded-full bg-primary/10 text-sm"
                                  data-testid={`dimension-${dim}-${index}`}
                                >
                                  {dim.charAt(0).toUpperCase() + dim.slice(1)}: {value as number}%
                                </div>
                              ))}
                          </div>
                        </div>
                      </div>
                      
                      {/* Right: Actions */}
                      <div className="flex flex-col gap-3 md:w-48">
                        <Button 
                          className="w-full" 
                          data-testid={`button-use-template-${index}`}
                          onClick={() => {
                            setSelectedTemplate(rec);
                            setStep("mixer");
                            toast({
                              title: "Template Selected",
                              description: `Using ${rec.template.name}`,
                            });
                          }}
                        >
                          Use This Template
                        </Button>
                        <Button 
                          variant="outline" 
                          className="w-full"
                          data-testid={`button-customize-${index}`}
                          onClick={() => {
                            setSelectedTemplate(rec);
                            setStep("mixer");
                            toast({
                              title: "Customizing Template",
                              description: "Opening dimension mixer...",
                            });
                          }}
                        >
                          Customize First
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
            
            {/* Manual Creation Option */}
            <div className="text-center pt-6 border-t">
              <p className="text-muted-foreground mb-4">
                Don't see what you need? Start from scratch.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedTemplate(null);
                  setStep("mixer");
                  toast({
                    title: "Starting Fresh",
                    description: "Creating script from scratch",
                  });
                }}
                data-testid="button-start-from-scratch"
              >
                <Sliders className="w-4 h-4 mr-2" />
                Start From Scratch
              </Button>
            </div>
          </div>
        )}

        {step === "mixer" && (
          <div className="space-y-6">
            {/* Mixer Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold" data-testid="mixer-title">
                  {selectedTemplate ? `Customizing: ${selectedTemplate.template.name}` : "Create From Scratch"}
                </h2>
                <p className="text-muted-foreground mt-1">
                  Adjust the 8-dimensional mix to shape your hypnosis script
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setStep("recommendations");
                  toast({
                    title: "Back to Templates",
                    description: "Returning to recommendations",
                  });
                }}
                data-testid="button-back-to-recommendations"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </div>

            {/* Dimension Sliders */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Sliders className="w-5 h-5 text-primary" />
                8-Dimensional Framework
              </h3>
              <div className="space-y-6">
                {dimensions
                  .filter((dim: any) => dim.enabled)
                  .sort((a: any, b: any) => a.sortOrder - b.sortOrder)
                  .map((dim: any) => {
                    const value = dimensionValues[dim.name.toLowerCase()] || dim.defaultValue;
                    return (
                      <div key={dim.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium" data-testid={`label-${dim.name.toLowerCase()}`}>
                            {dim.name}
                          </label>
                          <span className="text-sm text-muted-foreground" data-testid={`value-${dim.name.toLowerCase()}`}>
                            {value}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min={dim.minValue}
                          max={dim.maxValue}
                          value={value}
                          onChange={(e) => {
                            const newValue = parseInt(e.target.value);
                            setDimensionValues(prev => ({
                              ...prev,
                              [dim.name.toLowerCase()]: newValue
                            }));
                          }}
                          className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer slider-thumb"
                          data-testid={`slider-${dim.name.toLowerCase()}`}
                        />
                        <p className="text-xs text-muted-foreground">{dim.description}</p>
                      </div>
                    );
                  })}
              </div>
            </Card>

            {/* Archetype & Style Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Archetype Dropdown */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  Therapeutic Archetype
                </h3>
                <select
                  value={selectedArchetypeId || ""}
                  onChange={(e) => setSelectedArchetypeId(e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full p-3 rounded-md border bg-background"
                  data-testid="select-archetype"
                >
                  <option value="">Choose an archetype...</option>
                  {archetypes
                    .filter((arch: any) => arch.enabled)
                    .sort((a: any, b: any) => a.sortOrder - b.sortOrder)
                    .map((arch: any) => (
                      <option key={arch.id} value={arch.id}>
                        {arch.name}
                      </option>
                    ))}
                </select>
                {selectedArchetypeId && (
                  <p className="text-sm text-muted-foreground mt-3">
                    {archetypes.find((a: any) => a.id === selectedArchetypeId)?.description}
                  </p>
                )}
              </Card>

              {/* Style Dropdown */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  Communication Style
                </h3>
                <select
                  value={selectedStyleId || ""}
                  onChange={(e) => setSelectedStyleId(e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full p-3 rounded-md border bg-background"
                  data-testid="select-style"
                >
                  <option value="">Choose a style...</option>
                  {styles
                    .filter((style: any) => style.enabled)
                    .sort((a: any, b: any) => a.sortOrder - b.sortOrder)
                    .map((style: any) => (
                      <option key={style.id} value={style.id}>
                        {style.name}
                      </option>
                    ))}
                </select>
                {selectedStyleId && (
                  <p className="text-sm text-muted-foreground mt-3">
                    {styles.find((s: any) => s.id === selectedStyleId)?.description}
                  </p>
                )}
              </Card>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-end">
              <Button
                variant="outline"
                onClick={() => generatePreviewMutation.mutate()}
                disabled={!selectedTemplate || generatePreviewMutation.isPending}
                data-testid="button-preview"
              >
                <Eye className="w-4 h-4 mr-2" />
                {generatePreviewMutation.isPending ? "Generating..." : "Preview Script"}
              </Button>
              <Button
                onClick={() => generateFullScriptMutation.mutate()}
                disabled={!selectedTemplate || generateFullScriptMutation.isPending}
                data-testid="button-generate"
              >
                <Wand2 className="w-4 h-4 mr-2" />
                {generateFullScriptMutation.isPending ? "Generating..." : "Generate Full Script ($3)"}
              </Button>
            </div>
          </div>
        )}

        {step === "results" && (
          <div className="space-y-6">
            {/* Results Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold" data-testid="results-title">
                  {fullScriptResult ? "Your Hypnosis Script" : "Script Preview"}
                </h2>
                <p className="text-muted-foreground mt-1">
                  {selectedTemplate ? `Generated from: ${selectedTemplate.template.name}` : "Custom generation"}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setStep("mixer");
                  setPreviewResult(null);
                  setFullScriptResult(null);
                }}
                data-testid="button-back-to-mixer"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Adjust Mix
              </Button>
            </div>

            {/* Preview Result */}
            {previewResult && !fullScriptResult && (
              <Card className="p-6">
                <div className="flex items-start gap-3 mb-4">
                  <Eye className="w-5 h-5 text-primary mt-1" />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">Preview</h3>
                    <p className="text-sm text-muted-foreground">
                      Estimated length: {previewResult.estimatedLength}
                    </p>
                  </div>
                </div>
                <div 
                  className="prose prose-sm max-w-none dark:prose-invert whitespace-pre-wrap"
                  data-testid="preview-content"
                >
                  {previewResult.preview}
                </div>
                <div className="mt-6 pt-6 border-t flex gap-3">
                  <Button
                    onClick={() => generateFullScriptMutation.mutate()}
                    disabled={generateFullScriptMutation.isPending}
                    data-testid="button-generate-from-preview"
                  >
                    <Wand2 className="w-4 h-4 mr-2" />
                    {generateFullScriptMutation.isPending ? "Generating..." : "Generate Full Script ($3)"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setStep("mixer");
                      setPreviewResult(null);
                    }}
                    data-testid="button-adjust-from-preview"
                  >
                    <Sliders className="w-4 h-4 mr-2" />
                    Adjust Mix
                  </Button>
                </div>
              </Card>
            )}

            {/* Full Script Result */}
            {fullScriptResult && (
              <Card className="p-6">
                <div className="flex items-start gap-3 mb-4">
                  <Check className="w-5 h-5 text-primary mt-1" />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">Complete Hypnosis Script</h3>
                    <p className="text-sm text-muted-foreground">
                      Your full therapeutic script is ready
                    </p>
                  </div>
                </div>
                <div 
                  className="prose max-w-none dark:prose-invert whitespace-pre-wrap"
                  data-testid="full-script-content"
                >
                  {fullScriptResult.fullScript}
                </div>
                <div className="mt-6 pt-6 border-t flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(fullScriptResult.fullScript);
                      toast({
                        title: "Copied",
                        description: "Script copied to clipboard",
                      });
                    }}
                    data-testid="button-copy-script"
                  >
                    Copy Script
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setStep("mixer");
                      setFullScriptResult(null);
                      setPreviewResult(null);
                    }}
                    data-testid="button-generate-new"
                  >
                    Generate New Script
                  </Button>
                </div>
              </Card>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
