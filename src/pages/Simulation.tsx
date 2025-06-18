// Trading Simulation page for OrangeWave Trading Platform
// Provides a risk-free environment for users to practice trading strategies
// Features real-time price simulation, portfolio tracking, and performance analytics

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { usePortfolio, Asset } from '@/contexts/PortfolioContext';
import { getAllAssets, AssetData } from '@/services/marketService';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart } from 'recharts';
import { LineChart as LineChartIcon, Activity, TrendingUp, Calendar, ArrowUpRight, ArrowDownRight, CreditCard, Wallet, Info, Clock } from 'lucide-react';
import { format, addDays, subDays, addHours, addMinutes, addSeconds } from 'date-fns';
import { cn } from '@/lib/utils';

// Extended asset interface with simulation-specific properties
interface SimulationAsset extends AssetData {
  simulatedValue?: number;         // Current market value of owned quantity
  simulatedQuantity?: number;      // Number of shares/units owned in simulation
  simulatedAvgCost?: number;       // Average cost per unit (for profit/loss calculation)
  simulatedProfit?: number;        // Total profit/loss on position
  simulatedProfitPercent?: number; // Percentage profit/loss on position
  simulatedPrices?: number[];      // Pre-generated price movement array for simulation
}

// Data structure for tracking portfolio performance over time
interface SimulationDay {
  day: number;           // Simulation day counter
  date: string;          // Human-readable date
  time: string;          // Current simulation time
  portfolioValue: number; // Total value of owned assets
  cashBalance: number;   // Available cash balance
  totalValue: number;    // Portfolio value + cash balance
  change: number;        // Absolute change from previous period
  changePercent: number; // Percentage change from previous period
}

/**
 * Generates realistic price movements for simulation using random walk with optional trend
 * Creates an array of prices that simulate market volatility and trends
 * 
 * @param startPrice - Initial price to start simulation from
 * @param days - Number of price points to generate
 * @param volatility - Price volatility factor (default 0.02 = 2%)
 * @param trend - Optional trend factor for directional movement
 * @returns Array of simulated prices
 */
const generatePriceMovement = (
  startPrice: number, 
  days: number, 
  volatility: number = 0.02,
  trend: number = 0
) => {
  const prices = [startPrice];
  let currentPrice = startPrice;
  
  for (let i = 1; i < days; i++) {
    // Combine random walk with trend component for realistic price simulation
    const change = (Math.random() * 2 - 1) * volatility * currentPrice + trend * currentPrice;
    currentPrice = Math.max(0.01, currentPrice + change); // Prevent negative prices
    prices.push(Number(currentPrice.toFixed(2)));
  }
  
  return prices;
};

const Simulation = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { assets, getAssetsByType } = usePortfolio();
  
  // Core simulation state management
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);         // Time elapsed in simulation
  const [simulationAssets, setSimulationAssets] = useState<SimulationAsset[]>([]); // Assets with simulation data
  const [simulationHistory, setSimulationHistory] = useState<SimulationDay[]>([]); // Performance history
  const [simulationCash, setSimulationCash] = useState<number>(10000);     // Available cash for trading
  const [initialCash, setInitialCash] = useState<number>(10000);           // Starting cash amount
  const [isRunning, setIsRunning] = useState<boolean>(false);              // Simulation running state
  const [simulationSpeed, setSimulationSpeed] = useState<number>(1000);    // Update interval in milliseconds
  
  // Trading interface state
  const [tradeDialogOpen, setTradeDialogOpen] = useState<boolean>(false);    // Trade modal visibility
  const [selectedAsset, setSelectedAsset] = useState<SimulationAsset | null>(null); // Asset being traded
  const [tradeQuantity, setTradeQuantity] = useState<number>(1);             // Quantity for stock trades
  const [tradeAmount, setTradeAmount] = useState<string>('');                // Dollar amount for crypto trades
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');         // Trade direction
  
  // Settings interface state
  const [settingsDialogOpen, setSettingsDialogOpen] = useState<boolean>(false); // Settings modal visibility
  const [tempInitialCash, setTempInitialCash] = useState<number>(10000);         // Temporary settings value
  
  // Simulation parameters
  const volatility = 0.02;  // 2% price volatility
  const marketTrend = 0;    // Neutral market trend
  
  /**
   * Formats simulation elapsed time into HH:MM:SS format
   * @param totalSeconds - Total seconds elapsed in simulation
   * @returns Formatted time string
   */
  const formatElapsedTime = (totalSeconds: number): string => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  // Authentication guard: redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);
  
  // Initialize simulation with real market assets and generate price paths
  useEffect(() => {
    const initializeSimulationAssets = async () => {
      try {
        // Load all assets from the market service
        const allAssets = await getAllAssets();
        
        // Generate extensive price data for long-running simulations
        const maxPricePoints = 1000; // Enough for extended simulation sessions
        const simAssets = allAssets.map(asset => {
          // Create realistic price movements with crypto having higher volatility
          const futurePrices = generatePriceMovement(
            asset.price, 
            maxPricePoints,
            volatility,
            (asset.type === 'crypto' ? 1.5 : 1) * marketTrend // Crypto 50% more volatile
          );
          
          return {
            ...asset,
            simulatedQuantity: 0,        // Start with no positions
            simulatedAvgCost: asset.price,
            simulatedPrices: futurePrices,
            simulatedValue: 0,           // No value since no positions
          };
        });
        
        setSimulationAssets(simAssets);
        initializeSimulation(simAssets, initialCash);
      } catch (error) {
        console.error('Failed to load assets for simulation:', error);
      }
    };
    
    initializeSimulationAssets();
  }, [initialCash]);
  
  /**
   * Initializes or resets the simulation to starting state
   * @param assets - Array of simulation assets
   * @param startingCash - Initial cash balance
   */
  const initializeSimulation = (assets: SimulationAsset[], startingCash: number) => {
    setElapsedSeconds(0);
    setIsRunning(false);
    setSimulationCash(startingCash);
    
    // Use current date/time as simulation starting point
    const now = new Date();
    
    // Create initial history entry
    const initialDay: SimulationDay = {
      day: 0,
      date: format(now, 'MMM dd'),    // e.g., "Jun 18"
      time: format(now, 'HH:mm:ss'),  // e.g., "09:00:00"
      portfolioValue: 0,              // No assets owned initially
      cashBalance: startingCash,
      totalValue: startingCash,       // Total equals cash since no investments
      change: 0,
      changePercent: 0
    };
    
    setSimulationHistory([initialDay]);
  };
  
  /**
   * Resets the entire simulation to starting conditions
   * Clears all positions and returns to initial cash balance
   */
  const resetSimulation = () => {
    // Reset all asset positions to zero
    const resetAssets = simulationAssets.map(asset => ({
      ...asset,
      simulatedQuantity: 0,
      simulatedValue: 0,
      simulatedProfit: 0,
      simulatedProfitPercent: 0,
    }));
    
    setSimulationAssets(resetAssets);
    initializeSimulation(resetAssets, initialCash);
  };
  
  /**
   * Toggles simulation between running and paused states
   */
  const toggleSimulation = () => {
    setIsRunning(prev => !prev);
  };

  // Main simulation loop: updates prices and portfolio values when running
  useEffect(() => {
    if (!isRunning || simulationAssets.length === 0) return;
    
    const timer = setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
      
      // Calculate simulated market time (starts at 9:00 AM)
      const startTime = new Date();
      startTime.setHours(9, 0, 0, 0);
      const currentTime = addSeconds(startTime, elapsedSeconds + 1);
      
      // Get price index for current simulation time (cycles through available data)
      const priceIndex = (elapsedSeconds + 1) % 1000;
      
      // Update all asset prices and position values
      const updatedAssets = simulationAssets.map(asset => {
        const newPrice = asset.simulatedPrices?.[priceIndex] || asset.price;
        return {
          ...asset,
          simulatedValue: (asset.simulatedQuantity || 0) * newPrice,
          simulatedProfit: (asset.simulatedQuantity || 0) * (newPrice - (asset.simulatedAvgCost || asset.price)),
          simulatedProfitPercent: asset.simulatedAvgCost && asset.simulatedAvgCost > 0 ? 
            ((newPrice - asset.simulatedAvgCost) / asset.simulatedAvgCost) * 100 : 0
        };
      });
      
      setSimulationAssets(updatedAssets);
      
      // Calculate portfolio performance metrics
      const portfolioValue = updatedAssets.reduce(
        (sum, asset) => sum + (asset.simulatedQuantity || 0) * (asset.simulatedPrices?.[priceIndex] || asset.price), 0
      );
      
      const totalValue = portfolioValue + simulationCash;
      const prevTotalValue = simulationHistory[simulationHistory.length - 1].totalValue;
      
      // Add new entry to performance history
      const newEntry: SimulationDay = {
        day: elapsedSeconds + 1,
        date: format(currentTime, 'MMM dd'),
        time: format(currentTime, 'HH:mm:ss'),
        portfolioValue,
        cashBalance: simulationCash,
        totalValue,
        change: totalValue - prevTotalValue,
        changePercent: ((totalValue / prevTotalValue) - 1) * 100
      };
      
      setSimulationHistory(prev => {
        // Limit history to prevent memory issues in long simulations
        const history = [...prev, newEntry];
        if (history.length > 100) {
          return history.slice(history.length - 100); // Keep last 100 entries
        }
        return history;
      });
      
    }, simulationSpeed);
    
    return () => clearInterval(timer);
  }, [isRunning, elapsedSeconds, simulationAssets, simulationHistory, simulationSpeed, simulationCash]);
  
  /**
   * Opens the trading dialog for a specific asset
   * @param asset - Asset to trade
   * @param type - Buy or sell operation
   */
  const handleTrade = (asset: SimulationAsset, type: 'buy' | 'sell') => {
    setSelectedAsset(asset);
    setTradeType(type);
    setTradeQuantity(1);
    setTradeAmount(''); // Reset for crypto trades
    setTradeDialogOpen(true);
  };
  
  /**
   * Executes a buy or sell trade in the simulation
   * Handles both stock (whole shares) and crypto (fractional) trading
   * Updates portfolio positions and cash balance
   */
  const executeTrade = () => {
    if (!selectedAsset) return;
    
    // Get current price based on simulation time
    const priceIndex = elapsedSeconds % 1000;
    const currentPrice = selectedAsset.simulatedPrices?.[priceIndex] || selectedAsset.price;
    
    let finalQuantity = 0;
    let tradeValue = 0;
    
    // Calculate trade parameters based on asset type
    if (selectedAsset.type === 'crypto' && tradeAmount) {
      // Crypto: trade by dollar amount, calculate fractional quantity
      const dollarAmount = parseFloat(tradeAmount);
      if (dollarAmount <= 0 || isNaN(dollarAmount)) {
        alert("Please enter a valid dollar amount.");
        return;
      }
      finalQuantity = dollarAmount / currentPrice;
      tradeValue = dollarAmount;
    } else {
      // Stocks: trade by whole shares
      if (tradeQuantity <= 0) return;
      finalQuantity = tradeQuantity;
      tradeValue = currentPrice * tradeQuantity;
    }
    
    if (tradeType === 'buy') {
      // Validate sufficient funds
      if (simulationCash < tradeValue) {
        alert("Insufficient funds for this trade.");
        return;
      }
      
      // Execute buy order: update position and calculate new average cost
      const updatedAssets = simulationAssets.map(asset => {
        if (asset.id === selectedAsset.id) {
          const newQuantity = (asset.simulatedQuantity || 0) + finalQuantity;
          // Calculate weighted average cost for position
          const newAvgCost = (
            ((asset.simulatedQuantity || 0) * (asset.simulatedAvgCost || 0)) + 
            (finalQuantity * currentPrice)
          ) / newQuantity;
          
          return {
            ...asset,
            simulatedQuantity: newQuantity,
            simulatedAvgCost: newAvgCost,
            simulatedValue: newQuantity * currentPrice,
            simulatedProfit: newQuantity * (currentPrice - newAvgCost),
            simulatedProfitPercent: ((currentPrice - newAvgCost) / newAvgCost) * 100,
          };
        }
        return asset;
      });
      
      setSimulationAssets(updatedAssets);
      setSimulationCash(prev => prev - tradeValue);
    } else {
      // Validate sufficient holdings for sell
      if ((selectedAsset.simulatedQuantity || 0) < finalQuantity) {
        alert("You don't own enough of this asset to sell.");
        return;
      }
      
      // Execute sell order: reduce position, maintain average cost for remaining shares
      const updatedAssets = simulationAssets.map(asset => {
        if (asset.id === selectedAsset.id) {
          const newQuantity = (asset.simulatedQuantity || 0) - finalQuantity;
          return {
            ...asset,
            simulatedQuantity: newQuantity,
            simulatedValue: newQuantity * currentPrice,
            simulatedProfit: newQuantity * (currentPrice - (asset.simulatedAvgCost || 0)),
            simulatedProfitPercent: asset.simulatedAvgCost && asset.simulatedAvgCost > 0 && newQuantity > 0 ? 
              ((currentPrice - asset.simulatedAvgCost) / asset.simulatedAvgCost) * 100 : 0,
          };
        }
        return asset;
      });
      
      setSimulationAssets(updatedAssets);
      setSimulationCash(prev => prev + tradeValue);
    }
    
    setTradeDialogOpen(false);
  };

  /**
   * Calculates total market value of all owned assets
   * @returns Total portfolio value at current prices
   */
  const getTotalPortfolioValue = () => {
    const priceIndex = elapsedSeconds % 1000;
    return simulationAssets.reduce((sum, asset) => {
      const currentPrice = asset.simulatedPrices?.[priceIndex] || asset.price;
      return sum + (asset.simulatedQuantity || 0) * currentPrice;
    }, 0);
  };
  
  /**
   * Calculates total return on investment
   * @returns Object with absolute return amount and percentage
   */
  const calculateTotalReturn = () => {
    const portfolioValue = getTotalPortfolioValue();
    const totalValue = portfolioValue + simulationCash;
    const returnAmount = totalValue - initialCash;
    const returnPercent = ((totalValue / initialCash) - 1) * 100;
    
    return {
      amount: returnAmount,
      percent: returnPercent
    };
  };
  
  /**
   * Prepares recent performance data for chart display
   * @returns Array of chart data points for last 24 entries
   */
  const prepareChartData = () => {
    const startIdx = Math.max(0, simulationHistory.length - 24);
    return simulationHistory.slice(startIdx).map(entry => ({
      time: entry.time,
      value: entry.totalValue,
    }));
  };
  
  // Authentication guard
  if (!isAuthenticated) {
    return null; // Will be redirected by useEffect
  }
  
  const totalReturn = calculateTotalReturn();
  const isPositiveReturn = totalReturn.amount >= 0;
  
  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        {/* Page header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-1">Trading Simulation</h1>
          <p className="text-muted-foreground">
            Practice trading strategies in a risk-free environment
          </p>
        </div>
        
        {/* Simulation control panel and performance overview */}
        <Card className="mb-6">
          <CardHeader className="pb-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <CardTitle className="text-xl flex items-center">
                  <Clock className="mr-2 h-5 w-5" />
                  Simulation Progress
                </CardTitle>
                <CardDescription>
                  Time Elapsed: {formatElapsedTime(elapsedSeconds)}
                </CardDescription>
              </div>
              
              {/* Control buttons */}
              <div className="flex gap-2 mt-4 md:mt-0">
                <Button 
                  variant={isRunning ? "destructive" : "default"}
                  onClick={toggleSimulation}
                >
                  {isRunning ? "Pause" : "Start"}
                </Button>
                
                <Button variant="outline" onClick={resetSimulation}>
                  Reset Simulation
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => setSettingsDialogOpen(true)}
                >
                  Settings
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-6">
              {/* Portfolio summary metrics */}
              <div className="w-full md:w-1/3">
                <h3 className="text-lg font-medium mb-3">Simulation Summary</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">Initial Investment</p>
                    <p className="text-xl font-bold">${initialCash.toLocaleString()}</p>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">Current Cash</p>
                    <p className="text-xl font-bold">${simulationCash.toLocaleString()}</p>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">Portfolio Value</p>
                    <p className="text-xl font-bold">${getTotalPortfolioValue().toLocaleString()}</p>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">Total Value</p>
                    <p className="text-xl font-bold">${(simulationCash + getTotalPortfolioValue()).toLocaleString()}</p>
                  </div>
                </div>
                
                {/* Total return display with color coding */}
                <div className={cn(
                  "mt-4 p-4 border rounded-lg",
                  isPositiveReturn ? "border-green-500" : "border-red-500"
                )}>
                  <p className="text-sm text-muted-foreground">Total Return</p>
                  <div className="flex items-center">
                    {isPositiveReturn ? (
                      <ArrowUpRight className="h-4 w-4 mr-1 text-green-500" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 mr-1 text-red-500" />
                    )}
                    <p className={cn(
                      "text-xl font-bold",
                      isPositiveReturn ? "text-green-500" : "text-red-500"
                    )}>
                      ${Math.abs(totalReturn.amount).toLocaleString()} ({isPositiveReturn ? '+' : ''}{totalReturn.percent.toFixed(2)}%)
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Performance chart showing recent portfolio value changes */}
              <div className="w-full md:w-2/3">
                <h3 className="text-lg font-medium mb-3">Performance Chart (24-hour view)</h3>
                <div className="h-64">
                  {simulationHistory.length > 1 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={prepareChartData()}>
                        <defs>
                          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                        <XAxis 
                          dataKey="time" 
                          tick={{fontSize: 12}} 
                        />
                        <YAxis 
                          tick={{fontSize: 12}}
                          domain={['dataMin - 1000', 'dataMax + 1000']}
                          tickFormatter={(value) => `$${value.toLocaleString()}`}
                        />
                        <Tooltip 
                          formatter={(value) => [`$${Number(value).toLocaleString()}`, "Portfolio Value"]}
                          labelFormatter={(label) => `Time: ${label}`}
                          contentStyle={{
                            backgroundColor: '#1e1e1e',
                            border: '1px solid #333',
                          }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="value" 
                          name="Portfolio Value" 
                          stroke="#8884d8" 
                          fillOpacity={1} 
                          fill="url(#colorValue)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <p className="text-muted-foreground">Simulation starting...</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Asset list with trading interface */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2 h-5 w-5" />
              Simulation Portfolio
            </CardTitle>
            <CardDescription>
              Assets you can trade in the simulation (unlimited quantities available)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {simulationAssets.map(asset => {
                const priceIndex = elapsedSeconds % 1000;
                const currentPrice = asset.simulatedPrices?.[priceIndex] || asset.price;
                const previousPrice = priceIndex > 0 ? 
                  asset.simulatedPrices?.[priceIndex - 1] || asset.price : 
                  asset.price;
                  
                // Calculate price movement indicators
                const priceChange = currentPrice - previousPrice;
                const priceChangePercent = (priceChange / previousPrice) * 100;
                const isPositive = priceChange >= 0;
                
                // Calculate position metrics
                const ownedValue = (asset.simulatedQuantity || 0) * currentPrice;
                const profitLoss = (asset.simulatedQuantity || 0) * (currentPrice - (asset.simulatedAvgCost || 0));
                const profitLossPercent = asset.simulatedAvgCost && asset.simulatedAvgCost > 0 ? 
                  ((currentPrice - asset.simulatedAvgCost) / asset.simulatedAvgCost) * 100 : 0;
                
                return (
                  <div key={asset.id} className="p-4 border rounded-lg hover:border-primary/50 transition-all">
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                      {/* Asset identification */}
                      <div className="flex items-center col-span-1">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mr-3">
                          {asset.logoUrl ? (
                            <img src={asset.logoUrl} alt={asset.name} className="w-6 h-6" />
                          ) : (
                            <span className="text-xs font-bold">{asset.symbol.substring(0, 2)}</span>
                          )}
                        </div>
                        
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{asset.symbol}</span>
                            <Badge variant="outline" className={cn(
                              "text-xs capitalize",
                              asset.type === "stock" ? "bg-blue-500/10 text-blue-500" : "bg-orange-500/10 text-orange-500"
                            )}>
                              {asset.type}
                            </Badge>
                          </div>
                          <span className="text-xs text-muted-foreground">{asset.name}</span>
                        </div>
                      </div>
                      
                      {/* Current price and movement */}
                      <div className="md:col-span-1">
                        <div className="text-sm text-muted-foreground">Current Price</div>
                        <div className="font-medium">${currentPrice.toFixed(2)}</div>
                        <div className={cn(
                          "text-xs flex items-center",
                          isPositive ? "text-green-500" : "text-red-500"
                        )}>
                          {isPositive ? (
                            <ArrowUpRight className="h-3 w-3 mr-1" />
                          ) : (
                            <ArrowDownRight className="h-3 w-3 mr-1" />
                          )}
                          {isPositive ? "+" : ""}{priceChange.toFixed(2)} ({isPositive ? "+" : ""}{priceChangePercent.toFixed(2)}%)
                        </div>
                      </div>
                      
                      {/* Availability (unlimited in simulation) */}
                      <div className="md:col-span-1">
                        <div className="text-sm text-muted-foreground">Availability</div>
                        <div className="font-medium text-green-500">
                          Unlimited
                        </div>
                        <div className="text-xs text-muted-foreground">
                          No limits in simulation
                        </div>
                      </div>
                      
                      {/* User's position */}
                      <div className="md:col-span-1">
                        <div className="text-sm text-muted-foreground">Your Position</div>
                        <div className="font-medium">
                          {asset.type === 'crypto' ? 
                            (asset.simulatedQuantity || 0).toFixed(6) : 
                            (asset.simulatedQuantity || 0).toFixed(0)
                          } {'shares'}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {asset.simulatedQuantity ? `Avg. cost: $${(asset.simulatedAvgCost || 0).toFixed(2)}` : 'No position'}
                        </div>
                      </div>
                      
                      {/* Position value and P&L */}
                      <div className="md:col-span-1">
                        <div className="text-sm text-muted-foreground">Value</div>
                        <div className="font-medium">${ownedValue.toFixed(2)}</div>
                        {asset.simulatedQuantity ? (
                          <div className={cn(
                            "text-xs",
                            profitLoss >= 0 ? "text-green-500" : "text-red-500"
                          )}>
                            {profitLoss >= 0 ? "+" : ""}{profitLoss.toFixed(2)} ({profitLoss >= 0 ? "+" : ""}{profitLossPercent.toFixed(2)}%)
                          </div>
                        ) : (
                          <div className="text-xs text-muted-foreground">No position</div>
                        )}
                      </div>
                      
                      {/* Trading action buttons */}
                      <div className="flex items-center justify-end md:col-span-1 gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleTrade(asset, 'buy')}
                        >
                          Buy
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          size="sm"
                          className={cn(
                            "border-red-500 text-red-500 hover:bg-red-500/10",
                            (!asset.simulatedQuantity || asset.simulatedQuantity <= 0) && "opacity-50 cursor-not-allowed"
                          )}
                          onClick={() => handleTrade(asset, 'sell')}
                          disabled={(!asset.simulatedQuantity || asset.simulatedQuantity <= 0)}
                        >
                          Sell
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
        
        {/* Trading Dialog - handles both buy and sell operations */}
        <Dialog open={tradeDialogOpen} onOpenChange={setTradeDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {tradeType === 'buy' ? 'Buy' : 'Sell'} {selectedAsset?.symbol}
              </DialogTitle>
              <DialogDescription>
                Current price: ${selectedAsset?.simulatedPrices?.[elapsedSeconds % 1000]?.toFixed(2) || selectedAsset?.price.toFixed(2)}
                {selectedAsset?.type === 'stock' && (
                  <span className="block mt-1 text-green-500">Unlimited stock available in simulation</span>
                )}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              {/* Different input types for crypto vs stocks */}
              {selectedAsset?.type === 'crypto' ? (
                <div className="space-y-2">
                  <Label htmlFor="amount">Dollar Amount</Label>
                  <Input 
                    id="amount" 
                    type="number" 
                    min={0.01} 
                    step={0.01}
                    placeholder="Enter dollar amount (e.g., 100.00)"
                    value={tradeAmount} 
                    onChange={(e) => setTradeAmount(e.target.value)} 
                  />
                  <div className="text-xs text-muted-foreground">
                    {tradeAmount && !isNaN(parseFloat(tradeAmount)) ? 
                      `≈ ${(parseFloat(tradeAmount) / (selectedAsset?.simulatedPrices?.[elapsedSeconds % 1000] || selectedAsset?.price || 1)).toFixed(6)} ${selectedAsset?.symbol}` : 
                      'Enter amount to see quantity'
                    }
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity (Shares)</Label>
                  <Input 
                    id="quantity" 
                    type="number" 
                    min={1} 
                    step={1}
                    value={tradeQuantity} 
                    onChange={(e) => setTradeQuantity(Math.max(1, parseInt(e.target.value) || 0))} 
                  />
                </div>
              )}
              
              {/* Trade summary */}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Cost:</span>
                <span className="font-medium">
                  ${selectedAsset?.type === 'crypto' && tradeAmount ? 
                    parseFloat(tradeAmount).toFixed(2) : 
                    ((selectedAsset?.simulatedPrices?.[elapsedSeconds % 1000] || selectedAsset?.price || 0) * tradeQuantity).toFixed(2)
                  }
                </span>
              </div>
              
              {/* Available balances */}
              {tradeType === 'buy' && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Available Cash:</span>
                  <span className="font-medium">${simulationCash.toFixed(2)}</span>
                </div>
              )}
              
              {tradeType === 'sell' && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Available to Sell:</span>
                  <span className="font-medium">
                    {selectedAsset?.type === 'crypto' ? 
                      (selectedAsset?.simulatedQuantity || 0).toFixed(6) : 
                      (selectedAsset?.simulatedQuantity || 0).toFixed(0)
                    } {selectedAsset?.type === 'stock' ? 'shares' : selectedAsset?.symbol}
                  </span>
                </div>
              )}
              
              {/* Validation alerts for insufficient funds or holdings */}
              {tradeType === 'buy' && selectedAsset?.type === 'crypto' && tradeAmount && 
                parseFloat(tradeAmount) > simulationCash && (
                <Alert variant="destructive">
                  <AlertDescription>
                    Insufficient funds for this transaction.
                  </AlertDescription>
                </Alert>
              )}
              
              {tradeType === 'buy' && selectedAsset?.type === 'stock' && 
                ((selectedAsset?.simulatedPrices?.[elapsedSeconds % 1000] || selectedAsset?.price || 0) * tradeQuantity) > simulationCash && (
                <Alert variant="destructive">
                  <AlertDescription>
                    Insufficient funds for this transaction.
                  </AlertDescription>
                </Alert>
              )}
              
              {tradeType === 'sell' && selectedAsset?.type === 'crypto' && tradeAmount &&
                (parseFloat(tradeAmount) / (selectedAsset?.simulatedPrices?.[elapsedSeconds % 1000] || selectedAsset?.price || 1)) > (selectedAsset?.simulatedQuantity || 0) && (
                <Alert variant="destructive">
                  <AlertDescription>
                    You don't own enough of this asset for this transaction.
                  </AlertDescription>
                </Alert>
              )}
              
              {tradeType === 'sell' && selectedAsset?.type === 'stock' &&
                tradeQuantity > (selectedAsset?.simulatedQuantity || 0) && (
                <Alert variant="destructive">
                  <AlertDescription>
                    You don't own enough shares for this transaction.
                  </AlertDescription>
                </Alert>
              )}
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setTradeDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={executeTrade}
                disabled={
                  (tradeType === 'buy' && selectedAsset?.type === 'crypto' && tradeAmount && 
                    parseFloat(tradeAmount) > simulationCash) ||
                  (tradeType === 'buy' && selectedAsset?.type === 'stock' && 
                    (((selectedAsset?.simulatedPrices?.[elapsedSeconds % 1000] || selectedAsset?.price || 0) * tradeQuantity) > simulationCash)) ||
                  (tradeType === 'sell' && selectedAsset?.type === 'crypto' && tradeAmount &&
                    (parseFloat(tradeAmount) / (selectedAsset?.simulatedPrices?.[elapsedSeconds % 1000] || selectedAsset?.price || 1)) > (selectedAsset?.simulatedQuantity || 0)) ||
                  (tradeType === 'sell' && selectedAsset?.type === 'stock' && tradeQuantity > (selectedAsset?.simulatedQuantity || 0)) ||
                  (selectedAsset?.type === 'crypto' && (!tradeAmount || parseFloat(tradeAmount) <= 0))
                }
                className={tradeType === 'sell' ? "bg-red-600 hover:bg-red-700" : ""}
              >
                {tradeType === 'buy' ? 'Buy' : 'Sell'} {selectedAsset?.symbol}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Settings Dialog - configure simulation parameters */}
        <Dialog open={settingsDialogOpen} onOpenChange={setSettingsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Simulation Settings</DialogTitle>
              <DialogDescription>
                Adjust simulation parameters
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 py-4">
              {/* Initial cash balance setting */}
              <div className="space-y-4">
                <Label>Initial Cash Balance</Label>
                <div className="flex items-center gap-2">
                  <span>$</span>
                  <Input 
                    type="number" 
                    min={1000} 
                    step={1000}
                    value={tempInitialCash} 
                    onChange={(e) => setTempInitialCash(Math.max(1000, parseInt(e.target.value) || 1000))}
                  />
                </div>
                <div className="text-xs text-muted-foreground">
                  Minimum: $1,000. This will reset your simulation when applied.
                </div>
              </div>
              
              {/* Simulation speed control */}
              <div className="space-y-4">
                <div>
                  <Label className="mb-2 block">Simulation Speed</Label>
                  <div className="flex items-center gap-4">
                    <span>Slow</span>
                    <Slider 
                      defaultValue={[2000 - simulationSpeed]} 
                      min={0} 
                      max={1900} 
                      step={100} 
                      onValueChange={(value) => setSimulationSpeed(2000 - value[0])}
                    />
                    <span>Fast</span>
                  </div>
                  <p className="text-xs text-center text-muted-foreground mt-2">
                    {simulationSpeed > 1500 ? 'Very Slow' : 
                      simulationSpeed > 1000 ? 'Slow' : 
                      simulationSpeed > 500 ? 'Medium' : 
                      simulationSpeed > 200 ? 'Fast' : 'Very Fast'} 
                      ({(2000 - simulationSpeed) / 1900 * 100}%)
                  </p>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setSettingsDialogOpen(false);
                setTempInitialCash(initialCash); // Reset temp value
              }}>
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  setInitialCash(tempInitialCash);
                  setSettingsDialogOpen(false);
                  resetSimulation();
                }}
              >
                Apply Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default Simulation;