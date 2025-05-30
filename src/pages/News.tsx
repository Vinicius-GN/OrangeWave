
import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Calendar, Search, ChevronRight } from 'lucide-react';
import Layout from '@/components/Layout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';

// News article interface
interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: 'market' | 'crypto' | 'stocks' | 'economy';
  source: string;
  imageUrl?: string;
  publishedAt: number;
  relatedAssets?: string[];
}

// Mock function to get news
const getNews = async (category?: string, search?: string): Promise<NewsArticle[]> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Mock news data
  const mockNews: NewsArticle[] = [
    {
      id: 'news-1',
      title: 'Bitcoin Surges to New All-Time High as Institutional Interest Grows',
      summary: 'Bitcoin has reached a new all-time high as major financial institutions increase their cryptocurrency investments.',
      content: 'Full article content...',
      category: 'crypto',
      source: 'Crypto Market News',
      imageUrl: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80',
      publishedAt: Date.now() - 12 * 60 * 60 * 1000, // 12 hours ago
      relatedAssets: ['asset-btc', 'asset-eth'],
    },
    {
      id: 'news-2',
      title: 'Apple Announces New AI Features Coming to iPhone in Next Update',
      summary: 'Apple revealed a suite of new AI-powered features that will be available in the next iOS update.',
      content: 'Full article content...',
      category: 'stocks',
      source: 'Tech Today',
      imageUrl: 'https://www.shutterstock.com/image-photo/chengdu-sichuan-china-june-7-600nw-2472736747.jpg',
      publishedAt: Date.now() - 24 * 60 * 60 * 1000, // 1 day ago
      relatedAssets: ['asset-aapl', 'asset-msft'],
    },
    {
      id: 'news-3',
      title: 'Tesla Unveils Next-Generation Electric Vehicle with Revolutionary Battery Technology',
      summary: 'Tesla has announced a breakthrough in battery technology that will significantly increase the range and reduce the cost of their electric vehicles.',
      content: 'Full article content...',
      category: 'stocks',
      source: 'Auto Innovation News',
      imageUrl: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80',
      publishedAt: Date.now() - 3 * 24 * 60 * 60 * 1000, // 3 days ago
      relatedAssets: ['asset-tsla'],
    },
    {
      id: 'news-4',
      title: 'Microsoft Acquires AI Startup in Billion-Dollar Deal',
      summary: 'Microsoft has acquired an AI startup specializing in natural language processing technologies.',
      content: 'Full article content...',
      category: 'stocks',
      source: 'Tech Insider',
      imageUrl: 'https://www.shutterstock.com/image-photo/logo-microsoft-company-headquarters-office-260nw-2161001273.jpg',
      publishedAt: Date.now() - 5 * 24 * 60 * 60 * 1000, // 5 days ago
      relatedAssets: ['asset-msft'],
    },
    {
      id: 'news-5',
      title: 'Amazon Expands Logistics Network with New Fulfillment Centers',
      summary: 'Amazon is opening several new fulfillment centers across North America to meet growing demand.',
      content: 'Full article content...',
      category: 'stocks',
      source: 'Business Daily',
      imageUrl: 'https://www.shutterstock.com/image-photo/iasi-romania-april-26-2018-260nw-1388007155.jpg',
      publishedAt: Date.now() - 7 * 24 * 60 * 60 * 1000, // 7 days ago
      relatedAssets: ['asset-amzn'],
    },
    {
      id: 'news-6',
      title: 'Federal Reserve Maintains Interest Rates, Signals Future Cuts',
      summary: 'The Federal Reserve has maintained current interest rates but suggested potential cuts later this year as inflation moderates.',
      content: 'Full article content...',
      category: 'economy',
      source: 'Economic Journal',
      imageUrl: 'https://images.unsplash.com/photo-1511174511562-5f7f18b874f8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80',
      publishedAt: Date.now() - 2 * 24 * 60 * 60 * 1000, // 2 days ago
    },
    {
      id: 'news-7',
      title: 'Ethereum Completes Major Network Upgrade, Enhancing Scalability',
      summary: 'Ethereum has successfully implemented a network upgrade that significantly improves transaction throughput and reduces fees.',
      content: 'Full article content...',
      category: 'crypto',
      source: 'Blockchain Times',
      imageUrl: 'https://images.unsplash.com/photo-1639762681057-408e52192e55?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80',
      publishedAt: Date.now() - 4 * 24 * 60 * 60 * 1000, // 4 days ago
      relatedAssets: ['asset-eth'],
    },
    {
      id: 'news-8',
      title: 'Global Market Outlook: Asian Markets Lead Recovery Amid Economic Uncertainty',
      summary: 'Asian markets show resilience and growth potential despite ongoing global economic challenges.',
      content: 'Full article content...',
      category: 'market',
      source: 'Global Finance Review',
      imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80',
      publishedAt: Date.now() - 8 * 24 * 60 * 60 * 1000, // 8 days ago
    },
    {
      id: 'news-9',
      title: 'Google Parent Alphabet Reports Strong Quarterly Earnings, Boosted by AI Initiatives',
      summary: 'Alphabet has exceeded earnings expectations, with significant revenue growth attributed to AI-powered products and services.',
      content: 'Full article content...',
      category: 'stocks',
      source: 'Tech Financial News',
      imageUrl: 'https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80',
      publishedAt: Date.now() - 6 * 24 * 60 * 60 * 1000, // 6 days ago
      relatedAssets: ['asset-googl'],
    },
    {
      id: 'news-10',
      title: 'U.S. Consumer Confidence Rises to Highest Level in Two Years',
      summary: 'Recent survey shows American consumers are increasingly optimistic about economic conditions and job prospects.',
      content: 'Full article content...',
      category: 'economy',
      source: 'Economic Trends',
      imageUrl: 'https://images.unsplash.com/photo-1559589689-577aabd1db4f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80',
      publishedAt: Date.now() - 9 * 24 * 60 * 60 * 1000, // 9 days ago
    }
  ];
  
  // Filter by category if provided
  let filtered = mockNews;
  if (category && category !== 'all') {
    filtered = mockNews.filter(article => article.category === category);
  }
  
  // Filter by search term if provided
  if (search) {
    const searchLower = search.toLowerCase();
    filtered = filtered.filter(article => 
      article.title.toLowerCase().includes(searchLower) || 
      article.summary.toLowerCase().includes(searchLower)
    );
  }
  
  // Sort by published date (newest first)
  return filtered.sort((a, b) => b.publishedAt - a.publishedAt);
};

const News = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearchTerm = searchParams.get('search') || '';
  const initialCategory = searchParams.get('category') || 'all';
  
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [category, setCategory] = useState(initialCategory);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const loadNews = async () => {
      setIsLoading(true);
      try {
        const newsData = await getNews(
          category === 'all' ? undefined : category,
          searchTerm
        );
        setArticles(newsData);
      } catch (error) {
        console.error('Error loading news:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadNews();
    
    // Update URL params
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (category !== 'all') params.set('category', category);
    setSearchParams(params, { replace: true });
  }, [category, searchTerm, setSearchParams]);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // The search is already reactive due to the useEffect
  };
  
  const handleCategoryChange = (value: string) => {
    setCategory(value);
  };
  
  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-1">Market News</h1>
          <p className="text-muted-foreground">
            Stay updated with the latest news and insights from the financial markets.
          </p>
        </div>
        
        <div className="mb-6">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="search"
                placeholder="Search news..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button type="submit">Search</Button>
          </form>
        </div>
        
        <Tabs value={category} onValueChange={handleCategoryChange}>
          <TabsList className="mb-6">
            <TabsTrigger value="all">All News</TabsTrigger>
            <TabsTrigger value="market">Market</TabsTrigger>
            <TabsTrigger value="stocks">Stocks</TabsTrigger>
            <TabsTrigger value="crypto">Crypto</TabsTrigger>
            <TabsTrigger value="economy">Economy</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-0">
            <NewsGrid articles={articles} isLoading={isLoading} />
          </TabsContent>
          
          <TabsContent value="market" className="mt-0">
            <NewsGrid articles={articles} isLoading={isLoading} />
          </TabsContent>
          
          <TabsContent value="stocks" className="mt-0">
            <NewsGrid articles={articles} isLoading={isLoading} />
          </TabsContent>
          
          <TabsContent value="crypto" className="mt-0">
            <NewsGrid articles={articles} isLoading={isLoading} />
          </TabsContent>
          
          <TabsContent value="economy" className="mt-0">
            <NewsGrid articles={articles} isLoading={isLoading} />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

interface NewsGridProps {
  articles: NewsArticle[];
  isLoading: boolean;
}

const NewsGrid = ({ articles, isLoading }: NewsGridProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="overflow-hidden">
            <Skeleton className="h-48 w-full" />
            <CardContent className="p-4">
              <Skeleton className="h-6 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-4 w-2/3 mb-3" />
              <Skeleton className="h-4 w-1/4" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  if (articles.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold mb-2">No articles found</h2>
        <p className="text-muted-foreground">Try adjusting your search or filters.</p>
      </div>
    );
  }
  
  // Featured article (first one)
  const featuredArticle = articles[0];
  const remainingArticles = articles.slice(1);
  
  return (
    <div className="space-y-8">
      {/* Featured article */}
      <Card className="overflow-hidden">
        <Link to={`/news/article/${featuredArticle.id}`} className="block">
          <div className="grid md:grid-cols-2 gap-6">
            {featuredArticle.imageUrl && (
              <div className="h-64 md:h-auto overflow-hidden">
                <img 
                  src={featuredArticle.imageUrl} 
                  alt={featuredArticle.title} 
                  className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                />
              </div>
            )}
            <CardContent className="p-6 flex flex-col justify-center">
              <div className="flex items-center mb-2">
                <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded font-medium mr-2">
                  Featured
                </span>
                <span className="text-sm text-muted-foreground">
                  {formatDistanceToNow(featuredArticle.publishedAt, { addSuffix: true })}
                </span>
              </div>
              <h2 className="text-2xl font-bold mb-3">{featuredArticle.title}</h2>
              <p className="text-muted-foreground mb-4">{featuredArticle.summary}</p>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">{featuredArticle.source}</span>
                <div className="flex items-center text-primary hover:text-primary/90 transition-colors">
                  Read more <ChevronRight className="h-4 w-4 ml-1" />
                </div>
              </div>
            </CardContent>
          </div>
        </Link>
      </Card>
      
      {/* News grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {remainingArticles.map(article => (
          <Card key={article.id} className="overflow-hidden card-hover">
            <Link to={`/news/article/${article.id}`} className="block">
              {article.imageUrl && (
                <div className="h-48 overflow-hidden">
                  <img 
                    src={article.imageUrl} 
                    alt={article.title} 
                    className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                  />
                </div>
              )}
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="capitalize text-xs px-2 py-0.5 bg-secondary text-muted-foreground rounded">
                    {article.category}
                  </span>
                  <div className="text-xs text-muted-foreground flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    {formatDistanceToNow(article.publishedAt, { addSuffix: true })}
                  </div>
                </div>
                <h3 className="font-bold mb-2 line-clamp-2">{article.title}</h3>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {article.summary}
                </p>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">{article.source}</span>
                  <div className="flex items-center text-primary hover:text-primary/90 transition-colors">
                    Read more <ChevronRight className="h-3 w-3 ml-0.5" />
                  </div>
                </div>
              </CardContent>
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default News;
