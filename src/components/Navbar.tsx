import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, UploadCloud } from "lucide-react";

const Navbar = () => {
  const { pathname } = useLocation();

  const linkClass = (path: string) =>
    `flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
      pathname === path
        ? "bg-primary text-primary-foreground"
        : "text-muted-foreground hover:text-foreground hover:bg-accent"
    }`;

  return (
    <header className="w-full border-b bg-card shadow-sm">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
        <img src="/logo.svg" alt="Support Hub" className="h-8" />
        <nav className="flex items-center gap-2">
          <Link to="/" className={linkClass("/")}>
            <UploadCloud className="h-4 w-4" />
            Subir nuevo archivo
          </Link>
          <Link to="/dashboard" className={linkClass("/dashboard")}>
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;

