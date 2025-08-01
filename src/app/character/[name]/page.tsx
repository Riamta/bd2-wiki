'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Character, Costume, Stats } from '@/types/character';
import { loadGameData } from '@/data/gameData';
import SpinePlayer from '@/components/SpinePlayer';
import { Heart, Grid, Film, User, Play, Pause, UserPlus } from 'lucide-react';
import { SkinCard } from '@/components/characters/SkinCard';
import { ExclusiveGear } from '@/components/characters/ExclusiveGear';
import { CharacterHeader } from '@/components/characters/CharacterHeader';
import { SkillDisplay } from '@/components/characters/SkillDisplay';
import { MaxLevelStatsDisplay } from '@/components/characters/MaxLevelStatsDisplay';
import { AnimationControls } from '@/components/AnimationControls';
import { SkillPotentialDisplay } from '@/components/characters/SkillPotentialDisplay';

function StatDisplay({ stats }: { stats: Stats; title: string }) {
    const statEntries = Object.entries(stats).filter(([, value]) => value !== undefined && value !== 0);

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

function CostumeCard({ costume, isSelected, onSelect }: {
    costume: Costume;
    isSelected: boolean;
    onSelect: () => void;
}) {
    return (
        <div
            className={`transition-opacity duration-200 ${isSelected ? 'opacity-100' : 'opacity-60'}`}
            onClick={onSelect}
        >
            <div className="aspect-[3/5] relative h-30 pb-[10px]">
                <Image
                    src={costume.icon_chibi ? "/assets/characters/" + costume.path + "/" + costume.icon_chibi : costume.image_url.replace('/characters-large/', '/characters/').replace('.webp', '_idle.webp')}
                    alt={costume.name}
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 50vw, 25vw"
                />
            </div>
            <h4 className={`font-medium text-xs text-center text-gray-200 -mt-9`}>
                {costume.name}
            </h4>
        </div>
    );
}

export default function CharacterDetailPage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [character, setCharacter] = useState<Character | null>(null);
    const [selectedCostume, setSelectedCostume] = useState(0);
    const [selectedSkin, setSelectedSkin] = useState(0); // 添加 selectedSkin 状态
    const [, setSelectedSkillLevel] = useState(0);
    const [activePotentialIndexes, setActivePotentialIndexes] = useState<number[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isMobile, setIsMobile] = useState(false);
    const [isHVersion, setIsHVersion] = useState(false);
    const [isCutsceneMode, setIsCutsceneMode] = useState(false);
    const [isFatedGuestMode, setIsFatedGuestMode] = useState(false); // Add Fated Guest mode state
    const [spineZoom, setSpineZoom] = useState(1.0);
    const [spinePosition, setSpinePosition] = useState({ x: 0, y: 0 });
    const [resetTrigger, setResetTrigger] = useState(0);
    const [showScalePanel, setShowScalePanel] = useState(false);
    const [showAnimationPanel, setShowAnimationPanel] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [dragLock, setDragLock] = useState(true); // Thêm state khoá drag, mặc định true
    const [availableAnimations, setAvailableAnimations] = useState<string[]>([]);
    const [selectedAnimation, setSelectedAnimation] = useState<string>('');
    const [isAutoPlay, setIsAutoPlay] = useState(false); // 添加自动播放状态
    // const spinePlayerRef = useRef<HTMLDivElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);

    // Khi mount, đọc trạng thái dragLock từ localStorage
    useEffect(() => {
        const stored = localStorage.getItem('dragLock');
        if (stored !== null) setDragLock(stored === 'true');

        // Read autoplay state from localStorage
        const storedAutoPlay = localStorage.getItem('autoPlay');
        if (storedAutoPlay !== null) setIsAutoPlay(storedAutoPlay === 'true');
    }, []);
    // Khi dragLock thay đổi, lưu vào localStorage
    useEffect(() => {
        localStorage.setItem('dragLock', dragLock ? 'true' : 'false');
    }, [dragLock]);
    // When autoPlay state changes, save to localStorage
    useEffect(() => {
        localStorage.setItem('autoPlay', isAutoPlay ? 'true' : 'false');
    }, [isAutoPlay]);

    // Memoize callback functions to prevent infinite re-renders
    const handleZoomChange = useCallback((zoom: number) => {
        // Nếu dragLock thì không cho scale
        if (!dragLock) setSpineZoom(zoom);
    }, [dragLock]);

    const handlePositionChange = useCallback((x: number, y: number) => {
        // Chỉ cho phép drag khi dragLock là false
        if (!dragLock) setSpinePosition({ x, y });
    }, [dragLock]);

    // Handle animations loaded callback
    const handleAnimationsLoaded = useCallback((animations: string[]) => {
        setAvailableAnimations(animations);
        // Set default animation to idle if available
        if (animations.includes('idle')) {
            setSelectedAnimation('idle');
        } else if (animations.length > 0) {
            setSelectedAnimation(animations[0]);
        }
    }, []); // Remove dependency on currentCostume since it's not used in the callback

    // Handle animation selection
    const handleAnimationSelect = useCallback((animation: string) => {
        setSelectedAnimation(animation);
    }, []);

    // Reset animation selection when costume or skin changes
    useEffect(() => {
        setSelectedAnimation('');
        setAvailableAnimations([]);
    }, [selectedCostume, selectedSkin]);

 

    // Function to handle back navigation
    const handleBackNavigation = useCallback(() => {
        // Get the previous page path from localStorage
        const previousPath = localStorage.getItem('previousPath') || '/';

        // Get any stored params for the target path
        const storedParams = sessionStorage.getItem('homePageParams');
        const finalPath = storedParams ? `${previousPath}?${storedParams}` : previousPath;

        router.push(finalPath);
    }, [router]);

    // Save current path when component mounts
    useEffect(() => {
        const currentPath = window.location.pathname;
        const previousPath = localStorage.getItem('previousPath');

        // Only update previousPath if we're coming from a different page
        if (previousPath !== currentPath) {
            localStorage.setItem('previousPath', previousPath || '/');
        }
    }, []);

    // Function to handle recording completion
    const handleRecordingComplete = useCallback(() => {
        if (isRecording && mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
        }
    }, [isRecording]);

    // Function to export animation as video
    const handleExportVideo = useCallback(() => {
        if (isRecording) {
            // Stop recording
            if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
                mediaRecorderRef.current.stop();
            }
            setIsRecording(false);
            return;
        }

        const container = document.querySelector('.spine-character-background canvas') ||
            document.querySelector('.spine-character-mobile canvas');

        if (!(container instanceof HTMLCanvasElement)) {
            alert('No canvas found. Please wait for the animation to load.');
            return;
        }

        try {
            // Capture stream directly from canvas with higher FPS for better quality
            const stream = container.captureStream(60); // 60 FPS for smoother video
            
            // Try to use the best available codec for highest quality and compatibility
            let mediaRecorderOptions;
            let fileExtension = 'webm';
            
            if (MediaRecorder.isTypeSupported('video/mp4;codecs=avc1.42E01E')) {
                // H.264 in MP4 for best compatibility and quality
                mediaRecorderOptions = {
                    mimeType: 'video/mp4;codecs=avc1.42E01E',
                    videoBitsPerSecond: 12000000 // 12 Mbps for very high quality
                };
                fileExtension = 'mp4';
            } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
                // VP9 codec with very high bitrate
                mediaRecorderOptions = {
                    mimeType: 'video/webm;codecs=vp9',
                    videoBitsPerSecond: 10000000 // 10 Mbps for high quality
                };
            } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8')) {
                // Fallback to VP8 with high bitrate
                mediaRecorderOptions = {
                    mimeType: 'video/webm;codecs=vp8',
                    videoBitsPerSecond: 8000000 // 8 Mbps
                };
            } else {
                // Last resort - default webm
                mediaRecorderOptions = {
                    videoBitsPerSecond: 6000000 // 6 Mbps
                };
            }
            
            const mediaRecorder = new MediaRecorder(stream, mediaRecorderOptions);

            const chunks: Blob[] = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    chunks.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunks, { type: mediaRecorderOptions.mimeType || 'video/webm' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                const costumeName = character?.costumes[selectedCostume]?.name || 'costume';
                link.download = `${character?.name || 'character'}_${costumeName}_${new Date().getTime()}.${fileExtension}`;
                link.href = url;
                link.click();
                URL.revokeObjectURL(url);
                setIsRecording(false);
            };

            mediaRecorderRef.current = mediaRecorder;
            mediaRecorder.start();
            setIsRecording(true);

        } catch (error) {
            console.error('Failed to export animation:', error);
            alert('Failed to export animation. Your browser may not support this feature.');
            setIsRecording(false);
        }
    }, [isRecording, character?.name, character?.costumes, selectedCostume]);

    // Check if device is mobile
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Handle fullscreen escape key
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isFullscreen) {
                setIsFullscreen(false);
            }
        };

        if (isFullscreen) {
            window.addEventListener('keydown', handleKeyPress);
            return () => window.removeEventListener('keydown', handleKeyPress);
        }
    }, [isFullscreen]);

    // Add effect to handle mode switching
    useEffect(() => {
        // If Fated Guest mode is enabled, disable cutscene mode
        if (isFatedGuestMode) {
            setIsCutsceneMode(false);
        }
        // If cutscene mode is enabled, disable Fated Guest mode
        if (isCutsceneMode) {
            setIsFatedGuestMode(false);
        }
    }, [isFatedGuestMode, isCutsceneMode]);

    useEffect(() => {
        const fetchCharacter = async () => {
            try {
                const data = await loadGameData();
                const characterName = decodeURIComponent(params.name as string);
                const foundCharacter = data.characters.find(c => c.name === characterName);

                if (foundCharacter) {
                    setCharacter(foundCharacter);

                    // Check for costume parameter in URL
                    const costumeParam = searchParams.get('costume');
                    if (costumeParam) {
                        const costumeIndex = parseInt(costumeParam);
                        if (!isNaN(costumeIndex) && costumeIndex >= 0 && costumeIndex < foundCharacter.costumes.length) {
                            setSelectedCostume(costumeIndex);
                        }
                    }
                } else {
                    setError('Character not found');
                }
            } catch (err) {
                setError('Failed to load character data');
                console.error('Error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchCharacter();
    }, [params.name, searchParams]);

    const currentCostume = character?.costumes?.[selectedCostume];
    const currentSkill = currentCostume?.skill;
    const activePotentials = currentSkill?.potential ?
        currentSkill.potential.filter((_, idx) => activePotentialIndexes.includes(idx)) :
        [];

    // Function to save current frame as image
    const handleSaveImage = useCallback(() => {
        // Find the canvas element from SpinePlayer
        const container = document.querySelector('.spine-character-background canvas') ||
            document.querySelector('.spine-character-mobile canvas');

        if (container instanceof HTMLCanvasElement) {
            try {
                // Create a link element and trigger download
                const link = document.createElement('a');
                link.download = `${character?.name || 'character'}_${currentCostume?.name || 'costume'}_${new Date().getTime()}.png`;
                link.href = container.toDataURL('image/png');
                link.click();
            } catch (error) {
                console.error('Failed to save image:', error);
                alert('Failed to save image. Please try again.');
            }
        } else {
            alert('No canvas found. Please wait for the animation to load.');
        }
    }, [character?.name, currentCostume?.name]);

    // Xử lý kích hoạt từng potential
    const handleTogglePotential = useCallback((index: number) => {
        setActivePotentialIndexes(prev => {
            if (prev.includes(index)) {
                return prev.filter(i => i !== index);
            } else {
                return [...prev, index];
            }
        });
    }, []);

    // Xử lý kích hoạt/tắt tất cả potential
    const handleToggleAll = () => {
        if (currentSkill?.potential) {
            if (activePotentialIndexes.length === currentSkill.potential.length) {
                // Nếu tất cả đã được kích hoạt, tắt tất cả
                setActivePotentialIndexes([]);
            } else {
                // Ngược lại, bật tất cả
                setActivePotentialIndexes(currentSkill.potential.map((_, idx) => idx));
            }
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400"></div>
            </div>
        );
    }

    if (error || !character) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-400 mb-4">{error || 'Character not found'}</p>
                    <button
                        onClick={handleBackNavigation}
                        className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-bold"
                    >
                        Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-950">
            {/* Fullscreen Backdrop */}
            {isFullscreen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-0 transition-all duration-300" />
            )}

            {/* Header - Removed unnecessary wrapper div */}
            {!isFullscreen && (
                <CharacterHeader character={character} onBackClick={handleBackNavigation} isMobile={isMobile} />
            )}

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 min-h-screen">
                {/* Desktop Background Spine Animation Container - Adjusted z-index and position */}
                {!isMobile && (
                    <div className="absolute inset-0 overflow-hidden" style={{ zIndex: 5, top: '60px' }}>
                        <div className={`fixed top-16 h-screen flex items-center transition-all duration-300`}>
                            {currentCostume?.spine_data && currentCostume.spine_data.length > 0 ? (
                                <SpinePlayer
                                    key={`spine-${selectedCostume}-${selectedSkin}-${currentCostume.spine_data[0].spinePath}-${isHVersion}-${isCutsceneMode}-${isFatedGuestMode}-${isAutoPlay}`}
                                    spineData={
                                        selectedSkin > 0 && currentCostume.skin && currentCostume.skin[selectedSkin - 1].spine_data.length > 0
                                            ? currentCostume.skin[selectedSkin - 1].spine_data[0]
                                            : currentCostume.spine_data[0]
                                    }
                                    fallbackImageUrl={
                                        selectedSkin > 0 && currentCostume.skin
                                            ? currentCostume.skin[selectedSkin - 1].image_url
                                            : currentCostume.image_url
                                    }
                                    className="spine-character-background"
                                    width={isFatedGuestMode ? 5000 : 2560}
                                    height={isFatedGuestMode ? 5000 : 2560}
                                    isHVersion={isHVersion}
                                    isCutsceneMode={isCutsceneMode}
                                    isFatedGuestMode={isFatedGuestMode}
                                    isFullScreen={isFullscreen}
                                    onZoomChange={handleZoomChange}
                                    onPositionChange={handlePositionChange}
                                    resetTrigger={resetTrigger}
                                    dragLock={dragLock}
                                    scaleLock={dragLock}
                                    attribute={character.attribute}
                                    onAnimationsLoaded={handleAnimationsLoaded}
                                    selectedAnimation={selectedAnimation}
                                    onAnimationSelect={handleAnimationSelect}
                                    isAutoPlay={isAutoPlay}
                                    isRecording={isRecording}
                                    onRecordingComplete={handleRecordingComplete}
                                />
                            ) : currentCostume?.image_url ? (
                                <Image
                                    src={currentCostume.image_url}
                                    alt={currentCostume.name}
                                    width={800}
                                    height={900}
                                    className="object-contain opacity-80 pointer-events-none"
                                    priority
                                />
                            ) : null}
                        </div>
                    </div>
                )}

                {/* Control Icons */}
                {!isMobile && (currentCostume?.spine_data && currentCostume.spine_data.length > 0) && (
                    <AnimationControls
                        isFullscreen={isFullscreen}
                        setIsFullscreen={setIsFullscreen}
                        dragLock={dragLock}
                        setDragLock={setDragLock}
                        isHVersion={isHVersion}
                        setIsHVersion={setIsHVersion}
                        isCutsceneMode={isCutsceneMode}
                        setIsCutsceneMode={setIsCutsceneMode}
                        isFatedGuestMode={isFatedGuestMode}
                        setIsFatedGuestMode={setIsFatedGuestMode}
                        isAutoPlay={isAutoPlay}
                        setIsAutoPlay={setIsAutoPlay}
                        isRecording={isRecording}
                        handleSaveImage={handleSaveImage}
                        handleExportVideo={handleExportVideo}
                        onRecordingComplete={handleRecordingComplete}
                        showScalePanel={showScalePanel}
                        setShowScalePanel={setShowScalePanel}
                        showAnimationPanel={showAnimationPanel}
                        setShowAnimationPanel={setShowAnimationPanel}
                        availableAnimations={availableAnimations}
                        selectedAnimation={selectedAnimation}
                        setSelectedAnimation={setSelectedAnimation}
                        hasSpineData={currentCostume?.spine_data && currentCostume.spine_data.length > 0}
                        hasSpineHVersion={currentCostume?.spine_data && currentCostume.spine_data[0].spinePathH?.replace('.skel', '.atlas') ? true : false}
                        hasSpineCutscene={
                            selectedSkin > 0 && currentCostume?.skin && currentCostume.skin[selectedSkin - 1].spine_data.length > 0
                                ? currentCostume.skin[selectedSkin - 1].spine_data[0].spineCutscene ? true : false
                                : currentCostume?.spine_data && currentCostume.spine_data[0].spineCutscene ? true : false
                        }
                        hasSpineFatedGuest={
                            selectedSkin > 0 && currentCostume?.skin && currentCostume.skin[selectedSkin - 1].spine_data.length > 0
                                ? currentCostume.skin[selectedSkin - 1].spine_data[0].spineFatedGuest ? true : false
                                : currentCostume?.spine_data && currentCostume.spine_data[0].spineFatedGuest ? true : false
                        }
                        spineZoom={spineZoom}
                        spinePosition={spinePosition}
                        resetTrigger={resetTrigger}
                        setResetTrigger={setResetTrigger}
                    />
                )}

                {/* Main Content - single column with relative positioning */}
                <div className={`relative z-10 ${isMobile ? 'max-w-full' : 'max-w-[45rem]'} ${isFullscreen ? 'hidden' : ''}`}>
                    {/* Mobile Spine Display */}
                    {isMobile && (
                        <div className="bg-white/5 backdrop-blur-md rounded-xl shadow-lg p-0 border border-white/10 mb-4 overflow-hidden">
                            <div className="py-2.5 border-b border-white/5">
                                <div className="flex justify-between items-center px-4">
                                    <h3 className="text-white/90 font-normal text-xs">Character Preview</h3>
                                    <div className="flex items-center gap-2">
                                        {/* Animation List Toggle for Mobile */}
                                        {availableAnimations.length > 0 && (
                                            <button
                                                onClick={() => setShowAnimationPanel(!showAnimationPanel)}
                                                className={`p-2 rounded-full transition-all ${showAnimationPanel
                                                    ? 'text-white bg-white/10'
                                                    : 'text-white/60 hover:text-white/90'
                                                    }`}
                                                title="Toggle Animation List"
                                            >
                                                <Grid size={18} />
                                            </button>
                                        )}
                                        {/* Auto Play Toggle for Mobile */}
                                        <button
                                            onClick={() => setIsAutoPlay(!isAutoPlay)}
                                            className={`p-2 rounded-full transition-all ${isAutoPlay
                                                ? 'bg-white/20 text-white'
                                                : 'bg-black/20 text-white/70 hover:bg-black/30'
                                                }`}
                                            title={isAutoPlay ? 'Turn Off Auto Play' : 'Turn On Auto Play'}
                                        >
                                            {isAutoPlay ? <Pause size={18} /> : <Play size={18} />}
                                        </button>
                                        {currentCostume?.spine_data && currentCostume.spine_data.length > 0 && currentCostume.spine_data[0].spinePathH?.replace('.skel', '.atlas') && (
                                            <button
                                                onClick={() => setIsHVersion(!isHVersion)}
                                                className={`p-2 rounded-full transition-all ${isHVersion
                                                    ? 'bg-white/20 text-white'
                                                    : 'bg-black/20 text-white/70 hover:bg-black/30'
                                                    }`}
                                            >
                                                {isHVersion ? <Heart size={18} /> : <Heart size={18} />}
                                            </button>
                                        )}
                                        {/* Cutscene Mode Button */}
                                        {(
                                            (selectedSkin > 0 && currentCostume?.skin && currentCostume.skin[selectedSkin - 1].spine_data.length > 0 && currentCostume.skin[selectedSkin - 1].spine_data[0].spineCutscene) ||
                                            (selectedSkin === 0 && currentCostume?.spine_data && currentCostume.spine_data.length > 0 && currentCostume.spine_data[0].spineCutscene)
                                        ) && (
                                            <button
                                                onClick={() => setIsCutsceneMode(!isCutsceneMode)}
                                                className={`p-2 rounded-full transition-all ${isCutsceneMode
                                                    ? 'bg-white/20 text-white'
                                                    : 'bg-black/20 text-white/70 hover:bg-black/30'
                                                    }`}
                                            >
                                                {isCutsceneMode ? <Film size={18} /> : <User size={18} />}
                                            </button>
                                        )}
                                        {/* Fated Guest Mode Button */}
                                        {(
                                            (selectedSkin > 0 && currentCostume?.skin && currentCostume.skin[selectedSkin - 1].spine_data.length > 0 && currentCostume.skin[selectedSkin - 1].spine_data[0].spineFatedGuest) ||
                                            (selectedSkin === 0 && currentCostume?.spine_data && currentCostume.spine_data.length > 0 && currentCostume.spine_data[0].spineFatedGuest)
                                        ) && (
                                            <button
                                                onClick={() => {
                                                    if (isFatedGuestMode) {
                                                        setIsFatedGuestMode(false);
                                                    } else {
                                                        setIsFatedGuestMode(true);
                                                    }
                                                }}
                                                className={`p-2 rounded-full transition-all ${isFatedGuestMode
                                                    ? 'bg-white/20 text-white'
                                                    : 'bg-black/20 text-white/70 hover:bg-black/30'
                                                    }`}
                                            >
                                                {isFatedGuestMode ? <UserPlus size={18} /> : <UserPlus size={18} />}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-center items-center bg-gradient-to-b">
                                {currentCostume?.spine_data && currentCostume.spine_data.length > 0 ? (
                                    <SpinePlayer
                                        key={`mobile-spine-${selectedCostume}-${selectedSkin}-${currentCostume.spine_data[0].spinePath}-${isHVersion}-${isCutsceneMode}-${isFatedGuestMode}-${isAutoPlay}`}
                                        spineData={
                                            selectedSkin > 0 && currentCostume.skin && currentCostume.skin[selectedSkin - 1].spine_data.length > 0
                                                ? currentCostume.skin[selectedSkin - 1].spine_data[0]
                                                : currentCostume.spine_data[0]
                                        }
                                        fallbackImageUrl={
                                            selectedSkin > 0 && currentCostume.skin
                                                ? currentCostume.skin[selectedSkin - 1].image_url
                                                : currentCostume.image_url
                                        }
                                        className="spine-character-mobile"
                                        width={1000}
                                        height={500}
                                        isHVersion={isHVersion}
                                        isCutsceneMode={isCutsceneMode}
                                        isFatedGuestMode={isFatedGuestMode}
                                        isFullScreen={isFullscreen}
                                        onZoomChange={handleZoomChange}
                                        onPositionChange={handlePositionChange}
                                        resetTrigger={resetTrigger}
                                        dragLock={dragLock}
                                        scaleLock={dragLock}
                                        attribute={character.attribute}
                                        onAnimationsLoaded={handleAnimationsLoaded}
                                        selectedAnimation={selectedAnimation}
                                        onAnimationSelect={handleAnimationSelect}
                                        isAutoPlay={isAutoPlay}
                                        isRecording={isRecording}
                                        onRecordingComplete={handleRecordingComplete}
                                    />
                                ) : currentCostume?.image_url ? (
                                    <Image
                                        src={currentCostume.image_url}
                                        alt={currentCostume.name}
                                        width={200}
                                        height={250}
                                        className="object-contain"
                                        priority
                                    />
                                ) : null}
                            </div>

                            {/* Animation List for Mobile - Show/Hide based on showAnimationPanel */}
                            {showAnimationPanel && availableAnimations.length > 0 && (
                                <div className="bg-white/10 backdrop-blur-md text-white rounded-b-lg border-t border-white/10">
                                    <div className="py-2.5 border-b border-white/5">
                                        <h4 className="text-center font-normal text-xs text-white/90">Animations</h4>
                                    </div>
                                    <div className="p-3">
                                        <div className="grid grid-cols-3 gap-1.5 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                                            {availableAnimations.map((animation) => (
                                                <button
                                                    key={animation}
                                                    onClick={() => setSelectedAnimation(animation)}
                                                    className={`px-2 py-1.5 rounded text-xs transition-all duration-200 ${selectedAnimation === animation
                                                        ? 'bg-white/20 text-white'
                                                        : 'bg-black/20 text-white/70 hover:bg-black/30 hover:text-white/90'
                                                        }`}
                                                >
                                                    {animation}
                                                </button>
                                            ))}
                                        </div>
                                        <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between text-[10px]">
                                            <span className="text-white/50">Current:</span>
                                            <span className="text-white/90">{selectedAnimation}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-[55%_43%] gap-4">
                            {/* Character Basic Info */}
                            <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-700">
                                <div className="p-6">
                                    <div className="flex flex-col sm:flex-row gap-4">
                                        {/* Avatar on the left */}
                                        <div className="w-[125px] h-[173px] mx-auto sm:mx-0 flex-shrink-0 cursor-pointer" onClick={() => setShowModal(true)}>
                                            <Image
                                                src={
                                                    currentCostume?.avatar
                                                        ? `/assets/characters/${currentCostume.path}/${currentCostume.avatar}`
                                                        : currentCostume?.image_url
                                                            ? currentCostume.image_url.replace('/characters-large/', '/characters/')
                                                            : "/assets/placeholder.png"
                                                }
                                                alt={character.name}
                                                width={300}
                                                height={300}
                                                className="rounded-lg object-cover w-full h-full hover:opacity-80 transition-opacity"
                                            />
                                        </div>
                                        {/* Character info grid */}
                                        <div className="flex-1 space-y-3">
                                            <h4 className="text-white font-bold mb-2 text-center text-sm">Max Level Stats</h4>
                                            <div className="flex gap-4">
                                                <div className="flex-shrink-0">
                                                </div>
                                                <div className="flex-1 sm:-ml-4">
                                                    <MaxLevelStatsDisplay stats={character.max_level_stats} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-700">
                                <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 p-6">
                                    <div className="">
                                        <h4 className="text-white font-bold mb-2 text-center text-sm">Engraving</h4>
                                        <StatDisplay stats={character.engraving} title="" />
                                    </div>
                                    <div className="">
                                        <h4 className="text-white font-bold mb-2 text-center text-sm">Awakening</h4>
                                        <StatDisplay stats={character.awakening} title="" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Exclusive Gear */}
                        {character.exclusive_gear && (
                            <ExclusiveGear character={character} />
                        )}
                        {/* Costumes */}
                        <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-700 mt-1 p-4">
                            <div className="grid grid-cols-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                                {character.costumes.map((costume, index) => {
                                    const selected = selectedCostume === index;
                                    return (
                                        <div
                                            key={index}
                                            className="relative rounded-xl transition-all cursor-pointer"
                                            onClick={() => {
                                                setSelectedCostume(index);
                                                setSelectedSkillLevel(0);
                                                // Reset H version if new costume doesn't support it
                                                if (!costume.spine_data?.[0]?.spinePathH) {
                                                    setIsHVersion(false);
                                                }
                                                // Reset cutscene mode if new costume doesn't support it
                                                if (!costume.spine_data?.[0]?.spineCutscene) {
                                                    setIsCutsceneMode(false);
                                                }
                                                // 重置皮肤选择
                                                setSelectedSkin(0);
                                                // Update URL with costume parameter
                                                const url = new URL(window.location.href);
                                                url.searchParams.set('costume', index.toString());
                                                router.replace(url.pathname + url.search, { scroll: false });
                                            }}
                                        >
                                            {selected && (
                                                <Image
                                                    src="/assets/skin-active-bg.png"
                                                    alt=""
                                                    width={800}
                                                    height={200}
                                                    className="absolute inset-0 w-full h-200px object-cover pointer-events-none z-0 p-3"
                                                    style={{ marginTop: -35 }}
                                                    draggable={false}
                                                />
                                            )}
                                            <div className="relative z-10" style={{ marginTop: -30 }}>
                                                <CostumeCard
                                                    costume={costume}
                                                    isSelected={selected}
                                                    onSelect={() => { }} // No-op, handled by parent div
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>




                        {/* Skins */}
                        {currentCostume?.skin && currentCostume.skin.length > 0 && (
                            <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-700 mt-4 p-4">
                                <div className="flex items-center justify-between mb-3 px-2">
                                    <h3 className="text-white text-sm font-medium">Skins</h3>
                                </div>
                                <div className="grid grid-cols-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                                    {/* 默认皮肤 */}
                                    <div
                                        key="default-skin"
                                        className="relative rounded-xl transition-all cursor-pointer"
                                        onClick={() => setSelectedSkin(0)}
                                    >
                                        {selectedSkin === 0 && (
                                            <Image
                                                src="/assets/skin-active-bg.png"
                                                alt=""
                                                width={800}
                                                height={200}
                                                className="absolute inset-0 w-full h-200px object-cover pointer-events-none z-0 p-3"
                                                style={{ marginTop: -35 }}
                                                draggable={false}
                                            />
                                        )}
                                        <div className="relative z-10" style={{ marginTop: -30 }}>
                                            <div className="aspect-[3/5] relative h-30 pb-[10px]">
                                                <Image
                                                    src={currentCostume.icon_chibi ? "/assets/characters/" + currentCostume.path + "/" + currentCostume.icon_chibi : currentCostume.image_url.replace('/characters-large/', '/characters/').replace('.webp', '_idle.webp')}
                                                    alt="Default"
                                                    fill
                                                    className="object-contain"
                                                    sizes="(max-width: 768px) 50vw, 25vw"
                                                />
                                            </div>
                                            <h4 className={`font-medium text-xs text-center text-gray-200 -mt-9`}>
                                                {currentCostume.name}
                                            </h4>
                                        </div>
                                    </div>

                                    {/* 其他皮肤 */}
                                    {currentCostume.skin.map((skin, idx) => {
                                        const skinSelected = selectedSkin === idx + 1;
                                        return (
                                            <div
                                                key={`skin-${idx}`}
                                                className="relative rounded-xl transition-all cursor-pointer"
                                                onClick={() => setSelectedSkin(idx + 1)}
                                            >
                                                {skinSelected && (
                                                    <Image
                                                        src="/assets/skin-active-bg.png"
                                                        alt=""
                                                        width={800}
                                                        height={200}
                                                        className="absolute inset-0 w-full h-200px object-cover pointer-events-none z-0 p-3"
                                                        style={{ marginTop: -35 }}
                                                        draggable={false}
                                                    />
                                                )}
                                                <div className="relative z-10" style={{ marginTop: -30 }}>
                                                    <SkinCard
                                                        skin={skin}
                                                        isSelected={skinSelected}
                                                        onSelect={() => { }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Stats và Potentials Grid Layout */}
                        <div className={`grid ${currentSkill?.potential && currentSkill.potential.length > 0 ? 'grid-cols-1 md:grid-cols-2 gap-4' : ''}`}>
                            {/* Stats Grid */}
                            <div className="bg-[#1a1e2e] rounded-lg overflow-hidden mt-4">
                                {/* All Stats Grid */}
                                <div className="grid grid-cols-2 md:grid-cols-2 gap-3 p-4">
                                    {currentCostume && (
                                        <>
                                            <div className="">
                                                <h4 className="text-white font-bold mb-2 text-center text-sm">Permanent</h4>
                                                <StatDisplay stats={currentCostume.permanent} title="" />
                                            </div>
                                            <div className="">
                                                <h4 className="text-white font-bold mb-2 text-center text-sm">Bonding</h4>
                                                <StatDisplay stats={currentCostume.bonding} title="" />
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Skill Potentials Section */}
                            {currentSkill?.potential && currentSkill.potential.length > 0 && (
                                <SkillPotentialDisplay
                                    skill={currentSkill}
                                    activePotentialIndexes={activePotentialIndexes}
                                    onTogglePotential={handleTogglePotential}
                                    onToggleAll={handleToggleAll}
                                />
                            )}
                        </div>

                        {/* Skills Section */}
                        {currentSkill && (
                            <SkillDisplay
                                skill={currentSkill}
                                costumePath={currentCostume.path}
                                activePotential={activePotentials}
                            />
                        )}


                    </div>
                </div>
            </main>

            {/* Image Modal - Outside all layout containers */}
            {showModal && (
                <div
                    className="fixed inset-0 bg-black/95 flex items-center justify-center z-[9999] cursor-pointer"
                    onClick={() => setShowModal(false)}
                >
                    {/* Close Button */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowModal(false);
                        }}
                        className="absolute top-6 right-6 z-10 text-white/80 hover:text-white text-3xl font-light transition-all"
                    >
                        ×
                    </button>

                    {/* Image */}
                    <div className="max-w-[90vw] max-h-[90vh] flex items-center justify-center">
                        <Image
                            src={currentCostume?.image_url ?? ""}
                            alt={character.name}
                            width={450}
                            height={450}
                            className="object-contain max-w-full max-h-full"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                </div>
            )}
        </div>
    );

    // Không cần hàm applyPotentialsToSkill nữa vì đã xử lý trực tiếp trong SkillDisplay
}