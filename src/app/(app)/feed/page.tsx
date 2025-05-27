
'use client';

import { useEffect, useState, useRef } from 'react';
import { VideoCard } from '@/components/shared/VideoCard';
import { useAppStore } from '@/stores/useAppStore';
import type { Video, Emotion } from '@/lib/types';
import { recommendVideos as recommendVideosFlow } from '@/ai/flows/video-recommendation';
import { Loader2, AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

const mockVideos: Video[] = [
  { id: '1', url: 'placeholder', description: 'Un relajante paseo por la naturaleza con música calmante.', thumbnailUrl: 'https://placehold.co/720x1280.png', dataAiHint: 'nature relaxation' },
  { id: '2', url: 'placeholder', description: 'Ejercicios de respiración guiados para reducir la ansiedad.', thumbnailUrl: 'https://placehold.co/720x1280.png', dataAiHint: 'breathing exercise' },
  { id: '3', url: 'placeholder', description: 'Momentos divertidos de animales para alegrar tu día.', thumbnailUrl: 'https://placehold.co/720x1280.png', dataAiHint: 'funny animals' },
  { id: '4', url: 'placeholder', description: 'Consejos rápidos para mejorar la concentración y productividad.', thumbnailUrl: 'https://placehold.co/720x1280.png', dataAiHint: 'productivity tips' },
  { id: '5', url: 'placeholder', description: 'Paisajes sonoros ASMR para un sueño profundo.', thumbnailUrl: 'https://placehold.co/720x1280.png', dataAiHint: 'asmr landscape' },
];

const VIDEO_PLAY_DURATION = 7000; // 7 seconds for auto-advance

export default function FeedPage() {
  const router = useRouter();
  const { toast } = useToast();
  const selectedEmotion = useAppStore((state) => state.selectedEmotion);
  const userHistory = useAppStore((state) => state.userHistory);
  const currentVideoRecommendations = useAppStore((state) => state.currentVideoRecommendations);
  const setVideoRecommendations = useAppStore((state) => state.setVideoRecommendations);
  const isLoading = useAppStore((state) => state.isLoading);
  const setLoading = useAppStore((state) => state.setLoading);
  const error = useAppStore((state) => state.error);
  const setError = useAppStore((state) => state.setError);

  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const videoRefs = useRef<(HTMLDivElement | null)[]>([]);
  const autoAdvanceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const feedContainerRef = useRef<HTMLDivElement | null>(null);

  const fetchRecommendations = async (emotion: Emotion) => {
    setLoading(true);
    setError(null);
    try {
      const historyString = userHistory.map(h => `${h.videoId}:${h.interactionType}`).join(', ');
      const aiResult = await recommendVideosFlow({
        emotion: emotion,
        userHistory: historyString || undefined,
      });

      const recommendedVideos: Video[] = aiResult.videoRecommendations.map((desc, index) => ({
        id: `ai-${emotion}-${index}-${Date.now()}`,
        url: 'ai_placeholder_url',
        description: desc,
        thumbnailUrl: `https://placehold.co/720x1280.png`,
        dataAiHint: 'abstract relax'
      }));
      
      const finalVideos = recommendedVideos.length > 0 ? recommendedVideos : mockVideos.slice(0,3);
      setVideoRecommendations(finalVideos.slice(0, 5));
      setCurrentVideoIndex(0); // Reset to first video on new recommendations
      videoRefs.current = finalVideos.slice(0, 5).map(_ => null);


    } catch (err) {
      console.error('Error fetching recommendations:', err);
      setError('No se pudieron cargar las recomendaciones. Intenta de nuevo.');
      setVideoRecommendations(mockVideos.slice(0,3));
      setCurrentVideoIndex(0);
      videoRefs.current = mockVideos.slice(0, 3).map(_ => null);
      toast({
        title: 'Error de Recomendación',
        description: 'Usando videos de muestra. Por favor, intenta recargar.',
        variant: 'destructive'
      });
    }
  };
  
  useEffect(() => {
    if (!selectedEmotion) {
      toast({ title: 'Emoción no seleccionada', description: 'Por favor, selecciona tu emoción actual.', variant: 'destructive' });
      router.replace('/home');
      return;
    }
    if(currentVideoRecommendations.length === 0 && !isLoading) {
      fetchRecommendations(selectedEmotion);
    } else if (currentVideoRecommendations.length > 0) {
      // Ensure refs array is up-to-date if recommendations change
      videoRefs.current = videoRefs.current.slice(0, currentVideoRecommendations.length);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEmotion, router]);


  // Auto-advance and scrolling logic
  useEffect(() => {
    if (currentVideoRecommendations.length === 0 || isLoading) return;

    const scrollToVideo = (index: number) => {
      const videoElement = videoRefs.current[index];
      if (videoElement) {
        videoElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else if (feedContainerRef.current && index === 0) {
        // Fallback for initial load if refs aren't set yet
        feedContainerRef.current.scrollTop = 0;
      }
    };
    
    scrollToVideo(currentVideoIndex);

    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current);
    }

    autoAdvanceTimerRef.current = setTimeout(() => {
      setCurrentVideoIndex(prevIndex => (prevIndex + 1) % currentVideoRecommendations.length);
    }, VIDEO_PLAY_DURATION);

    return () => {
      if (autoAdvanceTimerRef.current) {
        clearTimeout(autoAdvanceTimerRef.current);
      }
    };
  }, [currentVideoIndex, currentVideoRecommendations, isLoading]);

  // Effect to reset timer if recommendations change (e.g. user changes emotion and new videos are fetched)
  useEffect(() => {
    setCurrentVideoIndex(0); // Reset to first video when recommendations change
    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current);
    }
    // Timer will be restarted by the [currentVideoIndex, currentVideoRecommendations, isLoading] effect
  }, [currentVideoRecommendations]);


  if (!selectedEmotion && !isLoading) { // Added !isLoading to prevent premature redirect
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4 text-center">
        <AlertTriangle className="w-16 h-16 text-destructive mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Emoción no seleccionada</h2>
        <p className="text-muted-foreground mb-4">Por favor, vuelve y selecciona cómo te sientes.</p>
        <Button onClick={() => router.push('/home')}>Seleccionar Emoción</Button>
      </div>
    );
  }
  
  if (isLoading && currentVideoRecommendations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <Loader2 className="w-16 h-16 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Cargando videos para ti...</p>
        <p className="text-sm text-muted-foreground">Emoción: {selectedEmotion}</p>
      </div>
    );
  }

  if (error && currentVideoRecommendations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4 text-center">
        <AlertTriangle className="w-16 h-16 text-destructive mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Error al cargar</h2>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={() => selectedEmotion && fetchRecommendations(selectedEmotion)}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Intentar de nuevo
        </Button>
      </div>
    );
  }
  
  if (currentVideoRecommendations.length === 0 && !isLoading) {
     return (
      <div className="flex flex-col items-center justify-center h-screen p-4 text-center">
        <AlertTriangle className="w-16 h-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-semibold mb-2">No hay videos disponibles</h2>
        <p className="text-muted-foreground mb-4">No pudimos encontrar videos para "{selectedEmotion}". Intenta recargar.</p>
        <Button onClick={() => selectedEmotion && fetchRecommendations(selectedEmotion)}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Recargar videos
        </Button>
      </div>
    );
  }

  return (
    <div ref={feedContainerRef} className="h-screen overflow-y-auto snap-y snap-mandatory scroll-smooth bg-black">
      {currentVideoRecommendations.map((video, index) => (
        <div
          key={video.id}
          ref={el => videoRefs.current[index] = el}
          className="h-screen w-full snap-start" // Ensures each video container snaps correctly
        >
          <VideoCard
            video={video}
            isPlaying={index === currentVideoIndex}
          />
        </div>
      ))}
    </div>
  );
}

