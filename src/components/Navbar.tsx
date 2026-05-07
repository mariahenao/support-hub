import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, UploadCloud } from "lucide-react";

const Navbar = () => {
  const { pathname } = useLocation();

  const linkClass = (path: string) =>
    `flex items-center gap-2 px-4 py-2 rounded text-sm font-medium transition-colors ${
      pathname === path
        ? "bg-primary text-primary-foreground"
        : "text-muted-foreground hover:text-foreground hover:bg-accent"
    }`;

  return (
    <>
      <header className="w-full border-b bg-card shadow-sm h-[80px]">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 h-full">
          <img src="/logo.svg" alt="Support Hub" className="h-10" />
          <nav className="flex items-center gap-2">
            <Link to="/" className={linkClass("/")}>
              <UploadCloud className="h-4 w-4" />
              SUBIR NUEVO ARCHIVO
            </Link>
            <Link to="/dashboard" className={linkClass("/dashboard")}>
              <LayoutDashboard className="h-4 w-4" />
              DASHBOARD
            </Link>
          </nav>
        </div>
      </header>

      {/* Decorative separator using the requested image */}
      <div
        aria-hidden="true"
        className="w-full h-1.5"
        style={{
          backgroundImage: `url("https://tiendaregistrada.com.co/wp-content/uploads/2021/08/colores.png")`,
          backgroundRepeat: 'repeat-x',
          backgroundSize: 'auto 100%',
          backgroundPosition: 'center',
        }}
      />
    </>
  );
};

export default Navbar;
