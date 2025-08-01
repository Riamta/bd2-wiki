import { Costume } from '@/types/character';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { AttributeIcon, AttributeType } from '@/components/Icons/AttributeIcon';
import { AttackType, AttackTypeIcon } from '@/components/Icons/AttackTypeIcon';

// Type for costume with character information
interface CostumeWithCharacter extends Costume {
  characterName: string;
  characterAttribute: string;
  characterAtkType: string;
  characterGender: string;
  characterStar: number;
  characterCollab?: string;
  costumeIndex: number;
}

interface CostumeCardProps {
  costume: CostumeWithCharacter;
  sortBy?: string; // Add sortBy prop
}

export default function CostumeCard({ costume, sortBy = 'default' }: CostumeCardProps) {

  // Only preserve costume parameter, remove other filter/sort parameters
  const characterUrl = `/character/${encodeURIComponent(costume.characterName)}?costume=${costume.costumeIndex}`;

  const getMinSkillValue = (property: 'sp' | 'cd') => {
    if (!costume.skill?.levels || costume.skill.levels.length === 0) {
      return 'N/A';
    }

    // Get the lowest level value
    const minValue = Math.min(...costume.skill.levels.map(level => level[property] || 0));
    return minValue.toString();
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
      value = getMinSkillValue('sp');
      label = 'SP';
    } else if (sortBy === 'cd') {
      value = getMinSkillValue('cd');
      label = 'CD';
    }

    return (
      <div className="text-xs text-green-400 font-medium mt-1">
        {label}: {value}
      </div>
    );
  };

  return (
    <Link href={characterUrl}>
      <div className="bg-gray-900/80 backdrop-blur-sm rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 overflow-hidden cursor-pointer border border-gray-700">
        <div className="aspect-square relative bg-gradient-to-b from-gray-800 to-gray-900">
          <Image
            src={costume.avatar ? "/assets/characters/" + costume.path + "/" + costume.avatar : costume.image_url.replace('/characters-large/', '/characters/')}
            alt={costume.name}
            fill
            className="object-contain"
            sizes="(max-width: 768px) 50vw, 25vw"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/assets/placeholder.png';
            }}
          />

          {/* Character attribute overlay */}
          <div className="absolute top-2 left-2 bg-black/60 rounded-full p-1">
            <AttributeIcon attribute={costume.characterAttribute as AttributeType} size={16} />
          </div>

          {/* Attack type overlay */}
          <div className="absolute top-2 right-2 bg-black/60 rounded-full p-1">
            <AttackTypeIcon attackType={costume.characterAtkType as AttackType} size={16} />
          </div>
        </div>

        <div className="p-3">
          <h3 className="font-bold text-white text-sm mb-1 truncate">{costume.name}</h3>
          <p className="text-gray-300 text-xs mb-2 truncate">{costume.characterName}</p>
          {showSortValue()}
        </div>
      </div>
    </Link>
  );
}

// Export the type for use in other files
export type { CostumeWithCharacter }; 