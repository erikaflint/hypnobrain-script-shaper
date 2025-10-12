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
import { ArrowLeft, Sparkles, Lock, Crown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  const [loading, setLoading] = useState(false);

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

    setLoading(true);
    
    // TODO: Will be connected to backend in Phase 3
    toast({
      title: "Coming Soon",
      description: "Free script generation will be available once backend is connected",
    });
    
    setLoading(false);
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
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="font-semibold">Free Weekly Script</span>
          </div>
        </div>
      </header>

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

            <Button 
              type="submit" 
              size="lg" 
              className="w-full"
              disabled={loading}
              data-testid="button-generate-free"
            >
              {loading ? "Generating..." : "Generate My Free Script"}
            </Button>
          </form>
        </Card>

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
