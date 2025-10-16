import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Heart, RotateCcw } from "lucide-react";
import { VoicePlayerPro } from "./voice-player-pro";

interface PreviewPanelProps {
  previewText: string | null;
  loading: boolean;
  mode: "create" | "remix";
  dimensionsUsed?: Array<{ name: string; value: number }>;
  changesDetected?: Array<{ dimension: string; from: number; to: number; change: string }>;
  onGeneratePreview: () => void;
  onGenerateFull: () => void;
  onRemix?: () => void;
  onRevert?: () => void;
}

export function PreviewPanel({
  previewText,
  loading,
  mode,
  dimensionsUsed = [],
  changesDetected = [],
  onGeneratePreview,
  onGenerateFull,
  onRemix,
  onRevert,
}: PreviewPanelProps) {
  if (loading) {
    return (
      <Card className="p-8">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mb-4" />
          <p className="text-muted-foreground">
            {mode === "remix" ? "Remixing your script..." : "Mixing your script..."}
          </p>
        </div>
      </Card>
    );
  }

  if (!previewText) {
    return (
      <Card className="p-8 border-dashed">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Sparkles className="w-12 h-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">
            Adjust the dimensions and settings, then generate a preview
          </p>
          <Button onClick={onGeneratePreview} data-testid="button-generate-preview">
            <Sparkles className="w-4 h-4 mr-2" />
            Generate Preview
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">
              {mode === "remix" ? "Remixed Preview" : "Preview"} (150-200 words)
            </h3>
            <Badge variant="secondary" className="text-xs">
              Preview
            </Badge>
          </div>
        </div>

        <div className="prose prose-sm dark:prose-invert max-w-none mb-6">
          <div className="font-mono text-sm leading-relaxed whitespace-pre-wrap">
            {previewText}
          </div>
        </div>

        {mode === "create" && dimensionsUsed.length > 0 && (
          <div className="pt-4 border-t">
            <p className="text-sm font-medium mb-2">Active Dimensions:</p>
            <div className="flex flex-wrap gap-2">
              {dimensionsUsed
                .filter((d) => d.value > 30)
                .map((dim) => (
                  <Badge key={dim.name} variant="outline" className="text-xs">
                    {dim.name} ({dim.value}%)
                  </Badge>
                ))}
            </div>
          </div>
        )}

        {mode === "remix" && changesDetected.length > 0 && (
          <div className="pt-4 border-t">
            <p className="text-sm font-medium mb-2">What Changed:</p>
            <div className="space-y-1">
              {changesDetected.map((change, i) => (
                <div key={i} className="text-xs text-muted-foreground">
                  • {change.dimension} {change.change} from {change.from}% to {change.to}%
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      <VoicePlayerPro text={previewText} title="Listen to Preview" />

      <div className="flex gap-3">
        <Button
          onClick={onGenerateFull}
          size="lg"
          className="flex-1"
          data-testid="button-generate-full"
        >
          <Heart className="w-4 h-4 mr-2" />
          {mode === "remix" ? "Perfect! Get Full Remix - $3" : "Love it! Generate Full Script - $3"}
        </Button>
        {mode === "create" && onRemix && (
          <Button
            onClick={onRemix}
            size="lg"
            variant="outline"
            data-testid="button-remix-preview"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Remix
          </Button>
        )}
        {mode === "remix" && onRevert && (
          <Button
            onClick={onRevert}
            size="lg"
            variant="outline"
            data-testid="button-revert-original"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Revert
          </Button>
        )}
      </div>
    </div>
  );
}
