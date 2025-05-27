'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useAppStore } from '@/stores/useAppStore';
import type { Emotion } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { Smile, Frown, ShieldQuestion, Angry, BatteryLow, Flame, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useState, type ReactNode } from 'react';
import axios from 'axios';

const emotionOptions: { name: Emotion; icon: ReactNode; colorClass: string }[] = [
  { name: 'Feliz', icon: <Smile size={48} />, colorClass: 'text-yellow-500 hover:bg-yellow-100 border-yellow-500' },
  { name: 'Triste', icon: <Frown size={48} />, colorClass: 'text-blue-500 hover:bg-blue-100 border-blue-500' },
  { name: 'Ansioso', icon: <ShieldQuestion size={48} />, colorClass: 'text-purple-500 hover:bg-purple-100 border-purple-500' },
  { name: 'Enojado', icon: <Angry size={48} />, colorClass: 'text-red-500 hover:bg-red-100 border-red-500' },
  { name: 'Cansado', icon: <BatteryLow size={48} />, colorClass: 'text-gray-500 hover:bg-gray-100 border-gray-500' },
  { name: 'Motivado', icon: <Flame size={48} />, colorClass: 'text-orange-500 hover:bg-orange-100 border-orange-500' },
];

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

      if (localSelectedEmotion === 'Enojado') {
        setLoading(true);
        setShorts([]);

        try {
          const backendUrl = 'http://localhost:8000/youtube/shorts';
          console.log('Enviando solicitud al backend en:', backendUrl);
          console.log('Datos enviados:', {
            channel_handle: 'Lostranquility',
            limit: 5,
          });

          const res = await axios.post(backendUrl, {
            channel_handle: 'Lostranquility',
            limit: 5,
          });

          console.log('Respuesta del backend:', res.data);
          setShorts(res.data.shorts_urls);

          // Guardar los videos en el estado global
          setVideoRecommendations(
            res.data.shorts_urls.map((url, idx) => ({
              id: `short-${idx}`,
              url,
              description: `Short ${idx + 1}`,
              thumbnailUrl: '',
              dataAiHint: '',
            }))
          );

          // Redirigir al feed
          router.push('/feed');
        } catch (error) {
          console.error('Error al obtener los shorts:', error);
        } finally {
          setLoading(false);
        }
      } else {
        router.push('/feed');
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
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-background to-secondary">
      <Card className="w-full max-w-lg shadow-xl">
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
