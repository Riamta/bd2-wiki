import { useState } from 'react';
import Image from 'next/image';
import { Skill, SkillLevel, Potential } from '@/types/character';

interface SkillDisplayProps {
    skill: Skill;
    costumePath: string;
    activePotential?: Potential[];
}

// Function to format skill description with actual values
function formatSkillDescription(baseSkill: string, skillLevel: SkillLevel, activePotentials?: Potential[]): string {
    let formatted = baseSkill;
    const valueMapping: { [key: string]: number } = {};

    // Khởi tạo giá trị từ skillLevel
    if (skillLevel.VALUE1 !== undefined) {
        valueMapping.VALUE1 = skillLevel.VALUE1;
    }
    if (skillLevel.VALUE2 !== undefined) {
        valueMapping.VALUE2 = skillLevel.VALUE2;
    }
    if (skillLevel.VALUE3 !== undefined) {
        valueMapping.VALUE3 = skillLevel.VALUE3;
    }
    if (skillLevel.VALUE4 !== undefined) {
        valueMapping.VALUE4 = skillLevel.VALUE4;
    }
    if (skillLevel.VALUE5 !== undefined) {
        valueMapping.VALUE5 = skillLevel.VALUE5;
    }

    // Áp dụng tất cả các potential nếu có
    if (activePotentials && activePotentials.length > 0) {
        activePotentials.forEach(potential => {
            if (potential.switches) {
                potential.switches.forEach(sw => {
                    if (sw.target && sw.target.startsWith('VALUE') && valueMapping[sw.target] !== undefined) {
                        valueMapping[sw.target] += sw.value;
                    }
                });
            }
        });
    }

    // Thay thế các giá trị trong chuỗi mô tả
    Object.keys(valueMapping).forEach(key => {
        formatted = formatted.replace(new RegExp(`{${key}}`, 'g'), `<span class="text-yellow-400 text-center">${valueMapping[key]}</span>`);
    });

    if (baseSkill.includes('\n')) {
        formatted = formatted.replace(/\n/g, '<br />');
    }

    return `<div class="text-center">${formatted}</div>`;
}

// Function to extract YouTube video ID from URL
function getYouTubeVideoId(url: string): string | null {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
}

export function SkillDisplay({ skill, costumePath, activePotential }: SkillDisplayProps) {
    const [selectedSkillLevel, setSelectedSkillLevel] = useState(0);

    // Tạo bản sao của skill level hiện tại để tính toán
    let currentSkillLevel = { ...skill.levels[selectedSkillLevel] };

    // Áp dụng các hiệu ứng của tất cả potential được kích hoạt
    const activePotentials = Array.isArray(activePotential) ? activePotential : (activePotential ? [activePotential] : []);

    // Xử lý SP và CD từ các potential
    activePotentials.forEach(potential => {
        if (potential.switches) {
            potential.switches.forEach(sw => {
                if (sw.target === 'SP' && currentSkillLevel.sp) {
                    currentSkillLevel.sp = Math.max(0, currentSkillLevel.sp - sw.value);
                }
                if (sw.target === 'CD' && currentSkillLevel.cd) {
                    currentSkillLevel.cd = Math.max(0, currentSkillLevel.cd - sw.value);
                }
            });
        }
    });

    // Lấy tất cả Range potential
    const rangePotentials = activePotentials.filter(p => p.type === 'Range');
    // Nếu có potential Range, sử dụng nó thay cho range của skill
    const rangeToDisplay = rangePotentials.length > 0 && rangePotentials[0].value ? rangePotentials[0].value : null;

    return (
        <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-700">
            {/* Skill Name */}
            <div className="bg-gray-800/60 border-b border-gray-600/50 px-6 py-1 rounded-t-xl">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        {skill.icon && (
                            <Image
                                src={"/assets/characters/" + costumePath + "/res/" + skill.icon}
                                alt="Skill Icon"
                                width={40}
                                height={40}
                                className="object-contain"
                                sizes="100px"
                            />
                        )}
                        <h3 className="text-xl font-bold text-white">{skill.name}</h3>
                    </div>
                    <div className="flex flex-wrap items-center gap-5">
                        {/* Hiển thị range từ potential hoặc range gốc của skill */}
                        {rangeToDisplay ? (
                            <div className="flex justify-center">
                                <div className="p-1 border border-green-600/50 bg-green-900/20 rounded-lg">
                                    <Image
                                        src={`/assets/potential/${rangeToDisplay}.png`}
                                        alt="Skill Range (from Potential)"
                                        width={25}
                                        height={25}
                                        className="object-contain"
                                        sizes="100px"
                                    />
                                </div>
                            </div>
                        ) : skill.range && (
                            <div className="flex justify-center">
                                <div className="p-1 border border-gray-600/50 rounded-lg">
                                    <Image
                                        src={"/assets/characters/" + costumePath + "/res/" + skill.range}
                                        alt="Skill Range"
                                        width={25}
                                        height={25}
                                        className="object-contain"
                                        sizes="100px"
                                    />
                                </div>
                            </div>
                        )}
                        <div className="flex items-center gap-2">
                            <span className="text-white text-lg">SP:</span>
                            <span className={`${activePotentials.some(p => p.switches?.some(sw => sw.target === 'SP')) ? 'text-green-400' : 'text-yellow-400'} text-lg`}>
                                {currentSkillLevel.sp}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-white text-lg">CD:</span>
                            <span className={`${activePotentials.some(p => p.switches?.some(sw => sw.target === 'CD')) ? 'text-green-400' : 'text-yellow-400'} text-lg`}>
                                {currentSkillLevel.cd}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-white text-lg">Chain:</span>
                            <span className="text-yellow-400 text-lg">{skill.chain}</span>
                        </div>
                    </div>
                </div>
            </div>
            <div className="p-6">
                {/* Skill Level Selector */}
                <div className="mb-4">
                    <div className="flex justify-center gap-2">
                        {skill.levels.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setSelectedSkillLevel(index)}
                                className={`relative w-12 h-12 rounded transition-all overflow-hidden ${selectedSkillLevel === index
                                    ? 'ring-2 ring-green-400'
                                    : 'opacity-60 hover:opacity-100'
                                    }`}
                            >
                                <Image
                                    src={`/images/levels/${index}.png`}
                                    alt={`Level ${index}`}
                                    fill
                                    className="object-contain"
                                    sizes="50px"
                                />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Skill Description */}
                <div className={`p-4 rounded-lg border border-gray-600/50 mb-6 ${activePotentials.length > 0 ? 'bg-green-900/30' : ''}`}>
                    <p className="text-gray-200 leading-relaxed"
                        dangerouslySetInnerHTML={{
                            __html: currentSkillLevel
                                ? formatSkillDescription(skill.base_skill, currentSkillLevel, activePotentials)
                                : skill.base_skill
                        }}
                    />
                </div>

                {/* Skill Preview Video */}
                {skill.preview && (
                    <div className="mt-6">
                        <h4 className="text-white font-bold mb-4 text-center">🎥 Skill Preview</h4>
                        {(() => {
                            const videoId = getYouTubeVideoId(skill.preview);
                            if (videoId) {
                                return (
                                    <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-600/50">
                                        <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                                            <iframe
                                                className="absolute top-0 left-0 w-full h-full rounded-lg"
                                                src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&showinfo=0`}
                                                title="Skill Preview"
                                                frameBorder="0"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                            />
                                        </div>
                                    </div>
                                );
                            } else {
                                // Check file extension to determine if it's mp4 or gif
                                const isGif = skill.preview.toLowerCase().includes('.gif');
                                if (isGif) {
                                    return (
                                        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-600/50 relative flex items-center justify-center" style={{ paddingBottom: '56.25%' }}>
                                            <img
                                                src={skill.preview}
                                                alt="Skill Preview GIF"
                                                className="absolute top-0 left-0 w-full h-full rounded-lg object-contain"
                                                style={{ objectFit: 'contain' }}
                                            />
                                        </div>
                                    );
                                } else {
                                    return (
                                        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-600/50 relative" style={{ paddingBottom: '56.25%' }}>
                                            <video
                                                className="absolute top-0 left-0 w-full h-full rounded-lg"
                                                controls
                                                preload="metadata"
                                            >
                                                <source src={skill.preview} type="video/mp4" />
                                                Your browser does not support the video tag.
                                            </video>
                                        </div>
                                    );
                                }
                            }
                        })()}
                    </div>
                )}
            </div>
        </div>
    );
} 