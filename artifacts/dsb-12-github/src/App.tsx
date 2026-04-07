import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import FrameworksPage from "@/pages/frameworks";
import FrameworkDetailPage from "@/pages/framework-detail";
import TemplatesPage from "@/pages/templates";
import TemplateDetailPage from "@/pages/template-detail";
import SubmitPage from "@/pages/submit";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const queryClient = new QueryClient();

function Router() {
  return (
    <div className="min-h-screen flex flex-col w-full bg-background font-sans text-foreground">
      <Navbar />
      <div className="flex-1 flex flex-col w-full">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/frameworks" component={FrameworksPage} />
          <Route path="/frameworks/:id" component={FrameworkDetailPage} />
          <Route path="/templates" component={TemplatesPage} />
          <Route path="/templates/:id" component={TemplateDetailPage} />
          <Route path="/submit" component={SubmitPage} />
          <Route component={NotFound} />
        </Switch>
      </div>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
