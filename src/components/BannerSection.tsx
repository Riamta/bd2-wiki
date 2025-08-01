'use client';

import { Banner } from '@/data/gameData';
import BannerCard from '@/components/BannerCard';
import { ExtendedCostumeWithCharacter } from './CharacterList';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';

interface BannerSectionProps {
  bannerCostumes: ExtendedCostumeWithCharacter[];
  banners: Banner[];
}

export default function BannerSection({ bannerCostumes, banners }: BannerSectionProps) {
  const { user } = useAuth();
  const [isEditMode, setIsEditMode] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newBannerData, setNewBannerData] = useState({
    name: '',
    costume: '',
    start_date: '',
    end_date: ''
  });
  
  if (!bannerCostumes || bannerCostumes.length === 0) return null;

  const handleEditToggle = () => {
    setIsEditMode(!isEditMode);
  };

  const handleAddBanner = async () => {
    try {
      const response = await fetch('/api/banners', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newBannerData),
      });
      
      if (response.ok) {
        setShowAddModal(false);
        setNewBannerData({ name: '', costume: '', start_date: '', end_date: '' });
        window.location.reload();
      }
    } catch (error) {
      console.error('Error adding banner:', error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-bold text-green-400">Current Banner</h2>
          {user?.role === 'admin' && (
            <div className="flex gap-2">
              <button
                onClick={() => setShowAddModal(true)}
                className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded-md transition-colors"
              >
                Add Banner
              </button>
              <button
                onClick={handleEditToggle}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md transition-colors"
              >
                {isEditMode ? 'Exit Edit' : 'Edit Banners'}
              </button>
            </div>
          )}
        </div>
        <div className="grid grid-cols-4 md:grid-cols-5 xl:grid-cols-7 2xl:grid-cols-7 gap-3 ">
          {bannerCostumes.slice(0, 9).map((costume, idx) => (
            <BannerCard 
              key={costume.characterName + '-' + costume.name + '-' + idx} 
              costume={costume} 
              banner={banners[idx]}
              isEditMode={isEditMode && user?.role === 'admin'}
            />
          ))}
        </div>
      </div>
      
      {/* Add Banner Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-white mb-4">Add New Banner</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
                <input
                  type="text"
                  value={newBannerData.name}
                  onChange={(e) => setNewBannerData({...newBannerData, name: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500"
                  placeholder="Enter banner name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Costume</label>
                <input
                  type="text"
                  value={newBannerData.costume}
                  onChange={(e) => setNewBannerData({...newBannerData, costume: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500"
                  placeholder="Enter costume name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Start Date</label>
                <input
                  type="date"
                  value={newBannerData.start_date}
                  onChange={(e) => setNewBannerData({...newBannerData, start_date: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">End Date</label>
                <input
                  type="date"
                  value={newBannerData.end_date}
                  onChange={(e) => setNewBannerData({...newBannerData, end_date: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div className="flex gap-2 mt-6">
              <button
                onClick={handleAddBanner}
                disabled={!newBannerData.name || !newBannerData.costume || !newBannerData.start_date || !newBannerData.end_date}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded transition-colors"
              >
                Add Banner
              </button>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewBannerData({ name: '', costume: '', start_date: '', end_date: '' });
                }}
                className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}