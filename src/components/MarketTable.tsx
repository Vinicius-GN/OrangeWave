import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingDown, TrendingUp, ArrowDown, ArrowUp } from 'lucide-react';
import { AssetData } from '@/services/marketService';
import { cn } from '@/lib/utils';

interface MarketTableProps {
  assets: AssetData[];
  isLoading?: boolean;
}

type SortField = 'name' | 'price' | 'change' | 'marketCap' | 'volume';
type SortDirection = 'asc' | 'desc';

const MarketTable = ({ assets, isLoading = false }: MarketTableProps) => {
  const navigate = useNavigate();
  const [sortField, setSortField] = useState<SortField>('marketCap');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  
  // Handle sorting
  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };
  
  // Sort assets
  const sortedAssets = [...assets].sort((a, b) => {
    let comparison = 0;
    
    switch (sortField) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'price':
        comparison = a.price - b.price;
        break;
      case 'change':
        comparison = a.changePercent - b.changePercent;
        break;
      case 'marketCap':
        comparison = a.marketCap - b.marketCap;
        break;
      case 'volume':
        comparison = a.volume - b.volume;
        break;
    }
    
    return sortDirection === 'asc' ? comparison : -comparison;
  });
  
  // Handle row click - Fix: Ensure we're using the asset.id directly
  const handleRowClick = (asset: AssetData) => {
    console.log("Navigating to asset with ID:", asset.id);
    navigate(`/asset/${asset.id}`);
  };
  
  return (
    <div className="w-full overflow-x-auto">
      <table className="min-w-full border-collapse">
        <thead>
          <tr className="border-b">
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">#</th>
            <th 
              className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer"
              onClick={() => handleSort('name')}
            >
              <div className="flex items-center gap-1">
                Name
                {sortField === 'name' && (
                  sortDirection === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                )}
              </div>
            </th>
            <th 
              className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer"
              onClick={() => handleSort('price')}
            >
              <div className="flex items-center justify-end gap-1">
                Price
                {sortField === 'price' && (
                  sortDirection === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                )}
              </div>
            </th>
            <th 
              className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer"
              onClick={() => handleSort('change')}
            >
              <div className="flex items-center justify-end gap-1">
                24h %
                {sortField === 'change' && (
                  sortDirection === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                )}
              </div>
            </th>
            <th 
              className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hidden md:table-cell"
              onClick={() => handleSort('marketCap')}
            >
              <div className="flex items-center justify-end gap-1">
                Market Cap
                {sortField === 'marketCap' && (
                  sortDirection === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                )}
              </div>
            </th>
            <th 
              className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hidden lg:table-cell"
              onClick={() => handleSort('volume')}
            >
              <div className="flex items-center justify-end gap-1">
                Volume
                {sortField === 'volume' && (
                  sortDirection === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                )}
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            Array.from({ length: 10 }).map((_, index) => (
              <tr key={index} className="border-b animate-pulse">
                <td className="px-4 py-4">{index + 1}</td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-secondary rounded-full"></div>
                    <div className="space-y-2">
                      <div className="h-4 w-20 bg-secondary rounded"></div>
                      <div className="h-3 w-24 bg-secondary rounded"></div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 text-right">
                  <div className="h-4 w-20 bg-secondary rounded ml-auto"></div>
                </td>
                <td className="px-4 py-4 text-right">
                  <div className="h-4 w-16 bg-secondary rounded ml-auto"></div>
                </td>
                <td className="px-4 py-4 text-right hidden md:table-cell">
                  <div className="h-4 w-24 bg-secondary rounded ml-auto"></div>
                </td>
                <td className="px-4 py-4 text-right hidden lg:table-cell">
                  <div className="h-4 w-24 bg-secondary rounded ml-auto"></div>
                </td>
              </tr>
            ))
          ) : (
            sortedAssets.map((asset, index) => {
              const isPositive = asset.change >= 0;
              
              return (
                <tr 
                  key={asset.id} 
                  className="border-b hover:bg-secondary/50 cursor-pointer"
                  onClick={() => handleRowClick(asset)}
                >
                  <td className="px-4 py-4 text-sm">{index + 1}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      {asset.logo ? (
                        <div className="w-8 h-8 rounded-full bg-secondary/50 flex items-center justify-center overflow-hidden">
                          <img 
                            src={asset.logo}
                            alt={asset.name}
                            className="w-5 h-5 object-contain"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-secondary/50 flex items-center justify-center">
                          <span className="text-xs font-bold">{asset.symbol.substring(0, 2)}</span>
                        </div>
                      )}
                      <div>
                        <div className="font-medium">{asset.name}</div>
                        <div className="text-xs text-muted-foreground">{asset.symbol}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right font-medium">
                    ${asset.price.toLocaleString(undefined, { 
                      minimumFractionDigits: asset.price < 1 ? 4 : 2,
                      maximumFractionDigits: asset.price < 1 ? 4 : 2
                    })}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className={cn(
                      "inline-flex items-center gap-1",
                      isPositive ? "text-green-500" : "text-red-500"
                    )}>
                      {isPositive ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                      {asset.changePercent.toFixed(2)}%
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right text-sm text-muted-foreground hidden md:table-cell">
                    ${asset.marketCap.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </td>
                  <td className="px-4 py-4 text-right text-sm text-muted-foreground hidden lg:table-cell">
                    ${asset.volume.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

export default MarketTable;
