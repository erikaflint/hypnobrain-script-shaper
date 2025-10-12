import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { AlertCircle, Dices, Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const [issueOpen, setIssueOpen] = useState(false);
  const [outcomeOpen, setOutcomeOpen] = useState(false);
  const [outcomeSearch, setOutcomeSearch] = useState("");

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

  // Get suggested outcomes based on selected issue
  const suggestedOutcomes = presentingIssue && ISSUE_OUTCOME_PAIRS[presentingIssue] 
    ? ISSUE_OUTCOME_PAIRS[presentingIssue]
    : [];

  // Filter outcomes based on search
  const filteredOutcomes = suggestedOutcomes.filter(outcome =>
    outcome.toLowerCase().includes(outcomeSearch.toLowerCase())
  );

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
        <Popover open={issueOpen} onOpenChange={setIssueOpen}>
          <PopoverTrigger asChild>
            <Button
              id="presenting-issue"
              variant="outline"
              role="combobox"
              aria-expanded={issueOpen}
              className="w-full justify-between font-normal"
              data-testid="select-presenting-issue"
            >
              {presentingIssue || "Select or type an issue to address..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0" align="start">
            <Command>
              <CommandInput placeholder="Search issues..." />
              <CommandList>
                <CommandEmpty>No issue found.</CommandEmpty>
                <CommandGroup>
                  {PRESENTING_ISSUES.map((issue) => (
                    <CommandItem
                      key={issue}
                      value={issue}
                      onSelect={(currentValue) => {
                        onPresentingIssueChange(currentValue === presentingIssue ? "" : currentValue);
                        setIssueOpen(false);
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
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-2">
        <Label htmlFor="desired-outcome">
          Desired Outcome *
          {presentingIssue && suggestedOutcomes.length > 0 && (
            <span className="ml-2 text-xs text-muted-foreground">
              ({suggestedOutcomes.length} suggestions available)
            </span>
          )}
        </Label>
        <div className="relative">
          <Input
            id="desired-outcome"
            placeholder="Type desired outcome or click suggestions..."
            value={desiredOutcome}
            onChange={(e) => onDesiredOutcomeChange(e.target.value)}
            onFocus={() => {
              if (suggestedOutcomes.length > 0) {
                setOutcomeOpen(true);
              }
            }}
            onBlur={() => {
              // Close suggestions after a short delay to allow clicking on suggestions
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
                            onDesiredOutcomeChange(currentValue);
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
