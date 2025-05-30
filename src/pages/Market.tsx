
import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import Layout from '@/components/Layout';
import MarketTable from '@/components/MarketTable';
import { AssetData, getStocks, getCryptos } from '@/services/marketService';

const Market = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const initialType = searchParams.get('type') || 'all';
  const initialSort = searchParams.get('sort') || 'marketCap';
  
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [assetType, setAssetType] = useState<'all' | 'stocks' | 'crypto'>(initialType as any);
  const [sortBy, setSortBy] = useState(initialSort);
  
  const [isLoading, setIsLoading] = useState(true);
  const [stocks, setStocks] = useState<AssetData[]>([]);
  const [crypto, setCrypto] = useState<AssetData[]>([]);
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [minChange, setMinChange] = useState<string>('');
  const [maxChange, setMaxChange] = useState<string>('');
  
  // Load market data
  useEffect(() => {
    const loadMarketData = async () => {
      setIsLoading(true);
      try {
        const [stocksData, cryptoData] = await Promise.all([
          getStocks(),
          getCryptos()
        ]);
        
        setStocks(stocksData);
        setCrypto(cryptoData);
      } catch (error) {
        console.error('Failed to load market data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadMarketData();
  }, []);
  
  // Apply filters using useMemo for better performance
  const filteredAssets = useMemo(() => {
    let data: AssetData[] = [];
    
    // Filter by asset type
    if (assetType === 'stocks') {
      data = [...stocks];
    } else if (assetType === 'crypto') {
      data = [...crypto];
    } else {
      data = [...stocks, ...crypto];
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      data = data.filter(asset => 
        asset.name.toLowerCase().includes(query) || 
        asset.symbol.toLowerCase().includes(query)
      );
    }
    
    // Apply price filters
    if (minPrice && !isNaN(parseFloat(minPrice))) {
      data = data.filter(asset => asset.price >= parseFloat(minPrice));
    }
    
    if (maxPrice && !isNaN(parseFloat(maxPrice))) {
      data = data.filter(asset => asset.price <= parseFloat(maxPrice));
    }
    
    // Apply change percentage filters
    if (minChange && !isNaN(parseFloat(minChange))) {
      data = data.filter(asset => asset.changePercent >= parseFloat(minChange));
    }
    
    if (maxChange && !isNaN(parseFloat(maxChange))) {
      data = data.filter(asset => asset.changePercent <= parseFloat(maxChange));
    }
    
    // Apply sorting (now handled by table column headers)
    if (sortBy === 'name') {
      data.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'price') {
      data.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'change') {
      data.sort((a, b) => b.changePercent - a.changePercent);
    } else {
      // Default: sort by marketCap
      data.sort((a, b) => b.marketCap - a.marketCap);
    }
    
    // Update search params
    const newParams = new URLSearchParams();
    if (searchQuery) newParams.set('search', searchQuery);
    if (assetType !== 'all') newParams.set('type', assetType);
    if (sortBy !== 'marketCap') newParams.set('sort', sortBy);
    if (minPrice) newParams.set('minPrice', minPrice);
    if (maxPrice) newParams.set('maxPrice', maxPrice);
    if (minChange) newParams.set('minChange', minChange);
    if (maxChange) newParams.set('maxChange', maxChange);
    setSearchParams(newParams, { replace: true });
    
    return data;
  }, [searchQuery, assetType, sortBy, stocks, crypto, minPrice, maxPrice, minChange, maxChange, setSearchParams]);
  
  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // The search is now reactive due to useMemo
  };
  
  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setAssetType('all');
    setSortBy('marketCap');
    setMinPrice('');
    setMaxPrice('');
    setMinChange('');
    setMaxChange('');
  };
  
  // Update the asset type filter and sync with Tabs
  const handleAssetTypeChange = (value: string) => {
    setAssetType(value as 'all' | 'stocks' | 'crypto');
  };
  
  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-1">Market Explorer</h1>
          <p className="text-muted-foreground">
            Explore and analyze available stocks and cryptocurrencies.
          </p>
        </div>
        
        {/* Search and Filters */}
        <div className="mb-6">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="search"
                placeholder="Search by name or symbol..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Filter className="h-4 w-4" />
                  <span className="hidden sm:inline">Filters</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Asset Type</h4>
                    <RadioGroup 
                      value={assetType}
                      onValueChange={handleAssetTypeChange}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="all" id="all" />
                        <Label htmlFor="all">All Assets</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="stocks" id="stocks" />
                        <Label htmlFor="stocks">Stocks Only</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="crypto" id="crypto" />
                        <Label htmlFor="crypto">Crypto Only</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Price Range</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label htmlFor="minPrice">Min Price</Label>
                        <Input 
                          id="minPrice" 
                          type="number" 
                          value={minPrice} 
                          onChange={(e) => setMinPrice(e.target.value)}
                          placeholder="Min $"
                        />
                      </div>
                      <div>
                        <Label htmlFor="maxPrice">Max Price</Label>
                        <Input 
                          id="maxPrice" 
                          type="number" 
                          value={maxPrice} 
                          onChange={(e) => setMaxPrice(e.target.value)}
                          placeholder="Max $"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">% Change Range</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label htmlFor="minChange">Min Change %</Label>
                        <Input 
                          id="minChange" 
                          type="number" 
                          value={minChange} 
                          onChange={(e) => setMinChange(e.target.value)}
                          placeholder="Min %"
                        />
                      </div>
                      <div>
                        <Label htmlFor="maxChange">Max Change %</Label>
                        <Input 
                          id="maxChange" 
                          type="number" 
                          value={maxChange} 
                          onChange={(e) => setMaxChange(e.target.value)}
                          placeholder="Max %"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Removed "Sort By" filter section as requested */}
                  
                  <Button 
                    variant="outline" 
                    className="w-full mt-2" 
                    onClick={clearFilters}
                  >
                    Clear All Filters
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
            
            <Button type="submit" className="bg-primary hover:bg-primary/90">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </form>
        </div>
        
        {/* Market Table */}
        <Tabs value={assetType} onValueChange={handleAssetTypeChange}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Market Data</h2>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="stocks">Stocks</TabsTrigger>
              <TabsTrigger value="crypto">Crypto</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="all" className="mt-0">
            <MarketTable assets={filteredAssets} isLoading={isLoading} />
          </TabsContent>
          
          <TabsContent value="stocks" className="mt-0">
            <MarketTable assets={filteredAssets.filter(asset => asset.type === 'stock')} isLoading={isLoading} />
          </TabsContent>
          
          <TabsContent value="crypto" className="mt-0">
            <MarketTable assets={filteredAssets.filter(asset => asset.type === 'crypto')} isLoading={isLoading} />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Market;
