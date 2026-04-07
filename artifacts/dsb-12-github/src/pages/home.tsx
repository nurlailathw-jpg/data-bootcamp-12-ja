import { useGetStatsSummary, useGetTrendingFrameworks, useListTemplates, useGetStatsByCategory } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, Download, BarChart3, Database, Layers, TrendingUp, ChevronRight, FolderCode } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function Home() {
  const { data: stats, isLoading: statsLoading } = useGetStatsSummary();
  const { data: trending, isLoading: trendingLoading } = useGetTrendingFrameworks();
  const { data: templates, isLoading: templatesLoading } = useListTemplates({ limit: 4 } as any);
  const { data: categoryStats, isLoading: categoryStatsLoading } = useGetStatsByCategory();

  return (
    <div className="min-h-screen flex flex-col w-full">
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 space-y-12">
        {/* Hero Section */}
        <section className="py-12 md:py-20 flex flex-col items-center text-center space-y-6">
          <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground">
            Python Ecosystem Hub
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-primary">
            Discover. Build. Deploy.
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-[800px]">
            The definitive directory of Python frameworks, libraries, and project templates. Curated by the community, for the community.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Button asChild size="lg" className="h-12 px-8 text-base">
              <Link href="/frameworks" data-testid="btn-explore-frameworks">Explore Frameworks</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 px-8 text-base">
              <Link href="/templates" data-testid="btn-browse-templates">Browse Templates</Link>
            </Button>
          </div>
        </section>

        {/* Stats Section */}
        <section>
          {statsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-32 w-full rounded-xl" />
              ))}
            </div>
          ) : stats ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Frameworks</CardTitle>
                  <Database className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="stat-total-frameworks">{stats.totalFrameworks}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Project Templates</CardTitle>
                  <Layers className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="stat-total-templates">{stats.totalTemplates}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Stars</CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="stat-total-stars">{stats.totalStars.toLocaleString()}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Top Category</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold capitalize truncate" data-testid="stat-top-category">{stats.mostPopularCategory}</div>
                </CardContent>
              </Card>
            </div>
          ) : null}
        </section>

        {/* Two Column Layout for Trending and Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Trending Frameworks */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <h2 className="text-2xl font-semibold tracking-tight">Trending Frameworks</h2>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/frameworks" className="flex items-center">
                  View All <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
            
            {trendingLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full rounded-xl" />
                ))}
              </div>
            ) : trending?.length ? (
              <div className="space-y-4">
                {trending.slice(0, 5).map((framework) => (
                  <Link key={framework.id} href={`/frameworks/${framework.id}`}>
                    <Card className="hover:border-primary/50 hover:shadow-sm transition-all cursor-pointer">
                      <CardContent className="p-4 flex flex-col sm:flex-row justify-between gap-4">
                        <div className="space-y-1">
                          <h3 className="font-semibold text-lg text-primary" data-testid={`text-framework-name-${framework.id}`}>{framework.name}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-1">{framework.description}</p>
                          <div className="flex items-center gap-2 pt-1 text-xs font-mono text-muted-foreground">
                            <span className="px-1.5 py-0.5 bg-muted rounded-md">{framework.category}</span>
                            <span>v{framework.version}</span>
                          </div>
                        </div>
                        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-4 sm:gap-1 text-sm font-medium">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                            <span data-testid={`text-framework-stars-${framework.id}`}>{framework.stars.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Download className="w-3 h-3" />
                            <span>{framework.weeklyDownloads > 1000 ? `${(framework.weeklyDownloads / 1000).toFixed(1)}k` : framework.weeklyDownloads}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground bg-muted/20 rounded-xl border border-dashed">
                No trending frameworks found.
              </div>
            )}
          </section>

          {/* Categories Chart */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold tracking-tight">Ecosystem Distribution</h2>
            <Card className="h-[400px] flex flex-col">
              <CardContent className="p-6 flex-1">
                {categoryStatsLoading ? (
                  <Skeleton className="w-full h-full" />
                ) : categoryStats?.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoryStats} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="category" 
                        tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} 
                        axisLine={false} 
                        tickLine={false}
                        angle={-45}
                        textAnchor="end"
                      />
                      <YAxis 
                        tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} 
                        axisLine={false} 
                        tickLine={false} 
                      />
                      <Tooltip 
                        cursor={{ fill: 'hsl(var(--muted)/0.5)' }}
                        contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))', borderRadius: 'var(--radius)', color: 'hsl(var(--popover-foreground))' }}
                      />
                      <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    No data available
                  </div>
                )}
              </CardContent>
            </Card>
          </section>
        </div>

        {/* Recent Templates */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FolderCode className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-semibold tracking-tight">Recent Templates</h2>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/templates" className="flex items-center">
                View All <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {templatesLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-40 w-full rounded-xl" />
              ))
            ) : templates?.length ? (
              templates.map((template) => (
                <Link key={template.id} href={`/templates/${template.id}`}>
                  <Card className="h-full hover:border-primary/50 hover:shadow-sm transition-all cursor-pointer flex flex-col">
                    <CardHeader className="p-4 pb-2">
                      <div className="flex justify-between items-start gap-2">
                        <CardTitle className="text-base line-clamp-1 text-primary" data-testid={`text-template-name-${template.id}`}>
                          {template.name}
                        </CardTitle>
                      </div>
                      <CardDescription className="line-clamp-2 text-xs">
                        {template.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 mt-auto">
                      <div className="flex flex-wrap gap-2 text-xs font-mono">
                        <span className="px-1.5 py-0.5 bg-primary/10 text-primary rounded-md">
                          {template.frameworkName}
                        </span>
                        <span className="px-1.5 py-0.5 bg-muted rounded-md text-muted-foreground">
                          {template.language}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-muted-foreground bg-muted/20 rounded-xl border border-dashed">
                No templates found.
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
