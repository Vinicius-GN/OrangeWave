/**
 * Index (Home) Page Component
 * 
 * This component serves as the landing page for the OrangeWave trading platform, providing
 * an overview of the platform's capabilities and showcasing market highlights. It's designed
 * to convert visitors into registered users while providing value to existing users.
 * 
 * Features:
 * - Hero section with platform introduction and call-to-action
 * - Featured market data showcase (top stocks and crypto)
 * - Platform highlights and key features
 * - User testimonials and social proof
 * - Interactive tabs for different asset categories
 * - Responsive design optimized for all devices
 * - Integration with market data services for live content
 */

// React hooks for state management and lifecycle
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// UI icons from Lucide React
import { ArrowRight, ArrowUpRight, ArrowDownRight } from 'lucide-react';

// shadcn/ui components for consistent styling and functionality
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

// Layout and custom components
import Layout from '@/components/Layout';
import SpotlightAsset from '@/components/SpotlightAsset';

// Market data service for featured content
import { getStocks, getCryptos } from '@/services/marketService';

/**
 * Testimonial interface for type safety
 * 
 * Defines the structure for customer testimonials displayed on the homepage
 */
interface Testimonial {
  id: number;
  name: string;
  title: string;
  quote: string;
  avatar: string;
}

/**
 * Static testimonials data
 * 
 * Customer testimonials provide social proof and build trust with potential users.
 * In a production environment, these could be fetched from a CMS or testimonials API.
 */
const testimonials: Testimonial[] = [
  {
    id: 1,
    name: 'Alice Johnson',
    title: 'Software Engineer',
    quote: 'OrangeWave has transformed the way I invest. The real-time data and intuitive interface make it easy to stay informed and make smart decisions.',
    avatar: 'https://www.profilebakery.com/wp-content/uploads/2023/04/AI-Profile-Picture.jpg',
  },
  {
    id: 2,
    name: 'Bob Williams',
    title: 'Financial Analyst',
    quote: 'I\'ve tried several investment platforms, but OrangeWave stands out with its comprehensive tools and excellent customer support. It\'s a game-changer for both beginners and experienced investors.',
    avatar: 'https://r2.starryai.com/results/841134791/33d97c58-23a3-45f8-b069-15603acfc642.webp'
  }
];

/**
 * IndexPage Component
 * 
 * Main landing page component that handles:
 * - Featured market data fetching and display
 * - User engagement through interactive content
 * - Conversion-focused layout and messaging
 * - Social proof and testimonials
 * - Platform feature highlights
 * 
 * @returns JSX.Element - The complete homepage interface
 */
const IndexPage = () => {
  // State for featured market data
  const [topStocks, setTopStocks] = useState([]); // Top performing stocks for showcase
  const [topCryptos, setTopCryptos] = useState([]); // Top performing cryptocurrencies
  const [isLoading, setIsLoading] = useState(true); // Loading state for market data

  /**
   * Featured assets loading effect
   * 
   * Fetches top-performing stocks and cryptocurrencies to showcase on the homepage.
   * This provides immediate value to visitors and demonstrates platform capabilities.
   */
  useEffect(() => {
    const loadAssets = async () => {
      setIsLoading(true);
      try {
        // Fetch both asset types in parallel for better performance
        const [stocks, cryptos] = await Promise.all([getStocks(), getCryptos()]);
        
        // Show top 4 assets of each type for homepage spotlight
        setTopStocks(stocks.slice(0, 4));
        setTopCryptos(cryptos.slice(0, 4));
      } catch (error) {
        console.error('Failed to load assets:', error);
        // Graceful degradation - homepage still functions without featured assets
      } finally {
        setIsLoading(false);
      }
    };

    loadAssets();
  }, []); // Empty dependency array - only run on component mount
  
  return (
    <Layout>
      {/* Hero Section - Primary conversion area with platform introduction */}
      <section className="py-24 bg-gradient-to-br from-orange-500 to-orange-700 text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-5xl font-bold mb-4">Unlock Your Financial Future</h1>
              <p className="text-lg mb-8">
                Invest in stocks and cryptocurrencies with confidence. OrangeWave provides you with the tools and insights you need to succeed.
              </p>
              <div className="flex gap-4">
                <Link to="/register">
                  <Button className="bg-white text-orange-700 hover:bg-orange-100">Get Started</Button>
                </Link>
                <Link to="/about">
                  <Button variant="outline">Learn More</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Top Stocks Section */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold mb-1">Featured Stocks</h2>
              <p className="text-muted-foreground">Popular stocks with strong performance</p>
            </div>
            <Link to="/market?type=stocks">
              <Button variant="ghost" className="gap-1">
                View All Stocks <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {topStocks.map(stock => (
              <SpotlightAsset key={stock.id} asset={stock} />
            ))}
          </div>
        </div>
      </section>
      
      {/* Top Cryptocurrencies Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold mb-1">Trending Cryptocurrencies</h2>
              <p className="text-muted-foreground">Digital assets gaining momentum</p>
            </div>
            <Link to="/market?type=crypto">
              <Button variant="ghost" className="gap-1">
                View All Crypto <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Render a SpotlightAsset card for each trending crypto */}
            {topCryptos.map(crypto => (
              <SpotlightAsset key={crypto.id} asset={crypto} />
            ))}
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      {/* Section highlights key features of the platform */}
      <section className="py-12 bg-secondary">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="text-center">
              <img src="https://icons.veryicon.com/png/o/system/icon-for-fire-protection-system/real-time-data-4.png" alt="Real-Time Data" className="mx-auto h-16 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Real-Time Data</h3>
              <p className="text-muted-foreground">Stay up-to-date with real-time stock and cryptocurrency prices.</p>
            </div>
            
            {/* Feature 2 */}
            <div className="text-center">
              <img src="https://cdn-icons-png.flaticon.com/512/10822/10822070.png" alt="Portfolio Tracking" className="mx-auto h-16 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Portfolio Tracking</h3>
              <p className="text-muted-foreground">Monitor your investments and track your portfolio performance.</p>
            </div>
            
            {/* Feature 3 */}
            <div className="text-center">
              <img src="https://cerebrumx.ai/wp-content/uploads/2022/04/pr-img-1.png" alt="Secure Wallet" className="mx-auto h-16 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Secure Wallet</h3>
              <p className="text-muted-foreground">Protect your digital assets with our secure and reliable wallet.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Testimonials Section */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">What Our Users Say</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {testimonials.map(testimonial => (
              <Card key={testimonial.id}>
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full"
                    />
                    <div>
                      <CardTitle>{testimonial.name}</CardTitle>
                      <CardDescription>{testimonial.title}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground italic">"{testimonial.quote}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default IndexPage;