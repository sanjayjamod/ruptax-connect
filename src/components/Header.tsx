import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FileText, User, Shield } from "lucide-react";

const Header = () => {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-primary">
            <FileText className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-bold text-foreground">RupTax</span>
        </Link>

        <nav className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/client-login" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Client Login
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link to="/admin-login" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Admin
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
