'use client';

import { useEffect, useState, useRef } from 'react';
import { VideoCard } from '@/components/shared/VideoCard';
import { useAppStore } from '@/stores/useAppStore';
import type { Video, Emotion } from '@/lib/types';
import { recommendVideos as recommendVideosFlow } from '@/ai/flows/video-recommendation';
import { Loader2, AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

export default function FeedPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const selectedEmotion = useAppStore((state) => state.selectedEmotion);
  const userHistory = useAppStore((state) => state.userHistory);
  const currentVideoRecommendations = useAppStore((state) => state.currentVideoRecommendations);
  const setVideoRecommendations = useAppStore((state) => state.setVideoRecommendations);
  const isLoading = useAppStore((state) => state.isLoading);
  const setLoading = useAppStore((state) => state.setLoading);
  const error = useAppStore((state) => state.error);
  const setError = useAppStore((state) => state.setError);
  const savedVideos = useAppStore((state) => state.savedVideos);

  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const videoRefs = useRef<(HTMLDivElement | null)[]>([]);
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
      setVideoRecommendations(recommendedVideos.slice(0, 5));
      setCurrentVideoIndex(0); // Reset to first video on new recommendations
      videoRefs.current = recommendedVideos.slice(0, 5).map(_ => null);


    } catch (err) {
      console.error('Error fetching recommendations:', err);
      setError('No se pudieron cargar las recomendaciones. Intenta de nuevo.');
      setVideoRecommendations([]);
      setCurrentVideoIndex(0);
      videoRefs.current = [];
      toast({
        title: 'Error de Recomendación',
        description: 'No se pudieron cargar videos. Por favor, intenta recargar.',
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


  // Detectar el video visible en pantalla y actualizar currentVideoIndex
  useEffect(() => {
    if (!feedContainerRef.current) return;
    const handleScroll = () => {
      const container = feedContainerRef.current;
      if (!container) return;
      const children = Array.from(container.children);
      const containerRect = container.getBoundingClientRect();
      let minDiff = Infinity;
      let visibleIndex = 0;
      children.forEach((child, idx) => {
        const rect = (child as HTMLElement).getBoundingClientRect();
        // Medimos la diferencia del centro del contenedor y el centro del hijo
        const diff = Math.abs((rect.top + rect.bottom) / 2 - (containerRect.top + containerRect.bottom) / 2);
        if (diff < minDiff) {
          minDiff = diff;
          visibleIndex = idx;
        }
      });
      if (visibleIndex !== currentVideoIndex) {
        setCurrentVideoIndex(visibleIndex);
      }
    };
    const container = feedContainerRef.current;
    container.addEventListener('scroll', handleScroll);
    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [currentVideoIndex, currentVideoRecommendations.length]);

  // Avanzar automáticamente al siguiente video cuando termine la reproducción
  const handleVideoEnd = () => {
    setCurrentVideoIndex((prev) => (prev + 1) % currentVideoRecommendations.length);
    // Scroll automático al siguiente
    const nextEl = videoRefs.current[(currentVideoIndex + 1) % currentVideoRecommendations.length];
    if (nextEl) {
      nextEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Mostrar videos guardados en el feed si existen
  useEffect(() => {
    const videoIdParam = searchParams.get('videoId');
    if (videoIdParam && savedVideos.length > 0) {
      // Si el videoId está en los guardados, mostrar solo ese
      const saved = savedVideos.find(v => v.id === videoIdParam);
      if (saved) {
        setVideoRecommendations([saved]);
        setCurrentVideoIndex(0);
        return;
      }
    }
  }, [searchParams, savedVideos]);

  useEffect(() => {
    // Si hay un videoId en la URL, mostrar ese video primero
    const videoIdParam = searchParams.get('videoId');
    if (videoIdParam && currentVideoRecommendations.length > 0) {
      const idx = currentVideoRecommendations.findIndex(v => v.id === videoIdParam);
      if (idx !== -1) setCurrentVideoIndex(idx);
    }
    // eslint-disable-next-line
  }, [searchParams, currentVideoRecommendations.length]);

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
          ref={el => { videoRefs.current[index] = el; }}
          className="h-screen w-full snap-start" // Ensures each video container snaps correctly
        >
          <VideoCard
            video={video}
            isPlaying={index === currentVideoIndex}
            onVideoEnd={index === currentVideoIndex ? handleVideoEnd : undefined}
          />
        </div>
      ))}
    </div>
  );
}

