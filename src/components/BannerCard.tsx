import { CostumeWithCharacter } from './CostumeCard';
import { Banner } from '@/data/gameData';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AttributeIcon, AttributeType } from './Icons/AttributeIcon';
import { AttackType, AttackTypeIcon } from './Icons/AttackTypeIcon';

interface BannerCardProps {
  costume: CostumeWithCharacter;
  banner: Banner;
  sortBy?: string; // Add sortBy prop
  isEditMode?: boolean;
}

function getCountdown(endDate: string) {
  const end = new Date(endDate).getTime();
  const now = Date.now();
  let diff = Math.max(0, end - now);
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  diff -= days * (1000 * 60 * 60 * 24);
  const hours = Math.floor(diff / (1000 * 60 * 60));
  diff -= hours * (1000 * 60 * 60);
  const minutes = Math.floor(diff / (1000 * 60));
  diff -= minutes * (1000 * 60);
  const seconds = Math.floor(diff / 1000);
  return { days, hours, minutes, seconds };
}

function formatMonthDay(dateStr: string) {
  const d = new Date(dateStr);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${mm}-${dd}`;
}

export default function BannerCard({ costume, banner, sortBy = 'default', isEditMode = false }: BannerCardProps) {
  const [countdown, setCountdown] = useState(getCountdown(banner.end_date));
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState({
    name: banner.name,
    costume: banner.costume,
    start_date: banner.start_date,
    end_date: banner.end_date
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(getCountdown(banner.end_date));
    }, 1000);
    return () => clearInterval(timer);
  }, [banner.end_date]);

  const characterUrl = `/character/${encodeURIComponent(costume.characterName)}?costume=${costume.costumeIndex}`;

  // Function to get maximum value from skill levels
  const getMaxSkillValue = (property: 'sp' | 'cd') => {
    if (!costume.skill?.levels || costume.skill.levels.length === 0) {
      return 'N/A';
    }
    
    // Get the highest level value
    const maxValue = Math.max(...costume.skill.levels.map(level => level[property] || 0));
    return maxValue.toString();
  };
  
  // Get the chain value
  const getChainValue = () => {
    if (!costume.skill?.chain) {
      return 'N/A';
    }
    return costume.skill.chain.toString();
  };
  
  // Show value based on sort criteria
  const showSortValue = () => {
    if (!['chain', 'sp', 'cd'].includes(sortBy)) {
      return null;
    }
    
    let value = '';
    let label = '';
    
    if (sortBy === 'chain') {
      value = getChainValue();
      label = 'Chain';
    } else if (sortBy === 'sp') {
      value = getMaxSkillValue('sp');
      label = 'SP';
    } else if (sortBy === 'cd') {
      value = getMaxSkillValue('cd');
      label = 'CD';
    }
    
    return (
      <div className="text-xs text-green-400 font-medium mt-1 mb-1">
        {label}: {value}
      </div>
    );
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowEditModal(true);
  };

  const handleSave = async () => {
    try {
      const response = await fetch('/api/banners', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...editData, _id: banner._id }),
      });
      
      if (response.ok) {
        setShowEditModal(false);
        // Refresh the page or update state
        window.location.reload();
      }
    } catch (error) {
      console.error('Error updating banner:', error);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (confirm('Are you sure you want to delete this banner?')) {
      try {
        const response = await fetch(`/api/banners?id=${banner._id}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          window.location.reload();
        }
      } catch (error) {
        console.error('Error deleting banner:', error);
      }
    }
  };

  const CardContent = (
    <div className="bg-gradient-to-b from-green-900/80 to-gray-900/90 rounded-xl shadow-xl hover:scale-105 transition-all duration-300 overflow-hidden cursor-pointer relative">
        <div className="aspect-square relative bg-gradient-to-b from-gray-800 to-gray-900">
          <Image
            src={costume.avatar ? "/assets/characters/" + costume.path + "/" + costume.avatar : costume.image_url.replace('/characters-large/', '/characters/')}
            alt={costume.name}
            fill
            className="object-contain"
            sizes="(max-width: 768px) 50vw, 25vw"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = costume.image_url;
            }}
          />
          {/* Attribute icon */}
          <div className="absolute top-2 left-2 bg-black/70 rounded-full p-1">
            <AttributeIcon attribute={costume.characterAttribute as AttributeType} size={18} />
          </div>
          {/* Attack type icon */}
          <div className="absolute top-2 right-2 bg-black/70 rounded-full p-1">
            <AttackTypeIcon attackType={costume.characterAtkType as AttackType} size={18} />
          </div>
        </div>
        <div className="p-3">
          <h3 className="font-bold text-white text-base mb-1 truncate">{costume.name}</h3>
          <p className="text-green-300 text-xs mb-1 truncate">{costume.characterName}</p>
          {showSortValue()}
          <div className="flex items-center justify-between text-xs text-gray-300 mb-1">
            <span><span className="text-white">{formatMonthDay(banner.start_date)} - {formatMonthDay(banner.end_date)}</span></span>
          </div>
          <div className="flex items-center gap-1 text-xs text-yellow-300 font-bold mt-2">
            <span>{countdown.days}d</span>
            <span>{countdown.hours}h</span>
            <span>{countdown.minutes}m</span>
            <span>{countdown.seconds}s</span>
          </div>
        </div>
        {/* Edit overlay */}
        {isEditMode && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center gap-2">
            <button
              onClick={handleEdit}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
            >
              Delete
            </button>
          </div>
        )}
      </div>
  );

  return (
    <>
      {isEditMode ? CardContent : <Link href={characterUrl}>{CardContent}</Link>}
      
      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-white mb-4">Edit Banner</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
                <input
                  type="text"
                  value={editData.name}
                  onChange={(e) => setEditData({...editData, name: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Costume</label>
                <input
                  type="text"
                  value={editData.costume}
                  onChange={(e) => setEditData({...editData, costume: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Start Date</label>
                <input
                  type="date"
                  value={editData.start_date}
                  onChange={(e) => setEditData({...editData, start_date: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">End Date</label>
                <input
                  type="date"
                  value={editData.end_date}
                  onChange={(e) => setEditData({...editData, end_date: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div className="flex gap-2 mt-6">
              <button
                onClick={handleSave}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
              >
                Save
              </button>
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}