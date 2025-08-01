import { Character } from '@/types/character';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { AttributeIcon } from '@/components/Icons/AttributeIcon';
import { AttackTypeIcon } from '@/components/Icons/AttackTypeIcon';
interface CharacterCardProps {
  character: Character;
}


// Helper function to convert image URL from "characters-large" to "characters"
const convertImageUrl = (url: string): string => {
  return url.replace('/characters-large/', '/characters/');
};

export default function CharacterCard({ character }: CharacterCardProps) {
  const searchParams = useSearchParams();
  const mainCostume = character.costumes[0];
  const imageUrl = mainCostume?.avatar ? "/assets/characters/" + mainCostume.path + "/" + mainCostume.avatar : mainCostume?.image_url ? convertImageUrl(mainCostume.image_url) : '';

  // Only preserve costume parameter, remove other filter/sort parameters
  const costumeParam = searchParams.get('costume');
  const characterUrl = costumeParam
    ? `/character/${encodeURIComponent(character.name)}?costume=${costumeParam}`
    : `/character/${encodeURIComponent(character.name)}`;

  return (
    <Link href={characterUrl}>
      <div className="bg-gray-900/80 backdrop-blur-sm rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 overflow-hidden cursor-pointer border border-gray-700">
        <div className="relative">
          <div className="aspect-square relative bg-gradient-to-b from-gray-800 to-gray-900">
            {imageUrl && (
              <Image
                src={imageUrl}
                alt={character.name}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            )}
          </div>

          {/* Character attribute overlay */}
          <div className="absolute top-2 left-2 bg-black/60 rounded-full p-1">
            <AttributeIcon
              size={16}
              attribute={character.attribute}
            />
          </div>
          {/* Attack type overlay */}
          <div className="absolute top-2 right-2 bg-black/60 rounded-full p-1">
            <AttackTypeIcon
              attackType={character.atkType}
              size={16}
            />
          </div>
        </div>

        <div className="p-2 bg-gray-800/50">
          <h3 className="font-medium text-sm text-white text-center truncate">{character.name}</h3>
        </div>
      </div>
    </Link>
  );
} 