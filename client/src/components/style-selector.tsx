import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { Style } from "@shared/schema";

interface StyleSelectorProps {
  styles: Style[];
  selectedIds: number[];
  onToggleStyle: (id: number) => void;
}

export function StyleSelector({
  styles,
  selectedIds,
  onToggleStyle,
}: StyleSelectorProps) {
  return (
    <Card className="p-6 space-y-4">
      <div>
        <h3 className="font-semibold mb-2">Style & Approach</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Select one or more styles (can be combined)
        </p>
      </div>

      <div className="space-y-3">
        {styles.map((style) => (
          <div key={style.id} className="flex items-start space-x-3">
            <Checkbox
              id={`style-${style.id}`}
              checked={selectedIds.includes(style.id)}
              onCheckedChange={() => onToggleStyle(style.id)}
              data-testid={`checkbox-style-${style.name.toLowerCase().replace(/\s+/g, '-')}`}
            />
            <div className="flex-1">
              <Label
                htmlFor={`style-${style.id}`}
                className="text-sm font-medium cursor-pointer"
              >
                {style.name}
              </Label>
              {style.description && (
                <p className="text-xs text-muted-foreground mt-1">
                  {style.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
