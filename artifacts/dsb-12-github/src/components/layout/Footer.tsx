import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="border-t bg-muted/20 mt-auto">
      <div className="container mx-auto py-8 px-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex flex-col items-center md:items-start gap-2">
          <p className="text-sm text-muted-foreground font-medium">PyHub &copy; {new Date().getFullYear()}</p>
          <p className="text-xs text-muted-foreground">The public Python Developer Frameworks Hub.</p>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <Link href="/frameworks" className="hover:text-foreground transition-colors" data-testid="link-footer-frameworks">Frameworks</Link>
          <Link href="/templates" className="hover:text-foreground transition-colors" data-testid="link-footer-templates">Templates</Link>
          <Link href="/submit" className="hover:text-foreground transition-colors" data-testid="link-footer-submit">Submit</Link>
        </div>
      </div>
    </footer>
  );
}
