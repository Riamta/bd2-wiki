'use client';

import { Suspense } from 'react';
import { useState, useEffect } from 'react';
import { Character } from '@/types/character';
import { loadGameData, loadBannerData, Banner } from '@/data/gameData';
import CharacterList, { ExtendedCostumeWithCharacter, extractCostumesFromCharacters } from '@/components/CharacterList';
import BannerSection from '@/components/BannerSection';

function HomePageContent() {
  useEffect(() => {
    // Save current path to localStorage
    localStorage.setItem('previousPath', '/');
  }, []);

  const [characters, setCharacters] = useState<Character[]>([]);
  const [costumes, setCostumes] = useState<ExtendedCostumeWithCharacter[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bannerCostumes, setBannerCostumes] = useState<ExtendedCostumeWithCharacter[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [gameData, bannerData] = await Promise.all([
          loadGameData(),
          loadBannerData()
        ]);
        
        if (gameData.characters.length > 0) {
          setCharacters(gameData.characters);

          // Extract and set costume data
          const allCostumes = extractCostumesFromCharacters(gameData.characters);
          setCostumes(allCostumes);

          // Prepare banner costumes
          if (bannerData.banner && bannerData.banner.length > 0) {
            setBanners(bannerData.banner);
            // For each banner, find the matching costume
            const bannerCostumeList: ExtendedCostumeWithCharacter[] = bannerData.banner.map(banner => {
              return allCostumes.find(
                c => c.characterName === banner.name && c.name === banner.costume
              );
            }).filter(Boolean) as ExtendedCostumeWithCharacter[];
            setBannerCostumes(bannerCostumeList);
          }
        }
      } catch (err) {
        setError('Failed to load character data');
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto mb-4"></div>
          <p className="text-gray-300">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <p className="text-gray-300">Sử dụng dữ liệu mẫu để hiển thị</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <BannerSection bannerCostumes={bannerCostumes} banners={banners} />
      <CharacterList 
          characters={characters}
        costumes={costumes}
      />
      
      <footer className="bg-gray-900/95 backdrop-blur-sm border-t border-gray-800 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-gray-400">
            Brown Dust 2 Character Database - Built with Next.js
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center"><div className="text-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto mb-4"></div><p className="text-gray-300">Đang tải trang...</p></div></div>}>
      <HomePageContent />
    </Suspense>
  );
}
