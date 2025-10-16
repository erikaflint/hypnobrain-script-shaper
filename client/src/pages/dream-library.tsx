import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { AppHeader } from "@/components/app-header";
import { VoicePlayerPro } from "@/components/voice-player-pro";
import { Search, Star, Calendar, Play, X, ChevronLeft, ChevronRight, Maximize2, Minimize2, Trash2, Edit } from "lucide-react";
import type { Generation } from "@shared/schema";
import { format } from "date-fns";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";

export default function DreamLibrary() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterFavorites, setFilterFavorites] = useState(false);
  const [sortBy, setSortBy] = useState<"recent" | "title" | "oldest">("recent");
  const [selectedDream, setSelectedDream] = useState<Generation | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const { data: generations, isLoading } = useQuery<Generation[]>({
    queryKey: ["/api/user/generations"],
  });

  // Fetch selected dream details
  const { data: dreamDetails } = useQuery<Generation>({
    queryKey: ["/api/generations", selectedDream?.id],
    enabled: !!selectedDream?.id,
  });

  const { toast } = useToast();

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/generations/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/generations"] });
      toast({
        title: "Dream deleted",
        description: "Your dream journey has been removed.",
      });
      // Close player if the deleted dream was selected
      if (selectedDream && deletedDreamId === selectedDream.id) {
        closeDreamPlayer();
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete dream. Please try again.",
        variant: "destructive",
      });
    },
  });

  const [deletedDreamId, setDeletedDreamId] = useState<number | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editedScript, setEditedScript] = useState("");

  const handleDelete = (e: React.MouseEvent, dreamId: number) => {
    e.stopPropagation(); // Prevent card click
    setDeletedDreamId(dreamId);
    if (confirm("Are you sure you want to delete this dream journey?")) {
      deleteMutation.mutate(dreamId);
    }
  };

  // Edit mutation
  const editMutation = useMutation({
    mutationFn: async ({ id, script }: { id: number; script: string }) => {
      return apiRequest(`/api/generations/${id}/script`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullScript: script }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/generations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/generations", selectedDream?.id] });
      setIsEditDialogOpen(false);
      toast({
        title: "Script updated",
        description: "Your dream script has been saved.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update script. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleEditClick = () => {
    if (dreamDetails?.fullScript) {
      setEditedScript(dreamDetails.fullScript);
      setIsEditDialogOpen(true);
    }
  };

  const handleSaveEdit = () => {
    if (selectedDream && editedScript) {
      editMutation.mutate({ id: selectedDream.id, script: editedScript });
    }
  };

  // Filter only DREAM journeys
  const dreams = generations?.filter(g => g.generationMode === "dream") || [];

  // Apply search filter
  const filteredDreams = dreams.filter(dream => {
    const matchesSearch = !searchQuery || 
      dream.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dream.presentingIssue?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFavorites = !filterFavorites || dream.isFavorite;
    return matchesSearch && matchesFavorites;
  });

  // Apply sorting
  const sortedDreams = [...filteredDreams].sort((a, b) => {
    if (sortBy === "recent") {
      return new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime();
    } else if (sortBy === "oldest") {
      return new Date(a.createdAt!).getTime() - new Date(b.createdAt!).getTime();
    } else if (sortBy === "title") {
      const titleA = a.title || a.presentingIssue || "";
      const titleB = b.title || b.presentingIssue || "";
      return titleA.localeCompare(titleB);
    }
    return 0;
  });

  // Get images for selected dream
  const displayImages = dreamDetails?.imageUrls?.filter(Boolean) || 
    (dreamDetails?.imageUrl ? [dreamDetails.imageUrl] : []);

  // Track carousel changes
  useEffect(() => {
    if (!carouselApi) return;

    const onSelect = () => {
      setActiveImageIndex(carouselApi.selectedScrollSnap());
    };

    carouselApi.on("select", onSelect);
    return () => {
      carouselApi.off("select", onSelect);
    };
  }, [carouselApi]);

  // Get active background image
  const activeBackgroundImage = displayImages[activeImageIndex] || displayImages[0];

  const handleDreamClick = (dream: Generation) => {
    setSelectedDream(dream);
    setActiveImageIndex(0);
  };

  const closeDreamPlayer = () => {
    setSelectedDream(null);
    setIsFullscreen(false);
    setActiveImageIndex(0);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader showDreamboard={true} />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading your dream library...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Blurred Background Image (when dream is selected) */}
      {selectedDream && activeBackgroundImage && (
        <div 
          className="fixed inset-0 transition-all duration-700 ease-in-out"
          style={{
            backgroundImage: `url(${activeBackgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(40px)',
            transform: 'scale(1.1)',
          }}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />
        </div>
      )}

      {/* Header */}
      <div className="relative z-10">
        <AppHeader showDreamboard={true} showDreamLink={true} />
      </div>

      {/* Main Content Wrapper - Horizontal Split */}
      <div className={`relative z-10 flex ${selectedDream && isFullscreen ? 'hidden' : ''}`}>
        {/* Left Sidebar - Library */}
        <div 
          className={`transition-all duration-500 border-r border-border/50 ${
            selectedDream ? 'w-96' : 'w-full'
          }`}
          style={{ 
            height: selectedDream ? 'calc(100vh - 4rem)' : 'auto',
            overflowY: selectedDream ? 'auto' : 'visible'
          }}
        >
          <div className={`px-6 ${selectedDream ? 'py-4' : 'py-8'}`}>
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 text-primary" data-testid="page-title">
              Dream Library
            </h1>
            <p className="text-lg text-muted-foreground">
              Browse and play your collection of sleep journeys
            </p>
          </div>

          {/* Search and Filters */}
          <div className="mb-8 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search your dreams..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="input-search"
                />
              </div>

              {/* Sort */}
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="w-full sm:w-[180px]" data-testid="select-sort">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="title">Title (A-Z)</SelectItem>
                </SelectContent>
              </Select>

              {/* Favorites Filter */}
              <Button
                variant={filterFavorites ? "default" : "outline"}
                onClick={() => setFilterFavorites(!filterFavorites)}
                className="w-full sm:w-auto"
                data-testid="button-filter-favorites"
              >
                <Star className={`w-4 h-4 mr-2 ${filterFavorites ? 'fill-current' : ''}`} />
                Favorites
              </Button>
            </div>

            {/* Results count */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {sortedDreams.length} {sortedDreams.length === 1 ? 'dream' : 'dreams'} 
                {searchQuery && ` matching "${searchQuery}"`}
              </div>
              
              {selectedDream && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsFullscreen(true)}
                  data-testid="button-fullscreen"
                >
                  <Maximize2 className="w-4 h-4 mr-2" />
                  Fullscreen Player
                </Button>
              )}
            </div>
          </div>

          {/* Dream Grid */}
          {sortedDreams.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-xl text-muted-foreground mb-4">
                {searchQuery || filterFavorites 
                  ? "No dreams match your filters" 
                  : "No dreams yet"}
              </p>
              {!searchQuery && !filterFavorites && (
                <Button onClick={() => window.location.href = "/dream"} data-testid="button-create-first">
                  Create Your First Dream Journey
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {sortedDreams.map((dream) => (
                <Card 
                  key={dream.id}
                  onClick={() => handleDreamClick(dream)}
                  className={`group relative overflow-hidden hover-elevate active-elevate-2 cursor-pointer transition-all ${
                    selectedDream?.id === dream.id ? 'ring-2 ring-primary' : ''
                  }`}
                  data-testid={`dream-card-${dream.id}`}
                >
                  {/* Thumbnail Image */}
                  <div className="relative aspect-square bg-muted">
                    {dream.imageUrl ? (
                      <img
                        src={dream.imageUrl}
                        alt={dream.title || "Dream journey"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Play className="w-12 h-12 text-muted-foreground" />
                      </div>
                    )}
                    
                    {/* Hover Play Overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="bg-primary text-primary-foreground rounded-full p-4">
                        <Play className="w-8 h-8 fill-current" />
                      </div>
                    </div>

                    {/* Active Indicator */}
                    {selectedDream?.id === dream.id && (
                      <div className="absolute inset-0 border-4 border-primary" />
                    )}

                    {/* Favorite Badge */}
                    {dream.isFavorite && (
                      <div className="absolute top-2 right-2">
                        <Star className="w-5 h-5 text-primary fill-current drop-shadow-md" />
                      </div>
                    )}

                    {/* Delete Button (shows on hover) */}
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                      onClick={(e) => handleDelete(e, dream.id)}
                      data-testid={`button-delete-${dream.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Dream Info */}
                  <div className="p-3">
                    <h3 
                      className="font-semibold text-sm mb-1 line-clamp-2 min-h-[2.5rem]"
                      data-testid={`dream-title-${dream.id}`}
                    >
                      {dream.title || dream.presentingIssue || "Dream Journey"}
                    </h3>
                    
                    {dream.createdAt && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(dream.createdAt), "MMM d, yyyy")}
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
          </div>
        </div>

        {/* Right Main Area - Selected Dream Content */}
        {selectedDream && dreamDetails && (
          <div 
            className="flex-1 overflow-y-auto"
            style={{ height: 'calc(100vh - 4rem)' }}
          >
          {/* Hidden Carousel (always mounted for API - visually hidden but layout preserved) */}
          {displayImages.length > 0 && (
            <div className="absolute -z-50 opacity-0 pointer-events-none" aria-hidden="true">
              <Carousel 
                setApi={setCarouselApi}
                opts={{ loop: true }}
                className="w-full max-w-4xl"
              >
                <CarouselContent>
                  {displayImages.map((imageUrl, index) => (
                    <CarouselItem key={index}>
                      <div className="aspect-[21/9]">
                        <img src={imageUrl} alt={`Scene ${index + 1}`} className="w-full h-full object-cover" />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
            </div>
          )}

          <div className="container mx-auto px-4 py-6">
            {/* Large Thumbnail Section */}
            <div className="mb-6">
              <div className="relative">
                {displayImages[0] && (
                  <div className="relative aspect-[21/9] rounded-lg overflow-hidden shadow-2xl">
                    <img
                      src={displayImages[activeImageIndex] || displayImages[0]}
                      alt="Scene"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Navigation Controls (if multiple images) */}
                {displayImages.length > 1 && (
                  <>
                    <button
                      onClick={() => carouselApi?.scrollPrev()}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm hover-elevate active-elevate-2 rounded-full p-3"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={() => carouselApi?.scrollNext()}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm hover-elevate active-elevate-2 rounded-full p-3"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                    
                    {/* Scene Indicators */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                      {displayImages.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => carouselApi?.scrollTo(index)}
                          className={`w-2 h-2 rounded-full transition-all ${
                            index === activeImageIndex ? 'bg-primary w-8' : 'bg-white/50'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}

                {/* Close Button */}
                <Button
                  variant="outline"
                  size="icon"
                  onClick={closeDreamPlayer}
                  className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm"
                  data-testid="button-close-player"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Title and Content */}
            <div className="space-y-4">
              {/* Title */}
              <div>
                <h2 className="text-3xl font-bold text-primary mb-2">
                  {dreamDetails.title || dreamDetails.presentingIssue || "Dream Journey"}
                </h2>
                {dreamDetails.createdAt && (
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {format(new Date(dreamDetails.createdAt), "MMMM d, yyyy 'at' h:mm a")}
                  </p>
                )}
              </div>

              {/* Story Outline (if available) */}
              {dreamDetails.storyOutline && (
                <Card className="bg-card/90 backdrop-blur-sm border-primary/20">
                  <div className="p-6">
                    <h3 className="text-lg font-semibold mb-2 text-primary">Story Outline</h3>
                    <p className="text-xs text-muted-foreground mb-4">
                      The detailed 800-1200 word story created by the Story Shaper (Step 1)
                    </p>
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">
                        {dreamDetails.storyOutline}
                      </p>
                    </div>
                  </div>
                </Card>
              )}

              {/* Full Script */}
              {dreamDetails.fullScript && (
                <Card className="bg-card/90 backdrop-blur-sm">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">Full Script</h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleEditClick}
                        data-testid="button-edit-script"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Script
                      </Button>
                    </div>
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">
                        {dreamDetails.fullScript}
                      </p>
                    </div>
                  </div>
                </Card>
              )}

              {/* Voice Player */}
              {dreamDetails.fullScript && (
                <Card className="bg-card/90 backdrop-blur-sm">
                  <div className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Listen</h3>
                    <VoicePlayerPro text={dreamDetails.fullScript} />
                  </div>
                </Card>
              )}

              {/* Fullscreen Button */}
              <div className="flex justify-center pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsFullscreen(true)}
                  data-testid="button-fullscreen"
                >
                  <Maximize2 className="w-4 h-4 mr-2" />
                  Fullscreen View
                </Button>
              </div>
            </div>
          </div>
          </div>
        )}
      </div>

      {/* Fullscreen Mode */}
      {selectedDream && dreamDetails && isFullscreen && (
        <div className="fixed inset-0 z-30 bg-background overflow-y-auto">
          {/* Close/Minimize Controls */}
          <div className="absolute top-4 right-4 flex gap-2 z-40">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsFullscreen(false)}
              className="bg-background/80 backdrop-blur-sm"
              data-testid="button-minimize"
            >
              <Minimize2 className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={closeDreamPlayer}
              className="bg-background/80 backdrop-blur-sm"
              data-testid="button-close-player-fullscreen"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Visual Carousel Display */}
          {displayImages.length > 0 && (
            <div className="relative container mx-auto px-4 pt-20 pb-8">
              <div className="relative aspect-[21/9] rounded-lg overflow-hidden shadow-2xl">
                <img
                  src={displayImages[activeImageIndex]}
                  alt={`Scene ${activeImageIndex + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Navigation Arrows */}
              {displayImages.length > 1 && (
                <>
                  <button
                    onClick={() => carouselApi?.scrollPrev()}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm hover-elevate active-elevate-2 rounded-full p-3"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={() => carouselApi?.scrollNext()}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm hover-elevate active-elevate-2 rounded-full p-3"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}

              {/* Carousel Indicators */}
              {displayImages.length > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                  {displayImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => carouselApi?.scrollTo(index)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === activeImageIndex ? 'bg-primary w-8' : 'bg-white/50'
                      }`}
                      data-testid={`indicator-${index}`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Content Cards */}
          <div className="container mx-auto px-4 pb-8 space-y-4">
            <Card className="bg-card/90 backdrop-blur-sm">
              <div className="p-6">
                <h2 className="text-3xl font-bold text-primary mb-2">
                  {dreamDetails.title || dreamDetails.presentingIssue || "Dream Journey"}
                </h2>
                {dreamDetails.createdAt && (
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {format(new Date(dreamDetails.createdAt), "MMMM d, yyyy 'at' h:mm a")}
                  </p>
                )}
              </div>
            </Card>

            {/* Story Outline (if available) */}
            {dreamDetails.storyOutline && (
              <Card className="bg-card/90 backdrop-blur-sm border-primary/20">
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-2 text-primary">Story Outline</h3>
                  <p className="text-xs text-muted-foreground mb-4">
                    The detailed 800-1200 word story created by the Story Shaper (Step 1)
                  </p>
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">
                      {dreamDetails.storyOutline}
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {dreamDetails.fullScript && (
              <Card className="bg-card/90 backdrop-blur-sm">
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Full Script</h3>
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">
                      {dreamDetails.fullScript}
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {dreamDetails.fullScript && (
              <Card className="bg-card/90 backdrop-blur-sm">
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Listen</h3>
                  <VoicePlayerPro text={dreamDetails.fullScript} />
                </div>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Edit Script Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Edit Dream Script</DialogTitle>
            <DialogDescription>
              Make changes to your dream journey script. Your edits will be saved immediately.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={editedScript}
            onChange={(e) => setEditedScript(e.target.value)}
            className="min-h-[400px] font-mono text-sm"
            placeholder="Enter your script here..."
            data-testid="textarea-edit-script"
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              data-testid="button-cancel-edit"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={editMutation.isPending}
              data-testid="button-save-edit"
            >
              {editMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
