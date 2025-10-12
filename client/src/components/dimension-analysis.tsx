import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface DimensionAnalysisProps {
  dimensions: Array<{
    name: string;
    value: number;
  }>;
  detectedStyle?: string;
  detectedArchetype?: string;
  summary?: string;
}

export function DimensionAnalysis({
  dimensions,
  detectedStyle,
  detectedArchetype,
  summary,
}: DimensionAnalysisProps) {
  return (
    <Card className="p-6 space-y-4 bg-primary/5 border-primary/20">
      <div>
        <h3 className="font-semibold mb-2">Current Script Analysis</h3>
        <p className="text-sm text-muted-foreground">
          Your script currently emphasizes:
        </p>
      </div>

      <div className="space-y-3">
        {dimensions
          .sort((a, b) => b.value - a.value)
          .map((dim) => (
            <div key={dim.name} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{dim.name}</span>
                <span className="tabular-nums text-muted-foreground">{dim.value}%</span>
              </div>
              <Progress value={dim.value} className="h-2" />
            </div>
          ))}
      </div>

      {(detectedStyle || detectedArchetype) && (
        <div className="pt-4 border-t space-y-2">
          {detectedStyle && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Detected Style:</span>
              <Badge variant="secondary">{detectedStyle}</Badge>
            </div>
          )}
          {detectedArchetype && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Detected Archetype:</span>
              <Badge variant="secondary">{detectedArchetype}</Badge>
            </div>
          )}
        </div>
      )}

      {summary && (
        <div className="pt-4 border-t">
          <p className="text-sm text-muted-foreground italic">{summary}</p>
        </div>
      )}

      <div className="pt-4 border-t">
        <p className="text-sm font-medium flex items-center gap-2">
          <span className="text-primary">✨</span>
          Now adjust the sliders below to change your script's emphasis
        </p>
      </div>
    </Card>
  );
}
