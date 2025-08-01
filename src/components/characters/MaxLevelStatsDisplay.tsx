import { Stats } from "@/types/character";

export function MaxLevelStatsDisplay({ stats }: { stats: Stats }) {
    // Define the order of stats as they should appear
    const statOrder = ['HP', 'ATK', 'CR', 'CRDM', 'MRES', 'DEF'];

    // Map stats according to the defined order, using 0 for undefined values
    const orderedStats = statOrder.map(key => [key, stats[key as keyof Stats] || 0]);

    const formatStatKey = (key: string): string => {
        return key === 'CRDM' ? 'CDMG' : key;
    };

    const formatMaxLevelStat = (key: string, value: number): string => {
        if (key === 'CR' || key === 'CRDM' || key === 'MRES' || key === 'DEF') {
            return `${value}%`;
        }
        return value.toString();
    };

    return (
        <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
                {orderedStats.slice(0, 3).map(([key, value]) => (
                    <div key={key as string} className="bg-gray-800/50 rounded p-2 py-1 px-3 flex justify-between items-center border border-gray-600/50">
                        <span className="text-gray-300 text-xs font-medium">{formatStatKey(key as string)}</span>
                        <span className="font-bold text-white text-sm">
                            {formatMaxLevelStat(key as string, value as number)}
                        </span>
                    </div>
                ))}
            </div>
            <div className="space-y-1.5">
                {orderedStats.slice(3, 6).map(([key, value]) => (
                    <div key={key as string} className="bg-gray-800/50 rounded p-2 py-1 px-3 flex justify-between items-center border border-gray-600/50">
                        <span className="text-gray-300 text-xs font-medium">{formatStatKey(key as string)}</span>
                        <span className="font-bold text-white text-sm">
                            {formatMaxLevelStat(key as string, value as number)}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
} 