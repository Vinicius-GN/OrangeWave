import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Edit, Trash2, DownloadCloud, FileText, ArrowUpDown, AlertTriangle
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
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from '@/lib/utils';
import { AssetData } from '@/services/marketService';
import { 
  initializeAdminAssets, 
  getAdminAssets, 
  addAdminAsset, 
  updateAdminAsset, 
  deleteAdminAsset 
} from '@/services/adminAssetService';

interface StockFormValues {
  symbol: string;
  name: string;
  type: 'stock' | 'crypto';
  logoUrl?: string;
  logo?: string;
  price?: number;
  availableStock?: number;
  isFrozen?: boolean;
}

// Function to format currency
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
  });
  const { toast } = useToast();

  // Load assets from localStorage/marketService on component mount
  useEffect(() => {
    const loadAssets = async () => {
      setIsLoading(true);
      try {
        const adminAssets = await initializeAdminAssets();
        setAssets(adminAssets);
        setFilteredAssets(adminAssets);
      } catch (error) {
        console.error('Error loading assets:', error);
        toast({
          title: 'Error',
          description: 'Failed to load assets.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadAssets();
  }, [toast]);

  useEffect(() => {
    applyFilters(searchQuery);
  }, [assets, searchQuery]);

  const applyFilters = (search: string) => {
    let filtered = [...assets];

    if (search) {
      filtered = filtered.filter(asset =>
        asset.symbol.toLowerCase().includes(search.toLowerCase()) ||
        asset.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    setFilteredAssets(filtered);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const openNewAssetDialog = () => {
    setIsEditMode(false);
    setSelectedAsset(null);
    setFormValues({
      symbol: '',
      name: '',
      type: 'stock',
      availableStock: 100,
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
      logo: asset.logo,
      price: asset.price,
      availableStock: asset.availableStock,
      isFrozen: asset.isFrozen,
    });
    setIsDialogOpen(true);
  };

  const closeAssetDialog = () => {
    setIsDialogOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormValues(prevValues => ({
      ...prevValues,
      [name]: name === 'availableStock' 
              ? parseFloat(value) || 0 : value,
    }));
  };

  const handleTypeChange = (value: string) => {
    setFormValues(prevValues => ({
      ...prevValues,
      type: value === 'crypto' ? 'crypto' : 'stock',
    }));
  };

  const handleToggleFreeze = (assetId: string) => {
    const asset = assets.find(a => a.id === assetId);
    if (asset) {
      const updated = updateAdminAsset(assetId, { isFrozen: !asset.isFrozen });
      if (updated) {
        setAssets(getAdminAssets());
        toast({
          title: asset.isFrozen ? 'Asset Unfrozen' : 'Asset Frozen',
          description: `${asset.name} has been ${asset.isFrozen ? 'unfrozen' : 'frozen'}.`,
        });
      }
    }
  };

  const handleSubmit = () => {
    const { symbol, name, type, logoUrl, price, logo, availableStock, isFrozen } = formValues;

    if (!symbol || !name || !type) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (isEditMode && selectedAsset) {
        // Update existing asset - only editable fields
        const updated = updateAdminAsset(selectedAsset.id, {
          symbol,
          name,
          type,
          price: price || selectedAsset.price, // Keep existing price if not provided
          logoUrl: logoUrl || logo,
          availableStock: availableStock || 100,
          isFrozen: isFrozen || false
        });
        if (updated) {
          setAssets(getAdminAssets());
          toast({
            title: 'Asset Updated',
            description: `${name} has been updated successfully.`,
          });
        }
      } else {
        // Add new asset
        const assetData = {
          symbol,
          name,
          type: type as 'stock' | 'crypto',
          price,
          change: 0,
          changePercent: 0,
          marketCap: 1000000,
          volume: 10000,
          logoUrl: logoUrl || logo,
          logo: logoUrl || logo,
          availableStock: availableStock || 100,
          isFrozen: isFrozen || false,
        };
        addAdminAsset(assetData);
        setAssets(getAdminAssets());
        toast({
          title: 'Asset Created',
          description: `${name} has been created successfully.`,
        });
      }
      closeAssetDialog();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save asset.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteAsset = (assetId: string) => {
    const asset = assets.find(a => a.id === assetId);
    if (asset && deleteAdminAsset(assetId)) {
      setAssets(getAdminAssets());
      toast({
        title: 'Asset Deleted',
        description: `${asset.name} has been deleted successfully.`,
      });
    } else {
      toast({
        title: 'Error',
        description: 'Failed to delete asset.',
        variant: 'destructive',
      });
    }
  };

  const exportToCsv = () => {
    const headers = ['ID', 'Symbol', 'Name', 'Type', 'Price', 'Change', 'Change Percent', 'Market Cap', 'Volume', 'Logo URL', 'Available Stock', 'Is Frozen'];
    const csvRows = [
      headers.join(','),
      ...filteredAssets.map(asset => [
        asset.id,
        asset.symbol,
        asset.name,
        asset.type,
        asset.price,
        asset.change,
        asset.changePercent,
        asset.marketCap,
        asset.volume,
        asset.logoUrl || asset.logo || '',
        asset.availableStock || 0,
        asset.isFrozen || false
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
              onChange={handleSearchChange}
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

      {/* Assets table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Symbol</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Change</TableHead>
              <TableHead className="text-right">Market Cap</TableHead>
              <TableHead className="text-right">Volume</TableHead>
              <TableHead className="text-right">Stock</TableHead>
              <TableHead className="text-center">Frozen</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              // Loading state
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={`loading-${index}`}>
                  <TableCell colSpan={10} className="h-14">
                    <div className="w-full h-4 bg-secondary/50 rounded animate-pulse"></div>
                  </TableCell>
                </TableRow>
              ))
            ) : filteredAssets.length === 0 ? (
              // No data state
              <TableRow>
                <TableCell colSpan={10} className="h-24 text-center">
                  No assets found.
                </TableCell>
              </TableRow>
            ) : (
              // Data rows
              filteredAssets.map((asset) => (
                <TableRow key={asset.id}>
                  <TableCell className="font-medium">{asset.symbol}</TableCell>
                  <TableCell>{asset.name}</TableCell>
                  <TableCell className="capitalize">{asset.type}</TableCell>
                  <TableCell className="text-right">{formatCurrency(asset.price)}</TableCell>
                  <TableCell className="text-right">
                    <span className={cn(
                      asset.change >= 0 ? "text-green-600" : "text-red-600"
                    )}>
                      {asset.change >= 0 ? '+' : ''}{asset.change.toFixed(2)} ({asset.changePercent.toFixed(2)}%)
                    </span>
                  </TableCell>
                  <TableCell className="text-right">{asset.marketCap.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{asset.volume.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{asset.availableStock || 0}</TableCell>
                  <TableCell className="text-center">
                    <Switch
                      checked={asset.isFrozen || false}
                      onCheckedChange={() => handleToggleFreeze(asset.id)}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => openEditAssetDialog(asset)}>
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteAsset(asset.id)}>
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

      {/* Asset details dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Edit Asset' : 'Add New Asset'}</DialogTitle>
            <DialogDescription>
              {isEditMode ? 'Edit asset details (only editable fields can be modified).' : 'Create a new asset.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-4">
              <Label htmlFor="symbol" className="text-right">
                Symbol
              </Label>
              <Input id="symbol" name="symbol" value={formValues.symbol} onChange={handleInputChange} />

              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input id="name" name="name" value={formValues.name} onChange={handleInputChange} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                Type
              </Label>
              <Select value={formValues.type} onValueChange={handleTypeChange}>
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="stock">Stock</SelectItem>
                  <SelectItem value="crypto">Crypto</SelectItem>
                </SelectContent>
              </Select>

              <Label htmlFor="price" className="text-right">
                Price
              </Label>
              <Input id="price" name="price" type="number" value={formValues.price} onChange={handleInputChange} />

              <Label htmlFor="availableStock" className="text-right">
                Available Stock
              </Label>
              <Input id="availableStock" name="availableStock" type="number" value={formValues.availableStock} onChange={handleInputChange} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-4">
              <Label htmlFor="logoUrl" className="text-right">
                Logo URL
              </Label>
              <Input id="logoUrl" name="logoUrl" value={formValues.logoUrl || ''} onChange={handleInputChange} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeAssetDialog}>
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
