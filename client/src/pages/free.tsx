import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sparkles, Lock, Crown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { AppHeader } from "@/components/app-header";

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

export default function Free() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [presentingIssue, setPresentingIssue] = useState("");
  const [desiredOutcome, setDesiredOutcome] = useState("");
  const [generatedScript, setGeneratedScript] = useState<string | null>(null);
  const [notEligible, setNotEligible] = useState(false);
  const [nextAvailableDate, setNextAvailableDate] = useState<string | null>(null);

  // Check eligibility mutation
  const checkEligibility = useMutation({
    mutationFn: async (email: string) => {
      return await apiRequest('/api/check-free-eligibility', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
    },
  });

  // Generate free script mutation
  const generateScript = useMutation({
    mutationFn: async (data: { email: string; clientIssue: string }) => {
      return await apiRequest('/api/generate-free-script', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: (data) => {
      setGeneratedScript(data.script);
      toast({
        title: "Script Generated!",
        description: "Your personalized hypnosis script is ready",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to generate script",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !presentingIssue || !desiredOutcome) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // First check eligibility
    try {
      const eligibility = await checkEligibility.mutateAsync(email);
      
      if (!eligibility.eligible) {
        setNotEligible(true);
        setNextAvailableDate(eligibility.nextAvailableDate);
        toast({
          title: "Not Eligible",
          description: eligibility.message,
          variant: "destructive",
        });
        return;
      }

      // If eligible, generate the script
      const clientIssue = `${presentingIssue} - ${desiredOutcome}`;
      await generateScript.mutateAsync({ email, clientIssue });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader 
        showBack={true}
        title="Free Weekly Script"
        icon={<Sparkles className="w-5 h-5 text-primary" />}
      />

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Get Your Free Script This Week
          </h1>
          <p className="text-xl text-muted-foreground">
            Experience the power of the 8D Framework with a professionally crafted hypnosis script
          </p>
        </div>

        <Card className="p-8 mb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                data-testid="input-email"
              />
              <p className="text-sm text-muted-foreground">
                We'll email your script and track your weekly free script usage
              </p>
            </div>

            {/* Presenting Issue */}
            <div className="space-y-2">
              <Label htmlFor="issue">Presenting Issue *</Label>
              <Select value={presentingIssue} onValueChange={setPresentingIssue}>
                <SelectTrigger id="issue" data-testid="select-issue">
                  <SelectValue placeholder="Select an issue to address" />
                </SelectTrigger>
                <SelectContent>
                  {PRESENTING_ISSUES.map((issue) => (
                    <SelectItem key={issue} value={issue}>
                      {issue}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Desired Outcome */}
            <div className="space-y-2">
              <Label htmlFor="outcome">Desired Outcome *</Label>
              <Input
                id="outcome"
                placeholder="e.g., Feel calm and in control"
                value={desiredOutcome}
                onChange={(e) => setDesiredOutcome(e.target.value)}
                required
                data-testid="input-outcome"
              />
            </div>

            {/* Locked Settings Notice */}
            <Card className="p-4 bg-muted/50 border-dashed">
              <div className="flex items-start gap-3">
                <Lock className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium mb-2">Free Tier Settings</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• All dimensions set to 50% (balanced)</li>
                    <li>• Style: Permissive/Ericksonian</li>
                    <li>• Archetype: Hero's Journey</li>
                    <li>• No marketing assets included</li>
                  </ul>
                </div>
              </div>
            </Card>

            {notEligible && nextAvailableDate && (
              <Card className="p-4 bg-destructive/10 border-destructive">
                <p className="text-sm text-destructive">
                  You've already used your free script this week. Next available: {new Date(nextAvailableDate).toLocaleDateString()}
                </p>
              </Card>
            )}

            <Button 
              type="submit" 
              size="lg" 
              className="w-full"
              disabled={generateScript.isPending || checkEligibility.isPending}
              data-testid="button-generate-free"
            >
              {generateScript.isPending || checkEligibility.isPending ? "Generating..." : "Generate My Free Script"}
            </Button>
          </form>
        </Card>

        {/* Generated Script Display */}
        {generatedScript && (
          <Card className="p-8 mb-8">
            <h2 className="font-display text-2xl font-bold mb-4">Your Personalized Script</h2>
            <div className="prose prose-sm max-w-none" data-testid="text-generated-script">
              <pre className="whitespace-pre-wrap font-mono text-sm bg-muted p-4 rounded-lg">
                {generatedScript}
              </pre>
            </div>
          </Card>
        )}

        {/* Upgrade Prompt */}
        <Card className="p-6 border-primary/50 bg-gradient-to-r from-primary/5 to-chart-4/5">
          <div className="flex items-start gap-4">
            <Crown className="w-6 h-6 text-primary shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2">Want Full Control?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Unlock dimension sliders, 6 archetype options, 3 style approaches, and 6 marketing assets for just $3
              </p>
              <div className="flex gap-3">
                <Link href="/app" data-testid="link-upgrade-create">
                  <Button data-testid="button-upgrade-create">
                    Create Custom Script - $3
                  </Button>
                </Link>
                <Link href="/app?mode=remix" data-testid="link-upgrade-remix">
                  <Button variant="outline" data-testid="button-upgrade-remix">
                    Or Remix a Script - $3
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
