// import { useState, useEffect, useCallback } from 'react';
import { 
    Minimize2, Maximize2, Lock, Unlock, Download, Video, 
    Heart, Info, Grid, Film, User, Play, Pause, UserPlus 
} from 'lucide-react';

interface AnimationControlsProps {
    isFullscreen: boolean;
    setIsFullscreen: (value: boolean) => void;
    dragLock: boolean;
    setDragLock: (value: boolean) => void;
    isHVersion: boolean;
    setIsHVersion: (value: boolean) => void;
    isCutsceneMode: boolean;
    setIsCutsceneMode: (value: boolean) => void;
    isFatedGuestMode: boolean; 
    setIsFatedGuestMode: (value: boolean) => void;
    isAutoPlay: boolean;
    setIsAutoPlay: (value: boolean) => void;
    isRecording: boolean;
    handleSaveImage: () => void;
    handleExportVideo: () => void;
    onRecordingComplete?: () => void;
    showScalePanel: boolean;
    setShowScalePanel: (value: boolean) => void;
    showAnimationPanel: boolean;
    setShowAnimationPanel: (value: boolean) => void;
    availableAnimations: string[];
    selectedAnimation: string;
    spineZoom: number;
    spinePosition: { x: number; y: number };
    resetTrigger: number;
    setResetTrigger: (value: number) => void;
    setSelectedAnimation: (animation: string) => void;
    hasSpineData: boolean;
    hasSpineHVersion?: boolean;
    hasSpineCutscene?: boolean;
    hasSpineFatedGuest?: boolean;
}

export function AnimationControls({
    isFullscreen,
    setIsFullscreen,
    dragLock,
    setDragLock,
    isHVersion,
    setIsHVersion,
    isCutsceneMode,
    setIsCutsceneMode,
    isFatedGuestMode,
    setIsFatedGuestMode,
    isAutoPlay,
    setIsAutoPlay,
    isRecording,
    handleSaveImage,
    handleExportVideo,
    onRecordingComplete,
    showScalePanel,
    setShowScalePanel,
    showAnimationPanel,
    setShowAnimationPanel,
    availableAnimations,
    selectedAnimation,
    spineZoom,
    spinePosition,
    resetTrigger,
    setResetTrigger,
    setSelectedAnimation,
    hasSpineData,
    hasSpineHVersion = false,
    hasSpineCutscene = false,
    hasSpineFatedGuest = false
}: AnimationControlsProps) {
    
    if (!hasSpineData) return null;
    
    return (
        <>
            {/* Main Controls */}
            <div className="fixed right-6 z-50 flex flex-col gap-3 transition-all duration-300 top-20">
                {/* Fullscreen Icon */}
                <button
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    className={`p-2 rounded-full transition-all ${isFullscreen
                        ? 'text-purple-400 hover:text-purple-300 hover:bg-purple-400/10'
                        : 'text-gray-400 hover:text-white hover:bg-white/10'
                        }`}
                    title={`Toggle Fullscreen Mode${isFullscreen ? ' (Press ESC to exit)' : ''}`}
                >
                    {isFullscreen ? <Minimize2 size={24} /> : <Maximize2 size={24} />}
                </button>
                
                {/* Drag Lock Icon */}
                <button
                    onClick={() => setDragLock(!dragLock)}
                    className={`p-2 rounded-full transition-all ${dragLock
                        ? 'text-yellow-400 hover:text-yellow-300 hover:bg-yellow-400/10'
                        : 'text-gray-400 hover:text-white hover:bg-white/10'
                        }`}
                    title={dragLock ? 'Unlock Drag & Scale' : 'Lock Drag & Scale'}
                >
                    {dragLock ? <Lock size={24} /> : <Unlock size={24} />}
                </button>
                
                {/* Save Image Icon */}
                <button
                    onClick={handleSaveImage}
                    className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                    title="Save Current Frame as Image"
                >
                    <Download size={24} />
                </button>
                
                {/* Export Video Icon */}
                <button
                    onClick={handleExportVideo}
                    className={`p-2 rounded-full transition-all ${isRecording
                        ? 'text-red-400 hover:text-red-300 hover:bg-red-400/10'
                        : 'text-gray-400 hover:text-white hover:bg-white/10'
                        }`}
                    title={isRecording ? "Stop Recording" : "Start Recording Video"}
                >
                    <Video size={24} />
                </button>
                
                {/* Animation Mode Switcher */}
                <div className="flex flex-col overflow-hidden rounded-full border border-white/10">
                    <button
                        onClick={() => {
                            setIsCutsceneMode(false);
                            setIsFatedGuestMode(false);
                        }}
                        className={`p-2 transition-all ${isHVersion
                            ? 'text-red-400 hover:text-red-300 hover:bg-red-400/10'
                            : 'text-gray-400 hover:text-white hover:bg-white/10'
                            } ${!isCutsceneMode && !isFatedGuestMode ? 'bg-white/10' : ''}`}
                        title="Regular Animation"
                    >
                        <User size={24} />
                    </button>

                    {hasSpineCutscene && (
                        <button
                            onClick={() => {
                                setIsCutsceneMode(true);
                                setIsFatedGuestMode(false);
                            }}
                            className={`p-2 transition-all ${isHVersion
                                ? 'text-red-400 hover:text-red-300 hover:bg-red-400/10'
                                : 'text-gray-400 hover:text-white hover:bg-white/10'
                                } ${isCutsceneMode ? 'bg-white/10' : ''}`}
                            title="Cutscene Animation"
                        >
                            <Film size={24} />
                        </button>
                    )}
                    
                    {hasSpineFatedGuest && (
                        <button
                            onClick={() => {
                                setIsFatedGuestMode(true);
                                setIsCutsceneMode(false);
                            }}
                            className={`p-2 transition-all ${isHVersion
                                ? 'text-red-400 hover:text-red-300 hover:bg-red-400/10'
                                : 'text-gray-400 hover:text-white hover:bg-white/10'
                                } ${isFatedGuestMode ? 'bg-white/10' : ''}`}
                            title="Fated Guest Animation"
                        >
                            <UserPlus size={24} />
                        </button>
                    )}
                </div>
            </div>

            {/* Bottom Control Panel */}
            <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end space-y-3">
                {/* Panels */}
                <div className="flex flex-col space-y-3 mb-3 w-full items-end">
                    {/* Animation List Panel */}
                    {showAnimationPanel && availableAnimations.length > 0 && (
                        <div className="bg-white/10 backdrop-blur-md text-white rounded-lg border border-white/10 shadow-lg mb-0 w-72 max-w-xs overflow-hidden transition-all duration-300 ease-in-out">
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

                    {/* Scale and Position Panel */}
                    {showScalePanel && (
                        <div className="bg-white/10 backdrop-blur-md text-white rounded-lg border border-white/10 shadow-lg w-72 max-w-xs overflow-hidden transition-all duration-300 ease-in-out">
                            <div className="py-2.5 border-b border-white/5">
                                <h4 className="text-center font-normal text-xs text-white/90">Info</h4>
                            </div>
                            <div className="p-3 space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-white/70 text-xs">Scale:</span>
                                    <span className="font-medium text-xs text-white">{Math.round(spineZoom * 100)}%</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-white/70 text-xs">Position:</span>
                                    <span className="font-mono text-[10px] text-white/90">{spinePosition.x}, {spinePosition.y}</span>
                                </div>
                                <div className="flex justify-center mt-2 pt-2 border-t border-white/5">
                                    <button
                                        onClick={() => {
                                            setResetTrigger(resetTrigger + 1);
                                        }}
                                        className="px-3 py-1 bg-white/10 hover:bg-white/15 text-white/90 text-[10px] rounded-md border-none transition-all duration-200"
                                    >
                                        Reset
                                    </button>
                                </div>
                                <div className="text-[10px] text-white/50 text-center mt-1.5">
                                    Drag to move • Scroll to zoom (50%-200%)
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Icon Buttons */}
                <div className="flex flex-row space-x-2">
                    {/* Auto Play Icon */}
                    <button
                        onClick={() => setIsAutoPlay(!isAutoPlay)}
                        className={`p-2 rounded-full transition-all ${isAutoPlay
                            ? 'text-green-400 hover:text-green-300 hover:bg-green-400/10'
                            : 'text-gray-400 hover:text-white hover:bg-white/10'
                            }`}
                        title={isAutoPlay ? 'Turn Off Auto Play' : 'Turn On Auto Play'}
                    >
                        {isAutoPlay ? <Pause size={24} /> : <Play size={24} />}
                    </button>
                    
                    {/* H Version Switch */}
                    {hasSpineHVersion && (
                        <button
                            onClick={() => {
                                setIsHVersion(!isHVersion);
                            }}
                            className={`p-2 rounded-full transition-all ${isHVersion
                                ? 'text-red-400 hover:text-red-300 hover:bg-red-400/10'
                                : 'text-gray-400 hover:text-white hover:bg-white/10'
                                }`}
                            title={isHVersion ? "SFW" : "NSFW"}
                        >
                            <Heart size={24} />
                        </button>
                    )}
                    
                    {/* Animation List Icon */}
                    {availableAnimations.length > 0 && (
                        <button
                            onClick={() => setShowAnimationPanel(!showAnimationPanel)}
                            className={`p-2 rounded-full transition-all ${showAnimationPanel
                                ? 'text-green-400 hover:text-green-300 hover:bg-green-400/10'
                                : 'text-gray-400 hover:text-white hover:bg-white/10'
                                }`}
                            title="Toggle Animation List"
                        >
                            <Grid size={24} />
                        </button>
                    )}
                    
                    {/* Info Icon - Toggle Scale Panel */}
                    <button
                        onClick={() => setShowScalePanel(!showScalePanel)}
                        className={`p-2 rounded-full transition-all ${showScalePanel
                            ? 'text-blue-400 hover:text-blue-300 hover:bg-blue-400/10'
                            : 'text-gray-400 hover:text-white hover:bg-white/10'
                            }`}
                        title="Toggle Scale Panel"
                    >
                        <Info size={24} />
                    </button>
                </div>
            </div>
        </>
    );
}