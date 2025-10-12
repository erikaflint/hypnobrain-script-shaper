import { Button } from "@/components/ui/button";
import { PlusCircle, RefreshCw } from "lucide-react";

interface ModeSwitcherProps {
  mode: "create" | "remix";
  onChange: (mode: "create" | "remix") => void;
}

export function ModeSwitcher({ mode, onChange }: ModeSwitcherProps) {
  return (
    <div className="inline-flex items-center gap-2 p-1 bg-muted rounded-lg">
      <Button
        variant={mode === "create" ? "default" : "ghost"}
        size="sm"
        onClick={() => onChange("create")}
        className="gap-2"
        data-testid="button-mode-create"
      >
        <PlusCircle className="w-4 h-4" />
        Create New
      </Button>
      <Button
        variant={mode === "remix" ? "default" : "ghost"}
        size="sm"
        onClick={() => onChange("remix")}
        className="gap-2"
        data-testid="button-mode-remix"
      >
        <RefreshCw className="w-4 h-4" />
        Remix Existing
      </Button>
    </div>
  );
}
