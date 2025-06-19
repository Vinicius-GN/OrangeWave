
import { useState, useEffect } from 'react';

const API_URL = 'http://localhost:3001/api';

interface NewsArticle {
  _id: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  imageUrl?: string;
  publishedAt: string;
  author: string;
}

export const useNews = () => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNews = async () => {
    try {
      const response = await fetch(`${API_URL}/news`);
      
      if (response.ok) {
        const data: NewsArticle[] = await response.json();
        setArticles(data);
      } else {
        setError('Failed to fetch news');
      }
    } catch (err) {
      console.error('Error fetching news:', err);
      setError('Failed to fetch news');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  return {
    articles,
    isLoading,
    error,
    refreshNews: fetchNews
  };
};

export const useNewsArticle = (articleId: string) => {
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticle = async () => {
      if (!articleId) return;
      
      try {
        const response = await fetch(`${API_URL}/news/${articleId}`);
        
        if (response.ok) {
          const data: NewsArticle = await response.json();
          setArticle(data);
        } else {
          setError('Article not found');
        }
      } catch (err) {
        console.error('Error fetching article:', err);
        setError('Failed to fetch article');
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticle();
  }, [articleId]);

  return {
    article,
    isLoading,
    error
  };
};
