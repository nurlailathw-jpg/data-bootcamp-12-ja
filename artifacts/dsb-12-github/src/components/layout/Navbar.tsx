import { Link } from "wouter";
import { SiPython } from "react-icons/si";
import { BookOpen, FolderCode, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg text-primary hover:opacity-80 transition-opacity" data-testid="link-home">
            <SiPython className="w-6 h-6" />
            <span>PyHub</span>
          </Link>
          <div className="hidden md:flex gap-4">
            <Link href="/frameworks" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5" data-testid="link-nav-frameworks">
              <BookOpen className="w-4 h-4" />
              Frameworks
            </Link>
            <Link href="/templates" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5" data-testid="link-nav-templates">
              <FolderCode className="w-4 h-4" />
              Templates
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Button asChild size="sm" variant="default" className="hidden sm:flex" data-testid="btn-nav-submit">
            <Link href="/submit" className="flex items-center gap-1.5">
              <PlusCircle className="w-4 h-4" />
              Submit
            </Link>
          </Button>
          <Button asChild size="icon" variant="ghost" className="sm:hidden" data-testid="btn-nav-submit-mobile">
            <Link href="/submit">
              <PlusCircle className="w-5 h-5" />
            </Link>
          </Button>
        </div>
      </div>
    </nav>
  );
}
