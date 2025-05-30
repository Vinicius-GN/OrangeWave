import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, Clock, ChevronLeft, ArrowLeft, ArrowRight } from 'lucide-react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  source: string;
  imageUrl?: string;
  publishedAt: number;
  relatedAssets?: string[];
  url?: string;
}

const mockNewsArticles: NewsArticle[] = [
  {
    id: 'news-1',
    title: 'Bitcoin Surges to New All-Time High as Institutional Interest Grows',
    summary: 'Bitcoin has reached a new all-time high as major financial institutions increase their cryptocurrency investments.',
    content: `
      <p>Bitcoin (BTC) has surged to a new all-time high, crossing the $70,000 mark for the first time in its history. The milestone comes amid growing institutional interest and adoption of cryptocurrencies worldwide.</p>
      <p>Major financial institutions have been increasing their exposure to Bitcoin and other digital assets, citing diversification and hedge against inflation as primary motivations. This institutional influx is seen as a key factor driving the recent price rally.</p>
      <p>Retail investors have also played a role, encouraged by increased media coverage and the growing ecosystem of crypto services such as exchanges and wallets. This combined demand has pushed Bitcoin’s market capitalization to unprecedented levels.</p>
      <p>Additionally, several countries are considering regulatory frameworks to better integrate cryptocurrencies into their financial systems, which boosts investor confidence.</p>
      <p>Experts warn about volatility but remain optimistic about Bitcoin’s long-term potential as a decentralized store of value, likening it to “digital gold.” Meanwhile, adoption by companies and payment processors continues to rise, further solidifying its position.</p>
    `,
    source: 'Crypto Market News',
    imageUrl: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    publishedAt: Date.now() - 12 * 60 * 60 * 1000,
    relatedAssets: ['asset-btc', 'asset-eth'],
  },
  {
    id: 'news-2',
    title: 'Apple Announces New AI Features Coming to iPhone in Next Update',
    summary: 'Apple revealed a suite of new AI-powered features that will be available in the next iOS update.',
    content: `
      <p>Apple Inc. (AAPL) has announced a significant expansion of its artificial intelligence capabilities in the upcoming iOS update, set to roll out later this year. The new features leverage advanced machine learning to enhance user experience across various applications.</p>
      <p>During a special event at Apple Park, the company showcased AI-powered improvements including smarter Siri interactions, predictive text enhancements, and on-device image recognition. These features aim to provide faster and more personalized experiences while prioritizing user privacy.</p>
      <p>Other highlights include improved AI-driven photo editing tools, new accessibility functions that assist users with disabilities, and augmented reality experiences enhanced by AI.</p>
      <p>Apple’s focus on integrating AI more deeply into its ecosystem reflects the company’s strategy to differentiate itself in a competitive smartphone market. Developers are already preparing to incorporate these tools into third-party apps, promising innovative use cases for end-users.</p>
      <p>Industry analysts expect these AI upgrades will help Apple maintain its technological edge and continue attracting a loyal customer base, while also opening new revenue streams.</p>
    `,
    source: 'Tech Today',
    imageUrl: 'https://www.shutterstock.com/image-photo/chengdu-sichuan-china-june-7-600nw-2472736747.jpg',
    publishedAt: Date.now() - 24 * 60 * 60 * 1000,
    relatedAssets: ['asset-aapl', 'asset-msft'],
  },
  {
    id: 'news-3',
    title: 'Tesla Unveils Next-Generation Electric Vehicle with Revolutionary Battery Technology',
    summary: 'Tesla has announced a breakthrough in battery technology that will significantly increase the range and reduce the cost of their electric vehicles.',
    content: `
      <p>Tesla, Inc. (TSLA) has unveiled its next-generation electric vehicle featuring revolutionary battery technology that promises to reshape the EV market. This new battery design increases energy density, allowing vehicles to travel longer distances on a single charge.</p>
      <p>The innovative battery cells are also cheaper to produce, which is expected to lower the overall cost of Tesla vehicles and make them more accessible to a wider audience.</p>
      <p>Elon Musk emphasized that the new technology would enhance vehicle performance, safety, and sustainability by using more environmentally friendly materials and reducing reliance on scarce resources.</p>
      <p>The unveiling included a detailed explanation of the manufacturing process, which incorporates cutting-edge automation and quality control measures.</p>
      <p>Industry experts hailed the announcement as a game-changer that could accelerate the global shift away from fossil fuels and cement Tesla’s position as a leader in clean transportation innovation.</p>
    `,
    source: 'Auto Innovation News',
    imageUrl: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    publishedAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
    relatedAssets: ['asset-tsla'],
  },
  {
    id: 'news-4',
    title: 'Microsoft Acquires AI Startup in Billion-Dollar Deal',
    summary: 'Microsoft has acquired an AI startup specializing in natural language processing technologies.',
    content: `
      <p>Microsoft announced the acquisition of an AI startup specializing in natural language processing (NLP) technologies in a deal valued at over one billion dollars. This move aligns with Microsoft’s broader AI strategy focused on enhancing its cloud and productivity offerings.</p>
      <p>The startup is known for pioneering advanced NLP algorithms that improve machine understanding of human language, enabling smarter chatbots, voice assistants, and content analysis tools.</p>
      <p>Microsoft plans to integrate these technologies into Azure Cognitive Services, Microsoft 365, and other enterprise products to boost automation and efficiency for business users worldwide.</p>
      <p>Executives from both companies highlighted the cultural fit and shared vision for AI development, signaling a smooth integration process ahead.</p>
      <p>Market analysts view this acquisition as a strategic step for Microsoft to stay competitive against rivals like Google and Amazon in the AI cloud market.</p>
    `,
    source: 'Tech Insider',
    imageUrl: 'https://www.shutterstock.com/image-photo/logo-microsoft-company-headquarters-office-260nw-2161001273.jpg',
    publishedAt: Date.now() - 5 * 24 * 60 * 60 * 1000,
    relatedAssets: ['asset-msft'],
  },
  {
    id: 'news-5',
    title: 'Amazon Expands Logistics Network with New Fulfillment Centers',
    summary: 'Amazon is opening several new fulfillment centers across North America to meet growing demand.',
    content: `
      <p>Amazon continues to grow its logistics network by opening new fulfillment centers strategically located across North America. These new facilities will help the company handle increased order volumes and improve delivery speeds, especially in underserved regions.</p>
      <p>The fulfillment centers feature cutting-edge automation technologies such as robotics, AI-powered sorting systems, and advanced inventory management to optimize efficiency.</p>
      <p>Amazon aims to reduce delivery times and enhance customer satisfaction through this expansion, particularly for Prime members.</p>
      <p>The company also emphasizes sustainability, with several new centers designed to minimize environmental impact by utilizing renewable energy sources and eco-friendly building materials.</p>
      <p>Local communities are expected to benefit from job creation, economic growth, and enhanced infrastructure, reinforcing Amazon’s commitment to social responsibility.</p>
    `,
    source: 'Business Daily',
    imageUrl: 'https://www.shutterstock.com/image-photo/iasi-romania-april-26-2018-260nw-1388007155.jpg',
    publishedAt: Date.now() - 7 * 24 * 60 * 60 * 1000,
    relatedAssets: ['asset-amzn'],
  },
  {
    id: 'news-6',
    title: 'Federal Reserve Maintains Interest Rates, Signals Future Cuts',
    summary: 'The Federal Reserve has maintained current interest rates but suggested potential cuts later this year as inflation moderates.',
    content: `
      <p>The Federal Reserve has decided to hold interest rates steady in its latest meeting, signaling a cautious approach amid mixed economic data and ongoing global uncertainties.</p>
      <p>While inflation rates have begun to moderate, the Fed emphasized that future policy decisions will depend on economic indicators such as employment, consumer spending, and global trade conditions.</p>
      <p>Officials indicated the possibility of rate cuts later this year if inflation continues to decline, aiming to support sustained economic growth without overheating the market.</p>
      <p>Market analysts responded positively, interpreting the Fed’s communication as a balanced approach that fosters stability and investor confidence.</p>
      <p>The decision reflects the central bank’s dual mandate to promote maximum employment and price stability while navigating complex macroeconomic challenges.</p>
    `,
    source: 'Economic Journal',
    imageUrl: 'https://images.unsplash.com/photo-1511174511562-5f7f18b874f8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    publishedAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
  },
  {
    id: 'news-7',
    title: 'Ethereum Completes Major Network Upgrade, Enhancing Scalability',
    summary: 'Ethereum has successfully implemented a network upgrade that significantly improves transaction throughput and reduces fees.',
    content: `
      <p>Ethereum’s recent network upgrade marks a critical advancement in blockchain scalability and user experience. The upgrade introduces new consensus mechanisms and optimizations that enable the network to process a higher volume of transactions efficiently.</p>
      <p>By reducing transaction fees and confirmation times, this upgrade aims to attract more users and developers to the Ethereum platform, facilitating broader adoption of decentralized applications (dApps) and decentralized finance (DeFi) solutions.</p>
      <p>The Ethereum Foundation highlighted the upgrade as a stepping stone toward their long-term vision of a sustainable, scalable, and secure blockchain ecosystem.</p>
      <p>Community response has been largely positive, with many praising the technical achievements and anticipated impact on the ecosystem’s growth and usability.</p>
      <p>This upgrade also lays the groundwork for future innovations, including Ethereum 2.0 developments focused on energy efficiency and sharding technologies.</p>
    `,
    source: 'Blockchain Times',
    imageUrl: 'https://images.unsplash.com/photo-1639762681057-408e52192e55?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    publishedAt: Date.now() - 4 * 24 * 60 * 60 * 1000,
    relatedAssets: ['asset-eth'],
  },
  {
    id: 'news-8',
    title: 'Global Market Outlook: Asian Markets Lead Recovery Amid Economic Uncertainty',
    summary: 'Asian markets show resilience and growth potential despite ongoing global economic challenges.',
    content: `
      <p>Asian markets are rebounding strongly even with continued global uncertainties surrounding inflation, supply chain disruptions, and geopolitical tensions.</p>
      <p>Key markets including China, Japan, South Korea, and Southeast Asia have posted solid gains, driven by government stimulus efforts and strong corporate earnings reports.</p>
      <p>Investors are optimistic about the region’s growth prospects, supported by expanding middle classes and increasing technological innovation.</p>
      <p>However, risks remain from global economic slowdowns and trade tensions that could affect the pace of recovery.</p>
      <p>Market analysts continue to monitor policy developments and economic data closely, noting that Asia’s dynamic economies are poised to lead global growth if challenges are managed effectively.</p>
    `,
    source: 'Global Finance Review',
    imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    publishedAt: Date.now() - 8 * 24 * 60 * 60 * 1000,
  },
  {
    id: 'news-9',
    title: 'Google Parent Alphabet Reports Strong Quarterly Earnings, Boosted by AI Initiatives',
    summary: 'Alphabet has exceeded earnings expectations, with significant revenue growth attributed to AI-powered products and services.',
    content: `
      <p>Alphabet, the parent company of Google, has reported quarterly earnings that surpassed analysts’ expectations, driven largely by advancements in artificial intelligence across its product suite.</p>
      <p>AI-powered search improvements, cloud computing growth, and monetization through targeted advertising contributed to the strong revenue results.</p>
      <p>Executives highlighted key developments in natural language processing, computer vision, and machine learning that continue to enhance user engagement and open new business opportunities.</p>
      <p>The company also announced increased investments in AI research and partnerships aimed at expanding its leadership in the field.</p>
      <p>Investor sentiment remains positive, viewing Alphabet’s AI strategy as central to its long-term growth prospects and competitive positioning.</p>
    `,
    source: 'Tech Financial News',
    imageUrl: 'https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    publishedAt: Date.now() - 6 * 24 * 60 * 60 * 1000,
    relatedAssets: ['asset-googl'],
  },
  {
    id: 'news-10',
    title: 'U.S. Consumer Confidence Rises to Highest Level in Two Years',
    summary: 'Recent survey shows American consumers are increasingly optimistic about economic conditions and job prospects.',
    content: `
      <p>Consumer confidence in the U.S. has reached its highest level in two years, according to the latest surveys conducted by economic research firms.</p>
      <p>The increase reflects optimism about improving job markets, stable inflation, and steady wage growth, encouraging households to increase spending on big-ticket items.</p>
      <p>Economists suggest that rising consumer confidence is a positive signal for economic growth, as consumer spending accounts for a significant portion of GDP.</p>
      <p>However, challenges remain, including global supply chain issues and inflationary pressures, which could temper future consumer sentiment.</p>
      <p>Overall, the data indicates a cautiously optimistic outlook for the U.S. economy as it continues its recovery from recent disruptions.</p>
    `,
    source: 'Economic Trends',
    imageUrl: 'https://images.unsplash.com/photo-1559589689-577aabd1db4f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    publishedAt: Date.now() - 9 * 24 * 60 * 60 * 1000,
  },
];


// Função para buscar artigo por ID (mock)
const getNewsArticleById = async (id: string): Promise<NewsArticle | null> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockNewsArticles.find(a => a.id === id) || null;
};

const getTotalArticleCount = async (): Promise<number> => {
  return mockNewsArticles.length;
};

const NewsArticlePage = () => {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [totalArticles, setTotalArticles] = useState<number>(0);
  const { toast } = useToast();

  const currentArticleNum = id ? parseInt(id.replace('news-', '')) : 0;
  const hasPrevious = currentArticleNum > 1;
  const hasNext = currentArticleNum < totalArticles;

  useEffect(() => {
    const loadArticle = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const [articleData, totalCount] = await Promise.all([
          getNewsArticleById(id),
          getTotalArticleCount(),
        ]);
        setTotalArticles(totalCount);

        if (!articleData) {
          toast({
            title: "Article not found",
            description: "The requested news article could not be found.",
            variant: "destructive",
          });
          return;
        }

        setArticle(articleData);
      } catch {
        toast({
          title: "Error",
          description: "Failed to load the news article. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadArticle();
  }, [id, toast]);

  if (!article && !isLoading) {
    return (
      <Layout>
        <div className="container mx-auto py-16 px-4 text-center">
          <h1 className="text-2xl font-bold mb-4">Article Not Found</h1>
          <p className="mb-8">The requested news article could not be found.</p>
          <Button asChild>
            <Link to="/news">Return to News</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  const formatPublishedDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-6">
          <Button variant="ghost" asChild className="p-0 hover:bg-transparent">
            <Link to="/news" className="flex items-center text-muted-foreground">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to News
            </Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-6">
            <Skeleton className="h-12 w-3/4 rounded" />
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-6 w-32 rounded" />
              <Skeleton className="h-6 w-48 rounded" />
            </div>
            <Skeleton className="h-64 w-full rounded" />
            <div className="space-y-4">
              <Skeleton className="h-4 w-full rounded" />
              <Skeleton className="h-4 w-full rounded" />
              <Skeleton className="h-4 w-3/4 rounded" />
            </div>
          </div>
        ) : (
          <article className="prose prose-invert max-w-none">
            <h1 className="text-3xl font-bold mb-4">{article?.title}</h1>

            <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-muted-foreground">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1.5" />
                {formatPublishedDate(article?.publishedAt || Date.now())}
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1.5" />
                {formatDistanceToNow(article?.publishedAt || Date.now(), { addSuffix: true })}
              </div>
              <div>Source: {article?.source}</div>
            </div>

            {article?.imageUrl && (
              <img
                src={article.imageUrl}
                alt={article.title}
                className="w-full h-64 object-cover rounded-lg mb-6"
              />
            )}

            <div dangerouslySetInnerHTML={{ __html: article?.content || '' }} />

            {article?.url && (
              <div className="mt-8">
                <Button asChild>
                  <a href={article.url} target="_blank" rel="noopener noreferrer">
                    Read Original Article
                  </a>
                </Button>
              </div>
            )}

            <div className="flex justify-between mt-10 pt-6 border-t">
              <Button
                variant="outline"
                asChild
                className="flex items-center"
                disabled={!hasPrevious}
              >
                <Link to={hasPrevious ? `/news/article/news-${currentArticleNum - 1}` : '#'}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Previous Article
                </Link>
              </Button>

              <Button
                variant="outline"
                asChild
                className="flex items-center"
                disabled={!hasNext}
              >
                <Link to={hasNext ? `/news/article/news-${currentArticleNum + 1}` : '#'}>
                  Next Article
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          </article>
        )}
      </div>
    </Layout>
  );
};

export default NewsArticlePage;
