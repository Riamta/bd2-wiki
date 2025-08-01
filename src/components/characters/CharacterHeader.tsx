import Image from 'next/image';
import { Character } from '@/types/character';
import { AttributeIcon } from '@/components/Icons/AttributeIcon';
import { AttackTypeIcon } from '@/components/Icons/AttackTypeIcon';

interface CharacterHeaderProps {
    character: Character;
    onBackClick: () => void;
    isMobile: boolean;
}
export function CharacterHeader({ character, onBackClick, isMobile }: CharacterHeaderProps) {
    return (
        <header className="sticky top-0 z-50 bg-gray-900/95 backdrop-blur-sm shadow-2xl border-b border-gray-800 w-full">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
                {/* Desktop Layout */}
                {!isMobile && (
                    <div className="hidden md:flex items-center gap-4">
                        {/* Back Button and Character Info */}
                        <div className="flex items-center gap-4">
                            <button
                                onClick={onBackClick}
                                className="group flex items-center gap-2 px-2 py-1 rounded-lg bg-gray-800/50 hover:bg-gray-700/80 border border-gray-600/50 hover:border-green-400/50 transition-all duration-200"
                            >
                                <span className="text-green-400 group-hover:text-green-300 transition-colors">←</span>
                                <span className="text-gray-300 group-hover:text-white text-sm font-medium">Back to Characters</span>
                            </button>

                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-bold text-white">{character.name}</h1>
                                <div className="flex items-center gap-2 bg-gray-800/50 px-3 py-1 rounded-lg border border-gray-600/50">
                                    <AttributeIcon attribute={character.attribute} size={20} />
                                    <span className="text-gray-300 text-sm font-medium">{character.attribute}</span>
                                </div>
                                <div className="bg-gradient-to-r from-yellow-600 to-yellow-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                                    {'★'.repeat(character.star)}
                                </div>
                                <div className="bg-black-800/50 rounded-full p-2 border border-gray-600/50 w-10 h-10 flex items-center justify-center">
                                    <AttackTypeIcon attackType={character.atkType} size={20} />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Mobile Layout */}
                {isMobile && (
                    <div className="flex md:hidden flex-col gap-3">
                        {/* Top row: Back button */}
                        <div className="flex justify-start">
                            <button
                                onClick={onBackClick}
                                className="group flex items-center gap-1 px-2 py-1 rounded bg-gray-800/50 hover:bg-gray-700/80 border border-gray-600/50 hover:border-green-400/50 transition-all duration-200 text-xs"
                            >
                                <span className="text-green-400 group-hover:text-green-300 transition-colors">←</span>
                                <span className="text-gray-300 group-hover:text-white text-sm font-medium">Back</span>
                            </button>
                        </div>

                        {/* Bottom row: Character info */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <h1 className="text-xl font-bold text-white">{character.name}</h1>
                                <div className="bg-gradient-to-r from-yellow-600 to-yellow-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                                    {'★'.repeat(character.star)}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1 bg-gray-800/50 px-2 py-1 rounded border border-gray-600/50">
                                    <AttributeIcon attribute={character.attribute} size={16} />
                                </div>
                                <div className="flex items-center gap-1 bg-gray-800/50 px-2 py-1 rounded border border-gray-600/50">
                                    <AttackTypeIcon attackType={character.atkType} size={16} />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
} 