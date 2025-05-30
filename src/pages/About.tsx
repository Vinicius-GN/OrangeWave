
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Layout from '@/components/Layout';
import { ArrowRight, Shield, Globe, TrendingUp, Banknote, Users, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

const About = () => {
  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl font-bold mb-4">About OrangeWave</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Empowering investors with innovative tools and technologies for the modern financial world.
          </p>
          <div className="flex justify-center">
            <Link to="/register">
              <Button className="bg-orange-500 hover:bg-orange-600">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
        
        {/* Mission Section */}
        <div className="mb-16">
          <div className="glass-card p-8 rounded-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
                <p className="text-muted-foreground mb-4">
                  OrangeWave was founded with a clear mission: to democratize investing and make financial markets accessible to everyone.
                </p>
                <p className="text-muted-foreground mb-4">
                  We believe that everyone should have the opportunity to grow their wealth through investing, regardless of their background or experience level.
                </p>
                <p className="text-muted-foreground">
                  Our platform combines powerful trading tools with an intuitive user experience, enabling both beginners and experienced traders to navigate the markets with confidence.
                </p>
              </div>
              <div className="bg-secondary/50 rounded-xl p-8 hidden md:block">
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Shield className="h-6 w-6 text-orange-500 mr-3" />
                    <span className="font-medium">Security First Approach</span>
                  </div>
                  <div className="flex items-center">
                    <Globe className="h-6 w-6 text-orange-500 mr-3" />
                    <span className="font-medium">Global Market Access</span>
                  </div>
                  <div className="flex items-center">
                    <TrendingUp className="h-6 w-6 text-orange-500 mr-3" />
                    <span className="font-medium">Advanced Trading Tools</span>
                  </div>
                  <div className="flex items-center">
                    <Banknote className="h-6 w-6 text-orange-500 mr-3" />
                    <span className="font-medium">Competitive Pricing</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Core Values */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">Our Core Values</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              The principles that guide us in building a trusted platform for millions of investors
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="glass-card">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-orange-500" />
                </div>
                <h3 className="text-xl font-bold mb-2">Security & Trust</h3>
                <p className="text-muted-foreground">
                  We prioritize the security of your assets and personal information above all else, employing industry-leading protection measures.
                </p>
              </CardContent>
            </Card>
            
            <Card className="glass-card">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-orange-500" />
                </div>
                <h3 className="text-xl font-bold mb-2">Innovation</h3>
                <p className="text-muted-foreground">
                  We constantly push the boundaries of what's possible in financial technology to provide you with cutting-edge tools and features.
                </p>
              </CardContent>
            </Card>
            
            <Card className="glass-card">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-orange-500" />
                </div>
                <h3 className="text-xl font-bold mb-2">Accessibility</h3>
                <p className="text-muted-foreground">
                  We design our platform to be intuitive and accessible for everyone, removing barriers to financial markets.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Why Choose Us */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">Why Choose OrangeWave</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Discover the advantages that set us apart from traditional brokerages
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex gap-4 p-6 border rounded-lg">
              <div className="w-10 h-10 rounded-full bg-orange-500/20 flex-shrink-0 flex items-center justify-center">
                <Star className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <h3 className="font-bold mb-2">Commission-Free Trading</h3>
                <p className="text-muted-foreground">
                  Trade stocks and cryptocurrencies without paying commissions, maximizing your investment returns.
                </p>
              </div>
            </div>
            
            <div className="flex gap-4 p-6 border rounded-lg">
              <div className="w-10 h-10 rounded-full bg-orange-500/20 flex-shrink-0 flex items-center justify-center">
                <Star className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <h3 className="font-bold mb-2">Real-Time Market Data</h3>
                <p className="text-muted-foreground">
                  Access up-to-the-minute price data, charts, and market news to make informed decisions.
                </p>
              </div>
            </div>
            
            <div className="flex gap-4 p-6 border rounded-lg">
              <div className="w-10 h-10 rounded-full bg-orange-500/20 flex-shrink-0 flex items-center justify-center">
                <Star className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <h3 className="font-bold mb-2">Powerful Portfolio Tools</h3>
                <p className="text-muted-foreground">
                  Track your investments, analyze performance, and optimize your portfolio with our advanced tools.
                </p>
              </div>
            </div>
            
            <div className="flex gap-4 p-6 border rounded-lg">
              <div className="w-10 h-10 rounded-full bg-orange-500/20 flex-shrink-0 flex items-center justify-center">
                <Star className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <h3 className="font-bold mb-2">Seamless Experience</h3>
                <p className="text-muted-foreground">
                  Enjoy a smooth, intuitive trading experience designed for both beginners and pros.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* CTA Section */}
        <div>
          <div className="glass-card rounded-2xl p-8 md:p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to start investing?</h2>
            <p className="text-xl text-muted-foreground mb-6 max-w-2xl mx-auto">
              Join thousands of traders on OrangeWave and take control of your financial future today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button size="lg" className="bg-orange-500 hover:bg-orange-600">
                  Create an Account
                </Button>
              </Link>
              <Link to="/market">
                <Button size="lg" variant="outline">
                  Explore Markets
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default About;
