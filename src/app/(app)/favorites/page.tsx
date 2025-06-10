'use client';

import { PageHeader } from '@/components/shared/PageHeader';
import { useAppStore } from '@/stores/useAppStore';
import type { Video, UserInteraction } from '@/lib/types';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlayCircle, Trash2, BookmarkMinus } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { Star } from 'lucide-react';
import { useEffect } from 'react';


export default function FavoritesPage() {
  const fetchUserHistory = useAppStore((state) => state.fetchUserHistory);
  const currentUser = useAppStore((state) => state.currentUser);
  useEffect(() => {
    if (currentUser) {
      fetchUserHistory();
    }
  }, [currentUser, fetchUserHistory]);

  // Eliminado comentario y referencia a mock list. Solo se usa userHistory real.
  const userHistory = useAppStore((state) => state.userHistory);
  const allVideos = useAppStore((state) => state.currentVideoRecommendations); // Si hay videos, vienen de la IA/backend
  const likedVideos = useAppStore((state) => state.likedVideos);
  const { toast } = useToast();

  // Mostrar videos a los que el usuario dio like o guardó
  const likedVideoInteractions = userHistory.filter(interaction => interaction.interactionType === 'like');
  const savedVideoInteractions = userHistory.filter(interaction => interaction.interactionType === 'save');

  // Videos únicos por id para cada categoría
  const likedUnique: UserInteraction[] = likedVideoInteractions.reduce<UserInteraction[]>((acc, curr) => {
    if (!acc.some(v => v.videoId === curr.videoId)) acc.push(curr);
    return acc;
  }, []);
  const savedUnique: UserInteraction[] = savedVideoInteractions.reduce<UserInteraction[]>((acc, curr) => {
    if (!acc.some(v => v.videoId === curr.videoId)) acc.push(curr);
    return acc;
  }, []);

  if (likedUnique.length === 0 && savedUnique.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4 text-center">
        <Star className="w-16 h-16 text-yellow-400 mb-4" />
        <h2 className="text-2xl font-semibold mb-2">No tienes videos favoritos aún</h2>
        <p className="text-muted-foreground mb-4">Marca videos con <span className='text-yellow-400'>me gusta</span> o <span className='text-blue-400'>guárdalos</span> para verlos aquí.</p>
        <Button asChild>
          <Link href="/feed">Explorar videos</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader title="Tus Favoritos" description="Videos que te gustaron o guardaste, clasificados por tipo." />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Sección Me gusta */}
        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Star className="text-yellow-400" /> Me gusta</h2>
          {likedUnique.length === 0 ? (
            <p className="text-muted-foreground mb-4">No tienes videos marcados con me gusta.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {likedUnique.map((interaction) => (
                <Card key={interaction.videoId} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
                  <CardHeader className="p-4">
                    <div className="font-bold">{interaction.videoTitle || 'Video Favorito'}</div>
                  </CardHeader>
                  <CardContent className="p-4 flex-grow">
                    {interaction.videoThumbnail && (
                      <img src={interaction.videoThumbnail} alt={interaction.videoTitle || 'thumbnail'} className="mb-2 rounded-lg w-full h-40 object-cover" />
                    )}
                    <CardTitle className="text-lg font-semibold mb-1 line-clamp-2">{interaction.videoTitle || 'Video Favorito'}</CardTitle>
                    <CardDescription className="text-sm text-muted-foreground line-clamp-3">
                      {interaction.videoUrl ? (
                        <a href={interaction.videoUrl} target="_blank" rel="noopener noreferrer" className="underline text-blue-600">Ver en YouTube</a>
                      ) : '(Sin URL guardada)'}
                    </CardDescription>
                  </CardContent>
                  <CardFooter className="p-4 border-t">
                    <Button className="w-full" variant="outline" asChild>
                      <Link href={interaction.videoUrl ? `/feed?videoId=${interaction.videoId}` : `/feed`} target="_self">
                        <PlayCircle className="mr-2 h-5 w-5" />
                        Ver video
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
        {/* Sección Guardados */}
        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><BookmarkMinus className="text-blue-400" /> Guardados</h2>
          {savedUnique.length === 0 ? (
            <p className="text-muted-foreground mb-4">No tienes videos guardados.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {savedUnique.map((interaction) => (
                <Card key={interaction.videoId} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
                  <CardHeader className="p-4">
                    <div className="font-bold">{interaction.videoTitle || 'Video Guardado'}</div>
                  </CardHeader>
                  <CardContent className="p-4 flex-grow">
                    {interaction.videoThumbnail && (
                      <img src={interaction.videoThumbnail} alt={interaction.videoTitle || 'thumbnail'} className="mb-2 rounded-lg w-full h-40 object-cover" />
                    )}
                    <CardTitle className="text-lg font-semibold mb-1 line-clamp-2">{interaction.videoTitle || 'Video Guardado'}</CardTitle>
                    <CardDescription className="text-sm text-muted-foreground line-clamp-3">
                      {interaction.videoUrl ? (
                        <a href={interaction.videoUrl} target="_blank" rel="noopener noreferrer" className="underline text-blue-600">Ver en YouTube</a>
                      ) : '(Sin URL guardada)'}
                    </CardDescription>
                  </CardContent>
                  <CardFooter className="p-4 border-t">
                    <Button className="w-full" variant="outline" asChild>
                      <Link href={interaction.videoUrl ? `/feed?videoId=${interaction.videoId}` : `/feed`} target="_self">
                        <PlayCircle className="mr-2 h-5 w-5" />
                        Ver video
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
