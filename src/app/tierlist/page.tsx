"use client";
import { loadGameData, loadTierListPVEData } from '@/data/gameData';
import CharacterCard from '@/components/CharacterCard';
import { Character } from '@/types/character';
import React from 'react';
import { AttributeIcon } from '@/components/Icons/AttributeIcon';

const ELEMENTS = ['Fire', 'Water', 'Wind', 'Light', 'Dark'];

export default function TierListPage() {
    const [tierList, setTierList] = React.useState<any[]>([]);
    const [characters, setCharacters] = React.useState<Character[]>([]);
    const [isMobile, setIsMobile] = React.useState(false);

    React.useEffect(() => {
        async function fetchData() {
            const tierListData = await loadTierListPVEData();
            const gameData = await loadGameData();
            setTierList(tierListData.tierList);
            setCharacters(gameData.characters);
        }
        fetchData();
    }, []);

    // Check if device is mobile
    React.useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const getCharByName = (name: string) => characters.find(c => c.name === name);

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Main content */}
            <main className="mx-auto max-w-7xl px-4 py-8">
                <section className="bg-gray-900/80 backdrop-blur-sm rounded-xl shadow-xl p-6 border border-gray-700">
                    <h2 className="text-2xl font-bold text-center mb-4">Tier List PVE</h2>

                    {/* Desktop Table View */}
                    {!isMobile && (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[800px] border-collapse text-sm">
                                <thead>
                                    <tr>
                                        <th className="sticky left-0 bg-gray-900 text-left p-2 z-10">Rank</th>
                                        {ELEMENTS.map(el => (
                                            <th key={el} className="p-2 text-center">
                                                <AttributeIcon attribute={el as any} size={28} />
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {tierList.map((tier) => (
                                        <tr key={tier.rank} className="border-t border-gray-700 align-top">
                                            <td className="sticky left-0 bg-gray-900 p-2 font-bold text-yellow-400 text-center z-10">{tier.rank}</td>
                                            {ELEMENTS.map(element => (
                                                <td key={element} className="p-2">
                                                    {tier.elements[element]?.characters?.length > 0 ? (
                                                        <div className="flex flex-wrap gap-2 justify-center">
                                                            {tier.elements[element].characters.map((charName: string) => {
                                                                const char = getCharByName(charName);
                                                                return char ? (
                                                                    <div key={char.name} className="w-25 sm:w-32">
                                                                        <CharacterCard character={char} />
                                                                    </div>
                                                                ) : (
                                                                    <div key={charName} className="text-xs text-red-400">{charName}</div>
                                                                );
                                                            })}
                                                        </div>
                                                    ) : (
                                                        <div className="text-center text-gray-500">-</div>
                                                    )}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Mobile Card View */}
                    {isMobile && (
                        <div className="space-y-6">
                            {tierList.map((tier) => (
                                <div key={tier.rank} className="bg-gray-800/50 rounded-lg p-4 border border-gray-600">
                                    <div className="text-center mb-4">
                                        <span className="inline-block bg-yellow-600 text-black font-bold px-4 py-2 rounded-lg text-lg">
                                            {tier.rank}
                                        </span>
                                    </div>

                                    <div className="space-y-4">
                                        {ELEMENTS.map(element => {
                                            const hasCharacters = tier.elements[element]?.characters?.length > 0;
                                            if (!hasCharacters) return null;

                                            return (
                                                <div key={element} className="bg-gray-700/50 rounded-lg p-3">
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <AttributeIcon attribute={element as any} size={24} />
                                                        <span className="font-semibold text-white">{element}</span>
                                                    </div>

                                                    <div className="grid grid-cols-3 gap-2">
                                                        {tier.elements[element].characters.map((charName: string) => {
                                                            const char = getCharByName(charName);
                                                            return char ? (
                                                                <div key={char.name} className="w-full">
                                                                    <CharacterCard character={char} />
                                                                </div>
                                                            ) : (
                                                                <div key={charName} className="text-xs text-red-400 p-2 text-center">
                                                                    {charName}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </main>

            {/* Footer */}
            <footer className="bg-gray-900 border-t border-gray-800 mt-12 py-6 text-center text-gray-400">
                <div className="px-4">
                    <div className={`${isMobile ? 'text-sm' : 'text-base'}`}>
                        Brown Dust 2 Character Database - Built with Next.js
                    </div>
                </div>
            </footer>
        </div>
    );
}
