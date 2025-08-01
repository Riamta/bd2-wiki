import Image from 'next/image';

export type AttackType = 'Physical' | 'Magical';

const attackTypeIcons: Record<AttackType, string> = {
    Physical: '/images/attack_type/icon_atk.svg',
    Magical: '/images/attack_type/icon_matk.svg',
};

export function AttackTypeIcon({ attackType, size = 20, className = '' }: { attackType: AttackType, size?: number, className?: string }) {
    return <Image src={attackTypeIcons[attackType]}
        alt={attackType}
        width={size}
        height={size}
        className={className} />
}