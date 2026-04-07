import { useState, useMemo } from "react";
import { Link } from "wouter";
import { useListTemplates, useListFrameworks } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FolderCode, Github, BarChart, Code2, Users, FilterX } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function TemplatesPage() {
  const [frameworkId, setFrameworkId] = useState<string>("all");

  const queryParams = useMemo(() => {
    return frameworkId !== "all" ? { frameworkId: parseInt(frameworkId, 10) } : {};
  }, [frameworkId]);

  const { data: templates, isLoading } = useListTemplates(queryParams);
  const { data: frameworks } = useListFrameworks();

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <FolderCode className="h-8 w-8 text-primary" />
            Project Templates
          </h1>
          <p className="text-muted-foreground">Jumpstart your next project with community-crafted boilerplates.</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center bg-card p-4 rounded-xl border shadow-sm">
        <div className="w-full sm:w-[300px]">
          <Select value={frameworkId} onValueChange={setFrameworkId}>
            <SelectTrigger data-testid="select-template-framework">
              <SelectValue placeholder="Filter by Framework" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Frameworks</SelectItem>
              {frameworks?.map((fw) => (
                <SelectItem key={fw.id} value={fw.id.toString()}>
                  {fw.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {frameworkId !== "all" && (
          <Button variant="ghost" onClick={() => setFrameworkId("all")} className="w-full sm:w-auto" data-testid="btn-clear-template-filters">
            <FilterX className="h-4 w-4 mr-2" /> Clear Filter
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[240px] w-full rounded-xl" />
          ))
        ) : templates?.length ? (
          templates.map((tpl) => (
            <Link key={tpl.id} href={`/templates/${tpl.id}`}>
              <Card className="h-full hover:border-primary/50 hover:shadow-md transition-all cursor-pointer flex flex-col group">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                      {tpl.frameworkName}
                    </Badge>
                    <Badge variant={
                      tpl.difficulty === 'beginner' ? 'secondary' : 
                      tpl.difficulty === 'intermediate' ? 'default' : 'destructive'
                    } className="capitalize text-[10px] px-1.5 h-5">
                      {tpl.difficulty}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-1" data-testid={`text-tpl-name-${tpl.id}`}>
                    {tpl.name}
                  </CardTitle>
                  <CardDescription className="line-clamp-2 pt-1 h-10">
                    {tpl.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-3 flex-1 flex flex-col justify-end">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground font-medium">
                    <div className="flex items-center gap-1.5">
                      <Code2 className="h-4 w-4" />
                      {tpl.language}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="h-4 w-4" />
                      {tpl.useCount.toLocaleString()} uses
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-0 text-xs text-muted-foreground border-t border-border/40 bg-muted/10 p-4 mt-auto justify-between">
                  <span>Added {formatDistanceToNow(new Date(tpl.createdAt), { addSuffix: true })}</span>
                  {tpl.repoUrl && <Github className="h-4 w-4" />}
                </CardFooter>
              </Card>
            </Link>
          ))
        ) : (
          <div className="col-span-full py-20 text-center border rounded-xl bg-card border-dashed">
            <h3 className="text-lg font-medium text-foreground">No templates found</h3>
            <p className="text-muted-foreground mt-1">Try selecting a different framework or submit a new one.</p>
            <Button variant="outline" onClick={() => setFrameworkId("all")} className="mt-4" data-testid="btn-reset-template-search">
              Reset Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
