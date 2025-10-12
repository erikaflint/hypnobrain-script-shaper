import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import type { Archetype } from "@shared/schema";

interface ArchetypeSelectorProps {
  archetypes: Archetype[];
  selectedId: number | null;
  customArchetype: string;
  onSelectArchetype: (id: number | null) => void;
  onCustomArchetype: (value: string) => void;
}

export function ArchetypeSelector({
  archetypes,
  selectedId,
  customArchetype,
  onSelectArchetype,
  onCustomArchetype,
}: ArchetypeSelectorProps) {
  return (
    <Card className="p-6 space-y-4">
      <div>
        <h3 className="font-semibold mb-2">Archetype</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Choose a narrative framework for your script
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="archetype">Select Archetype</Label>
        <Select
          value={selectedId?.toString() || ""}
          onValueChange={(value) => {
            onSelectArchetype(value ? parseInt(value) : null);
            if (value) onCustomArchetype(""); // Clear custom if selecting preset
          }}
        >
          <SelectTrigger id="archetype" data-testid="select-archetype">
            <SelectValue placeholder="Choose an archetype" />
          </SelectTrigger>
          <SelectContent>
            {archetypes.map((arch) => (
              <SelectItem key={arch.id} value={arch.id.toString()}>
                {arch.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="custom-archetype">Or Custom Archetype</Label>
        <Input
          id="custom-archetype"
          placeholder="e.g., Phoenix rising from ashes"
          value={customArchetype}
          onChange={(e) => {
            onCustomArchetype(e.target.value);
            if (e.target.value) onSelectArchetype(null); // Clear preset if typing custom
          }}
          data-testid="input-custom-archetype"
        />
      </div>
    </Card>
  );
}
