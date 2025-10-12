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
import { Button } from "@/components/ui/button";
import { AlertCircle, Dices } from "lucide-react";

interface ClientContextFormProps {
  presentingIssue: string;
  desiredOutcome: string;
  benefits: string;
  customNotes: string;
  onPresentingIssueChange: (value: string) => void;
  onDesiredOutcomeChange: (value: string) => void;
  onBenefitsChange: (value: string) => void;
  onCustomNotesChange: (value: string) => void;
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

export function ClientContextForm({
  presentingIssue,
  desiredOutcome,
  benefits,
  customNotes,
  onPresentingIssueChange,
  onDesiredOutcomeChange,
  onBenefitsChange,
  onCustomNotesChange,
}: ClientContextFormProps) {
  const handleDiceMix = () => {
    // Randomly select a presenting issue (exclude "Other")
    const availableIssues = PRESENTING_ISSUES.filter(issue => issue !== "Other");
    const randomIssue = availableIssues[Math.floor(Math.random() * availableIssues.length)];
    
    // Get matching outcomes for that issue
    const matchingOutcomes = ISSUE_OUTCOME_PAIRS[randomIssue];
    const randomOutcome = matchingOutcomes[Math.floor(Math.random() * matchingOutcomes.length)];
    
    // Update both fields
    onPresentingIssueChange(randomIssue);
    onDesiredOutcomeChange(randomOutcome);
  };

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-semibold mb-2">Client Context</h3>
          <p className="text-sm text-muted-foreground">
            Provide details about the therapeutic session
          </p>
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

      <div className="space-y-2">
        <Label htmlFor="presenting-issue">Presenting Issue *</Label>
        <Select value={presentingIssue} onValueChange={onPresentingIssueChange}>
          <SelectTrigger id="presenting-issue" data-testid="select-presenting-issue">
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

      <div className="space-y-2">
        <Label htmlFor="desired-outcome">Desired Outcome *</Label>
        <Input
          id="desired-outcome"
          placeholder="e.g., Feel calm and in control"
          value={desiredOutcome}
          onChange={(e) => onDesiredOutcomeChange(e.target.value)}
          data-testid="input-desired-outcome"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="benefits">Key Benefits</Label>
        <Textarea
          id="benefits"
          placeholder="e.g., Better sleep, reduced stress, increased confidence"
          value={benefits}
          onChange={(e) => onBenefitsChange(e.target.value)}
          rows={3}
          data-testid="textarea-benefits"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="custom-notes">Additional Notes</Label>
        <Textarea
          id="custom-notes"
          placeholder="e.g., Client loves nature metaphors, responds well to direct suggestions"
          value={customNotes}
          onChange={(e) => onCustomNotesChange(e.target.value)}
          rows={3}
          data-testid="textarea-custom-notes"
        />
      </div>

      <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
        <AlertCircle className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground">
          <strong>Important:</strong> Do not include client names or private information
        </p>
      </div>
    </Card>
  );
}
