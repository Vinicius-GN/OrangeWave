
/**
 * NewsArticle Page Component
 * 
 * This component displays a detailed view of a specific news article in the OrangeWave platform.
 * It provides a full article reading experience with proper formatting and navigation.
 * 
 * Key Features:
 * - Dynamic article loading based on URL parameter (article ID)
 * - Rich article display with metadata (author, date, category)
 * - Responsive article layout with proper typography
 * - Error handling for missing or invalid articles
 * - Navigation back to news listing
 * - Image display support for articles with featured images
 * 
 * URL Structure:
 * - Route: /news/:id where :id is the article identifier
 * - Accessible from news listing page and direct links
 * 
 * Data Flow:
 * - Extracts article ID from URL parameters
 * - Uses custom hook to fetch article data from API
 * - Handles loading, error, and success states
 * - Renders formatted article content using dangerouslySetInnerHTML
 * 
 * Security Considerations:
 * - Article content is rendered as HTML (assumes trusted content from API)
 * - No user input handling on this page
 * - Uses proper error boundaries for failed requests
 */

import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, User } from 'lucide-react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNewsArticle } from '@/hooks/api/useNews';

/**
 * NewsArticle Component
 * 
 * Renders a detailed news article page with full content display
 * Handles loading states and provides navigation back to news listing
 */
const NewsArticle = () => {  // Extract article ID from URL parameters
  const { id } = useParams<{ id: string }>();
  // Fetch article data using custom hook with loading and error states
  const { article, isLoading, error } = useNewsArticle(id || '');

  // Loading state: Show spinner while fetching article data
  if (isLoading) {    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          {/* Loading indicator with consistent styling */}
          <div className="text-center">Loading article...</div>
        </div>
      </Layout>
    );
  }

  // Error state: Handle missing articles or API errors
  if (error || !article) {    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          {/* Error state with user-friendly message and navigation */}
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Article Not Found</h1>
            <p className="text-muted-foreground mb-6">
              {error || 'The article you are looking for does not exist.'}
            </p>
            {/* Navigation button back to news listing */}
            <Button asChild>
              <Link to="/news">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to News
              </Link>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  /**
   * Format date string into readable format
   * @param dateString - ISO date string from API
   * @returns Formatted date with time
   */
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Navigation: Back button to return to news listing */}
        <Button asChild variant="ghost" className="mb-6">
          <Link to="/news">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to News
          </Link>
        </Button>

        {/* Main article container with responsive max-width */}
        <article className="max-w-4xl mx-auto">
          {/* Article header section with metadata */}
          <div className="mb-8">
            {/* Article metadata bar: category and publication date */}
            <div className="flex items-center gap-4 mb-4">
              <Badge variant="secondary">
                {article.category}
              </Badge>
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="w-4 h-4 mr-1" />
                {formatDate(article.publishedAt)}
              </div>
            </div>
            
            {/* Article title with large, bold typography */}
            <h1 className="text-4xl font-bold mb-4 leading-tight">
              {article.title}
            </h1>
            
            {/* Article summary/subtitle with muted styling */}
            <p className="text-xl text-muted-foreground mb-6">
              {article.summary}
            </p>
            
            {/* Author information */}
            <div className="flex items-center text-sm text-muted-foreground">
              <User className="w-4 h-4 mr-1" />
              By {article.author}
            </div>
          </div>

          {/* Featured image section (conditional rendering) */}
          {article.imageUrl && (
            <div className="mb-8">
              <img
                src={article.imageUrl}
                alt={article.title}
                className="w-full h-96 object-cover rounded-lg"
              />
            </div>
          )}          {/* Article content section */}
          {/* 
            Article content rendered as HTML with Tailwind prose styling
            Note: Uses dangerouslySetInnerHTML - content should be sanitized at API level
            The prose classes provide proper typography for article content
          */}
          <div className="prose prose-lg max-w-none">
            <div dangerouslySetInnerHTML={{ __html: article.content }} />
          </div>
        </article>
      </div>
    </Layout>
  );
};

export default NewsArticle;
