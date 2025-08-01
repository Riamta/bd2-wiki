import { Mars, Venus } from 'lucide-react';

export type Gender = 'Male' | 'Female';

export function GenderIcon({ gender, size = 20, className = '' }: { gender: Gender, size?: number, className?: string }) {
    return gender === 'Male' ? <Mars size={size} className={className} /> : <Venus size={size} className={className} />
}