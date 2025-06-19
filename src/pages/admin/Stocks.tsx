import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Edit, Trash2, DownloadCloud
} from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

// Stocks management page for admin to view, add, edit, and delete assets
const API_URL = 'http://localhost:3001/api';

// AssetData interface defines the structure for stock/crypto asset objects
interface AssetData {
  _id: string;
  symbol: string;
  name: string;
  type: 'stock' | 'crypto';
  price: number;
  marketCap: number;
  availableStock?: number;
  volume: number;
  logoUrl?: string;
  quantityBougth?: number;
  quantityBought?: number;
}

// StockFormValues interface for asset creation/editing forms
interface StockFormValues {
  symbol: string;
  name: string;
  type: 'stock' | 'crypto';
  logoUrl?: string;
  price?: number;
  availableStock?: number;
  marketCap?: number;
  volume?: number;
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

const StocksManagement = () => {
  const [assets, setAssets] = useState<AssetData[]>([]);
  const [filteredAssets, setFilteredAssets] = useState<AssetData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<AssetData | null>(null);
  const [formValues, setFormValues] = useState<StockFormValues>({
    symbol: '',
    name: '',
    type: 'stock',
    availableStock: 100,
    price: 0,
    marketCap: 1000000,
    volume: 10000
  });
  
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchAssets = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/assets`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const assetData = await response.json();
        setAssets(Array.isArray(assetData) ? assetData : []);
      } else {
        throw new Error('Failed to fetch assets');
      }
    } catch (error) {
      console.error('Error fetching assets:', error);
      toast({
        title: 'Error',
        description: 'Failed to load assets.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  useEffect(() => {
    let filtered = [...assets];

    if (searchQuery) {
      filtered = filtered.filter(asset =>
        asset.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredAssets(filtered);
  }, [assets, searchQuery]);

  const openNewAssetDialog = () => {
    setIsEditMode(false);
    setSelectedAsset(null);
    setFormValues({
      symbol: '',
      name: '',
      type: 'stock',
      availableStock: 100,
      price: 0,
      marketCap: 1000000,
      volume: 10000
    });
    setIsDialogOpen(true);
  };

  const openEditAssetDialog = (asset: AssetData) => {
    setIsEditMode(true);
    setSelectedAsset(asset);
    setFormValues({
      symbol: asset.symbol,
      name: asset.name,
      type: asset.type,
      logoUrl: asset.logoUrl,
      price: asset.price,
      availableStock: asset.availableStock,
      marketCap: asset.marketCap,
      volume: asset.volume
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) return;
    
    const { symbol, name, type, logoUrl, price, availableStock, marketCap, volume } = formValues;

    // Validate required fields before submission
    if (!symbol || !name || !type || !price) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Prepare asset data with defaults for missing fields
      const assetData = {
        symbol,
        name,
        type,
        price: price || 0,
        marketCap: marketCap || 1000000,
        volume: volume || 10000,
        logoUrl: logoUrl || '',
        availableStock: availableStock || 100,
        description: `${name} (${symbol}) - ${type}`,
        quantityBougth: 0
      };

      let response;
      if (isEditMode && selectedAsset) {
        // Update existing asset
        response = await fetch(`${API_URL}/assets/${selectedAsset.symbol}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(assetData)
        });
      } else {
        // Create new asset with generated ID
        response = await fetch(`${API_URL}/assets`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            ...assetData,
            _id: `asset-${symbol.toLowerCase()}`
          })
        });
      }

      if (response.ok) {
        await fetchAssets();
        setIsDialogOpen(false);
        toast({
          title: isEditMode ? 'Asset Updated' : 'Asset Created',
          description: `${name} has been ${isEditMode ? 'updated' : 'created'} successfully.`,
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save asset');
      }
    } catch (error) {
      console.error('Error saving asset:', error);
      toast({
        title: 'Error',
        description: `Failed to ${isEditMode ? 'update' : 'create'} asset.`,
        variant: 'destructive',
      });
    }
  };

  const handleDeleteAsset = async (asset: AssetData) => {
    const token = localStorage.getItem('authToken');
    if (!token) return;
    
    if (window.confirm(`Are you sure you want to delete ${asset.name}?`)) {
      try {
        const response = await fetch(`${API_URL}/assets/${asset.symbol}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          await fetchAssets();
          toast({
            title: 'Asset Deleted',
            description: `${asset.name} has been deleted successfully.`,
          });
        } else {
          throw new Error('Failed to delete asset');
        }
      } catch (error) {
        console.error('Error deleting asset:', error);
        toast({
          title: 'Error',
          description: 'Failed to delete asset.',
          variant: 'destructive',
        });
      }
    }
  };

  const exportToCsv = () => {
    const headers = ['Symbol', 'Name', 'Type', 'Price', 'Market Cap', 'Volume', 'Available Stock', 'Quantity Sold'];
    const csvRows = [
      headers.join(','),
      ...filteredAssets.map(asset => [
        asset.symbol,
        asset.name,
        asset.type,
        asset.price,
        asset.marketCap,
        asset.volume,
        asset.availableStock || 0,
        asset.quantityBougth || asset.quantityBought || 0
      ].join(','))
    ];

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'assets.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: 'Export Successful',
      description: `${filteredAssets.length} assets exported to CSV.`,
    });
  };

  return (
    <AdminLayout title="Assets Management" description="Manage and view all platform assets">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search assets..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={exportToCsv}>
            <DownloadCloud className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={openNewAssetDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Add Asset
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Symbol</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Market Cap</TableHead>
              <TableHead className="text-right">Volume</TableHead>
              <TableHead className="text-right">Stock</TableHead>
              <TableHead className="text-right">Sold</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={`loading-${index}`}>
                  <TableCell colSpan={9} className="h-14">
                    <div className="w-full h-4 bg-secondary/50 rounded animate-pulse"></div>
                  </TableCell>
                </TableRow>
              ))
            ) : filteredAssets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center">
                  No assets found.
                </TableCell>
              </TableRow>
            ) : (
              filteredAssets.map((asset) => (
                <TableRow key={asset._id}>
                  <TableCell className="font-medium">{asset.symbol}</TableCell>
                  <TableCell>{asset.name}</TableCell>
                  <TableCell className="capitalize">{asset.type}</TableCell>
                  <TableCell className="text-right">{formatCurrency(asset.price)}</TableCell>
                  <TableCell className="text-right">{asset.marketCap.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{asset.volume.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{asset.availableStock || 0}</TableCell>
                  <TableCell className="text-right">{asset.quantityBougth || asset.quantityBought || 0}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => openEditAssetDialog(asset)}>
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteAsset(asset)}>
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Edit Asset' : 'Add New Asset'}</DialogTitle>
            <DialogDescription>
              {isEditMode ? 'Edit asset details.' : 'Create a new asset for the platform.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-4">
              <Label htmlFor="symbol" className="text-right">Symbol *</Label>
              <Input 
                id="symbol" 
                value={formValues.symbol} 
                onChange={(e) => setFormValues({ ...formValues, symbol: e.target.value })}
                placeholder="e.g. AAPL, BTC"
              />

              <Label htmlFor="name" className="text-right">Name *</Label>
              <Input 
                id="name" 
                value={formValues.name} 
                onChange={(e) => setFormValues({ ...formValues, name: e.target.value })}
                placeholder="e.g. Apple Inc."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-4">
              <Label htmlFor="type" className="text-right">Type *</Label>
              <Select 
                value={formValues.type} 
                onValueChange={(value: 'stock' | 'crypto') => setFormValues({ ...formValues, type: value })}
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="stock">Stock</SelectItem>
                  <SelectItem value="crypto">Crypto</SelectItem>
                </SelectContent>
              </Select>

              <Label htmlFor="price" className="text-right">Price *</Label>
              <Input 
                id="price" 
                type="number" 
                step="0.01"
                value={formValues.price} 
                onChange={(e) => setFormValues({ ...formValues, price: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-4">
              <Label htmlFor="availableStock" className="text-right">Available Stock</Label>
              <Input 
                id="availableStock" 
                type="number" 
                value={formValues.availableStock} 
                onChange={(e) => setFormValues({ ...formValues, availableStock: parseInt(e.target.value) || 0 })}
                placeholder="100"
              />

              <Label htmlFor="logoUrl" className="text-right">Logo URL</Label>
              <Input 
                id="logoUrl" 
                value={formValues.logoUrl || ''} 
                onChange={(e) => setFormValues({ ...formValues, logoUrl: e.target.value })}
                placeholder="https://..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {isEditMode ? 'Update Asset' : 'Create Asset'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default StocksManagement;
