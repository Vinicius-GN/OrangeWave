/**
 * @file Layout.tsx
 * @brief Main layout wrapper component for the OrangeWave trading platform.
 *
 * This component defines the overall page structure, including:
 *  - A sticky, responsive header with navigation links
 *  - Authentication-aware user menu and CartButton
 *  - Role-based navigation items (admin vs. regular user vs. guest)
 *  - A mobile-friendly hamburger menu that toggles a full-screen nav drawer
 *  - React Router integration for internal page routing
 *  - A main content area where child pages are rendered
 *  - A footer with institutional links and copyright notice
 *
 * The header applies a backdrop blur effect, and navigation items
 * dynamically show or hide based on the user's authentication status and role.
 */

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

/**
 * @interface LayoutProps
 * @brief Props for the Layout component.
 *
 * @param children  The React nodes (pages) to render inside the layout.
 */
interface LayoutProps {
  children: ReactNode;
}

/**
 * @typedef NavigationItem
 * @brief Defines a single navigation menu item.
 *
 * @param href               The route path to link to.
 * @param label              The displayed text for the menu item.
 * @param icon               The icon component to display alongside the label.
 * @param adminOnly?         When true, only visible to users with the "admin" role.
 * @param badge?             Optional badge text (e.g., "New") shown next to the label.
 * @param hideWhenLoggedIn?  When true, hides this item if the user is authenticated.
 * @param hideWhenLoggedOut? When true, hides this item if the user is not authenticated.
 */
type NavigationItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
  badge?: string;
  hideWhenLoggedIn?: boolean;
  hideWhenLoggedOut?: boolean;
};

/**
 * @brief Central configuration for all navigation items.
 *
 * This array is filtered at runtime based on the current user's
 * authentication status and role. Each item can include badges,
 * role restrictions, and conditional visibility flags.
 */
const navigationItems: NavigationItem[] = [
  {
    href: "/",
    label: "Home",
    icon: <Home className="h-4 w-4" />,
    hideWhenLoggedIn: true,   /**< Only show to unauthenticated users */
  },
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: <LineChart className="h-4 w-4" />,
    hideWhenLoggedOut: true,  /**< Only show to authenticated users */
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
    badge: "New",            /**< Draw attention to new articles */
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
    adminOnly: true,         /**< Visible only to admin users */
    hideWhenLoggedOut: true,
  },
  {
    href: "/help",
    label: "Help",
    icon: <HelpCircle className="h-4 w-4" />,
    hideWhenLoggedOut: true,
  },
];

/**
 * @brief Layout component that wraps all pages.
 *
 * Provides a responsive header, user menu, mobile navigation drawer,
 * main content container, and footer. Navigation items are filtered
 * by authentication status and user role. The header remains sticky
 * at the top with a blur backdrop.
 *
 * @param props.children The page content to render inside the layout.
 * @returns JSX.Element The complete layout structure.
 */
const Layout: React.FC<LayoutProps> = ({ children }) => {
  // Hooks for routing and authentication context
  const location = useLocation();          
  const navigate = useNavigate();          
  const { user, isAuthenticated, logout } = useAuth();
  const isMobile = useIsMobile();          

  // State controlling the mobile menu open/close
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  /** @brief Boolean indicating if the current user has the "admin" role. */
  const isAdmin = user?.role === "admin";

  /**
   * @brief Close the mobile nav drawer automatically when the route changes.
   *
   * This effect watches the pathname and resets `isMobileMenuOpen` to false
   * whenever the user navigates to a new page.
   */
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  /**
   * @brief Toggle the mobile menu open or closed.
   *
   * Called when the hamburger or close icon is clicked.
   */
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  /**
   * @brief Log out the current user and redirect to the login screen.
   *
   * Invokes the `logout` function from AuthContext, then uses
   * React Router's `navigate` to send the user to "/login".
   */
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  /**
   * @brief Filter the navigation items based on auth state and role.
   *
   * Removes items that:
   *  - require admin role when user is not admin
   *  - should be hidden when logged in/out based on flags
   *
   * @returns NavigationItem[] The array of items visible to the current user.
   */
  const filteredNavItems = navigationItems.filter((item) => {
    if (item.adminOnly && !isAdmin) return false;
    if (isAuthenticated && item.hideWhenLoggedIn) return false;
    if (!isAuthenticated && item.hideWhenLoggedOut) return false;
    return true;
  });

  return (
    <div className="flex min-h-screen flex-col">
      {/* ========================= Header ========================= */}
      <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-40">
        <div className="container flex h-14 items-center">
          {/* Logo: links to home or dashboard depending on auth */}
          <Link to={isAuthenticated ? "/dashboard" : "/"} className="flex items-center">
            <Flame className="text-primary h-6 w-6" />
            <span className="ml-2 font-bold">OrangeWave</span>
          </Link>

          {/* Desktop navigation: hidden on mobile */}
          {!isMobile && (
            <nav className="flex-1 mx-6">
              <ul className="hidden md:flex md:gap-1">
                {filteredNavItems.map((item) => (
                  <li key={item.href}>
                    <Link
                      to={item.href}
                      className={`flex items-center px-3 py-2 text-sm rounded-md hover:bg-secondary transition-colors ${
                        location.pathname === item.href ? "bg-secondary" : ""
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

          {/* Right-aligned actions: Cart, Profile / Auth links, Mobile menu toggle */}
          <div className="flex flex-1 items-center justify-end space-x-2 md:flex-none">
            {/* Cart button only for authenticated users */}
            {isAuthenticated && <CartButton />}

            {/* User profile dropdown or Sign In / Sign Up links */}
            {isAuthenticated ? (
              <Popover>
                <PopoverTrigger asChild>
                  <button className="flex items-center space-x-1 rounded-full bg-secondary/50 p-2 text-sm hover:bg-secondary transition-colors">
                    <User className="h-4 w-4" />
                    {!isMobile && (
                      <>
                        <span>{user?.fullName}</span>
                        <ChevronDown className="h-3 w-3" />
                      </>
                    )}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="z-50 w-56 p-0">
                  {/* Profile summary */}
                  <div className="p-2 text-sm">
                    <p className="font-medium">{user?.fullName}</p>
                    <p className="text-muted-foreground">{user?.email}</p>
                  </div>
                  <div className="border-t my-1" />
                  {/* Logout button */}
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
                <Link to="/login" className="text-sm underline-offset-4 hover:underline">
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

            {/* Mobile menu toggle button (hamburger / close icon) */}
            {isMobile && (
              <button
                className="ml-1 rounded-md p-2 text-muted-foreground hover:bg-accent"
                onClick={toggleMobileMenu}
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ====================== Mobile Navigation Drawer ====================== */}
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
                    {item.badge && <Badge className="ml-2">{item.badge}</Badge>}
                  </Link>
                </li>
              ))}
            </ul>
            {/* Profile & Logout in mobile drawer */}
            {isAuthenticated && (
              <>
                <div className="border-t my-4" />
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

      {/* ====================== Main Content Area ====================== */}
      <main className="flex-1">{children}</main>

      {/* =========================== Footer =========================== */}
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
          {/* Copyright */}
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            &copy; {new Date().getFullYear()} OrangeWave. All rights reserved.
          </p>
          {/* Institutional links */}
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
