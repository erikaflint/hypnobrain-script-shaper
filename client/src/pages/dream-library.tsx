import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useState } from "react";
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
import { AppHeader } from "@/components/app-header";
import { Search, Star, Calendar, Play, Filter } from "lucide-react";
import type { Generation } from "@shared/schema";
import { format } from "date-fns";

export default function DreamLibrary() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterFavorites, setFilterFavorites] = useState(false);
  const [sortBy, setSortBy] = useState<"recent" | "title" | "oldest">("recent");

  const { data: generations, isLoading } = useQuery<Generation[]>({
    queryKey: ["/api/user/generations"],
  });

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
    <div className="min-h-screen bg-background">
      <AppHeader showDreamboard={true} showDreamLink={true} />
      
      <div className="container mx-auto px-4 py-8">
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
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Filter className="w-4 h-4" />
            {sortedDreams.length} {sortedDreams.length === 1 ? 'dream' : 'dreams'} 
            {searchQuery && ` matching "${searchQuery}"`}
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
              <Link href="/dream">
                <Button data-testid="button-create-first">Create Your First Dream Journey</Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {sortedDreams.map((dream) => (
              <Link key={dream.id} href={`/dream/${dream.id}/view`} data-testid={`link-dream-${dream.id}`}>
                <Card 
                  className="group relative overflow-hidden hover-elevate active-elevate-2 cursor-pointer transition-all"
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

                    {/* Favorite Badge */}
                    {dream.isFavorite && (
                      <div className="absolute top-2 right-2">
                        <Star className="w-5 h-5 text-primary fill-current drop-shadow-md" />
                      </div>
                    )}
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
              </Link>
            ))}
          </div>
        )}

        {/* Create New Dream CTA */}
        {sortedDreams.length > 0 && (
          <div className="mt-12 text-center">
            <Link href="/dream">
              <Button size="lg" data-testid="button-create-new">
                <Play className="w-5 h-5 mr-2" />
                Create New Dream Journey
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
