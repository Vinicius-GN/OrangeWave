/**
 * @file AdminLayout.tsx
 * @brief React layout component for admin pages with sidebar navigation and access control.
 *
 * This component:
 *  - Verifies authentication and admin privileges (role or specific email)
 *  - Redirects non-authenticated or non-admin users appropriately
 *  - Renders a sidebar with navigation buttons for admin actions:
 *      - Overview dashboard
 *      - Asset management
 *      - User management
 *      - Transaction history
 *      - Logout
 *  - Displays a header with page title and optional description
 *  - Wraps arbitrary child content in the main area
 */

import React, { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  Users,
  BarChart3,
  Package,
  ReceiptText
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';

/**
 * @interface AdminLayoutProps
 * @brief Props accepted by the AdminLayout component.
 *
 * @param children     ReactNode content to render within the layout’s main area.
 * @param title        Title string displayed at the top of the main content.
 * @param description  Optional description text rendered under the title.
 */
interface AdminLayoutProps {
  children: ReactNode;
  title: string;
  description?: string;
}

/**
 * @brief Utility function to determine if a user has admin privileges.
 *
 * Checks for either an "admin" role or a specific admin email address.
 *
 * @param user  User object from authentication context.
 * @returns boolean  True if the user is considered an admin.
 */
const isAdmin = (user: any): boolean => {
  return user?.role === 'admin' || user?.email === 'admin@gmail.com';
};

/**
 * @brief React component that enforces admin access and renders the admin dashboard layout.
 *
 * On mount and when authentication/user state changes:
 *  - Redirects to /login if the user is not authenticated.
 *  - Redirects to / if the user is authenticated but lacks admin privileges.
 *
 * Renders:
 *  - A sidebar with navigation buttons wrapped in a Card
 *  - A header section with a title and description
 *  - The children passed as main page content
 *
 * @param props  AdminLayoutProps including children, title, and optional description.
 * @returns JSX.Element|null  The admin layout UI or null during redirects.
 */
const AdminLayout: React.FC<AdminLayoutProps> = ({
  children,
  title,
  description
}) => {
  /** @brief Authentication context providing user, isAuthenticated flag, and logout method. */
  const { user, isAuthenticated, logout } = useAuth();

  /** @brief React Router navigation hook for programmatic navigation. */
  const navigate = useNavigate();

  /**
   * @brief Handle user logout action.
   *
   * Calls the logout function from AuthContext and navigates to the login page.
   */
  const handleLogout = (): void => {
    logout();
    navigate('/login');
  };

  /**
   * @brief Effect to enforce authentication and admin privileges.
   *
   * - If not authenticated, navigate to /login
   * - If authenticated but not an admin, navigate to /
   *
   * Dependencies trigger on changes to isAuthenticated, user, and navigate.
   */
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else if (user && !isAdmin(user)) {
      navigate('/');
    }
  }, [isAuthenticated, user, navigate]);

  /**
   * @brief While redirecting, render nothing to avoid flashing UI.
   *
   * Returns null if the user is not authenticated or lacks admin privileges.
   */
  if (!isAuthenticated || !user || !isAdmin(user)) {
    return null;
  }

  /**
   * @section Render layout structure
   * The layout consists of:
   *  - A full-screen background container
   *  - A two-column grid on desktop: sidebar (3 cols) + main (9 cols)
   *  - Sidebar: card with header, description, and scrollable button list
   *  - Main: page header (title + description) and dynamic children content
   */
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto py-8 px-4 lg:mr-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/** Sidebar - Card containing admin navigation */}
          <Card className="md:col-span-3 w-fit md:w-auto md:max-w-[300px]">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2 flex-shrink-0" />
                Admin Dashboard
              </CardTitle>
              <CardDescription>
                Manage assets, users, and transactions
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {/** Scrollable area for navigation buttons */}
              <ScrollArea className="h-fit md:h-[calc(100vh-300px)]">
                <div className="p-4 space-y-1">
                  {/** Overview button */}
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => navigate('/admin')}
                  >
                    <BarChart3 className="h-4 w-4 mr-2 flex-shrink-0" />
                    Overview
                  </Button>
                  {/** Manage Assets button */}
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => navigate('/admin/stocks')}
                  >
                    <Package className="h-4 w-4 mr-2 flex-shrink-0" />
                    Manage Assets
                  </Button>
                  {/** Manage Users button */}
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => navigate('/admin/users')}
                  >
                    <Users className="h-4 w-4 mr-2 flex-shrink-0" />
                    Manage Users
                  </Button>
                  {/** Transactions button */}
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => navigate('/admin/transactions')}
                  >
                    <ReceiptText className="h-4 w-4 mr-2 flex-shrink-0" />
                    Transactions
                  </Button>
                  {/** Logout button */}
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={handleLogout}
                  >
                    <Users className="h-4 w-4 mr-2 flex-shrink-0" />
                    Logout
                  </Button>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/** Main content column */}
          <div className="md:col-span-9">
            {/** Page header with title and optional description */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold mb-1">{title}</h1>
              {description && (
                <p className="text-muted-foreground">{description}</p>
              )}
            </div>
            {/** Render the children content passed into AdminLayout */}
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
