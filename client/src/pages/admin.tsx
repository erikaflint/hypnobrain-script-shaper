import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Eye, Calendar, Sparkles } from "lucide-react";
import type { Generation } from "@shared/schema";
import { VoicePlayer } from "@/components/voice-player";
import { AppHeader } from "@/components/app-header";

export default function Admin() {
  const { data: generations, isLoading } = useQuery<Generation[]>({
    queryKey: ['/api/admin/generations'],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading generations...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader 
        showBack={true}
        title="Admin: All Generations"
        icon={<Sparkles className="w-5 h-5 text-primary" />}
        rightContent={
          <Badge variant="secondary" data-testid="text-count">
            {generations?.length || 0} Total
          </Badge>
        }
      />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="space-y-4">
          {generations?.map((gen) => (
            <Card key={gen.id} className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-3">
                  {/* Header Row */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <Badge variant={gen.isFree ? "secondary" : "default"} data-testid={`badge-tier-${gen.id}`}>
                      {gen.isFree ? "Free" : gen.generationMode === 'create_new' ? "Create New" : "Remix"}
                    </Badge>
                    <Badge variant={gen.paymentStatus === 'completed' ? 'default' : 'outline'} data-testid={`badge-payment-${gen.id}`}>
                      {gen.paymentStatus}
                    </Badge>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      {new Date(gen.createdAt).toLocaleString()}
                    </div>
                  </div>

                  {/* Issue & Details */}
                  <div>
                    <p className="font-medium" data-testid={`text-issue-${gen.id}`}>
                      {gen.presentingIssue}
                    </p>
                    {gen.dimensionsJson && (
                      <div className="mt-2 flex gap-2 flex-wrap text-xs text-muted-foreground">
                        <span>Archetype: {gen.archetypeId}</span>
                        <span>•</span>
                        <span>Dimensions: {JSON.stringify(gen.dimensionsJson).substring(0, 50)}...</span>
                      </div>
                    )}
                  </div>

                  {/* Preview Text */}
                  {gen.previewText && (
                    <p className="text-sm text-muted-foreground line-clamp-2" data-testid={`text-preview-${gen.id}`}>
                      {gen.previewText}
                    </p>
                  )}
                </div>

                {/* View Full Script Button */}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" data-testid={`button-view-${gen.id}`}>
                      <Eye className="w-4 h-4 mr-2" />
                      View Full
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[80vh]">
                    <DialogHeader>
                      <DialogTitle>Generation #{gen.id}</DialogTitle>
                    </DialogHeader>
                    <ScrollArea className="h-[60vh] pr-4">
                      <div className="space-y-6">
                        {/* Metadata */}
                        <div className="space-y-2">
                          <h3 className="font-semibold">Details</h3>
                          <div className="text-sm space-y-1">
                            <p><strong>Issue:</strong> {gen.presentingIssue}</p>
                            <p><strong>Mode:</strong> {gen.generationMode}</p>
                            <p><strong>Free Tier:</strong> {gen.isFree ? 'Yes' : 'No'}</p>
                            <p><strong>Payment:</strong> {gen.paymentStatus}</p>
                            <p><strong>Created:</strong> {new Date(gen.createdAt).toLocaleString()}</p>
                          </div>
                        </div>

                        {/* Dimensions */}
                        {gen.dimensionsJson && (
                          <div className="space-y-2">
                            <h3 className="font-semibold">Dimension Values</h3>
                            <pre className="text-xs bg-muted p-3 rounded-lg overflow-x-auto">
                              {JSON.stringify(gen.dimensionsJson, null, 2)}
                            </pre>
                          </div>
                        )}

                        {/* Full Script */}
                        {gen.fullScript && (
                          <div className="space-y-2">
                            <h3 className="font-semibold">Full Script</h3>
                            <div className="prose prose-sm max-w-none">
                              <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded-lg" data-testid={`text-full-script-${gen.id}`}>
                                {gen.fullScript}
                              </pre>
                            </div>
                          </div>
                        )}

                        {/* Voice Player */}
                        {gen.fullScript && (
                          <VoicePlayer text={gen.fullScript} title="Listen to Script" />
                        )}

                        {/* Marketing Assets */}
                        {gen.assetsJson && (
                          <div className="space-y-2">
                            <h3 className="font-semibold">Marketing Assets</h3>
                            <pre className="text-xs bg-muted p-3 rounded-lg overflow-x-auto">
                              {JSON.stringify(gen.assetsJson, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </DialogContent>
                </Dialog>
              </div>
            </Card>
          ))}

          {generations?.length === 0 && (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">No generations yet. Generate your first script!</p>
              <Link href="/app" data-testid="link-create-first">
                <Button className="mt-4" data-testid="button-create-first">
                  Create Your First Script
                </Button>
              </Link>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
