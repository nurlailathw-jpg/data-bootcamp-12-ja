import { useParams, useLocation, Link } from "wouter";
import { 
  useGetFramework, 
  getGetFrameworkQueryKey,
  useListTemplates, 
  useDeleteFramework,
  useStarFramework,
  getListFrameworksQueryKey,
  getGetTrendingFrameworksQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Star, 
  Download, 
  CalendarDays, 
  Scale, 
  ArrowLeft, 
  Trash2, 
  FolderCode, 
  ExternalLink,
  ChevronRight
} from "lucide-react";
import { SiGithub, SiPypi } from "react-icons/si";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { format } from "date-fns";

export default function FrameworkDetailPage() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const frameworkId = parseInt(id || "0", 10);

  const { data: fw, isLoading: fwLoading, error } = useGetFramework(frameworkId, {
    query: {
      enabled: !!frameworkId,
      queryKey: getGetFrameworkQueryKey(frameworkId)
    }
  });

  const { data: templates, isLoading: templatesLoading } = useListTemplates(
    { frameworkId },
    { query: { enabled: !!frameworkId } }
  );

  const starMutation = useStarFramework();
  const deleteMutation = useDeleteFramework();

  const handleStar = () => {
    if (!fw) return;
    starMutation.mutate({ id: frameworkId }, {
      onSuccess: (updatedFw) => {
        queryClient.setQueryData(getGetFrameworkQueryKey(frameworkId), updatedFw);
        queryClient.invalidateQueries({ queryKey: getListFrameworksQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetTrendingFrameworksQueryKey() });
        toast({
          title: "Starred!",
          description: `You starred ${fw.name}.`,
        });
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to star framework.",
          variant: "destructive"
        });
      }
    });
  };

  const handleDelete = () => {
    deleteMutation.mutate({ id: frameworkId }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListFrameworksQueryKey() });
        toast({
          title: "Deleted",
          description: "Framework deleted successfully.",
        });
        setLocation("/frameworks");
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to delete framework.",
          variant: "destructive"
        });
      }
    });
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-20 text-center max-w-md">
        <h2 className="text-2xl font-bold mb-2">Framework not found</h2>
        <p className="text-muted-foreground mb-6">The framework you're looking for doesn't exist or has been removed.</p>
        <Button asChild>
          <Link href="/frameworks">Back to Frameworks</Link>
        </Button>
      </div>
    );
  }

  if (fwLoading || !fw) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-5xl space-y-8">
        <Skeleton className="w-24 h-10" />
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-1 space-y-6">
            <Skeleton className="w-full h-[200px]" />
            <Skeleton className="w-full h-[300px]" />
          </div>
          <div className="w-full md:w-80 space-y-6">
            <Skeleton className="w-full h-[400px]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl space-y-8">
      <Button variant="ghost" asChild className="pl-0 hover:bg-transparent hover:text-primary">
        <Link href="/frameworks">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Frameworks
        </Link>
      </Button>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Main Content */}
        <div className="flex-1 space-y-8 w-full">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h1 className="text-4xl font-bold tracking-tight text-primary flex items-center gap-3" data-testid="text-detail-name">
                {fw.name}
              </h1>
              <div className="flex items-center gap-3">
                <Button 
                  onClick={handleStar} 
                  variant="outline" 
                  className="gap-2"
                  disabled={starMutation.isPending}
                  data-testid="btn-star"
                >
                  <Star className={`h-4 w-4 ${starMutation.isPending ? 'opacity-50' : ''}`} /> 
                  Star <Badge variant="secondary" className="ml-1">{fw.stars.toLocaleString()}</Badge>
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="icon" className="text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20" data-testid="btn-delete">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the framework
                        and all associated data.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90" data-testid="btn-confirm-delete">
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
            <p className="text-xl text-muted-foreground leading-relaxed" data-testid="text-detail-desc">
              {fw.description}
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              {fw.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-sm px-3 py-1 bg-secondary/60">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderCode className="h-5 w-5 text-primary" />
                Templates using {fw.name}
              </CardTitle>
              <CardDescription>Kickstart your next project with these community templates.</CardDescription>
            </CardHeader>
            <CardContent>
              {templatesLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="w-full h-16" />)}
                </div>
              ) : templates?.length ? (
                <div className="space-y-3">
                  {templates.map((template) => (
                    <Link key={template.id} href={`/templates/${template.id}`}>
                      <div className="p-4 rounded-lg border bg-card hover:bg-accent/5 hover:border-primary/40 transition-colors cursor-pointer group flex justify-between items-center gap-4">
                        <div>
                          <h4 className="font-semibold text-primary group-hover:underline underline-offset-4">{template.name}</h4>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{template.description}</p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
                  <p>No templates available for this framework yet.</p>
                  <Button asChild variant="link" className="mt-2 text-primary">
                    <Link href={`/submit?tab=template&frameworkId=${fw.id}`}>Submit a template</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Info */}
        <div className="w-full lg:w-80 space-y-6">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Scale className="h-4 w-4" /> License
                </div>
                <div className="font-mono bg-muted px-2 py-1 rounded text-sm w-fit" data-testid="text-detail-license">{fw.license}</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" /> Category
                </div>
                <div className="capitalize">{fw.category}</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Download className="h-4 w-4" /> Weekly Downloads
                </div>
                <div className="font-semibold">{fw.weeklyDownloads.toLocaleString()}</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">Added to PyHub</div>
                <div className="text-sm">{format(new Date(fw.createdAt), 'MMM d, yyyy')}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {fw.githubUrl && (
                <a href={fw.githubUrl} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 rounded-md bg-muted/50 hover:bg-muted transition-colors text-sm font-medium" data-testid="link-github">
                  <SiGithub className="h-5 w-5" /> GitHub Repository
                  <ExternalLink className="h-3 w-3 ml-auto opacity-50" />
                </a>
              )}
              {fw.pypiUrl && (
                <a href={fw.pypiUrl} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 rounded-md bg-muted/50 hover:bg-muted transition-colors text-sm font-medium" data-testid="link-pypi">
                  <SiPypi className="h-5 w-5 text-[#3775A9]" /> PyPI Package
                  <ExternalLink className="h-3 w-3 ml-auto opacity-50" />
                </a>
              )}
              {fw.officialUrl && (
                <a href={fw.officialUrl} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-sm font-medium" data-testid="link-official">
                  <BookOpen className="h-5 w-5" /> Official Documentation
                  <ExternalLink className="h-3 w-3 ml-auto opacity-50" />
                </a>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
