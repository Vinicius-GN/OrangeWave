/**
 * News Page Component
 * 
 * This component provides a comprehensive news and market insights section for the OrangeWave
 * trading platform. It displays financial news articles, market analysis, and trading insights
 * to help users make informed investment decisions.
 * 
 * Features:
 * - Financial news articles display with rich metadata
 * - Category-based filtering (stocks, crypto, market analysis, etc.)
 * - Article preview cards with summaries and publication details
 * - Links to full article views for detailed reading
 * - Responsive grid layout optimized for different screen sizes
 * - Real-time news data integration
 * - Loading states and error handling
 * - Author and publication date information
 */

// React hooks for state management
import { useState } from 'react';
import { Link } from 'react-router-dom';

// UI icons from Lucide React
import { Calendar, User, ExternalLink } from 'lucide-react';

// Layout and UI components
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Custom hooks for news data management
import { useNews } from '@/hooks/api/useNews';

/**
 * News Component
 * 
 * Main news section component that handles:
 * - News articles fetching and state management
 * - Category-based filtering functionality
 * - Article display with metadata and navigation
 * - Loading and error state handling
 * - Responsive layout for different devices
 * 
 * @returns JSX.Element - The complete news interface
 */
const News = () => {
  // Custom hook for news data management with loading and error states
  const { articles, isLoading, error } = useNews();
  
  // State for category filtering functionality
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Loading state with user feedback
  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading news...</div>
        </div>
      </Layout>
    );
  }

  // Error state with user-friendly error message
  if (error) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-red-500">
            Error loading news: {error}
          </div>
        </div>
      </Layout>
    );
  }

  /**
   * Dynamic category extraction
   * 
   * Extracts unique categories from articles for filtering options.
   * Includes 'all' option to show all articles regardless of category.
   */
  const categories = ['all', ...Array.from(new Set(articles.map(article => article.category)))];

  /**
   * Article filtering logic
   * 
   * Filters articles based on selected category. Shows all articles
   * when 'all' is selected, otherwise filters by specific category.
   */
  const filteredArticles = selectedCategory === 'all' 
    ? articles 
    : articles.filter(article => article.category === selectedCategory);

  /**
   * Date formatting utility
   * 
   * Formats ISO date strings into user-friendly display format
   * for article publication dates.
   * 
   * @param dateString - ISO date string from article data
   * @returns Formatted date string for display
   */
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Page header with title and description */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Financial News</h1>
          <p className="text-muted-foreground">
            Stay informed with the latest financial news and market insights
          </p>
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="capitalize"
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Articles grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((article) => (
            <Card key={article._id} className="glass-card hover:shadow-lg transition-shadow">
              {article.imageUrl && (
                <div className="aspect-video overflow-hidden rounded-t-lg">
                  <img
                    src={article.imageUrl}
                    alt={article.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="secondary" className="text-xs">
                    {article.category}
                  </Badge>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3 mr-1" />
                    {formatDate(article.publishedAt)}
                  </div>
                </div>
                <CardTitle className="text-lg line-clamp-2">
                  {article.title}
                </CardTitle>
                <CardDescription className="line-clamp-3">
                  {article.summary}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <User className="w-4 h-4 mr-1" />
                    {article.author}
                  </div>
                  <Button asChild size="sm" variant="ghost">
                    <Link to={`/news/${article._id}`}>
                      Read More
                      <ExternalLink className="w-4 h-4 ml-1" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredArticles.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No articles found for the selected category.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default News;
