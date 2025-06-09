'use client';

import Image from 'next/image';
import type { Video } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Heart, Bookmark, Flag, Loader2, Send, MessageCircle, Volume2, VolumeX, Volume1 } from 'lucide-react'; // Added Send, MessageCircle for potential future use
import { useAppStore } from '@/stores/useAppStore';
import { useToast } from '@/hooks/use-toast';
import { improveRecommendations as improveRecommendationsFlow } from '@/ai/flows/improve-recommendations';
import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface VideoCardProps {
  video: Video;
  isPlaying?: boolean; // To potentially highlight the active video or manage real playback
  onVideoEnd?: () => void;
}

export function VideoCard({ video, isPlaying, onVideoEnd }: VideoCardProps) {
  const { toast } = useToast();
  const addInteraction = useAppStore((state) => state.addInteractionToHistory);
  const selectedEmotion = useAppStore((state) => state.selectedEmotion);
  const currentRecommendations = useAppStore((state) => state.currentVideoRecommendations);
  const setRecommendations = useAppStore((state) => state.setVideoRecommendations);
  const addLikedVideo = useAppStore((state) => state.addLikedVideo);
  const removeLikedVideo = useAppStore((state) => state.removeLikedVideo);
  const addSavedVideo = useAppStore((state) => state.addSavedVideo);
  const removeSavedVideo = useAppStore((state) => state.removeSavedVideo);
  const addDislikedVideo = useAppStore((state) => state.addDislikedVideo);
  const removeDislikedVideo = useAppStore((state) => state.removeDislikedVideo);
  const likedVideos = useAppStore((state) => state.likedVideos);
  const savedVideos = useAppStore((state) => state.savedVideos);
  const dislikedVideos = useAppStore((state) => state.dislikedVideos);
  const [isInteracting, setIsInteracting] = useState<string | null>(null); // Store type of interaction
  const [isMuted, setIsMuted] = useState(true);
  const [volume, setVolume] = useState(100); // 0-100
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const hideSliderTimeout = useRef<NodeJS.Timeout | null>(null);

  // Determinar icono de volumen
  let VolumeIcon = Volume2;
  if (isMuted || volume === 0) VolumeIcon = VolumeX;
  else if (volume < 50) VolumeIcon = Volume1;

  // Mostrar slider al hacer clic y ocultar después de 2.5s sin interacción
  const handleVolumeIconClick = () => {
    setShowVolumeSlider(true);
    if (hideSliderTimeout.current) clearTimeout(hideSliderTimeout.current);
    hideSliderTimeout.current = setTimeout(() => setShowVolumeSlider(false), 2500);
  };
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(Number(e.target.value));
    if (Number(e.target.value) === 0) setIsMuted(true);
    else setIsMuted(false);
    setShowVolumeSlider(true);
    if (hideSliderTimeout.current) clearTimeout(hideSliderTimeout.current);
    hideSliderTimeout.current = setTimeout(() => setShowVolumeSlider(false), 2500);
  };
  useEffect(() => () => { if (hideSliderTimeout.current) clearTimeout(hideSliderTimeout.current); }, []);

  const handleInteraction = async (interactionType: 'like' | 'save' | 'report') => {
    if (!selectedEmotion) {
      toast({ title: "Error", description: "No emotion selected.", variant: "destructive" });
      return;
    }
    setIsInteracting(interactionType);
    addInteraction({ videoId: video.id, interactionType, timestamp: new Date() });
    toast({
      title: `Video ${interactionType === 'like' ? 'gustado' : interactionType === 'save' ? 'guardado' : 'reportado'}`,
      description: video.description.substring(0, 50) + '...',
    });

    try {
      const prevRecIds = currentRecommendations.map(v => v.id);
      const result = await improveRecommendationsFlow({
        emotion: selectedEmotion,
        videoId: video.id,
        interactionType,
        previousRecommendations: prevRecIds,
      });
      
      console.log("AI Reasoning for improving recommendations:", result.reasoning);
      // Temporarily commenting out to prevent feed reshuffle that breaks auto-scroll
      // const newMockRecommendations = [...currentRecommendations].sort(() => Math.random() - 0.5).slice(0, 5) as Video[];
      // setRecommendations(newMockRecommendations);

    } catch (error) {
      console.error("Error improving recommendations:", error);
      toast({ title: "Error", description: "Could not update recommendations based on interaction.", variant: "destructive" });
    } finally {
      setIsInteracting(null);
    }
  };

  // Detectar fin de reproducción del short de YouTube
  const handleIframeMessage = (event: MessageEvent) => {
    if (!isPlaying || !onVideoEnd) return;
    // Solo aceptar mensajes de YouTube
    if (typeof event.data === 'object' && event.origin.includes('youtube')) {
      if (event.data?.event === 'onStateChange' && event.data?.info === 0) {
        // Estado 0 = video terminado
        onVideoEnd();
      }
    }
  };
  // Escuchar mensajes del iframe
  useEffect(() => {
    window.addEventListener('message', handleIframeMessage);
    return () => window.removeEventListener('message', handleIframeMessage);
  }, [isPlaying, onVideoEnd]);

  const isLiked = likedVideos.some(v => v.id === video.id);
  const isSaved = savedVideos.some(v => v.id === video.id);
  const isDisliked = dislikedVideos.some(v => v.id === video.id);

  return (
    <Card className="h-screen w-full snap-start flex flex-col shadow-none rounded-none bg-black relative overflow-hidden">
      {/* Botón de volumen en la esquina superior derecha */}
      {isPlaying && video.url.includes('youtube.com/shorts') && (
        <div
          className={cn(
            "absolute top-4 right-4 z-20 flex items-center space-x-2 rounded-full px-2 py-1 transition-colors duration-300",
            showVolumeSlider ? "bg-[#0009]" : "bg-transparent"
          )}
        >
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:text-primary"
            onClick={handleVolumeIconClick}
            aria-label={isMuted ? 'Activar sonido' : 'Silenciar'}
          >
            <VolumeIcon className="h-6 w-6" />
          </Button>
          {showVolumeSlider && (
            <input
              type="range"
              min={0}
              max={100}
              value={isMuted ? 0 : volume}
              onChange={handleSliderChange}
              className="w-20 accent-primary ml-2"
              aria-label="Volumen"
              autoFocus
            />
          )}
        </div>
      )}
      {video.url.includes('youtube.com/shorts') && isPlaying ? (
        <iframe
          src={
            video.url.replace('/shorts/', '/embed/').split('?')[0] +
            `?autoplay=1&mute=${isMuted ? 1 : 0}&controls=0&modestbranding=1&rel=0&loop=0&enablejsapi=1`
          }
          title={video.description}
          allow="autoplay; encrypted-media"
          allowFullScreen
          className="absolute inset-0 w-full h-full object-cover"
          style={{ zIndex: 1, border: 0 }}
        />
      ) : (
        <Image
          src={video.thumbnailUrl}
          alt={video.description}
          layout="fill"
          objectFit="cover"
          className={cn("transition-opacity duration-300", isPlaying ? "opacity-100" : "opacity-80")}
          data-ai-hint={video.dataAiHint}
          priority
        />
      )}
      {/* Overlay for better text visibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>

      {/* Content Overlay: Bottom Left */}
      <div className="absolute bottom-16 md:bottom-4 left-4 right-4 text-white z-10 p-4 space-y-2">
        <h3 className="font-semibold text-lg drop-shadow-md">@myzendUser</h3>
        <p className="text-sm line-clamp-2 drop-shadow-sm">{video.description}</p>
        <div className="flex items-center space-x-2 text-xs drop-shadow-sm">
          <Send size={16} className="transform rotate-[-45deg]" />
          <span>Sonido Original - myzend</span>
        </div>
      </div>

      {/* Action Buttons Overlay: Right Side */}
      <div className="absolute right-2 md:right-4 top-1/2 transform -translate-y-1/2 flex flex-col space-y-5 z-10 p-2">
        {/* Logo myzend como avatar */}
        <div className="relative flex flex-col items-center group">
           <img src="/logo.jpg" alt="myzend avatar" width={48} height={48} className="rounded-full border-2 border-white shadow-md" />
           <Button variant="ghost" size="icon" className="absolute -bottom-2.5 w-6 h-6 bg-primary text-primary-foreground rounded-full p-0.5 flex items-center justify-center shadow-md hover:bg-primary/90">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
           </Button>
        </div>
        {/* Botones de interacción */}
        <Button
          variant={isLiked ? 'default' : 'ghost'}
          size="icon"
          onClick={() => isLiked ? removeLikedVideo(video.id) : addLikedVideo(video)}
          className={cn("text-white hover:text-rose-500 rounded-full h-12 w-12 p-0 drop-shadow-lg transition-transform hover:scale-110", isLiked ? "text-rose-500 fill-rose-500" : "")}
          aria-label="Me gusta"
        >
          <Heart className="h-7 w-7" />
        </Button>
        <Button
          variant={isSaved ? 'default' : 'ghost'}
          size="icon"
          onClick={() => isSaved ? removeSavedVideo(video.id) : addSavedVideo(video)}
          className={cn("text-white hover:text-yellow-400 rounded-full h-12 w-12 p-0 drop-shadow-lg transition-transform hover:scale-110", isSaved ? "text-yellow-400 fill-yellow-400" : "")}
          aria-label="Guardar"
        >
          <Bookmark className="h-7 w-7" />
        </Button>
        <Button
          variant={isDisliked ? 'default' : 'ghost'}
          size="icon"
          onClick={() => isDisliked ? removeDislikedVideo(video.id) : addDislikedVideo(video)}
          className={cn("text-white hover:text-slate-400 rounded-full h-12 w-12 p-0 drop-shadow-lg transition-transform hover:scale-110", isDisliked ? "text-slate-400 fill-slate-400" : "")}
          aria-label="No me gusta"
        >
          <Flag className="h-7 w-7" />
        </Button>
      </div>
    </Card>
  );
}

// Helper to check if user has interacted
const userHistory = useAppStore.getState().userHistory; // Example, this might need better state access or prop drilling if reactive updates are needed for icon active state within this component.

