import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { VoicePlayer } from "@/components/voice-player";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, ArrowRight, Sparkles, Check, Sliders, User, MessageSquare, Eye, Wand2, FileText, Dices, ChevronsUpDown, Save, Download } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

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

const PRESENTING_ISSUES = [
  "Anxiety",
  "Weight Loss",
  "Smoking Cessation",
  "Confidence",
  "Sleep Issues",
  "Stress Management",
  "Pain Management",
  "Phobias",
  "Performance Enhancement",
  "Other",
];

const ISSUE_OUTCOME_PAIRS: Record<string, string[]> = {
  "Anxiety": [
    "Feel calm and in control",
    "Experience peace and relaxation",
    "Trust my ability to handle challenges",
    "Live with ease and confidence",
  ],
  "Weight Loss": [
    "Reach and maintain a healthy weight naturally",
    "Develop a positive relationship with food",
    "Feel energized and comfortable in my body",
    "Make healthy choices effortlessly",
  ],
  "Smoking Cessation": [
    "Be free from smoking completely",
    "Breathe easily and feel healthier",
    "Live as a confident non-smoker",
    "Enjoy life without cigarettes",
  ],
  "Confidence": [
    "Feel self-assured in all situations",
    "Speak and act with confidence",
    "Trust my abilities and judgment",
    "Project confidence naturally",
  ],
  "Sleep Issues": [
    "Sleep deeply and wake refreshed",
    "Fall asleep easily each night",
    "Enjoy restful, restorative sleep",
    "Wake up energized and ready",
  ],
  "Stress Management": [
    "Handle stress with ease and grace",
    "Stay calm under pressure",
    "Respond to challenges peacefully",
    "Maintain balance and clarity",
  ],
  "Pain Management": [
    "Experience comfort and relief",
    "Manage discomfort effectively",
    "Feel more at ease in my body",
    "Live with reduced pain levels",
  ],
  "Phobias": [
    "Feel safe and at ease",
    "Approach situations with confidence",
    "Live free from fear",
    "Respond calmly and rationally",
  ],
  "Performance Enhancement": [
    "Perform at my peak ability",
    "Excel with focus and skill",
    "Achieve my performance goals",
    "Compete with confidence and ease",
  ],
  "Other": [
    "Achieve my desired outcome",
    "Experience positive change",
    "Feel empowered and capable",
    "Live with greater well-being",
  ],
};

export default function AppV2() {
  const { toast } = useToast();
  const [step, setStep] = useState<Step>("intake");

  // Intake form state
  const [presentingIssue, setPresentingIssue] = useState("");
  const [desiredOutcome, setDesiredOutcome] = useState("");
  const [notes, setNotes] = useState("");
  
  // Type-ahead state
  const [issueOpen, setIssueOpen] = useState(false);
  const [outcomeOpen, setOutcomeOpen] = useState(false);
  const [issueSearch, setIssueSearch] = useState("");
  const [outcomeSearch, setOutcomeSearch] = useState("");

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
  
  // Save Mix state
  const [saveMixDialogOpen, setSaveMixDialogOpen] = useState(false);
  const [templateName, setTemplateName] = useState("");
  
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
  
  // Fetch user's saved templates
  const { data: userTemplates = [], refetch: refetchUserTemplates } = useQuery<any[]>({
    queryKey: ['/api/user/templates'],
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

  // Save template mutation
  const saveTemplateMutation = useMutation({
    mutationFn: async (data: { name: string; dimensionValues: Record<string, number> }) => {
      return await apiRequest('/api/templates', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      refetchUserTemplates();
      setSaveMixDialogOpen(false);
      setTemplateName("");
      toast({
        title: "Mix Saved",
        description: "Your dimension mix has been saved successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Save Failed",
        description: error.message || "Failed to save mix",
        variant: "destructive",
      });
    },
  });

  // Dice Mix helper - randomly select issue and outcome
  const handleDiceMix = () => {
    const availableIssues = PRESENTING_ISSUES.filter(issue => issue !== "Other");
    const randomIssue = availableIssues[Math.floor(Math.random() * availableIssues.length)];
    const matchingOutcomes = ISSUE_OUTCOME_PAIRS[randomIssue];
    const randomOutcome = matchingOutcomes[Math.floor(Math.random() * matchingOutcomes.length)];
    
    setPresentingIssue(randomIssue);
    setDesiredOutcome(randomOutcome);
  };

  // Filter issues based on dropdown search input, or show all if no search
  const filteredIssues = PRESENTING_ISSUES.filter(issue =>
    issue.toLowerCase().includes(issueSearch.toLowerCase())
  );

  // Get suggested outcomes based on selected issue
  const suggestedOutcomes = presentingIssue && ISSUE_OUTCOME_PAIRS[presentingIssue] 
    ? ISSUE_OUTCOME_PAIRS[presentingIssue]
    : [];

  // Filter outcomes based on search
  const filteredOutcomes = suggestedOutcomes.filter(outcome =>
    outcome.toLowerCase().includes(outcomeSearch.toLowerCase())
  );

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
      <AppHeader 
        showBack={true}
        title="HypnoBrain Script Shaper"
        subtitle={
          step === "intake" ? "Step 1: Client Intake" :
          step === "recommendations" ? "Step 2: Choose Template" :
          step === "mixer" ? "Step 3: Customize Mix" :
          "Your Script"
        }
        showDreamLink={true}
        showDreamboard={true}
        rightContent={
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${step === "intake" ? "bg-primary" : "bg-muted"}`} />
            <div className={`w-2 h-2 rounded-full ${step === "recommendations" ? "bg-primary" : "bg-muted"}`} />
            <div className={`w-2 h-2 rounded-full ${step === "mixer" ? "bg-primary" : "bg-muted"}`} />
            <div className={`w-2 h-2 rounded-full ${step === "results" ? "bg-primary" : "bg-muted"}`} />
          </div>
        }
      />

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
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="font-semibold text-lg">Client Intake</h3>
                  <p className="text-sm text-muted-foreground">Start with the basics or get inspired</p>
                </div>
                <Button 
                  type="button"
                  variant="outline" 
                  size="sm"
                  onClick={handleDiceMix}
                  className="shrink-0"
                  data-testid="button-dice-mix"
                >
                  <Dices className="w-4 h-4 mr-2" />
                  Dice Mix
                </Button>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="presenting-issue">
                    Presenting Issue <span className="text-destructive">*</span>
                    {PRESENTING_ISSUES.length > 0 && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        ({PRESENTING_ISSUES.length} suggestions available)
                      </span>
                    )}
                  </Label>
                  <div className="relative">
                    <Input
                      id="presenting-issue"
                      placeholder="Type or select presenting issue..."
                      value={presentingIssue}
                      onChange={(e) => setPresentingIssue(e.target.value)}
                      onFocus={() => {
                        if (PRESENTING_ISSUES.length > 0) {
                          setIssueOpen(true);
                        }
                      }}
                      onBlur={() => {
                        setTimeout(() => setIssueOpen(false), 200);
                      }}
                      data-testid="input-presenting-issue"
                      className="pr-10"
                    />
                    {PRESENTING_ISSUES.length > 0 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full"
                        onClick={() => setIssueOpen(!issueOpen)}
                        data-testid="button-show-issue-suggestions"
                      >
                        <ChevronsUpDown className="h-4 w-4" />
                      </Button>
                    )}
                    {issueOpen && (
                      <div className="absolute z-50 w-full mt-1 rounded-md border bg-popover text-popover-foreground shadow-md">
                        <Command shouldFilter={false}>
                          <CommandInput 
                            placeholder="Search suggestions..." 
                            value={issueSearch}
                            onValueChange={setIssueSearch}
                            className="border-b"
                          />
                          <CommandList>
                            {filteredIssues.length === 0 ? (
                              <CommandEmpty>
                                <div className="p-2 text-sm text-muted-foreground">
                                  No matching suggestions
                                </div>
                              </CommandEmpty>
                            ) : (
                              <CommandGroup>
                                {filteredIssues.map((issue) => (
                                  <CommandItem
                                    key={issue}
                                    value={issue}
                                    onSelect={(currentValue) => {
                                      setPresentingIssue(currentValue);
                                      setIssueOpen(false);
                                      setIssueSearch("");
                                    }}
                                    data-testid={`option-issue-${issue.toLowerCase().replace(/\s+/g, '-')}`}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        presentingIssue === issue ? "opacity-100" : "opacity-0"
                                      )}
                                    />
                                    {issue}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            )}
                          </CommandList>
                        </Command>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    What challenge is your client facing? Type freely or select from suggestions.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="desired-outcome">
                    Desired Outcome <span className="text-destructive">*</span>
                    {presentingIssue && suggestedOutcomes.length > 0 && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        ({suggestedOutcomes.length} suggestions available)
                      </span>
                    )}
                  </Label>
                  <div className="relative">
                    <Input
                      id="desired-outcome"
                      placeholder="Type or select desired outcome..."
                      value={desiredOutcome}
                      onChange={(e) => setDesiredOutcome(e.target.value)}
                      onFocus={() => {
                        if (suggestedOutcomes.length > 0) {
                          setOutcomeOpen(true);
                        }
                      }}
                      onBlur={() => {
                        setTimeout(() => setOutcomeOpen(false), 200);
                      }}
                      data-testid="input-desired-outcome"
                      className="pr-10"
                    />
                    {suggestedOutcomes.length > 0 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full"
                        onClick={() => setOutcomeOpen(!outcomeOpen)}
                        data-testid="button-show-suggestions"
                      >
                        <ChevronsUpDown className="h-4 w-4" />
                      </Button>
                    )}
                    {outcomeOpen && suggestedOutcomes.length > 0 && (
                      <div className="absolute z-50 w-full mt-1 rounded-md border bg-popover text-popover-foreground shadow-md">
                        <Command shouldFilter={false}>
                          <CommandInput 
                            placeholder="Search suggestions..." 
                            value={outcomeSearch}
                            onValueChange={setOutcomeSearch}
                            className="border-b"
                          />
                          <CommandList>
                            {filteredOutcomes.length === 0 ? (
                              <CommandEmpty>
                                <div className="p-2 text-sm text-muted-foreground">
                                  No matching suggestions
                                </div>
                              </CommandEmpty>
                            ) : (
                              <CommandGroup>
                                {filteredOutcomes.map((outcome, idx) => (
                                  <CommandItem
                                    key={idx}
                                    value={outcome}
                                    onSelect={(currentValue) => {
                                      setDesiredOutcome(currentValue);
                                      setOutcomeOpen(false);
                                      setOutcomeSearch("");
                                    }}
                                    data-testid={`option-outcome-${idx}`}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        desiredOutcome === outcome ? "opacity-100" : "opacity-0"
                                      )}
                                    />
                                    {outcome}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            )}
                          </CommandList>
                        </Command>
                      </div>
                    )}
                  </div>
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

            {/* Template Cards - Compact Grid */}
            <div className="grid gap-4 md:grid-cols-2">
              {recommendations.map((rec, index) => {
                const templateData = rec.template.jsonData;
                
                // Extract dimension values - handle both old and new formats
                const dimensionValues: Record<string, number> = {};
                if (templateData?.dimension_values) {
                  // Old format: flat object with values
                  Object.assign(dimensionValues, templateData.dimension_values);
                } else if (templateData?.dimensions) {
                  // New format: nested objects with level property
                  Object.entries(templateData.dimensions).forEach(([key, val]: [string, any]) => {
                    if (val?.level !== undefined) {
                      dimensionValues[key] = val.level;
                    }
                  });
                }
                
                return (
                  <Card key={rec.template.id} className="p-4" data-testid={`recommendation-${index}`}>
                    <div className="flex flex-col gap-4">
                      {/* Template Info */}
                      <div className="flex-1">
                        <div className="flex items-start gap-2 mb-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 shrink-0">
                            <Sparkles className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg mb-0.5" data-testid={`template-name-${index}`}>
                              {rec.template.name}
                            </h3>
                            <p className="text-xs text-muted-foreground">
                              {rec.template.category} • Score: {rec.matchScore}
                            </p>
                          </div>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2" data-testid={`template-description-${index}`}>
                          {rec.template.description}
                        </p>
                        
                        {/* Match Reasons - Compact */}
                        {rec.matchReasons.length > 0 && (
                          <div className="space-y-1 mb-3">
                            <p className="text-xs font-medium">Why it works:</p>
                            <ul className="space-y-0.5">
                              {rec.matchReasons.slice(0, 2).map((reason, i) => (
                                <li key={i} className="text-xs text-muted-foreground flex items-start gap-1">
                                  <Check className="w-3 h-3 text-primary shrink-0 mt-0.5" />
                                  <span>{reason}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {/* Dimension Preview - Compact */}
                        <div className="space-y-1.5">
                          <p className="text-xs font-medium">Top Dimensions:</p>
                          <div className="flex flex-wrap gap-1.5">
                            {Object.entries(dimensionValues)
                              .filter(([_, value]) => (value as number) > 40)
                              .sort(([, a], [, b]) => (b as number) - (a as number))
                              .slice(0, 3)
                              .map(([dim, value]) => (
                                <div
                                  key={dim}
                                  className="px-2 py-0.5 rounded-full bg-primary/10 text-xs"
                                  data-testid={`dimension-${dim}-${index}`}
                                >
                                  {dim.charAt(0).toUpperCase() + dim.slice(1)}: {value as number}%
                                </div>
                              ))}
                          </div>
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button 
                          size="sm"
                          className="flex-1" 
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
                          Use Template
                        </Button>
                        <Button 
                          size="sm"
                          variant="outline" 
                          className="flex-1"
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
                          Customize
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

            {/* Save/Apply Mix Controls */}
            <div className="flex gap-3">
              {/* Save Mix Button */}
              <Dialog open={saveMixDialogOpen} onOpenChange={setSaveMixDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex-1" data-testid="button-save-mix">
                    <Save className="w-4 h-4 mr-2" />
                    Save Mix
                  </Button>
                </DialogTrigger>
                <DialogContent data-testid="dialog-save-mix">
                  <DialogHeader>
                    <DialogTitle>Save Dimension Mix</DialogTitle>
                    <DialogDescription>
                      Save your current dimension configuration as a custom template for later use.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="template-name">Template Name</Label>
                      <Input
                        id="template-name"
                        placeholder="e.g., My Anxiety Protocol"
                        value={templateName}
                        onChange={(e) => setTemplateName(e.target.value)}
                        data-testid="input-template-name"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      onClick={() => {
                        if (!templateName.trim()) {
                          toast({
                            title: "Name Required",
                            description: "Please enter a name for your template",
                            variant: "destructive",
                          });
                          return;
                        }
                        saveTemplateMutation.mutate({
                          name: templateName,
                          dimensionValues,
                        });
                      }}
                      disabled={saveTemplateMutation.isPending}
                      data-testid="button-confirm-save-mix"
                    >
                      {saveTemplateMutation.isPending ? "Saving..." : "Save Mix"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Apply Mix Dropdown */}
              {userTemplates.length > 0 && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="flex-1" data-testid="button-apply-mix">
                      <Download className="w-4 h-4 mr-2" />
                      Apply Saved Mix ({userTemplates.length})
                    </Button>
                  </DialogTrigger>
                  <DialogContent data-testid="dialog-apply-mix">
                    <DialogHeader>
                      <DialogTitle>Apply Saved Mix</DialogTitle>
                      <DialogDescription>
                        Choose a saved dimension mix to apply to your current script.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-2 max-h-[400px] overflow-y-auto">
                      {userTemplates.map((template: any) => (
                        <Button
                          key={template.id}
                          variant="outline"
                          className="w-full justify-start hover-elevate"
                          onClick={() => {
                            setDimensionValues(template.dimensionValues);
                            toast({
                              title: "Mix Applied",
                              description: `Applied "${template.name}" to your dimension sliders`,
                            });
                          }}
                          data-testid={`button-apply-template-${template.id}`}
                        >
                          <Sliders className="w-4 h-4 mr-2" />
                          {template.name}
                        </Button>
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>

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
              <div className="space-y-6">
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

                {/* Voice Player */}
                <VoicePlayer text={fullScriptResult.fullScript} title="Listen to Your Script" />
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
