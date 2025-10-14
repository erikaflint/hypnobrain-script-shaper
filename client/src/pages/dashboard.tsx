import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { VoicePlayer } from "@/components/voice-player";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Copy, FileText, Calendar, Tag, Sparkles, Wand2, Star, Package, Moon } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { format } from "date-fns";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Generation } from "@shared/schema";

export default function Dreamboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, authLoading, toast]);

  const { data: generations, isLoading, error } = useQuery<Generation[]>({
    queryKey: ["/api/user/generations"],
    enabled: isAuthenticated,
  });

  const { data: packages } = useQuery<any[]>({
    queryKey: ["/api/packages"],
    enabled: isAuthenticated,
  });

  // Mutation for toggling favorite
  const favoriteMutation = useMutation({
    mutationFn: async ({ id, isFavorite }: { id: number; isFavorite: boolean }) => {
      return await apiRequest(`/api/generations/${id}/favorite`, {
        method: "PATCH",
        body: JSON.stringify({ isFavorite }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/generations"] });
      toast({
        title: "Updated",
        description: "Favorite status updated",
      });
    },
  });

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: `${label} copied to clipboard`,
    });
  };

  const toggleFavorite = (generation: Generation) => {
    favoriteMutation.mutate({
      id: generation.id,
      isFavorite: !generation.isFavorite,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader 
        title="HypnoBrain Script Shaper"
        showDreamLink={true}
        showCreateScript={true}
        showAdminLink={true}
        rightContent={
          <Link href="/packages/create" data-testid="link-create-package">
            <Button variant="outline" size="sm">
              <Package className="w-4 h-4 mr-2" />
              Create Package
            </Button>
          </Link>
        }
      />

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" data-testid="dreamboard-title">
            My Dreamboard
          </h1>
          <p className="text-muted-foreground">
            View and manage your generated scripts and packages
          </p>
        </div>

        {/* Script Packages Section */}
        {packages && packages.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold">Script Packages</h2>
              <Link href="/packages/create">
                <Button size="sm" data-testid="button-create-package">
                  <Package className="w-4 h-4 mr-2" />
                  New Package
                </Button>
              </Link>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {packages.map((pkg: any) => (
                <Link key={pkg.id} href={`/packages/${pkg.id}/edit`}>
                  <Card className="p-4 hover-elevate cursor-pointer" data-testid={`package-card-${pkg.id}`}>
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold" data-testid={`package-title-${pkg.id}`}>{pkg.title}</h3>
                      <Badge data-testid={`package-status-${pkg.id}`}>{pkg.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">Theme: {pkg.theme}</p>
                    <p className="text-sm text-muted-foreground">{pkg.scriptCount} scripts</p>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* My Scripts Heading */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold">My Scripts</h2>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-4 text-muted-foreground">Loading your scripts...</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && generations?.length === 0 && (
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
              {generations.filter(g => g.isFavorite).length > 0 && (
                <span className="ml-2">
                  ({generations.filter(g => g.isFavorite).length} favorite{generations.filter(g => g.isFavorite).length !== 1 ? 's' : ''})
                </span>
              )}
            </p>

            {/* Favorites Section */}
            {generations.filter(g => g.isFavorite).length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Star className="w-5 h-5 fill-current text-primary" />
                  Favorites
                </h3>
                {generations.filter(g => g.isFavorite).map((generation) => (
                  <Card key={generation.id} className="p-6 border-primary/50" data-testid={`script-card-${generation.id}`}>
                    {renderScriptCard(generation)}
                  </Card>
                ))}
              </div>
            )}

            {/* All Scripts Section */}
            {generations.filter(g => !g.isFavorite).length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">All Scripts</h3>
                {generations.filter(g => !g.isFavorite).map((generation) => (
                  <Card key={generation.id} className="p-6" data-testid={`script-card-${generation.id}`}>
                    {renderScriptCard(generation)}
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  function renderScriptCard(generation: Generation) {
    return (
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-2" data-testid={`script-title-${generation.id}`}>
              {generation.title || generation.presentingIssue || "Hypnosis Script"}
              {generation.versionLabel && (
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  ({generation.versionLabel})
                </span>
              )}
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
                {generation.generationMode === "dream" ? (
                  <>
                    <Moon className="w-4 h-4" />
                    DREAM
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    {generation.generationMode === "free_weekly" ? "Free" : 
                     generation.generationMode === "remix" ? "Remix" : "Create New"}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={generation.isFavorite ? "default" : "outline"}
              size="icon"
              onClick={() => toggleFavorite(generation)}
              data-testid={`button-favorite-${generation.id}`}
              title={generation.isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              <Star className={`w-4 h-4 ${generation.isFavorite ? 'fill-current' : ''}`} />
            </Button>
            
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

        {/* Thumbnail Image for DREAM scripts */}
        {generation.generationMode === "dream" && generation.imageUrl && (
          <div className="border-t pt-4">
            <img 
              src={generation.imageUrl} 
              alt="DREAM Journey Visualization"
              className="w-full h-auto rounded-lg"
              data-testid={`img-dream-thumbnail-${generation.id}`}
            />
          </div>
        )}

        {/* Desired Outcome */}
        {generation.desiredOutcome && (
          <div>
            <p className="text-sm font-medium mb-1">Desired Outcome:</p>
            <p className="text-sm text-muted-foreground">{generation.desiredOutcome}</p>
          </div>
        )}

        {/* Preview or Full Script Display */}
        {generation.fullScript ? (
          <>
            <div className="border-t pt-4">
              <p className="text-sm font-medium mb-2">Full Script:</p>
              <div 
                className="prose prose-sm max-w-none dark:prose-invert whitespace-pre-wrap bg-muted/30 p-4 rounded-md max-h-60 overflow-y-auto"
                data-testid={`script-content-${generation.id}`}
              >
                {generation.fullScript}
              </div>
            </div>
            
            {/* Voice Player for Full Script */}
            <div className="border-t pt-4">
              <VoicePlayer text={generation.fullScript} title="Listen to Script" />
            </div>
          </>
        ) : generation.previewText ? (
          <>
            <div className="border-t pt-4">
              <p className="text-sm font-medium mb-2">Preview:</p>
              <div 
                className="prose prose-sm max-w-none dark:prose-invert whitespace-pre-wrap bg-muted/30 p-4 rounded-md"
                data-testid={`preview-content-${generation.id}`}
              >
                {generation.previewText}
              </div>
            </div>
            
            {/* Voice Player for Preview */}
            <div className="border-t pt-4">
              <VoicePlayer text={generation.previewText} title="Listen to Preview" />
            </div>
          </>
        ) : null}
      </div>
    );
  }
}
