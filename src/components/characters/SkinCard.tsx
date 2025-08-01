import Image from 'next/image';
import { Skin } from '@/types/character';

interface SkinCardProps {
    skin: Skin;
    isSelected: boolean;
    onSelect: () => void;
}

export function SkinCard({ skin, isSelected, onSelect }: SkinCardProps) {
    return (
        <div
            className={`transition-opacity duration-200 ${isSelected ? 'opacity-100' : 'opacity-60'}`}
            onClick={onSelect}
        >
            <div className="aspect-[3/5] relative h-30 pb-[10px]">
                <Image
                    src={skin.image_url}
                    alt={skin.name}
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 50vw, 25vw"
                />
            </div>
            <h4 className={`font-medium text-xs text-center text-gray-200 -mt-9`}>
                {skin.name}
            </h4>
        </div>
    );
}