import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Package, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function CreatePackage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  const [title, setTitle] = useState("");
  const [theme, setTheme] = useState("");
  const [scriptCount, setScriptCount] = useState("12");
  const [description, setDescription] = useState("");

  const createPackageMutation = useMutation({
    mutationFn: async (data: {
      title: string;
      theme: string;
      scriptCount: number;
      description?: string;
    }) => {
      const response = await apiRequest("/api/packages", {
        method: "POST",
        body: JSON.stringify(data),
      });
      return response;
    },
    onSuccess: (data) => {
      toast({
        title: "Package Created!",
        description: `${data.scripts.length} script concepts generated successfully.`,
      });
      navigate(`/packages/${data.package.id}/edit`);
    },
    onError: (error: any) => {
      toast({
        title: "Error Creating Package",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const count = parseInt(scriptCount, 10);
    if (isNaN(count) || count < 1 || count > 50) {
      toast({
        title: "Invalid Script Count",
        description: "Please enter a number between 1 and 50",
        variant: "destructive",
      });
      return;
    }
    
    createPackageMutation.mutate({
      title,
      theme,
      scriptCount: count,
      description: description || undefined,
    });
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard")}
            className="mb-4"
            data-testid="button-back"
          >
            ← Back to Dreamboard
          </Button>
          <h1 className="text-4xl font-bold mb-2">Create Script Package</h1>
          <p className="text-muted-foreground">
            Generate a collection of themed hypnosis scripts to sell as a package
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Package Details
            </CardTitle>
            <CardDescription>
              AI will generate unique, complementary script concepts based on your theme
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title" data-testid="label-title">
                  Package Title *
                </Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Weight Loss Success Collection"
                  required
                  data-testid="input-title"
                />
                <p className="text-sm text-muted-foreground">
                  The name customers will see
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="theme" data-testid="label-theme">
                  Theme *
                </Label>
                <Input
                  id="theme"
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  placeholder="e.g., weight loss, anxiety relief, sleep improvement"
                  required
                  data-testid="input-theme"
                />
                <p className="text-sm text-muted-foreground">
                  The core topic for all scripts in this package
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="scriptCount" data-testid="label-count">
                  Number of Scripts *
                </Label>
                <Input
                  id="scriptCount"
                  type="number"
                  min="1"
                  max="50"
                  value={scriptCount}
                  onChange={(e) => setScriptCount(e.target.value)}
                  required
                  data-testid="input-count"
                />
                <p className="text-sm text-muted-foreground">
                  Recommended: 10-12 scripts per package
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" data-testid="label-description">
                  Description (Optional)
                </Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add any specific requirements or focus areas..."
                  rows={4}
                  data-testid="input-description"
                />
                <p className="text-sm text-muted-foreground">
                  Help AI understand what you want to emphasize
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  type="submit"
                  disabled={createPackageMutation.isPending}
                  className="flex-1"
                  data-testid="button-create"
                >
                  {createPackageMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating Concepts...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate Script Concepts
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/dashboard")}
                  disabled={createPackageMutation.isPending}
                  data-testid="button-cancel"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <h3 className="font-semibold mb-2">How it works:</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
            <li>AI generates {scriptCount} unique script concepts based on your theme</li>
            <li>Review and modify concepts or assign specific templates</li>
            <li>Generate all scripts with one click</li>
            <li>Export as a package ready to sell</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
