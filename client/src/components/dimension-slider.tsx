import { Slider } from "@/components/ui/slider";
import { Lock } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DimensionSliderProps {
  name: string;
  description: string;
  value: number;
  enabled: boolean;
  onChange: (value: number) => void;
  disabled?: boolean;
}

export function DimensionSlider({
  name,
  description,
  value,
  enabled,
  onChange,
  disabled = false,
}: DimensionSliderProps) {
  const isDisabled = !enabled || disabled;

  return (
    <div className={`space-y-2 ${isDisabled ? 'opacity-50' : ''}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">{name}</label>
          {!enabled && (
            <Tooltip>
              <TooltipTrigger>
                <Lock className="w-3 h-3 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Coming in Phase 2</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
        <span className="text-sm font-semibold tabular-nums min-w-[3ch] text-right">
          {value}%
        </span>
      </div>
      
      <Slider
        value={[value]}
        onValueChange={([newValue]) => !isDisabled && onChange(newValue)}
        max={100}
        step={1}
        className={isDisabled ? 'pointer-events-none' : ''}
        disabled={isDisabled}
        data-testid={`slider-${name.toLowerCase().replace(/\s+/g, '-')}`}
      />
      
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  );
}
