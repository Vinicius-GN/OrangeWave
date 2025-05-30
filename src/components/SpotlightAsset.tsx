
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AssetData } from '@/services/marketService';
import { cn } from '@/lib/utils';

interface SpotlightAssetProps {
  asset: AssetData;
  showButtons?: boolean;
}

const SpotlightAsset: React.FC<SpotlightAssetProps> = ({ 
  asset,
  showButtons = false // Default to false for Home page
}) => {
  const isPositive = asset.changePercent >= 0;
  
  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };
  
  // Format market cap
  const formatMarketCap = (value: number) => {
    if (value >= 1_000_000_000) {
      return `${(value / 1_000_000_000).toFixed(2)}B`;
    } else if (value >= 1_000_000) {
      return `${(value / 1_000_000).toFixed(2)}M`;
    } else {
      return `${(value / 1_000).toFixed(2)}K`;
    }
  };
  
  return (
    <Link to={`/asset/${asset.id}`}>
      <Card className="overflow-hidden hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {asset.logo && (
                <div className="w-8 h-8 rounded-full bg-secondary/50 flex items-center justify-center overflow-hidden">
                  <img 
                    src={asset.logo}
                    alt={asset.name}
                    className="w-6 h-6 object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
              <div>
                <h3 className="font-medium">{asset.name}</h3>
                <p className="text-xs text-muted-foreground">{asset.symbol}</p>
              </div>
            </div>
            
            <Badge variant="outline" className={cn(
              "rounded-md",
              asset.type === 'stock' ? "bg-blue-500/10 text-blue-500" : "bg-orange-500/10 text-orange-500"
            )}>
              {asset.type === 'stock' ? 'Stock' : 'Crypto'}
            </Badge>
          </div>
          
          <div className="flex justify-between items-end mt-2">
            <div>
              <p className="text-xl font-bold">{formatCurrency(asset.price)}</p>
              <div className={cn(
                "flex items-center text-sm",
                isPositive ? "text-green-500" : "text-red-500"
              )}>
                {isPositive ? (
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 mr-1" />
                )}
                {isPositive ? "+" : ""}{asset.changePercent.toFixed(2)}%
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Market Cap</p>
              <p className="font-medium">{formatMarketCap(asset.marketCap)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default SpotlightAsset;
