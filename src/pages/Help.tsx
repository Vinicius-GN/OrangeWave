
import { useState } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Search, HelpCircle, MessagesSquare, BookOpen } from 'lucide-react';
import Layout from '@/components/Layout';

// FAQ data
const faqItems = [
  {
    question: "How do I create an account?",
    answer: "To create an account, click on the 'Sign Up' button in the navigation bar. Fill out the registration form with your name, email address, and create a password. After submitting the form, you'll be automatically logged in and can start using the platform."
  },
  {
    question: "How do I deposit funds?",
    answer: "After logging in, navigate to the Wallet page from the navigation menu. Click on the 'Deposit' button and enter the amount you wish to deposit. In a real application, you would then be directed to a payment processor to complete the transaction. For this demo, funds are added instantly."
  },
  {
    question: "How do I buy stocks or cryptocurrencies?",
    answer: "To buy assets, first explore the Market page to find the asset you want to purchase. Click on the asset to view its details, then click the 'Buy' button. Enter the quantity you wish to purchase and confirm the transaction. Make sure you have sufficient funds in your wallet."
  },
  {
    question: "How do I sell my assets?",
    answer: "To sell assets you own, go to your Dashboard or the specific asset's detail page. Click the 'Sell' button, enter the quantity you wish to sell, and confirm the transaction. The funds will be added to your wallet balance."
  },
  {
    question: "What fees do you charge?",
    answer: "In a real brokerage platform, there would typically be trading fees, deposit/withdrawal fees, and possibly account maintenance fees. For this demo application, there are no fees charged on any transactions."
  },
  {
    question: "Is my data secure?",
    answer: "In a real brokerage platform, your data would be protected using industry-standard encryption and security measures. For this demo application, data is stored locally in your browser and is not transmitted to any external servers."
  },
  {
    question: "Can I trade on margin?",
    answer: "Margin trading is not available in this demo version. In a real brokerage platform, margin trading would allow you to borrow funds to increase your trading power, but it also comes with increased risks."
  },
  {
    question: "How do I track my portfolio performance?",
    answer: "Your portfolio performance is tracked automatically and displayed on your Dashboard. You can view your total portfolio value, asset distribution, and individual asset performance with gains and losses."
  }
];

const Help = () => {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter FAQs based on search query
  const filteredFaqs = searchQuery
    ? faqItems.filter(item => 
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.answer.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : faqItems;
  
  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is handled by the filteredFaqs variable
  };
  
  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-6 text-center max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Help & Support</h1>
          <p className="text-muted-foreground">
            Find answers to common questions or get in touch with our support team.
          </p>
        </div>
        
        {/* Search bar */}
        <div className="max-w-2xl mx-auto mb-12">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="search"
                placeholder="Search for answers..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button type="submit" className="bg-orange-500 hover:bg-orange-600">
              Search
            </Button>
          </form>
        </div>
        
        {/* Support categories */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="glass-card">
            <CardHeader className="text-center">
              <div className="w-12 h-12 rounded-full bg-orange-500/20 mx-auto flex items-center justify-center mb-2">
                <HelpCircle className="h-6 w-6 text-orange-500" />
              </div>
              <CardTitle>FAQ</CardTitle>
              <CardDescription>
                Find answers to commonly asked questions
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="glass-card">
            <CardHeader className="text-center">
              <div className="w-12 h-12 rounded-full bg-orange-500/20 mx-auto flex items-center justify-center mb-2">
                <MessagesSquare className="h-6 w-6 text-orange-500" />
              </div>
              <CardTitle>Support</CardTitle>
              <CardDescription>
                Contact our support team for help
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="glass-card">
            <CardHeader className="text-center">
              <div className="w-12 h-12 rounded-full bg-orange-500/20 mx-auto flex items-center justify-center mb-2">
                <BookOpen className="h-6 w-6 text-orange-500" />
              </div>
              <CardTitle>Knowledge Base</CardTitle>
              <CardDescription>
                Explore tutorials and guides
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
        
        {/* FAQ section */}
        <div className="mb-12">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>
            <p className="text-muted-foreground">
              Find quick answers to the most common questions
            </p>
          </div>
          
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              {filteredFaqs.length > 0 ? (
                filteredFaqs.map((item, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent>
                      <p className="text-muted-foreground">
                        {item.answer}
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                ))
              ) : (
                <p className="text-center py-4 text-muted-foreground">
                  No matching questions found. Try a different search term or contact us directly.
                </p>
              )}
            </Accordion>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Help;
