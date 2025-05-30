
import React, { ReactNode, useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LineChart,
  BarChart,
  Newspaper,
  Home,
  Wallet,
  Users,
  HelpCircle,
  Menu,
  X,
  ChevronDown,
  Flame,
  User,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { Badge } from "@/components/ui/badge";
import CartButton from "@/components/CartButton";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface LayoutProps {
  children: ReactNode;
}

type NavigationItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
  badge?: string;
  hideWhenLoggedIn?: boolean;
  hideWhenLoggedOut?: boolean;
};

const navigationItems: NavigationItem[] = [
  {
    href: "/",
    label: "Home",
    icon: <Home className="h-4 w-4" />,
    hideWhenLoggedIn: true,
  },
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: <LineChart className="h-4 w-4" />,
    hideWhenLoggedOut: true,
  },
  {
    href: "/market",
    label: "Market",
    icon: <BarChart className="h-4 w-4" />,
    hideWhenLoggedOut: true,
  },
  {
    href: "/orders",
    label: "Orders",
    icon: <LineChart className="h-4 w-4" />,
    hideWhenLoggedOut: true,
  },
  {
    href: "/news",
    label: "News",
    icon: <Newspaper className="h-4 w-4" />,
    hideWhenLoggedOut: true,
    badge: "New",
  },
  {
    href: "/simulation",
    label: "Simulation",
    icon: <LineChart className="h-4 w-4" />,
    hideWhenLoggedOut: true,
  },
  {
    href: "/wallet",
    label: "Wallet",
    icon: <Wallet className="h-4 w-4" />,
    hideWhenLoggedOut: true,
  },
  {
    href: "/admin",
    label: "Admin Panel",
    icon: <Users className="h-4 w-4" />,
    adminOnly: true,
    hideWhenLoggedOut: true,
  },
  {
    href: "/help",
    label: "Help",
    icon: <HelpCircle className="h-4 w-4" />,
    hideWhenLoggedOut: true,
  },
];

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const isMobile = useIsMobile();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Check if the user is an admin
  const isAdmin = user?.id?.includes('admin') || false;

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Filter navigation items based on auth status
  const filteredNavItems = navigationItems.filter(item => {
    if (item.adminOnly && !isAdmin) return false;
    if (isAuthenticated && item.hideWhenLoggedIn) return false;
    if (!isAuthenticated && item.hideWhenLoggedOut) return false;
    return true;
  });

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
        <div className="container flex h-14 items-center">
          <Link to={isAuthenticated ? "/dashboard" : "/"} className="flex items-center">
            <Flame className="text-primary h-6 w-6" />
            <span className="ml-2 font-bold">OrangeWave</span>
          </Link>

          {/* Desktop Navigation */}
          {!isMobile && (
            <nav className="flex-1 mx-6">
              <ul className="hidden md:flex md:gap-1">
                {filteredNavItems.map((item) => (
                  <li key={item.href}>
                    <Link
                      to={item.href}
                      className={`flex items-center px-3 py-2 text-sm rounded-md hover:bg-secondary transition-colors ${
                        location.pathname === item.href
                          ? "bg-secondary"
                          : ""
                      }`}
                    >
                      {item.icon}
                      <span className="ml-2">{item.label}</span>
                      {item.badge && (
                        <Badge className="ml-2 bg-primary text-primary-foreground">
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}

          <div className="flex flex-1 items-center justify-end space-x-2 md:flex-none">
            {/* Cart Button */}
            {isAuthenticated && (
              <CartButton />
            )}

            {/* User Menu */}
            {isAuthenticated ? (
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    className="flex items-center space-x-1 rounded-full bg-secondary/50 p-2 text-sm hover:bg-secondary transition-colors"
                  >
                    <User className="h-4 w-4" />
                    {!isMobile && (
                      <>
                        <span>{user?.name}</span>
                        <ChevronDown className="h-3 w-3" />
                      </>
                    )}
                  </button>
                </PopoverTrigger>

                <PopoverContent className="z-50 w-56 p-0">
                  <div className="p-2 text-sm">
                    <p className="font-medium">{user?.name}</p>
                    <p className="text-muted-foreground">{user?.email}</p>
                  </div>
                  <div className="border-t my-1"></div>
                  <button
                    className="flex w-full items-center rounded-md p-2 text-sm text-destructive hover:bg-accent"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </button>
                </PopoverContent>
              </Popover>
            ) : (
              <div className="space-x-2">
                <Link
                  to="/login"
                  className="text-sm underline-offset-4 hover:underline"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            {isMobile && (
              <button
                className="ml-1 rounded-md p-2 text-muted-foreground hover:bg-accent"
                onClick={toggleMobileMenu}
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      {isMobile && isMobileMenuOpen && (
        <div className="fixed inset-0 top-14 z-40 bg-background border-t">
          <nav className="container py-4">
            <ul className="space-y-2">
              {filteredNavItems.map((item) => (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    className={`flex items-center px-3 py-4 text-lg rounded-md hover:bg-secondary transition-colors ${
                      location.pathname === item.href ? "bg-secondary" : ""
                    }`}
                  >
                    {item.icon}
                    <span className="ml-3">{item.label}</span>
                    {item.badge && (
                      <Badge className="ml-2">{item.badge}</Badge>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
            {isAuthenticated && (
              <>
                <div className="border-t my-4"></div>
                <div className="space-y-2">
                  <Link
                    to="/profile"
                    className="flex items-center px-3 py-4 text-lg rounded-md hover:bg-secondary transition-colors"
                  >
                    <User className="h-4 w-4" />
                    <span className="ml-3">Profile</span>
                  </Link>
                  <button
                    className="flex w-full items-center px-3 py-4 text-lg rounded-md hover:bg-secondary transition-colors text-destructive"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="ml-3">Logout</span>
                  </button>
                </div>
              </>
            )}
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            &copy; {new Date().getFullYear()} OrangeWave. All rights reserved.
          </p>
          <div className="flex items-center gap-3">
            <Link to="/about" className="text-sm text-muted-foreground hover:underline underline-offset-4">
              About
            </Link>
            <Link to="/help" className="text-sm text-muted-foreground hover:underline underline-offset-4">
              Help
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
