
import { AssetData } from './marketService';
import { getAllAssets } from './marketService';

const ADMIN_ASSETS_KEY = 'orangewave_admin_assets';

// Editable fields for admin
export interface EditableAssetFields {
  symbol: string;
  name: string;
  type: 'stock' | 'crypto';
  logoUrl?: string;
  price?: number;
  availableStock?: number;
  isFrozen?: boolean;
}

// Initialize localStorage with assets from marketService if empty
export const initializeAdminAssets = async (): Promise<AssetData[]> => {
  const existingAssets = localStorage.getItem(ADMIN_ASSETS_KEY);
  
  if (!existingAssets) {
    // Load initial assets from marketService
    const initialAssets = await getAllAssets();
    // Add availableStock field for admin management
    const assetsWithStock = initialAssets.map(asset => ({
      ...asset,
      availableStock: 100 // Default stock amount
    }));
    localStorage.setItem(ADMIN_ASSETS_KEY, JSON.stringify(assetsWithStock));
    return assetsWithStock;
  }
  
  return JSON.parse(existingAssets);
};

// Get all admin assets from localStorage
export const getAdminAssets = (): AssetData[] => {
  const assets = localStorage.getItem(ADMIN_ASSETS_KEY);
  return assets ? JSON.parse(assets) : [];
};

// Save assets to localStorage
export const saveAdminAssets = (assets: AssetData[]): void => {
  localStorage.setItem(ADMIN_ASSETS_KEY, JSON.stringify(assets));
};

// Add new asset
export const addAdminAsset = (asset: Omit<AssetData, 'id'>): AssetData => {
  const assets = getAdminAssets();
  const newAsset: AssetData = {
    ...asset,
    id: `admin-asset-${Date.now()}`,
    availableStock: asset.availableStock || 100
  };
  
  const updatedAssets = [...assets, newAsset];
  saveAdminAssets(updatedAssets);
  
  return newAsset;
};

// Update existing asset - only editable fields
export const updateAdminAsset = (id: string, editableFields: Partial<EditableAssetFields>): AssetData | null => {
  const assets = getAdminAssets();
  const assetIndex = assets.findIndex(asset => asset.id === id);
  
  if (assetIndex === -1) {
    return null;
  }
  
  // Only update the editable fields
  const updatedAsset = {
    ...assets[assetIndex],
    ...(editableFields.symbol && { symbol: editableFields.symbol }),
    ...(editableFields.name && { name: editableFields.name }),
    ...(editableFields.type && { type: editableFields.type as 'stock' | 'crypto' }),
    ...(editableFields.logoUrl !== undefined && { logoUrl: editableFields.logoUrl }),
    ...(editableFields.price !== undefined && { price: editableFields.price }),
    ...(editableFields.availableStock !== undefined && { availableStock: editableFields.availableStock }),
    ...(editableFields.isFrozen !== undefined && { isFrozen: editableFields.isFrozen })
  };
  
  assets[assetIndex] = updatedAsset;
  saveAdminAssets(assets);
  
  return updatedAsset;
};

// Delete asset
export const deleteAdminAsset = (id: string): boolean => {
  const assets = getAdminAssets();
  const filteredAssets = assets.filter(asset => asset.id !== id);
  
  if (filteredAssets.length === assets.length) {
    return false; // Asset not found
  }
  
  saveAdminAssets(filteredAssets);
  return true;
};
