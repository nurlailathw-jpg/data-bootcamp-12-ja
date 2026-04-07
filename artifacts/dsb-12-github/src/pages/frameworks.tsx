import { useState, useMemo } from "react";
import { Link } from "wouter";
import { useListFrameworks, useGetStatsByCategory } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Star, Download, FilterX, BookOpen } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function FrameworksPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");

  const queryParams = useMemo(() => {
    const params: any = {};
    if (search.trim()) params.search = search.trim();
    if (category !== "all") params.category = category;
    return params;
  }, [search, category]);

  const { data: frameworks, isLoading } = useListFrameworks(queryParams);
  const { data: categories } = useGetStatsByCategory();

  const clearFilters = () => {
    setSearch("");
    setCategory("all");
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <BookOpen className="h-8 w-8 text-primary" />
            Frameworks
          </h1>
          <p className="text-muted-foreground">Discover and explore Python frameworks.</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center bg-card p-4 rounded-xl border shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search frameworks..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-background"
            data-testid="input-search-frameworks"
          />
        </div>
        <div className="w-full sm:w-[200px]">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger data-testid="select-category-filter">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories?.map((cat) => (
                <SelectItem key={cat.category} value={cat.category}>
                  {cat.category.charAt(0).toUpperCase() + cat.category.slice(1)} ({cat.count})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {(search || category !== "all") && (
          <Button variant="ghost" onClick={clearFilters} className="w-full sm:w-auto" data-testid="btn-clear-filters">
            <FilterX className="h-4 w-4 mr-2" /> Clear
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[200px] w-full rounded-xl" />
          ))
        ) : frameworks?.length ? (
          frameworks.map((fw) => (
            <Link key={fw.id} href={`/frameworks/${fw.id}`}>
              <Card className="h-full hover:border-primary/50 hover:shadow-md transition-all cursor-pointer flex flex-col group">
                <CardContent className="p-6 flex flex-col h-full gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <h2 className="text-xl font-bold text-primary group-hover:underline underline-offset-4" data-testid={`text-framework-title-${fw.id}`}>{fw.name}</h2>
                      <Badge variant="outline" className="font-mono text-xs">{fw.version}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2" title={fw.description}>{fw.description}</p>
                  </div>
                  
                  <div className="mt-auto pt-4 flex flex-col gap-4">
                    <div className="flex flex-wrap gap-1">
                      {fw.tags.slice(0, 3).map((tag, i) => (
                        <Badge key={i} variant="secondary" className="text-xs bg-secondary/50 font-normal">
                          {tag}
                        </Badge>
                      ))}
                      {fw.tags.length > 3 && (
                        <Badge variant="secondary" className="text-xs bg-secondary/50 font-normal">
                          +{fw.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground pt-2 border-t border-border/50">
                      <div className="flex items-center gap-1.5 font-medium text-foreground">
                        <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                        <span data-testid={`text-stars-${fw.id}`}>{fw.stars.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Download className="h-4 w-4" />
                        <span>{fw.weeklyDownloads > 1000 ? `${(fw.weeklyDownloads / 1000).toFixed(1)}k/wk` : `${fw.weeklyDownloads}/wk`}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        ) : (
          <div className="col-span-full py-20 text-center border rounded-xl bg-card border-dashed">
            <h3 className="text-lg font-medium text-foreground">No frameworks found</h3>
            <p className="text-muted-foreground mt-1">Try adjusting your search or filters.</p>
            <Button variant="outline" onClick={clearFilters} className="mt-4" data-testid="btn-reset-search">
              Reset Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
