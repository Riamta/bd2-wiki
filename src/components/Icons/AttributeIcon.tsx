import React from 'react';

export type AttributeType = 'Fire' | 'Water' | 'Wind' | 'Light' | 'Dark';

export function AttributeIcon({ attribute, size = 20 }: { attribute: AttributeType, size?: number }) {
    const icons: Record<AttributeType, string> = {
        Fire: '/images/elementals/fire.webp',
        Water: '/images/elementals/water.webp',
        Wind: '/images/elementals/wind.webp',
        Light: '/images/elementals/light.webp',
        Dark: '/images/elementals/dark.webp',
    };
    if (!icons[attribute]) return null;
    return (
        <img
            src={icons[attribute]}
            alt={attribute}
            width={size}
            height={size}
        />
    );
}
