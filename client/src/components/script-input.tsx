import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

interface ScriptInputProps {
  script: string;
  onScriptChange: (value: string) => void;
  onAnalyze: () => void;
  analyzing: boolean;
}

export function ScriptInput({
  script,
  onScriptChange,
  onAnalyze,
  analyzing,
}: ScriptInputProps) {
  return (
    <Card className="p-6 space-y-4">
      <div>
        <h3 className="font-semibold mb-2">Your Existing Script</h3>
        <p className="text-sm text-muted-foreground">
          Paste your hypnosis script here (500-2000 words recommended)
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="script-text">Script Text</Label>
        <Textarea
          id="script-text"
          placeholder="Paste your hypnosis script here..."
          value={script}
          onChange={(e) => onScriptChange(e.target.value)}
          rows={12}
          className="font-mono text-sm"
          data-testid="textarea-script-input"
        />
      </div>

      <Button
        onClick={onAnalyze}
        disabled={!script.trim() || analyzing}
        className="w-full"
        data-testid="button-analyze-script"
      >
        <Sparkles className="w-4 h-4 mr-2" />
        {analyzing ? "Analyzing..." : "Analyze Script"}
      </Button>

      <p className="text-xs text-muted-foreground">
        After analysis, we'll show you the current dimensional emphasis of your script, 
        then you can adjust the sliders to shift the style and approach.
      </p>
    </Card>
  );
}
