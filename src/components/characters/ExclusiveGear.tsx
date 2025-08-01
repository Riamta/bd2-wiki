import Image from 'next/image';
import { Character } from '@/types/character';

interface ExclusiveGearProps {
    character: Character;
}

export function ExclusiveGear({ character }: ExclusiveGearProps) {
    if (!character.exclusive_gear) return null;

    return (
        <div className="bg-[#1a1e2e] rounded-lg overflow-hidden mt-4">
            <div className="bg-[#222739] py-2 px-4 flex justify-between items-center">
                <h3 className="text-white font-medium text-sm">Exclusive Gear</h3>
            </div>
            <div className="p-4">
                <div className="flex">
                    {/* Left side - Image and Name */}
                    <div className="flex flex-col items-center gap-2 mr-4 p-4">
                        <div className="w-16 h-16 flex-shrink-0 scale-150 relative">
                            {/* White blur effect behind the icon */}
                            <div className="absolute inset-0 bg-white/30 blur-md rounded-full z-0 scale-75"></div>
                            <Image
                                src={"/assets/characters/" + character.path + "/" + character.exclusive_gear.icon}
                                alt={character.exclusive_gear.name}
                                width={120}
                                height={120}
                                className="rounded-lg object-contain w-full h-full relative z-10"
                            />
                        </div>
                        <div className="text-center">
                            <h4 className="text-white font-bold text-sm flex items-center justify-center gap-1">
                                <Image
                                    src="/assets/ur.png"
                                    alt="UR"
                                    width={16}
                                    height={16}
                                    className="object-contain"
                                />
                                {character.exclusive_gear.name}
                            </h4>
                        </div>
                    </div>

                    {/* Right side - Stats (stacked vertically) */}
                    <div className="flex-1 flex flex-col">
                        {/* Exclusive Ability */}
                        <div className="rounded-lg p-1">
                            <div className="flex justify-between items-center bg-gray-800/50 rounded p-2 border border-gray-600/50">
                                <span className="text-gray-300 text-xs">Exclusive Ability</span>
                                <div className="flex gap-1">
                                    {Object.entries(character.exclusive_gear["Exclusive Ability"]).map(([key, value]) => (
                                        <div key={key} className="flex items-center">
                                            <span className="text-gray-300 text-xs">
                                                {key === 'CRDM' ? 'CDMG' : key}
                                            </span>
                                            <span className="font-bold text-white text-xs ml-1">
                                                {typeof value === 'string' && value.includes('.') ? `${value}%` : value}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        {/* Basic Stats 1 */}
                        <div className="rounded-lg p-1">
                            <div className="flex justify-between items-center bg-gray-800/50 rounded p-2 border border-gray-600/50">
                                <span className="text-gray-300 text-xs">Basic Stat 1</span>
                                <span className="text-xs font-normal text-right text-gray-300">
                                    {Object.entries(character.exclusive_gear.basic_stats_1).map(([key, value]) => (
                                        <div key={key} className="flex items-center">
                                            <span className="text-gray-300 text-xs">
                                                {key === 'CRDM' ? 'CDMG' : key}
                                            </span>
                                            <span className="font-bold text-white text-xs ml-1">
                                                {typeof value === 'string' && value.includes('.') ? `${value}%` : value}
                                            </span>
                                        </div>
                                    ))}
                                </span>
                            </div>
                        </div>
                        {/* Basic Stats 2 */}
                        <div className="rounded-lg p-1">
                            <div className="flex justify-between items-center bg-gray-800/50 rounded p-2 border border-gray-600/50">
                                <span className="text-gray-300 text-xs">Basic Stat 2</span>
                                <span className="text-xs font-normal text-right text-gray-300">
                                    <div className="flex overflow-x-auto space-x-4">
                                        {Object.entries(character.exclusive_gear.basic_stats_2).map(([key, value]) => (
                                            <div key={key} className="flex items-center">
                                                <span className="text-gray-300 text-xs">
                                                    {key === 'CRDM' ? 'CDMG' : key}
                                                </span>
                                                <span className="font-bold text-white text-xs ml-1">
                                                    {typeof value === 'string' && value.includes('.') ? `${value}%` : value}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 