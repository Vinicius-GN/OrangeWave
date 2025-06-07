
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';
import { PortfolioProvider } from '@/contexts/PortfolioContext';

// Public pages
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import PasswordRecovery from '@/pages/PasswordRecovery';

// Main app pages
import Index from '@/pages/Index';
import Dashboard from '@/pages/Dashboard';
import Market from '@/pages/Market';
import AssetDetail from '@/pages/AssetDetail';
import Wallet from '@/pages/Wallet';
import Orders from '@/pages/Orders';
import Simulation from '@/pages/Simulation';
import News from '@/pages/News';
import NewsArticle from '@/pages/NewsArticle';
import Help from '@/pages/Help';
import Profile from '@/pages/Profile';
import Cart from '@/pages/Cart';

// Admin pages
import AdminDashboard from '@/pages/admin/Dashboard';
import AdminUsers from '@/pages/admin/Users';
import AdminStocks from '@/pages/admin/Stocks';
import AdminTransactions from '@/pages/admin/Transactions';

import NotFound from '@/pages/NotFound';
import { Toaster } from '@/components/ui/toaster';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <PortfolioProvider>
          <Router>
            <div className="min-h-screen bg-background">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/password-recovery" element={<PasswordRecovery />} />
                
                <Route path="/" element={<Index />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/market" element={<Market />} />
                <Route path="/asset/:id" element={<AssetDetail />} />
                <Route path="/wallet" element={<Wallet />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/simulation" element={<Simulation />} />
                <Route path="/news" element={<News />} />
                <Route path="/news/:id" element={<NewsArticle />} />
                <Route path="/help" element={<Help />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/cart" element={<Cart />} />
                
                {/* Admin routes */}
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/users" element={<AdminUsers />} />
                <Route path="/admin/stocks" element={<AdminStocks />} />
                <Route path="/admin/transactions" element={<AdminTransactions />} />
                
                <Route path="*" element={<NotFound />} />
              </Routes>
              <Toaster />
            </div>
          </Router>
        </PortfolioProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
