import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Copy, FileText, Calendar, Tag, Sparkles, Eye, Home, Wand2 } from "lucide-react";
import { format } from "date-fns";
import type { Generation } from "@shared/schema";

export default function Dashboard() {
  const [email, setEmail] = useState("");
  const [searchEmail, setSearchEmail] = useState("");
  const { toast } = useToast();

  const { data: generations, isLoading, error } = useQuery<Generation[]>({
    queryKey: ["/api/generations", { email: searchEmail }],
    enabled: !!searchEmail,
  });

  const handleSearch = () => {
    if (!email.trim()) {
      toast({
        title: "Email required",
        description: "Please enter your email to view saved scripts",
        variant: "destructive",
      });
      return;
    }
    setSearchEmail(email);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: `${label} copied to clipboard`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header Navigation */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-4 max-w-6xl">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">HypnoBrain Script Shaper</h2>
            <div className="flex gap-2">
              <Link href="/" data-testid="link-home">
                <Button variant="ghost" size="sm">
                  <Home className="w-4 h-4 mr-2" />
                  Home
                </Button>
              </Link>
              <Link href="/app-v2" data-testid="link-create-script">
                <Button variant="default" size="sm">
                  <Wand2 className="w-4 h-4 mr-2" />
                  Create Script
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" data-testid="dashboard-title">
            My Scripts
          </h1>
          <p className="text-muted-foreground">
            View and manage your generated hypnosis scripts
          </p>
        </div>

        {/* Email Search */}
        <Card className="p-6 mb-8">
          <div className="flex gap-3">
            <Input
              type="email"
              placeholder="Enter your email to view scripts"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              data-testid="input-email-search"
            />
            <Button
              onClick={handleSearch}
              disabled={!email.trim()}
              data-testid="button-search-scripts"
            >
              <Eye className="w-4 h-4 mr-2" />
              View Scripts
            </Button>
          </div>
        </Card>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-4 text-muted-foreground">Loading your scripts...</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && searchEmail && generations?.length === 0 && (
          <Card className="p-12 text-center">
            <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No scripts found</h3>
            <p className="text-muted-foreground">
              No scripts have been generated with this email address yet.
            </p>
          </Card>
        )}

        {/* Scripts List */}
        {!isLoading && generations && generations.length > 0 && (
          <div className="space-y-6">
            <p className="text-sm text-muted-foreground" data-testid="scripts-count">
              Found {generations.length} script{generations.length !== 1 ? "s" : ""}
            </p>

            {generations.map((generation) => (
              <Card key={generation.id} className="p-6" data-testid={`script-card-${generation.id}`}>
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-2" data-testid={`script-title-${generation.id}`}>
                        {generation.presentingIssue || "Hypnosis Script"}
                      </h3>
                      
                      <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                        {generation.createdAt && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {format(new Date(generation.createdAt), "MMM d, yyyy")}
                          </div>
                        )}
                        
                        {generation.templateUsed && (
                          <div className="flex items-center gap-1">
                            <Tag className="w-4 h-4" />
                            {generation.templateUsed}
                          </div>
                        )}
                        
                        <div className="flex items-center gap-1">
                          <Sparkles className="w-4 h-4" />
                          {generation.generationMode === "free_weekly" ? "Free" : 
                           generation.generationMode === "remix" ? "Remix" : "Create New"}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      {generation.previewText && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(generation.previewText!, "Preview")}
                          data-testid={`button-copy-preview-${generation.id}`}
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Copy Preview
                        </Button>
                      )}
                      
                      {generation.fullScript && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(generation.fullScript!, "Script")}
                          data-testid={`button-copy-script-${generation.id}`}
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Copy Full Script
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Desired Outcome */}
                  {generation.desiredOutcome && (
                    <div>
                      <p className="text-sm font-medium mb-1">Desired Outcome:</p>
                      <p className="text-sm text-muted-foreground">{generation.desiredOutcome}</p>
                    </div>
                  )}

                  {/* Preview or Full Script Display */}
                  {generation.fullScript ? (
                    <div className="border-t pt-4">
                      <p className="text-sm font-medium mb-2">Full Script:</p>
                      <div 
                        className="prose prose-sm max-w-none dark:prose-invert whitespace-pre-wrap bg-muted/30 p-4 rounded-md max-h-60 overflow-y-auto"
                        data-testid={`script-content-${generation.id}`}
                      >
                        {generation.fullScript}
                      </div>
                    </div>
                  ) : generation.previewText ? (
                    <div className="border-t pt-4">
                      <p className="text-sm font-medium mb-2">Preview:</p>
                      <div 
                        className="prose prose-sm max-w-none dark:prose-invert whitespace-pre-wrap bg-muted/30 p-4 rounded-md"
                        data-testid={`preview-content-${generation.id}`}
                      >
                        {generation.previewText}
                      </div>
                    </div>
                  ) : null}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
