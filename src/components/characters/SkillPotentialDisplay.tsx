import Image from 'next/image';
import { Skill, Potential, PotentialSwitch } from '@/types/character';
import { useState } from 'react';

interface SkillPotentialDisplayProps {
  skill: Skill;
  activePotentialIndexes: number[];
  onTogglePotential: (index: number) => void;
  onToggleAll?: () => void;
}
function getDescription(potential: Potential) {
  if (potential.type === 'SP') {
    return `SP consumption is reduced by ${potential.value}`;
  }
  return potential.value;
}
export function SkillPotentialDisplay({
  skill,
  activePotentialIndexes,
  onTogglePotential,
  onToggleAll
}: SkillPotentialDisplayProps) {
  if (!skill.potential || skill.potential.length === 0) {
    return null;
  }

  // Kiểm tra xem tất cả potential có được kích hoạt không
  const allActive = skill.potential.length > 0 && activePotentialIndexes.length === skill.potential.length;

  return (
    <div className="bg-[#1a1e2e] rounded-lg overflow-hidden mt-4">
      {/* Header */}
      <div className="bg-[#222739] py-2 px-4 flex justify-between items-center">
        <h3 className="text-white font-medium text-sm">Skill Potentials</h3>
        <button
          onClick={onToggleAll}
          className={`px-3 py-1 text-xs rounded-md transition-all ${allActive
            ? 'bg-green-600 hover:bg-green-700 text-white'
            : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
            }`}
        >
          {allActive ? 'Disable All' : 'Active All'}
        </button>
      </div>

      {/* Content */}
      <div className="py-1">
        {skill.potential.map((potential: Potential, index: number) => {
          const isActive = activePotentialIndexes.includes(index);

          // Xác định icon dựa trên loại potential
          let icon = null;
          if (potential.type === 'Fire') {
            icon = (
              <div className="w-5 h-5 mr-2 flex items-center justify-center">
                <Image
                  src={`/assets/potential/potentail_Fire.webp`}
                  alt={potential.type}
                  width={35}
                  height={35}
                  className="max-w-[35px] max-h-[35px]"
                />
              </div>
            );
          } else if (potential.type === 'Range') {
            icon = (
              <div className="w-5 h-5 mr-2 flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22 12L18 16L18 13L6 13L6 16L2 12L6 8L6 11L18 11L18 8L22 12Z" fill="currentColor" />
                </svg>
              </div>
            );
          } else if (potential.type === 'SP') {
            icon = (
              <div className="w-5 h-5 mr-2 flex items-center justify-center">
                <Image
                  src={`/assets/potential/potentail_Rhombus.webp`}
                  alt={potential.type}
                  width={35}
                  height={35}
                  className="max-w-[35px] max-h-[35px]"
                />
              </div>
            );
          } else {
            icon = (
              <div className="w-5 h-5 mr-2 flex items-center justify-center text-yellow-400">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 22L5.5 15.5L8.8 12.2L12 15.4L15.2 12.2L18.5 15.5L12 22ZM12 2L18.5 8.5L15.2 11.8L12 8.6L8.8 11.8L5.5 8.5L12 2Z" fill="currentColor" />
                </svg>
              </div>
            );
          }

          return (
            <div
              key={index}
              className={`py-2 px-4 flex items-center justify-between border-b border-[#2a304a] last:border-0 cursor-pointer hover:bg-[#2a304a]/60 transition-colors ${isActive ? 'bg-[#2a304a]/30' : ''}`}
              onClick={() => onTogglePotential(index)}
            >
              <div className="flex items-center text-gray-300">
                {icon}
                <span className="text-sm">{getDescription(potential)}</span>
              </div>
              <label className="inline-flex items-center cursor-pointer" onClick={(e) => e.stopPropagation()}>
                <div className="relative">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={isActive}
                    onChange={() => onTogglePotential(index)}
                  />
                  <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-600"></div>
                </div>
              </label>
            </div>
          );
        })}
      </div>
    </div>
  );
} 