import { useEffect, useState } from 'react';
import { Users, ShoppingCart, TrendingUp, Package } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

const API_URL = 'http://localhost:3001/api';

const AdminDashboard = () => {
  const [usersCount, setUsersCount] = useState(0);
  const [ordersCount, setOrdersCount] = useState(0);
  const [assetsCount, setAssetsCount] = useState(0);
  const [totalQuantitySold, setTotalQuantitySold] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth(); // mantido para autenticação, mesmo que não seja usado diretamente aqui

  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      setIsLoading(true);
      try {
        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        };

        // Fetch users count
        const usersResponse = await fetch(`${API_URL}/users`, { headers });
        if (usersResponse.ok) {
          const users = await usersResponse.json();
          setUsersCount(Array.isArray(users) ? users.length : 0);
        }

        // Fetch orders count
        const ordersResponse = await fetch(`${API_URL}/orders`, { headers });
        if (ordersResponse.ok) {
          const orders = await ordersResponse.json();
          setOrdersCount(Array.isArray(orders) ? orders.length : 0);
        }

        // Fetch assets and calculate total quantity sold
        const assetsResponse = await fetch(`${API_URL}/assets`, { headers });
        if (assetsResponse.ok) {
          const assets = await assetsResponse.json();
          setAssetsCount(Array.isArray(assets) ? assets.length : 0);

          const totalSold = assets.reduce(
            (sum: number, asset: any) =>
              sum + (asset.quantityBougth || asset.quantityBought || 0),
            0
          );
          setTotalQuantitySold(totalSold);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast({
          title: "Error",
          description: "Failed to load dashboard data",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [toast]);

  return (
    <AdminLayout
      title="Admin Dashboard"
      description="Overview of platform statistics and management tools"
    >
      {/* 4 cards em duas colunas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {/* Total Assets */}
        <Card>
          <CardContent className="flex items-start pt-6">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mr-4">
              <Package className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Assets</p>
              <h3 className="text-2xl font-bold">
                {isLoading ? '...' : assetsCount}
              </h3>
              <Button
                variant="link"
                className="p-0 h-auto text-xs"
                onClick={() => navigate('/admin/stocks')}
              >
                Manage Assets
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Total Users */}
        <Card>
          <CardContent className="flex items-start pt-6">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mr-4">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Users</p>
              <h3 className="text-2xl font-bold">
                {isLoading ? '...' : usersCount}
              </h3>
              <Button
                variant="link"
                className="p-0 h-auto text-xs"
                onClick={() => navigate('/admin/users')}
              >
                Manage Users
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Total Orders */}
        <Card>
          <CardContent className="flex items-start pt-6">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mr-4">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Orders</p>
              <h3 className="text-2xl font-bold">
                {isLoading ? '...' : ordersCount}
              </h3>
              <Button
                variant="link"
                className="p-0 h-auto text-xs"
                onClick={() => navigate('/admin/transactions')}
              >
                View Orders
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Assets Sold */}
        <Card>
          <CardContent className="flex items-start pt-6">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mr-4">
              <ShoppingCart className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Assets Sold</p>
              <h3 className="text-2xl font-bold">
                {isLoading ? '...' : totalQuantitySold}
              </h3>
              <Button
                variant="link"
                className="p-0 h-auto text-xs"
                onClick={() => navigate('/admin/transactions')}
              >
                View Details
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
