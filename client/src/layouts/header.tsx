import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/lib/auth-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Menu, Search, TrendingUp } from "lucide-react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header() {
  const [location, setLocation] = useLocation();
  const { user, logout, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/trending", label: "Trending", icon: TrendingUp },
    { href: "/teams", label: "Teams" },
    { href: "/players", label: "Players" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/">
            <div className="flex items-center gap-2 hover-elevate active-elevate-2 px-2 py-1 rounded-md cursor-pointer" data-testid="link-home">
              <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">S</span>
              </div>
              <span className="hidden md:inline text-xl font-bold">Sports Blog</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Button
                  key={link.href}
                  variant={location === link.href ? "secondary" : "ghost"}
                  className="gap-2"
                  onClick={() => setLocation(link.href)}
                  data-testid={`link-nav-${link.label.toLowerCase()}`}
                >
                  {Icon && <Icon className="h-4 w-4" />}
                  {link.label}
                </Button>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/search")} data-testid="button-search">
            <Search className="h-5 w-5" />
          </Button>

          <ThemeToggle />

          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full" data-testid="button-user-menu">
                  <Avatar>
                    <AvatarImage src={user?.avatar || ""} alt={user?.displayName} />
                    <AvatarFallback>{user?.displayName?.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex flex-col space-y-1 p-2">
                  <p className="text-sm font-medium" data-testid="text-user-name">{user?.displayName}</p>
                  <p className="text-xs text-muted-foreground" data-testid="text-user-email">{user?.email}</p>
                </div>
                <DropdownMenuSeparator />
                {(user?.role === "author" || user?.role === "editor" || user?.role === "admin") && (
                  <DropdownMenuItem onClick={() => setLocation("/dashboard")} data-testid="link-dashboard">
                    Dashboard
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => setLocation("/profile")} data-testid="link-profile">
                  Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} data-testid="button-logout">
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={() => setLocation("/login")} data-testid="button-login">Login</Button>
              <Button onClick={() => setLocation("/register")} data-testid="button-register">Sign Up</Button>
            </div>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            data-testid="button-mobile-menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-background p-4">
          <nav className="flex flex-col gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Button
                  key={link.href}
                  variant={location === link.href ? "secondary" : "ghost"}
                  className="w-full justify-start gap-2"
                  onClick={() => {
                    setLocation(link.href);
                    setMobileMenuOpen(false);
                  }}
                  data-testid={`link-mobile-${link.label.toLowerCase()}`}
                >
                  {Icon && <Icon className="h-4 w-4" />}
                  {link.label}
                </Button>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
