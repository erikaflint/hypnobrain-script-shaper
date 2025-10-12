import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type Step = "intake" | "recommendations" | "mixer" | "results";

interface RecommendedTemplate {
  id: number;
  templateId: string;
  name: string;
  description: string;
  category: string;
  dimensionValues: Record<string, number>;
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

  // Get template recommendations mutation
  const getRecommendationsMutation = useMutation({
    mutationFn: async (data: { presentingIssue: string; desiredOutcome: string; notes?: string }) => {
      return await apiRequest('/api/templates/recommend', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: (data) => {
      setRecommendations(data.recommendations || []);
      setStep("recommendations");
      toast({
        title: "Recommendations Ready",
        description: `Found ${data.recommendations?.length || 0} matching templates`,
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
      notes: notes.trim() || undefined,
    });
  };

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
                Based on your client's needs, here are {recommendations.length} templates that might work well.
              </p>
            </div>

            {/* Template recommendations will be built in task 11 */}
            <div className="text-center p-12">
              <p className="text-muted-foreground">Template recommendation display coming in task 11...</p>
              <p className="text-sm text-muted-foreground mt-2">
                Found {recommendations.length} recommendations
              </p>
            </div>
          </div>
        )}

        {step === "mixer" && (
          <div className="text-center p-12">
            <p className="text-muted-foreground">Dimension mixer coming in task 12...</p>
          </div>
        )}

        {step === "results" && (
          <div className="text-center p-12">
            <p className="text-muted-foreground">Results display coming later...</p>
          </div>
        )}
      </main>
    </div>
  );
}
