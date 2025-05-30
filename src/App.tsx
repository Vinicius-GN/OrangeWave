
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { PortfolioProvider } from "./contexts/PortfolioContext";
import { CartProvider } from "./contexts/CartContext";
import { ThemeProvider } from "next-themes";
import SupabaseInitializer from "./components/SupabaseInitializer";

// Pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PasswordRecovery from "./pages/PasswordRecovery";
import Dashboard from "./pages/Dashboard";
import Market from "./pages/Market";
import AssetDetail from "./pages/AssetDetail";
import Orders from "./pages/Orders";
import Wallet from "./pages/Wallet";
import Profile from "./pages/Profile";
import Help from "./pages/Help";
import About from "./pages/About";
import News from "./pages/News";
import NewsArticle from "./pages/NewsArticle";
import Cart from "./pages/Cart";
import Simulation from "./pages/Simulation";
import NotFound from "./pages/NotFound";

// Admin Pages
import AdminDashboard from "./pages/admin/Dashboard";
import AdminStocks from "./pages/admin/Stocks";
import AdminUsers from "./pages/admin/Users";
import AdminCarts from "./pages/admin/Carts";
import AdminTransactions from "./pages/admin/Transactions";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <PortfolioProvider>
          <CartProvider>
            <TooltipProvider>
              <SupabaseInitializer />
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/password-recovery" element={<PasswordRecovery />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/market" element={<Market />} />
                  <Route path="/asset/:id" element={<AssetDetail />} />
                  <Route path="/orders" element={<Orders />} />
                  <Route path="/wallet" element={<Wallet />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/help" element={<Help />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/news" element={<News />} />
                  <Route path="/news/article/:id" element={<NewsArticle />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/simulation" element={<Simulation />} />
                  
                  {/* Admin Routes */}
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/admin/stocks" element={<AdminStocks />} />
                  <Route path="/admin/users" element={<AdminUsers />} />
                  <Route path="/admin/carts" element={<AdminCarts />} />
                  <Route path="/admin/transactions" element={<AdminTransactions />} />
                  
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </CartProvider>
        </PortfolioProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
