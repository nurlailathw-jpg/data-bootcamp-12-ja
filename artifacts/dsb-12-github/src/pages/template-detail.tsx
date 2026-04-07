import { useParams, useLocation, Link } from "wouter";
import { 
  useGetTemplate,
  getGetTemplateQueryKey,
  useDeleteTemplate,
  getListTemplatesQueryKey,
  useGetFramework
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ArrowLeft, 
  Trash2, 
  FolderCode, 
  ExternalLink,
  Code2,
  Users,
  Calendar,
  Layers
} from "lucide-react";
import { SiGithub } from "react-icons/si";
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

export default function TemplateDetailPage() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const templateId = parseInt(id || "0", 10);

  const { data: tpl, isLoading: tplLoading, error } = useGetTemplate(templateId, {
    query: {
      enabled: !!templateId,
      queryKey: getGetTemplateQueryKey(templateId)
    }
  });

  const { data: framework } = useGetFramework(tpl?.frameworkId || 0, {
    query: { enabled: !!tpl?.frameworkId }
  });

  const deleteMutation = useDeleteTemplate();

  const handleDelete = () => {
    deleteMutation.mutate({ id: templateId }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListTemplatesQueryKey() });
        toast({
          title: "Deleted",
          description: "Template deleted successfully.",
        });
        setLocation("/templates");
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to delete template.",
          variant: "destructive"
        });
      }
    });
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-20 text-center max-w-md">
        <h2 className="text-2xl font-bold mb-2">Template not found</h2>
        <p className="text-muted-foreground mb-6">The template you're looking for doesn't exist.</p>
        <Button asChild>
          <Link href="/templates">Back to Templates</Link>
        </Button>
      </div>
    );
  }

  if (tplLoading || !tpl) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl space-y-8">
        <Skeleton className="w-24 h-10" />
        <Skeleton className="w-full h-[300px] rounded-xl" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl space-y-8">
      <Button variant="ghost" asChild className="pl-0 hover:bg-transparent hover:text-primary">
        <Link href="/templates">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Templates
        </Link>
      </Button>

      <Card className="border-2">
        <CardContent className="p-8 md:p-10 flex flex-col md:flex-row gap-8">
          <div className="flex-1 space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Link href={`/frameworks/${tpl.frameworkId}`}>
                  <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 hover:bg-primary/10 transition-colors cursor-pointer text-sm py-1" data-testid="link-fw-badge">
                    {tpl.frameworkName}
                  </Badge>
                </Link>
                <Badge variant={
                  tpl.difficulty === 'beginner' ? 'secondary' : 
                  tpl.difficulty === 'intermediate' ? 'default' : 'destructive'
                } className="capitalize text-xs">
                  {tpl.difficulty}
                </Badge>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-primary" data-testid="text-tpl-detail-name">
                {tpl.name}
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed" data-testid="text-tpl-detail-desc">
                {tpl.description}
              </p>
            </div>

            <div className="flex flex-wrap gap-6 pt-4 border-t">
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                  <Code2 className="h-4 w-4" /> Language
                </div>
                <div className="font-semibold text-foreground">{tpl.language}</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                  <Users className="h-4 w-4" /> Uses
                </div>
                <div className="font-semibold text-foreground">{tpl.useCount.toLocaleString()}</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" /> Added
                </div>
                <div className="font-semibold text-foreground">{format(new Date(tpl.createdAt), 'MMM d, yyyy')}</div>
              </div>
            </div>

            <div className="pt-6 flex flex-wrap gap-4">
              {tpl.repoUrl ? (
                <Button asChild size="lg" className="gap-2">
                  <a href={tpl.repoUrl} target="_blank" rel="noreferrer" data-testid="link-tpl-repo">
                    <SiGithub className="h-5 w-5" />
                    Use Template
                    <ExternalLink className="h-4 w-4 ml-1" />
                  </a>
                </Button>
              ) : (
                <Button size="lg" disabled className="gap-2">
                  <SiGithub className="h-5 w-5" />
                  Repository Missing
                </Button>
              )}
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="lg" className="text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20 ml-auto" data-testid="btn-delete-tpl">
                    <Trash2 className="h-4 w-4 mr-2" /> Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Template</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to remove this template? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90" data-testid="btn-confirm-delete-tpl">
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
          
          {framework && (
            <div className="w-full md:w-64 flex-shrink-0">
              <div className="bg-muted/30 border rounded-xl p-5 space-y-4">
                <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Framework Info</h3>
                <div className="space-y-2">
                  <div className="font-bold text-lg">{framework.name}</div>
                  <p className="text-sm text-muted-foreground line-clamp-3">{framework.description}</p>
                </div>
                <Button variant="secondary" className="w-full" asChild>
                  <Link href={`/frameworks/${framework.id}`}>View Framework</Link>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
