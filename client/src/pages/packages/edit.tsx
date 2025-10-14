import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Save, Sparkles, Download, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export default function EditPackage() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const { data, isLoading } = useQuery({
    queryKey: [`/api/packages/${id}`],
  });

  const updateScriptMutation = useMutation({
    mutationFn: async ({
      scriptId,
      updates,
    }: {
      scriptId: number;
      updates: any;
    }) => {
      return await apiRequest(`/api/packages/${id}/scripts/${scriptId}`, {
        method: "PATCH",
        body: JSON.stringify(updates),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/packages/${id}`] });
    },
  });

  const generateAllMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest(`/api/packages/${id}/generate`, {
        method: "POST",
      });
    },
    onSuccess: (response) => {
      const failedCount = response.failedScripts?.length || 0;
      const successCount = response.generatedScripts.length;
      
      if (failedCount === 0) {
        toast({
          title: "Package Generated!",
          description: `All ${successCount} scripts created successfully.`,
        });
      } else {
        toast({
          title: "Partial Generation",
          description: `${successCount} scripts succeeded, ${failedCount} failed. Check individual scripts for details.`,
          variant: "destructive",
        });
      }
      queryClient.invalidateQueries({ queryKey: [`/api/packages/${id}`] });
    },
    onError: (error: any) => {
      toast({
        title: "Generation Error",
        description: error.message || "Failed to generate scripts",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Package not found</p>
      </div>
    );
  }

  const { package: pkg, scripts } = data;

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard")}
            className="mb-4"
            data-testid="button-back"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dreamboard
          </Button>

          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold mb-2" data-testid="text-package-title">{pkg.title}</h1>
              <p className="text-muted-foreground">
                Theme: <span className="font-semibold">{pkg.theme}</span>
              </p>
              <Badge className="mt-2" data-testid="badge-status">{pkg.status}</Badge>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => generateAllMutation.mutate()}
                disabled={generateAllMutation.isPending || pkg.status === 'generating'}
                data-testid="button-generate-all"
              >
                {generateAllMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate All Scripts
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                disabled={pkg.status !== 'completed'}
                onClick={() => {
                  if (pkg.status === 'completed') {
                    window.open(`/api/packages/${id}/export`, '_blank');
                  } else {
                    toast({
                      title: "Export Not Available",
                      description: `Package must be fully completed before export. Current status: ${pkg.status}`,
                      variant: "destructive",
                    });
                  }
                }}
                data-testid="button-export"
              >
                <Download className="w-4 h-4 mr-2" />
                Export Package
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {scripts?.map((script: any, index: number) => (
            <ScriptConceptCard
              key={script.id}
              script={script}
              index={index}
              onUpdate={(updates) =>
                updateScriptMutation.mutate({
                  scriptId: script.id,
                  updates,
                })
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function ScriptConceptCard({
  script,
  index,
  onUpdate,
}: {
  script: any;
  index: number;
  onUpdate: (updates: any) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(script.userModifiedTitle || script.conceptTitle);
  const [issue, setIssue] = useState(script.userModifiedIssue || script.suggestedPresentingIssue);
  const [outcome, setOutcome] = useState(
    script.userModifiedOutcome || script.suggestedDesiredOutcome
  );

  const handleSave = () => {
    onUpdate({
      userModifiedTitle: title !== script.conceptTitle ? title : undefined,
      userModifiedIssue: issue !== script.suggestedPresentingIssue ? issue : undefined,
      userModifiedOutcome: outcome !== script.suggestedDesiredOutcome ? outcome : undefined,
    });
    setIsEditing(false);
  };

  return (
    <Card data-testid={`card-script-${script.id}`}>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" data-testid={`badge-number-${script.id}`}>#{index + 1}</Badge>
              <Badge data-testid={`badge-status-${script.id}`}>{script.status}</Badge>
            </div>
            {isEditing ? (
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-lg font-semibold mb-2"
                data-testid={`input-title-${script.id}`}
              />
            ) : (
              <CardTitle data-testid={`text-title-${script.id}`}>{title}</CardTitle>
            )}
            <CardDescription data-testid={`text-description-${script.id}`}>
              {script.conceptDescription}
            </CardDescription>
          </div>
          <Button
            variant={isEditing ? "default" : "outline"}
            size="sm"
            onClick={isEditing ? handleSave : () => setIsEditing(true)}
            data-testid={`button-edit-${script.id}`}
          >
            {isEditing ? (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save
              </>
            ) : (
              "Edit"
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <div className="space-y-4">
            <div>
              <Label data-testid={`label-issue-${script.id}`}>Presenting Issue</Label>
              <Input
                value={issue}
                onChange={(e) => setIssue(e.target.value)}
                data-testid={`input-issue-${script.id}`}
              />
            </div>
            <div>
              <Label data-testid={`label-outcome-${script.id}`}>Desired Outcome</Label>
              <Input
                value={outcome}
                onChange={(e) => setOutcome(e.target.value)}
                data-testid={`input-outcome-${script.id}`}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div>
              <span className="text-sm font-medium">Issue:</span>{" "}
              <span className="text-muted-foreground" data-testid={`text-issue-${script.id}`}>{issue}</span>
            </div>
            <div>
              <span className="text-sm font-medium">Outcome:</span>{" "}
              <span className="text-muted-foreground" data-testid={`text-outcome-${script.id}`}>{outcome}</span>
            </div>
          </div>
        )}
        {script.generationId && (
          <div className="mt-4 pt-4 border-t">
            <Badge variant="secondary" data-testid={`badge-generated-${script.id}`}>
              ✓ Script Generated (ID: {script.generationId})
            </Badge>
          </div>
        )}
        {script.status === 'failed' && script.errorMessage && (
          <div className="mt-4 pt-4 border-t">
            <Badge variant="destructive" data-testid={`badge-error-${script.id}`}>
              Failed
            </Badge>
            <p className="mt-2 text-sm text-destructive" data-testid={`text-error-${script.id}`}>
              Error: {script.errorMessage}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
