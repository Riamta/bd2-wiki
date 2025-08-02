import { GameData } from '@/types/character';

// This will be replaced with the actual data
export const gameData: GameData = {
  characters: []
};

// Cache for game data
let gameDataCache: GameData | null = null;
let gameDataPromise: Promise<GameData> | null = null;

// Function to load data (will be used to fetch from API or static file)
export async function loadGameData(): Promise<GameData> {
  // Return cached data if available
  if (gameDataCache) {
    return gameDataCache;
  }

  // Return existing promise if already loading
  if (gameDataPromise) {
    return gameDataPromise;
  }

  // Create new promise and cache it
  gameDataPromise = (async () => {
    try {
      // In production, this would fetch from an API or import the JSON
      const response = await fetch('/data/characters.json');
      const data = await response.json();
      gameDataCache = data as GameData;
      return gameDataCache;
    } catch (error) {
      console.error('Error loading game data:', error);
      const fallbackData = { characters: [] };
      gameDataCache = fallbackData;
      return fallbackData;
    } finally {
      // Clear the promise after completion
      gameDataPromise = null;
    }
  })();

  return gameDataPromise;
}

// Function to clear cache (useful for refreshing data)
export function clearGameDataCache(): void {
  gameDataCache = null;
  gameDataPromise = null;
}

// Function to clear banner cache
export function clearBannerDataCache(): void {
  bannerDataCache = null;
  bannerDataPromise = null;
}

// Function to clear all caches
export function clearAllCaches(): void {
  clearGameDataCache();
  clearBannerDataCache();
}

// Function to load banner data from MongoDB
export interface Banner {
  _id?: string;
  name: string;
  costume: string;
  start_date: string;
  end_date: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface BannerData {
  banner: Banner[];
}

// Cache for banner data
let bannerDataCache: BannerData | null = null;
let bannerDataPromise: Promise<BannerData> | null = null;

export async function loadBannerData(): Promise<BannerData> {
  // Return cached data if available
  if (bannerDataCache) {
    return bannerDataCache;
  }

  // Return existing promise if already loading
  if (bannerDataPromise) {
    return bannerDataPromise;
  }

  // Create new promise and cache it
  bannerDataPromise = (async () => {
    try {
      const response = await fetch('/api/banners');
      const data = await response.json();
      bannerDataCache = data as BannerData;
      return bannerDataCache;
    } catch (error) {
      console.error('Error loading banner data:', error);
      const fallbackData = { banner: [] };
      bannerDataCache = fallbackData;
      return fallbackData;
    } finally {
      // Clear the promise after completion
      bannerDataPromise = null;
    }
  })();

  return bannerDataPromise;
} 

export interface TierListData {
    tierList: TierList[];
}

export interface TierList {
    rank: string;
    elements: {
        [key: string]: {
            characters: string[];
        };
    };
}


export async function loadTierListPVEData(): Promise<TierListData> {
  try {
    const response = await fetch('/data/tierlist_pve.json');
    const data = await response.json();
    return data as TierListData;
  } catch (error) {
    console.error('Error loading tier list data:', error);
    return { tierList: [] };
  }
}

export async function loadTierListPVPData(): Promise<TierListData> {
  try {
    const response = await fetch('/data/tierlist_pvp.json');
    const data = await response.json();
    return data as TierListData;
  } catch (error) {
    console.error('Error loading tier list data:', error);
    return { tierList: [] };
  }
}
 


export interface CodeItem {
  code: string;
  reward: string;
  date: string;
  status: string;
}

export async function code(): Promise<CodeItem[]> {
  try {
    const response = await fetch('/data/code,.json');
    const data = await response.json();
    return data as CodeItem[];
  } catch (error) {
    console.error('Error loading code data:', error);
    return [];
  }
}
  