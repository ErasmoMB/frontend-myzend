'use client';

import { PageHeader } from '@/components/shared/PageHeader';
import { useAppStore } from '@/stores/useAppStore';
import type { Video } from '@/lib/types';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlayCircle, Trash2, BookmarkMinus } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { Star } from 'lucide-react';


export default function FavoritesPage() {
  // In a real app, saved videos would come from a persisted store or backend.
  // For this demo, we'll use a mock list, but it should ideally be from userHistory 'save' interactions.
  const userHistory = useAppStore((state) => state.userHistory);
  const allVideos = useAppStore((state) => state.currentVideoRecommendations); // Assuming currentVideoRecommendations contains all possible videos or they are fetched
  const likedVideos = useAppStore((state) => state.likedVideos);
  const { toast } = useToast();

  // This is a simplified way to get saved videos.
  // In a real app, you'd store the full Video object when saved.
  const savedVideoInteractions = userHistory.filter(interaction => interaction.interactionType === 'save');
  
  // This is a placeholder for actual saved videos.
  // It tries to find videos from a mock/example list based on IDs in history.
  // A proper implementation would store the video objects themselves or fetch them by ID.
  const mockSavedVideos: Video[] = [
    { id: '1', url: 'placeholder', description: 'Un relajante paseo por la naturaleza con música calmante.', thumbnailUrl: 'https://placehold.co/300x200.png', dataAiHint: 'nature path' },
    { id: '3', url: 'placeholder', description: 'Momentos divertidos de animales para alegrar tu día.', thumbnailUrl: 'https://placehold.co/300x200.png', dataAiHint: 'pet cat' },
  ];
  
  const savedVideos = mockSavedVideos.filter(video => 
    savedVideoInteractions.some(interaction => interaction.videoId === video.id)
  );
  
  // If savedVideos is empty from the above logic, show all mockSavedVideos for demo purposes.
  const displayVideos = likedVideos.length > 0 ? likedVideos : [];


  const handleRemoveFavorite = (videoId: string) => {
    // This is a mock. In a real app, update the store/backend.
    toast({
      title: 'Favorito eliminado',
      description: 'El video ya no está en tus favoritos (simulado).',
    });
    // Here you would filter out the video from the 'displayVideos' or trigger a re-fetch/re-filter.
  };


  if (displayVideos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4 text-center">
        <Star className="w-16 h-16 text-yellow-400 mb-4" />
        <h2 className="text-2xl font-semibold mb-2">No tienes videos favoritos aún</h2>
        <p className="text-muted-foreground mb-4">Marca videos con <span className='text-yellow-400'>me gusta</span> para verlos aquí.</p>
        <Button asChild>
          <Link href="/feed">Explorar videos</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader title="Mis Favoritos" description="Videos que guardaste para ver más tarde." />
      
      {displayVideos.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-16">
          <BookmarkMinus className="w-24 h-24 text-muted-foreground mb-6" />
          <h2 className="text-2xl font-semibold mb-3">No tienes favoritos guardados</h2>
          <p className="text-muted-foreground mb-6">
            Explora los videos y guarda los que más te gusten para verlos aquí.
          </p>
          <Button asChild>
            <Link href="/feed">Explorar videos</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayVideos.map((video) => (
            <Card key={video.id} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
              <CardHeader className="p-0 relative aspect-video">
                <Image
                  src={video.thumbnailUrl}
                  alt={video.description}
                  layout="fill"
                  objectFit="cover"
                  data-ai-hint={video.dataAiHint}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <Button variant="ghost" size="icon" className="absolute top-2 right-2 bg-black/30 hover:bg-black/50 text-white" onClick={() => handleRemoveFavorite(video.id)} aria-label="Eliminar de favoritos">
                  <Trash2 className="w-5 h-5" />
                </Button>
              </CardHeader>
              <CardContent className="p-4 flex-grow">
                <CardTitle className="text-lg font-semibold mb-1 line-clamp-2">{video.description.substring(0,50)}...</CardTitle>
                <CardDescription className="text-sm text-muted-foreground line-clamp-3">{video.description}</CardDescription>
              </CardContent>
              <CardFooter className="p-4 border-t">
                 <Button className="w-full" variant="outline" asChild>
                   <Link href={`/feed?videoId=${video.id}`}> {/* Conceptual link, feed needs to handle specific video */}
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
  );
}
