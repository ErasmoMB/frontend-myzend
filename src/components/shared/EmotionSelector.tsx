'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useAppStore } from '@/stores/useAppStore';
import type { Emotion } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { Meh, Frown, Angry, ThumbsDown, UserX, AlertTriangle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useState, type ReactNode } from 'react';
import axios from 'axios';

const emotionOptions: { name: Emotion; icon: ReactNode; colorClass: string }[] = [
  { name: 'Deprimido/a', icon: <Meh size={48} />, colorClass: 'text-purple-700 hover:bg-purple-100 border-purple-700' },
  { name: 'Triste', icon: <Frown size={48} />, colorClass: 'text-blue-500 hover:bg-blue-100 border-blue-500' },
  { name: 'Enojado/a', icon: <Angry size={48} />, colorClass: 'text-red-500 hover:bg-red-100 border-red-500' },
  { name: 'Desmotivado/a', icon: <ThumbsDown size={48} />, colorClass: 'text-yellow-600 hover:bg-yellow-100 border-yellow-600' },
  { name: 'Incomprendido/a', icon: <UserX size={48} />, colorClass: 'text-gray-500 hover:bg-gray-100 border-gray-500' },
  { name: 'Estresado/a', icon: <AlertTriangle size={48} />, colorClass: 'text-orange-500 hover:bg-orange-100 border-orange-500' },
];

// Diccionario de canales por emoción
const emotionChannels: Record<Emotion, string[]> = {
  'Deprimido/a': ['MusicaRelajante-oq6yh', 'CassioToledo', 'NomadicAmbience'],
  'Triste': ['Enchufetv', 'Backdoor', 'DarkarCompany'],
  'Enojado/a': ['Relaxedcamp', 'NomadicAmbience'],
  'Desmotivado/a': ['caminoalexito_', 'Excelentemode', 'facumarpe'],
  'Incomprendido/a': ['Legendaryreel', 'HeroesEverywhere247'],
  'Estresado/a': ['Silentdayss', 'Relaxedcamp', 'NomadicAmbience'],
};

export function EmotionSelector() {
  const router = useRouter();
  const { toast } = useToast();
  const selectedEmotion = useAppStore((state) => state.selectedEmotion);
  const setSelectedEmotion = useAppStore((state) => state.setSelectedEmotion);
  const setVideoRecommendations = useAppStore((state) => state.setVideoRecommendations);
  const [localSelectedEmotion, setLocalSelectedEmotion] = useState<Emotion | null>(selectedEmotion);
  const [shorts, setShorts] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleEmotionSelect = (emotion: Emotion) => {
    setLocalSelectedEmotion(emotion);
  };

  const handleContinue = async () => {
    if (localSelectedEmotion) {
      setSelectedEmotion(localSelectedEmotion);
      toast({
        title: `Emoción seleccionada: ${localSelectedEmotion}`,
        description: 'Preparando tus recomendaciones...',
      });

      // Elegir los canales según emoción
      const channels = emotionChannels[localSelectedEmotion];
      setLoading(true);
      setShorts([]);
      try {
        const backendUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/youtube/shorts`;
        // Solicitar shorts de todos los canales en paralelo
        const responses = await Promise.all(
          channels.map(channel_handle =>
            axios.post(backendUrl, {
              channel_handle,
              limit: 30 // Pedimos 30 a cada canal, luego intercalamos
            })
          )
        );
        // responses[i].data.shorts_urls es el array de shorts de ese canal
        const shortsByChannel: string[][] = responses.map(res => res.data.shorts_urls || []);
        // Intercalar shorts de los canales
        const maxShorts = Math.max(...shortsByChannel.map(arr => arr.length));
        const interleaved: string[] = [];
        for (let i = 0; i < maxShorts; i++) {
          for (let c = 0; c < shortsByChannel.length; c++) {
            if (shortsByChannel[c][i]) {
              interleaved.push(shortsByChannel[c][i]);
            }
          }
        }
        // Limitar a 30 en total
        const finalShorts = interleaved.slice(0, 30);
        setShorts(finalShorts);
        setVideoRecommendations(
          finalShorts.map((url: string, idx: number) => {
            let videoId = '';
            const match = url.match(/shorts\/([\w-]+)/);
            if (match && match[1]) {
              videoId = match[1];
            }
            const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : '';
            return {
              id: `short-${idx}`,
              url,
              description: `Short ${idx + 1}`,
              thumbnailUrl,
              dataAiHint: '',
            };
          })
        );
        router.push('/feed');
      } catch (error) {
        console.error('Error al obtener los shorts:', error);
      } finally {
        setLoading(false);
      }
    } else {
      toast({
        title: 'Selecciona una emoción',
        description: 'Por favor, elige cómo te sientes para continuar.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4" style={{ background: 'none' }}>
      <Card className="w-full max-w-lg shadow-xl bg-white/80 backdrop-blur-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-primary">¿Cómo te sientes hoy?</CardTitle>
          <CardDescription>Tu selección nos ayudará a personalizar tu experiencia.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {emotionOptions.map((emotionOpt) => (
              <Button
                key={emotionOpt.name}
                variant="outline"
                className={cn(
                  'flex flex-col items-center justify-center h-32 p-4 rounded-lg border-2 transition-all duration-200 ease-in-out transform hover:scale-105 relative shadow-md',
                  emotionOpt.colorClass,
                  localSelectedEmotion === emotionOpt.name ? 'ring-4 ring-primary ring-offset-2 bg-primary/10 border-primary' : 'bg-card'
                )}
                onClick={() => {
                  handleEmotionSelect(emotionOpt.name);
                }}
              >
                {emotionOpt.icon}
                <span className="mt-2 text-sm font-medium">{emotionOpt.name}</span>
                {localSelectedEmotion === emotionOpt.name && (
                   <CheckCircle className="absolute top-2 right-2 h-5 w-5 text-primary fill-background" />
                )}
              </Button>
            ))}
          </div>
          {loading && <p className="text-center py-4">Cargando shorts...</p>}
        </CardContent>
        <CardFooter>
          <Button onClick={handleContinue} className="w-full text-lg py-6" size="lg">
            Continuar
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
