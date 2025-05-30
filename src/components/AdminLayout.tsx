import React, { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Users, BarChart3, Package, ReceiptText } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
  description?: string;
}

// Define admin roles or special permission
const isAdmin = (user: any) => {
  // Check if user has admin role or is admin@gmail.com
  return user?.role === 'admin' || user?.email === 'admin@gmail.com';
};

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title, description }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Redirect to login if not authenticated, or to home if not an admin
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else if (user && !isAdmin(user)) {
      navigate('/');
    }
  }, [isAuthenticated, user, navigate]);
  
  if (!isAuthenticated || !user || !isAdmin(user)) {
    return null; // Don't render anything while redirecting
  }
  
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto py-8 px-4 lg:mr-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Sidebar */}
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
              <ScrollArea className="h-fit md:h-[calc(100vh-300px)]">
                <div className="p-4 space-y-1">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start" 
                    onClick={() => navigate('/admin')}
                  >
                    <BarChart3 className="h-4 w-4 mr-2 flex-shrink-0" />
                    Overview
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start" 
                    onClick={() => navigate('/admin/stocks')}
                  >
                    <Package className="h-4 w-4 mr-2 flex-shrink-0" />
                    Manage Assets
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start" 
                    onClick={() => navigate('/admin/users')}
                  >
                    <Users className="h-4 w-4 mr-2 flex-shrink-0" />
                    Manage Users
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start" 
                    onClick={() => navigate('/admin/transactions')}
                  >
                    <ReceiptText className="h-4 w-4 mr-2 flex-shrink-0" />
                    Transactions
                  </Button>

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
          
          {/* Main content */}
          <div className="md:col-span-9">
            {/* Page header */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold mb-1">{title}</h1>
              {description && (
                <p className="text-muted-foreground">{description}</p>
              )}
            </div>
            
            {/* Page content */}
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
