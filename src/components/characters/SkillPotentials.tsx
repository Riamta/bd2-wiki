import Image from 'next/image';
import { Skill } from '@/types/character';

interface SkillPotentialProps {
    potential: any[];
    isActive?: boolean;
    skill?: Skill;
    onActivate?: (potentialIndex: number) => void;
    activeIndex?: number;
}

export function SkillPotentials({ potential, onActivate, activeIndex = -1 }: SkillPotentialProps) {
    if (!potential || potential.length === 0) {
        return null;
    }

    return (
        <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-700">
            <div className="bg-gray-800/60 border-b border-gray-600/50 px-6 py-2 rounded-t-xl">
                <h3 className="text-lg font-bold text-white">Kỹ năng Potentials</h3>
            </div>
            <div className="p-4">
                <div className="space-y-3">
                    {potential.map((pot, index) => (
                        <div 
                            key={`potential-${index}`} 
                            className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                                activeIndex === index ? 'bg-green-900/30 border border-green-500/50' : 'bg-gray-800/50 border border-gray-700/50 hover:border-gray-600/70'
                            } ${onActivate ? 'cursor-pointer' : ''}`}
                            onClick={() => onActivate && onActivate(index)}
                        >
                            {pot.type === 'Range' && (
                                <div className="flex-shrink-0 w-12 h-12 relative">
                                    <Image
                                        src={`/assets/potential/${pot.value}.png`}
                                        alt="Range"
                                        fill
                                        className="object-contain"
                                    />
                                </div>
                            )}
                            <div className="flex-grow">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="bg-blue-500/30 text-blue-300 px-2 py-0.5 rounded text-xs font-medium">
                                        {pot.type}
                                    </span>
                                    {activeIndex === index && (
                                        <span className="bg-green-500/30 text-green-300 px-2 py-0.5 rounded text-xs font-medium">
                                            Đang kích hoạt
                                        </span>
                                    )}
                                </div>
                                <p className="text-gray-200 text-sm">{pot.value}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
} 