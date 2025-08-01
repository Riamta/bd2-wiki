'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Image from 'next/image';

interface SpineData {
  animation: string;
  id: string;
  spinePath: string;
  spinePathH: string;
  spineCutscene?: string;
  spineFatedGuest?: string; // Add Fated Guest spine path
  skin: string;
  offset?: {
    y: number;
    scale: number;
  };
}

interface SpinePlayerProps {
  spineData: SpineData;
  fallbackImageUrl?: string;
  className?: string;
  width?: number;
  height?: number;
  isHVersion?: boolean;
  isCutsceneMode?: boolean; // Add cutscene mode prop
  isFatedGuestMode?: boolean; // Add Fated Guest mode prop
  isFullScreen?: boolean; // Add full screen mode prop
  onZoomChange?: (zoom: number) => void;
  onPositionChange?: (x: number, y: number) => void;
  resetTrigger?: number;
  dragLock?: boolean; // Thêm prop dragLock
  scaleLock?: boolean; // Thêm prop scaleLock
  attribute?: string; // Add attribute prop
  onAnimationsLoaded?: (animations: string[]) => void; // Thêm callback
  selectedAnimation?: string; // Thêm prop để nhận animation được chọn
  onAnimationSelect?: (animation: string) => void; // Callback khi chọn animation
  isAutoPlay?: boolean; // 添加自动播放属性
  isRecording?: boolean; // Add recording prop
  onRecordingComplete?: () => void; // Callback khi animation kết thúc trong lúc record
}

// Map of attribute background colors
const attributeBackgroundColors: Record<string, string> = {
  Fire: 'rgb(170, 40, 40)',
  Water: 'rgb(40, 90, 170)',
  Wind: 'rgb(35, 107, 43)',
  Light: 'rgb(220, 190, 80)',
  Dark: 'rgb(90, 40, 120)'
};

// Define OrthoCamera interface
interface OrthoCamera {
  position: {
    x: number;
    y: number;
  };
  zoom: number;
  update(): void;
}

// Define Spine player types - using a more flexible type that extends the actual SpinePlayer
interface SpinePlayerType {
  skeleton?: unknown;
  sceneRenderer?: unknown;
  setAnimation?: (name: string, loop: boolean) => void;
  play?: () => void;
  pause?: () => void;
  dispose?: () => void;
  state?: {
    addListener?: (listener: AnimationListener) => void;
    removeListener?: (listener: AnimationListener) => void;
  };
  animationState?: {
    addListener?: (listener: AnimationListener) => void;
    removeListener?: (listener: AnimationListener) => void;
  } | null;
  [key: string]: unknown; // Allow any additional properties from the actual SpinePlayer
}

interface AnimationListener {
  complete?: (entry: unknown) => void;
}

export default function SpinePlayer({
  spineData,
  fallbackImageUrl,
  className = "",
  width = 1500,
  height = 1500,
  isHVersion = false,
  isCutsceneMode = false,
  isFatedGuestMode = false, // Add default value
  isFullScreen = false,
  onZoomChange,
  onPositionChange,
  resetTrigger,
  dragLock = false, // default: false (cho phép drag)
  scaleLock = false, // default: false (cho phép scale)
  attribute = "", // Default to empty string
  onAnimationsLoaded,
  selectedAnimation,
  onAnimationSelect,
  isAutoPlay = false, // 默认不自动播放
  isRecording = false, // Add recording prop
  onRecordingComplete // Add recording complete callback
}: SpinePlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<SpinePlayerType | null>(null);
  const cameraRef = useRef<OrthoCamera | null>(null);
  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null); // Auto play timer reference
  const animationCompletedListenerRef = useRef<unknown>(null); // Reference to store animation completed listener
  const recordingListenerRef = useRef<unknown>(null); // Reference to store recording animation completed listener
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [containerReady, setContainerReady] = useState(false);
  const [currentAnimation, setCurrentAnimation] = useState<string>('idle');
  const [availableAnimations, setAvailableAnimations] = useState<string[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1.0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, startX: 0, startY: 0 });
  const [hasDragged, setHasDragged] = useState(false);
  const [screenWidth, setScreenWidth] = useState(0);

  // Use refs to store latest callback functions
  const onZoomChangeRef = useRef(onZoomChange);
  const onPositionChangeRef = useRef(onPositionChange);

  // Update refs when callbacks change
  useEffect(() => {
    onZoomChangeRef.current = onZoomChange;
  }, [onZoomChange]);

  useEffect(() => {
    onPositionChangeRef.current = onPositionChange;
  }, [onPositionChange]);

  // Check if device is mobile and update screen width
  useEffect(() => {
    const checkMobileAndUpdateScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
      setScreenWidth(window.innerWidth);
    };

    checkMobileAndUpdateScreenSize();
    window.addEventListener('resize', checkMobileAndUpdateScreenSize);
    return () => window.removeEventListener('resize', checkMobileAndUpdateScreenSize);
  }, []);

  // Setup zoom functionality (desktop only)
  useEffect(() => {
    if (isMobile) return; // Disable zoom on mobile

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      // Nếu scaleLock thì không cho zoom
      if (scaleLock) return;
      const zoomSpeed = 0.1;
      const deltaY = e.deltaY;

      setZoomLevel(prev => {
        let newZoom = prev;
        if (deltaY < 0) {
          // Scroll up - zoom in
          newZoom = Math.min(2.0, prev + zoomSpeed);
        } else {
          // Scroll down - zoom out
          newZoom = Math.max(0.5, prev - zoomSpeed);
        }
        return newZoom;
      });
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
      return () => {
        container.removeEventListener('wheel', handleWheel);
      };
    }
  }, [containerReady, isMobile, scaleLock]);

  // Report zoom changes to parent
  useEffect(() => {
    if (onZoomChangeRef.current) {
      onZoomChangeRef.current(zoomLevel);
    }
  }, [zoomLevel]);

  // Report position changes to parent
  useEffect(() => {
    if (onPositionChangeRef.current) {
      onPositionChangeRef.current(position.x, position.y);
    }
  }, [position]);

  // Handle selectedAnimation prop changes
  useEffect(() => {
    if (selectedAnimation && availableAnimations.includes(selectedAnimation) && selectedAnimation !== currentAnimation) {
      // Use playAnimation but without calling the callback to avoid infinite loop
      if (playerRef.current && playerRef.current.setAnimation) {
        try {
          playerRef.current.setAnimation(selectedAnimation, true);
          setCurrentAnimation(selectedAnimation);

          // Recalculate camera position for new animation
          setTimeout(() => {
            setupCameraForAnimation(playerRef.current);
          }, 50);

        } catch {
          // Silently handle animation switch errors
        }
      }
    }
  }, [selectedAnimation, availableAnimations, currentAnimation]);

  // Play next animation in sequence
  const playNextAnimation = useCallback(() => {
    if (playerRef.current && playerRef.current.setAnimation && availableAnimations.length > 0) {
      // Get index of next animation
      const currentIndex = availableAnimations.indexOf(currentAnimation);
      const nextIndex = (currentIndex + 1) % availableAnimations.length;
      const nextAnimation = availableAnimations[nextIndex];

      try {
        // Stop any existing animation and start the new one
        playerRef.current.setAnimation(nextAnimation, true);
        setCurrentAnimation(nextAnimation);

        // Notify parent component
        if (onAnimationSelect) {
          onAnimationSelect(nextAnimation);
        }

        // Recalculate camera position for new animation
        setTimeout(() => {
          setupCameraForAnimation(playerRef.current);
        }, 50);

      } catch (error) {
        // Silent handling of animation switching errors
        console.error("Error switching to next animation:", error);
      }
    }
  }, [availableAnimations, currentAnimation, onAnimationSelect]);

  // Handle reset trigger from parent
  useEffect(() => {
    if (resetTrigger !== undefined) {
      setZoomLevel(1.0);
      setPosition({ x: 0, y: 0 });
    }
  }, [resetTrigger]);

  // Reset zoom and position when switching to mobile
  useEffect(() => {
    if (isMobile) {
      setZoomLevel(1.0);
      setPosition({ x: 0, y: 0 });
      setIsDragging(false);
      setHasDragged(false);
    }
  }, [isMobile]);

  // Check if container is ready on every render
  useEffect(() => {
    if (containerRef.current && !containerReady) {
      setContainerReady(true);
    }
  }, [containerReady]);

  // Handle auto play functionality
  useEffect(() => {
    // Clear previous timer if exists
    if (autoPlayTimerRef.current) {
      clearTimeout(autoPlayTimerRef.current);
      autoPlayTimerRef.current = null;
    }

    // Remove any existing animation completed listener
    if (animationCompletedListenerRef.current && playerRef.current?.animationState?.removeListener) {
      playerRef.current.animationState.removeListener(animationCompletedListenerRef.current);
      animationCompletedListenerRef.current = null;
    }

    // If auto play is enabled and animations are available
    if (isAutoPlay && availableAnimations.length > 1 && playerRef.current) {
      try {
        // Set up a listener for animation completion
        if (playerRef.current.animationState?.addListener) {
          const listener = {
            complete: () => {
              // When animation completes, play the next one with a small delay
              autoPlayTimerRef.current = setTimeout(() => {
                playNextAnimation();
              }, 100); // Small delay to prevent rapid switching
            }
          };

          // Add the listener to the animation state
          playerRef.current.animationState.addListener(listener);
          animationCompletedListenerRef.current = listener;
        } else {
          // Fallback to timer-based approach if animationState is not available
          autoPlayTimerRef.current = setTimeout(() => {
            playNextAnimation();
          }, 2000); // Default fallback time
        }
      } catch (error) {
        console.error("Error setting up animation completion listener:", error);
        // Fallback to timer-based auto play
        autoPlayTimerRef.current = setTimeout(() => {
          playNextAnimation();
        }, 2000); // Default fallback time
      }
    }

    return () => {
      // Cleanup timer
      if (autoPlayTimerRef.current) {
        clearTimeout(autoPlayTimerRef.current);
        autoPlayTimerRef.current = null;
      }

      // Cleanup animation completed listener
      if (animationCompletedListenerRef.current && playerRef.current?.animationState?.removeListener) {
        playerRef.current.animationState.removeListener(animationCompletedListenerRef.current);
        animationCompletedListenerRef.current = null;
      }
    };
  }, [isAutoPlay, currentAnimation, availableAnimations, playNextAnimation]);

  // Handle recording functionality
  useEffect(() => {
    // Remove any existing recording listener
    if (recordingListenerRef.current && playerRef.current?.animationState?.removeListener) {
      playerRef.current.animationState.removeListener(recordingListenerRef.current);
      recordingListenerRef.current = null;
    }

    if (isRecording && playerRef.current) {
      // Restart current animation when recording starts
      if (playerRef.current.setAnimation && currentAnimation) {
        try {
          playerRef.current.setAnimation(currentAnimation, false); // Set to non-looping for recording
          if (playerRef.current.play) {
            playerRef.current.play();
          }
        } catch (error) {
          console.error("Error restarting animation for recording:", error);
        }
      }

      // Set up listener for animation completion during recording
      if (playerRef.current.animationState?.addListener && onRecordingComplete) {
        try {
          const recordingListener = {
            complete: () => {
              // When animation completes during recording, stop recording
              if (onRecordingComplete) {
                onRecordingComplete();
              }
            }
          };

          playerRef.current.animationState.addListener(recordingListener);
          recordingListenerRef.current = recordingListener;
        } catch (error) {
          console.error("Error setting up recording completion listener:", error);
        }
      }
    }

    return () => {
      // Cleanup recording listener
      if (recordingListenerRef.current && playerRef.current?.animationState?.removeListener) {
        playerRef.current.animationState.removeListener(recordingListenerRef.current);
        recordingListenerRef.current = null;
      }
    };
  }, [isRecording, currentAnimation, onRecordingComplete]);

  // Modify switchAnimation function to use playNextAnimation in auto-play mode
  const switchAnimation = () => {
    // If auto play is enabled, return directly (manual click won't switch animation)
    if (isAutoPlay) return;

    // Original logic remains unchanged
    if (playerRef.current && playerRef.current.setAnimation && availableAnimations.length > 0) {
      let newAnimation: string;

      if (isCutsceneMode || isFatedGuestMode) {
        // In cutscene mode or FatedGuest mode, cycle through all animations sequentially
        const currentIndex = availableAnimations.indexOf(currentAnimation);
        const nextIndex = (currentIndex + 1) % availableAnimations.length;
        newAnimation = availableAnimations[nextIndex];
      } else {
        // Normal mode: Switch between idle and motion only
        if (currentAnimation === 'idle' && availableAnimations.includes('motion')) {
          newAnimation = 'motion';
        } else if (currentAnimation === 'motion' && availableAnimations.includes('idle')) {
          newAnimation = 'idle';
        } else {
          // If current animation is neither idle nor motion, switch to idle first
          if (availableAnimations.includes('idle')) {
            newAnimation = 'idle';
          } else if (availableAnimations.includes('motion')) {
            newAnimation = 'motion';
          } else {
            // Fallback to first available animation
            newAnimation = availableAnimations[0];
          }
        }
      }

      try {
        playerRef.current.setAnimation(newAnimation, true);
        setCurrentAnimation(newAnimation);

        // Notify parent component
        if (onAnimationSelect) {
          onAnimationSelect(newAnimation);
        }

        // Recalculate camera position for new animation
        setTimeout(() => {
          setupCameraForAnimation(playerRef.current);
        }, 50);

      } catch {
        // Silently handle animation switch errors
      }
    }
  };

  // Handle mouse events for dragging and clicking (desktop only)
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isMobile) return; // Disable dragging on mobile
    if (dragLock) return; // Nếu dragLock thì không cho drag
    setIsDragging(true);
    setHasDragged(false);
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      startX: position.x,
      startY: position.y
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || isMobile) return; // Disable dragging on mobile
    if (dragLock) return; // Nếu dragLock thì không cho drag
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;

    // Mark as dragged if moved more than 5 pixels
    if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
      setHasDragged(true);
    }

    setPosition({
      x: dragStart.startX + deltaX,
      y: dragStart.startY + deltaY
    });
  };

  const handleMouseUp = () => {
    if (isMobile) return; // Disable dragging on mobile

    setIsDragging(false);
    // Reset hasDragged after a delay to allow click detection
    setTimeout(() => setHasDragged(false), 100);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // 在移动设备上或非拖拽状态下且未开启自动播放时，切换动画
    if ((isMobile || !hasDragged) && !isAutoPlay) {
      switchAnimation();
    }
  };

  useEffect(() => {

    if (!spineData || !containerReady || !containerRef.current) {
      return;
    }

    setIsLoading(true);
    setHasError(false);

    // Dynamically import spine-player to avoid SSR issues
    const loadSpinePlayer = async () => {
      try {
        const { SpinePlayer, GLTexture, OrthoCamera } = await import('@esotericsoftware/spine-player');

        // Clear any existing player
        if (playerRef.current?.dispose) {
          playerRef.current.dispose();
        }

        if (!containerRef.current) return;

        // GLTexture patch for premultiplied alpha (from BD2-L2D-Viewer)
        const originalUpdate = GLTexture.prototype.update;
        GLTexture.prototype.update = function (useMipMaps: boolean) {
          const gl = this.context.gl;
          gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
          originalUpdate.call(this, useMipMaps);
        };

        // Determine spine and atlas paths based on mode
        let spinePath = spineData.spinePath;
        let atlasPath = spineData.spinePath.replace('.skel', '.atlas');

        if (isFatedGuestMode && spineData.spineFatedGuest) {
          // Use Fated Guest spine file
          spinePath = spineData.spineFatedGuest;
          atlasPath = spineData.spineFatedGuest.replace('.skel', '.atlas');
        } else if (isCutsceneMode && spineData.spineCutscene) {
          // Use cutscene spine file
          spinePath = spineData.spineCutscene;
          atlasPath = spineData.spineCutscene.replace('.skel', '.atlas');
        } else if (isHVersion && spineData.spinePathH) {
          // Use H version spine file
          spinePath = spineData.spinePath;
          atlasPath = spineData.spinePathH;
        }

        // Create new spine player with BD2-L2D-Viewer style config
        playerRef.current = new SpinePlayer(containerRef.current, {
          showControls: false,
          binaryUrl: spinePath,
          atlasUrl: atlasPath,
          backgroundColor: '#00000000',
          preserveDrawingBuffer: true,
          premultipliedAlpha: true,
          alpha: true,
          update: () => {
            // Update camera if manual camera exists
            if (cameraRef.current && playerRef.current && playerRef.current.sceneRenderer) {
              const cam = (playerRef.current.sceneRenderer as any).camera;
              const manualCamera = cameraRef.current;
              if (cam && cam.position) {
                cam.position.x = manualCamera.position.x;
                cam.position.y = manualCamera.position.y;
                cam.zoom = manualCamera.zoom;
                if (cam.update) cam.update();
              }
            }
          },
          success: (player: unknown) => {
            // Get all available animations
            const animations = (player as { skeleton?: { data?: { animations?: { name: string }[] } } }).skeleton?.data?.animations || [];
            const animationNames = animations.map((anim: { name: string }) => anim.name);
            setAvailableAnimations(animationNames);

            // Notify parent component about available animations
            if (onAnimationsLoaded) {
              onAnimationsLoaded(animationNames);
            }

            // Setup manual camera
            if (playerRef.current && playerRef.current.sceneRenderer) {
              const camera = (playerRef.current.sceneRenderer as any).camera;
              if (camera) {
                cameraRef.current = new OrthoCamera(
                  camera.viewportWidth,
                  camera.viewportHeight
                );
              }
            }

            // Determine which animation to start with
            let startAnimation = 'idle';

            // If selectedAnimation prop is provided and exists, use it
            if (selectedAnimation && animationNames.includes(selectedAnimation)) {
              startAnimation = selectedAnimation;
            } else {
              // Otherwise use default priority: idle -> motion -> original -> first available
              if (animationNames.includes('idle')) {
                startAnimation = 'idle';
              } else if (animationNames.includes('motion')) {
                startAnimation = 'motion';
              } else if (spineData.animation && animationNames.includes(spineData.animation)) {
                startAnimation = spineData.animation;
              } else if (animationNames.length > 0) {
                startAnimation = animationNames[0];
              }
            }

            if (playerRef.current && playerRef.current.setAnimation && startAnimation) {
              try {
                playerRef.current.setAnimation(startAnimation, true);
                setCurrentAnimation(startAnimation);
                if (playerRef.current?.play) {
                  playerRef.current.play();
                }
              } catch {
                // Silently handle start animation errors
              }
            }

            // Set skin if specified
            if (spineData.skin && spineData.skin !== 'default' && playerRef.current && playerRef.current.skeleton) {
              const skeleton = playerRef.current.skeleton as any;
              if (skeleton.setSkinByName) skeleton.setSkinByName(spineData.skin);
              if (skeleton.setSlotsToSetupPose) skeleton.setSlotsToSetupPose();
              if (skeleton.updateWorldTransform) skeleton.updateWorldTransform();
            }

            // Setup camera for initial animation
            setTimeout(() => {
              setupCameraForAnimation(playerRef.current);
            }, 100);

            setIsLoading(false);
            setHasError(false);
          },
          error: (_player: unknown, error: unknown) => {
            console.error('Spine loading error:', error);
            setIsLoading(false);
            setHasError(true);
          }
        }) as unknown as SpinePlayerType;

      } catch (error) {
        console.error('Failed to load Spine player:', error);
        setIsLoading(false);
        setHasError(true);
      }
    };
    loadSpinePlayer();
    // Cleanup on unmount
    return () => {
      if (playerRef.current?.dispose) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
      cameraRef.current = null;
    };
  }, [spineData, containerReady, width, height, isHVersion, isCutsceneMode, isFatedGuestMode, scaleLock, onAnimationsLoaded]);

  // Function to setup camera for current animation
  const setupCameraForAnimation = (player: SpinePlayerType | null) => {
    if (!player || !player.skeleton) return;

    // Calculate bounds for current animation
    const skeleton = player.skeleton as any;
    if (skeleton.setToSetupPose) skeleton.setToSetupPose();
    if (skeleton.updateWorldTransform) skeleton.updateWorldTransform();

    // Sử dụng mảng [x, y] thay vì object để tránh lỗi offset.set is not a function
    const offset: [number, number] = [0, 0];
    const size: [number, number] = [100000, 100000];
    if (skeleton.getBounds) skeleton.getBounds(offset, size);
    const centerX = offset[0] + size[0] / 2;
    const centerY = offset[1] + size[1] / 2;

    // Update viewport configuration
    const playerAny = player as any;
    if (playerAny.config) {
      playerAny.config.viewport = {
        x: offset[0],
        y: offset[1],
        width: size[0],
        height: size[1],
        padLeft: 0,
        padRight: 0,
        padTop: 0,
        padBottom: 0,
        transitionTime: 0,
      };
    }

    // Setup manual camera if available
    if (cameraRef.current && player.sceneRenderer) {
      const manualCamera = cameraRef.current;
      manualCamera.position.x = centerX;
      manualCamera.position.y = centerY;

      const paddedWidth = size[0];
      const paddedHeight = size[1] + 100;
      const canvas = (player as any).canvas;

      if (canvas && canvas.width && canvas.height) {
        const canvasAspect = canvas.height / canvas.width;
        const viewportAspect = paddedHeight / paddedWidth;
        const baseZoom = canvasAspect > viewportAspect
          ? paddedWidth / canvas.width
          : paddedHeight / canvas.height;
        // Scale down to 10% of original size
        manualCamera.zoom = baseZoom * 10;
        manualCamera.update();
      }
    }
  };

  const getTranslateX = () => {
    // 为FatedGuest模式添加特殊处理
    if (isFatedGuestMode && isFullScreen) {
      if (screenWidth >= 2400) return '-150%';
      if (screenWidth >= 1900) return '-135%';
      if (screenWidth >= 1600) return '-185%';
      if (screenWidth >= 1400) return '-200%';
    } else if (isFatedGuestMode) {
      if (screenWidth >= 2400) return '-150%';
      if (screenWidth >= 1900) return '-105%';
      if (screenWidth >= 1600) return '-135%';
      if (screenWidth >= 1400) return '-321%';
    }
    if (isFullScreen) return '0%';

    // 正常模式的原始逻辑
    if (screenWidth >= 2400) return '25%';
    if (screenWidth >= 1900) return '10%';
    if (screenWidth >= 1600) return '0%';
    if (screenWidth >= 1400) return '-20%';
    return '5%';
  };

  const getTransformOrigin = () => {
    if (isMobile) return 'center';
    if (isFullScreen) return 'center';
    // Adjust transform origin based on the translateX to maintain proper centering
    if (screenWidth >= 2400) return '75% center';
    if (screenWidth >= 1900) return '55% center';
    if (screenWidth >= 1600) return 'center';
    if (screenWidth >= 1400) return '85% center';
    return 'center';
  };

  const getScale = () => {
    if (screenWidth >= 2400) return 1.0;
    if (screenWidth >= 1900) return 0.9;
    if (screenWidth >= 1600) return 0.7;
    if (screenWidth >= 1400) return 0.7;
    return 0.6;
  };
  const getScaleCutscene = () => {
    if (screenWidth >= 2400) return 0.5;
    if (screenWidth >= 1900) return 0.5;
    if (screenWidth >= 1600) return 0.4;
    if (screenWidth >= 1400) return 0.3;
    if (isMobile) return 1
    return 0.2;
  };
  const getScaleFatedGuest = () => {
    if (screenWidth >= 2400) return 0.2;
    if (screenWidth >= 1900) return 0.25;
    if (screenWidth >= 1600) return 0.25;
    if (screenWidth >= 1400) return 0.25;
    if (isMobile) return 1
    return 0.2;
  };

  return (
    <div
      ref={containerRef}
      className={`spine-player ${className} relative group select-none touch-none`}
      style={{
        width: width,
        height: height,
        outline: 'none',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        WebkitTapHighlightColor: 'transparent',
        transform: `translate(${position.x}px, ${position.y}px) scale(${isMobile ? (zoomLevel * 0.8 * (isCutsceneMode ? getScaleCutscene() : (isFatedGuestMode ? getScaleFatedGuest() : 1))) : (getScale() * zoomLevel * (isCutsceneMode ? getScaleCutscene() : (isFatedGuestMode ? getScaleFatedGuest() : 1)))}) translateX(${isMobile ? '0' : getTranslateX()}) translateY(${isMobile ? '0' : (typeof spineData.offset?.y === 'number' ? `${spineData.offset.y}%` : (spineData.offset?.y || '-5%'))})`,
        transformOrigin: getTransformOrigin(),
        opacity: isLoading ? 0 : 1,
        transition: isMobile ? 'opacity 0.3s ease-in-out' : 'opacity 0.3s ease-in-out, transform 0.1s ease-out'
      }}
      onClick={handleClick}
      onTouchEnd={isMobile ? handleMouseUp : undefined}
      onTouchCancel={isMobile ? handleMouseUp : undefined}
      onMouseDown={!isMobile ? handleMouseDown : undefined}
      onMouseMove={!isMobile ? handleMouseMove : undefined}
      onMouseUp={!isMobile ? handleMouseUp : undefined}
      onMouseLeave={!isMobile ? handleMouseUp : undefined}
      title={isMobile
        ? ((isCutsceneMode || isFatedGuestMode)
          ? `Chạm để chuyển đổi giữa các animation (${availableAnimations.indexOf(currentAnimation) + 1}/${availableAnimations.length})`
          : (availableAnimations.length > 1 ? `Chạm để chuyển đổi giữa idle/motion (Hiện tại: ${currentAnimation})` : `Spine Animation (Hiện tại: ${currentAnimation})`))
        : ((isCutsceneMode || isFatedGuestMode)
          ? `Click để chuyển đổi giữa các animation (${availableAnimations.indexOf(currentAnimation) + 1}/${availableAnimations.length}) | Kéo để di chuyển | Cuộn để phóng to (${Math.round(zoomLevel * 100)}%)`
          : `${availableAnimations.length > 1 ? `Click để chuyển đổi giữa idle/motion (Hiện tại: ${currentAnimation}) | ` : `Hiện tại: ${currentAnimation} | `}Kéo để di chuyển | Cuộn để phóng to (${Math.round(zoomLevel * 100)}%)`)
      }
    >
      {/* Element background color */}
      {attribute && attributeBackgroundColors[attribute] && (
        <>
          {/* Outer glow */}
          <div
            className="center absolute inset-0 -z-10"
            style={{
              background: attributeBackgroundColors[attribute],
              borderRadius: '50%',
              width: isMobile ? '50%' : '20%',
              height: isMobile ? '50%' : '20%',
              margin: 'auto',
              opacity: isMobile ? 0.3 : 0.4,
              boxShadow: `0 0 ${isMobile ? '80px 20px' : '120px 30px'} ${attributeBackgroundColors[attribute]}`,
              filter: `blur(${isMobile ? '60px' : '100px'})`
            }}
          ></div>
        </>
      )}

      {/* Show fallback image if there's an error or while loading (and fallback exists) */}
      {(hasError || isLoading) && fallbackImageUrl && (
        <div className="absolute inset-0">
          <Image
            src={fallbackImageUrl}
            alt="Character"
            fill
            className="object-contain"
            loading="eager"
            priority
          />
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <div className="text-white text-xs">Đang tải animation...</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}





