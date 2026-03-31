import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Bike, Menu, X } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { to: "/", label: "Home" },
    { to: "/events", label: "Events" },
    ...(user ? [
      { to: "/create-event", label: "Create Event" },
      { to: "/profile", label: "Profile" },
    ] : []),
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <Bike className="h-8 w-8 text-primary" />
          <span className="font-heading text-xl font-bold text-foreground">
            Throttle <span className="text-gradient-fire">Up</span>
          </span>
        </Link>

        {/* Desktop */}
        <div className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                isActive(l.to)
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {l.label}
            </Link>
          ))}
          {user ? (
            <Button variant="outline" size="sm" onClick={() => signOut()} className="ml-2">
              Logout
            </Button>
          ) : (
            <Link to="/auth">
              <Button size="sm" className="ml-2 bg-gradient-fire text-primary-foreground hover:opacity-90">
                Get Started
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden text-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-border bg-background p-4 md:hidden">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setMobileOpen(false)}
              className={`block rounded-md px-4 py-3 text-sm font-medium ${
                isActive(l.to) ? "bg-primary/10 text-primary" : "text-muted-foreground"
              }`}
            >
              {l.label}
            </Link>
          ))}
          {user ? (
            <button onClick={() => { signOut(); setMobileOpen(false); }} className="mt-2 w-full rounded-md border border-border px-4 py-3 text-sm text-muted-foreground">
              Logout
            </button>
          ) : (
            <Link to="/auth" onClick={() => setMobileOpen(false)}>
              <div className="mt-2 rounded-md bg-gradient-fire px-4 py-3 text-center text-sm font-medium text-primary-foreground">
                Get Started
              </div>
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
