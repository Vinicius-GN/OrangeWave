// Admin asset management service for OrangeWave Trading Platform
// Provides localStorage-based asset management for admin panel functionality
// This service extends the base marketService with administrative capabilities

import { AssetData } from './marketService';
import { getAllAssets } from './marketService';

// localStorage key for persisting admin asset data
const ADMIN_ASSETS_KEY = 'orangewave_admin_assets';

// Interface defining which asset fields can be modified by administrators
// Restricts editing to safe fields while preserving system-critical data
export interface EditableAssetFields {
  symbol: string;              // Trading symbol (e.g., 'AAPL', 'BTC')
  name: string;                // Full asset name
  type: 'stock' | 'crypto';   // Asset category
  logoUrl?: string;            // Asset logo/icon URL
  price?: number;              // Current market price (admin override)
  availableStock?: number;     // Inventory available for trading
  isFrozen?: boolean;          // Trading suspension flag
}

/**
 * Initializes the admin asset system with data from marketService
 * Loads base assets and enhances them with admin-specific fields
 * Only runs if no existing admin assets are found in localStorage
 * 
 * @returns Promise resolving to array of AssetData objects with admin fields
 */
export const initializeAdminAssets = async (): Promise<AssetData[]> => {
  const existingAssets = localStorage.getItem(ADMIN_ASSETS_KEY);
  
  if (!existingAssets) {
    // Load initial assets from the main market service
    const initialAssets = await getAllAssets();
    
    // Enhance assets with admin-specific fields for inventory management
    const assetsWithStock = initialAssets.map(asset => ({
      ...asset,
      availableStock: 100 // Default stock amount for new assets
    }));
    
    // Persist enhanced assets to localStorage for admin panel use
    localStorage.setItem(ADMIN_ASSETS_KEY, JSON.stringify(assetsWithStock));
    return assetsWithStock;
  }
  
  // Return existing admin assets from localStorage
  return JSON.parse(existingAssets);
};

/**
 * Retrieves all admin-managed assets from localStorage
 * @returns Array of AssetData objects or empty array if none exist
 */
export const getAdminAssets = (): AssetData[] => {
  const assets = localStorage.getItem(ADMIN_ASSETS_KEY);
  return assets ? JSON.parse(assets) : [];
};

/**
 * Persists asset array to localStorage for admin panel persistence
 * @param assets - Array of AssetData objects to save
 */
export const saveAdminAssets = (assets: AssetData[]): void => {
  localStorage.setItem(ADMIN_ASSETS_KEY, JSON.stringify(assets));
};

/**
 * Creates a new asset in the admin system
 * Automatically generates a unique ID and sets default inventory
 * 
 * @param asset - Asset data without ID (will be generated)
 * @returns Complete AssetData object with generated ID
 */
export const addAdminAsset = (asset: Omit<AssetData, 'id'>): AssetData => {
  const assets = getAdminAssets();
  const newAsset: AssetData = {
    ...asset,
    id: `admin-asset-${Date.now()}`,           // Generate unique ID using timestamp
    availableStock: asset.availableStock || 100 // Ensure default stock if not provided
  };
  
  const updatedAssets = [...assets, newAsset];
  saveAdminAssets(updatedAssets);
  
  return newAsset;
};

/**
 * Updates an existing asset with admin-editable fields only
 * Uses selective field updating to maintain data integrity
 * Only modifies fields that are safe for admin manipulation
 * 
 * @param id - Unique identifier of the asset to update
 * @param editableFields - Partial asset data containing fields to update
 * @returns Updated AssetData object or null if asset not found
 */
export const updateAdminAsset = (id: string, editableFields: Partial<EditableAssetFields>): AssetData | null => {
  const assets = getAdminAssets();
  const assetIndex = assets.findIndex(asset => asset.id === id);
  
  if (assetIndex === -1) {
    return null;
  }
  
  // Selectively update only the editable fields to prevent system corruption
  const updatedAsset = {
    ...assets[assetIndex],
    // Only apply updates for defined fields
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

/**
 * Removes an asset from the admin system
 * @param id - Unique identifier of the asset to delete
 * @returns true if asset was deleted, false if asset was not found
 */
export const deleteAdminAsset = (id: string): boolean => {
  const assets = getAdminAssets();
  const filteredAssets = assets.filter(asset => asset.id !== id);
  
  // Check if any asset was actually removed
  if (filteredAssets.length === assets.length) {
    return false; // Asset not found
  }
  
  saveAdminAssets(filteredAssets);
  return true;
};
