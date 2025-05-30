
import { supabase } from '@/integrations/supabase/client';
import { getStocks, getCryptos, AssetData } from '@/services/marketService';

// Function to seed the assets table with initial data from marketService
export const seedAssets = async (): Promise<void> => {
  try {
    // Fetch current assets first to avoid duplicates
    const { data: existingAssets } = await supabase
      .from('assets')
      .select('id');
    
    const existingIds = new Set(existingAssets?.map(a => a.id) || []);
    
    // Get stocks and cryptos from the market service
    const [stocks, cryptos] = await Promise.all([
      getStocks(),
      getCryptos()
    ]);
    
    // Prepare data for insertion
    const assetsToInsert = [...stocks, ...cryptos]
      .filter(asset => !existingIds.has(asset.id))
      .map(asset => ({
        id: asset.symbol,
        name: asset.name,
        type: asset.type,
        current_price: asset.price,
        open_price_today: asset.price - asset.change, // Calculate open price from current price and change
        day_change_percent: asset.changePercent,
        market_cap: asset.marketCap,
        logo_url: asset.logoUrl || asset.logo // Use logoUrl or fallback to logo
      }));
    
    if (assetsToInsert.length === 0) {
      console.log('No new assets to seed');
      return;
    }
    
    // Insert assets in batches to avoid hitting limits
    const batchSize = 50;
    for (let i = 0; i < assetsToInsert.length; i += batchSize) {
      const batch = assetsToInsert.slice(i, i + batchSize);
      const { error } = await supabase.from('assets').insert(batch);
      
      if (error) {
        console.error(`Error seeding assets batch ${i/batchSize + 1}:`, error);
      }
    }
    
    console.log(`Successfully seeded ${assetsToInsert.length} assets`);
  } catch (error) {
    console.error('Error in seedAssets:', error);
  }
};

// Function to create a price snapshot for all assets or a specific asset
export const createPriceSnapshots = async (assetId?: string): Promise<void> => {
  try {
    // Get current assets
    let assetsQuery = supabase.from('assets').select('id, current_price');
    
    if (assetId) {
      assetsQuery = assetsQuery.eq('id', assetId);
    }
    
    const { data: assets, error } = await assetsQuery;
    
    if (error) {
      throw error;
    }
    
    if (!assets || assets.length === 0) {
      console.log('No assets found for price snapshots');
      return;
    }
    
    // Prepare price snapshots
    const snapshots = assets.map(asset => ({
      asset_id: asset.id,
      price: asset.current_price
    }));
    
    // Insert snapshots
    const { error: insertError } = await supabase
      .from('price_snapshots')
      .insert(snapshots);
    
    if (insertError) {
      throw insertError;
    }
    
    console.log(`Created ${snapshots.length} price snapshots`);
  } catch (error) {
    console.error('Error creating price snapshots:', error);
  }
};
