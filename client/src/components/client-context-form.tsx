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
import { AlertCircle } from "lucide-react";

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
  return (
    <Card className="p-6 space-y-6">
      <div>
        <h3 className="font-semibold mb-2">Client Context</h3>
        <p className="text-sm text-muted-foreground">
          Provide details about the therapeutic session
        </p>
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
