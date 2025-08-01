import { GameData } from '@/types/character';

// This will be replaced with the actual data
export const gameData: GameData = {
  characters: []
};

// Function to load data (will be used to fetch from API or static file)
export async function loadGameData(): Promise<GameData> {
  try {
    // In production, this would fetch from an API or import the JSON
    const response = await fetch('/data/characters.json');
    const data = await response.json();
    return data as GameData;
  } catch (error) {
    console.error('Error loading game data:', error);
    return { characters: [] };
  }
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

export async function loadBannerData(): Promise<BannerData> {
  try {
    const response = await fetch('/api/banners');
    const data = await response.json();
    return data as BannerData;
  } catch (error) {
    console.error('Error loading banner data:', error);
    return { banner: [] };
  }
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
  