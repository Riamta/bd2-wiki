import { Stats } from "@/types/character";

export function StatDisplay({ stats }: { stats: Stats; title?: string }) {
    const statEntries = Object.entries(stats).filter(([_, value]) => value !== undefined && value !== 0);

    if (statEntries.length === 0) return null;

    const formatStatKey = (key: string): string => {
        const keyMappings: { [key: string]: string } = {
            'CRDM': 'CDMG',
            'FIRE_DAMAGE': 'Fire DMG',
            'WATER_DAMAGE': 'Water DMG',
            'WIND_DAMAGE': 'Wind DMG',
            'LIGHT_DAMAGE': 'Light DMG',
            'DARK_DAMAGE': 'Dark DMG',
            'FIRE_DMG': 'Fire DMG',
            'WATER_DMG': 'Water DMG',
            'WIND_DMG': 'Wind DMG',
            'LIGHT_DMG': 'Light DMG',
            'DARK_DMG': 'Dark DMG'
        };
        return keyMappings[key] || key;
    };

    const formatStatValue = (key: string, value: number): string => {
        if (value.toString().includes('.')) {
            return `${value}%`;
        }
        // Stats that should always show as percentage
        const percentageStats = ['CR', 'CRDM', 'MRES', 'DEF'];
        const damageStats = ['FIRE_DAMAGE', 'WATER_DAMAGE', 'WIND_DAMAGE', 'LIGHT_DAMAGE', 'DARK_DAMAGE', 'FIRE_DMG', 'WATER_DMG', 'WIND_DMG', 'LIGHT_DMG', 'DARK_DMG'];

        if (percentageStats.includes(key) || damageStats.includes(key) || key.includes('.')) {
            return `${value.toFixed(2)}%`;
        }

        // For small decimal values (like 5.2), show as is
        if (value < 100 && value !== Math.floor(value)) {
            return value.toString();
        }

        return value.toString();
    };

    return (
        <div className="space-y-1">
            {statEntries.map(([key, value]) => (
                <div key={key} className="flex justify-between items-center bg-gray-800/50 rounded p-2 border border-gray-600/50">
                    <span className="text-gray-300 text-xs">{formatStatKey(key)}</span>
                    <span className="font-bold text-white text-xs">
                        {formatStatValue(key, value as number)}
                    </span>
                </div>
            ))}
        </div>
    );
} 