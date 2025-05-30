'use client';

import { PageHeader } from '@/components/shared/PageHeader';
import { useAppStore } from '@/stores/useAppStore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { Edit3, LogOut, Smile, Frown, ShieldQuestion, Angry, BatteryLow, Flame, History, Star } from 'lucide-react';
import type { Emotion } from '@/lib/types';
import Link from 'next/link';

const emotionIcons: Record<Emotion, React.ElementType> = {
  Feliz: Smile,
  Triste: Frown,
  Ansioso: ShieldQuestion,
  Enojado: Angry,
  Cansado: BatteryLow,
  Motivado: Flame,
};

export default function ProfilePage() {
  const currentUser = useAppStore((state) => state.currentUser);
  const userHistory = useAppStore((state) => state.userHistory); // Contains all interactions
  const logoutUser = useAppStore((state) => state.logout);
  const router = useRouter();

  if (!currentUser) {
    // This should ideally be handled by the AppLayout, but as a fallback:
    router.replace('/auth/login');
    return null;
  }

  const handleLogout = () => {
    logoutUser();
    router.push('/auth/login');
  };

  // Mock emotion history from userHistory (simplified)
  // In a real app, this might be stored differently or filtered more specifically
  const emotionHistory = userHistory
    .filter(item => item.interactionType === 'like' || item.interactionType === 'save') // Arbitrary filter for demo
    .slice(0, 5) // Limit to 5 for display
    .map((item, index) => ({ 
      // This is highly simplified. Real emotion history would be logged when selected.
      emotion: ['Feliz', 'Ansioso', 'Motivado', 'Triste', 'Cansado'][index % 5] as Emotion, 
      timestamp: item.timestamp 
    }))
    .sort((a,b) => b.timestamp.getTime() - a.timestamp.getTime());


  const savedVideosCount = userHistory.filter(item => item.interactionType === 'save').length;

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader title="Mi Perfil" description={`Bienvenido de nuevo, ${currentUser.name}!`}>
        <Button variant="outline" size="icon" onClick={handleLogout} aria-label="Cerrar sesión">
          <LogOut className="h-5 w-5" />
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1 shadow-lg">
          <CardHeader className="items-center text-center">
            <Avatar className="w-24 h-24 mb-4 border-4 border-primary shadow-md">
              <AvatarImage src={currentUser.avatarUrl || `https://placehold.co/100x100.png?text=${currentUser.name.charAt(0)}`} alt={currentUser.name} data-ai-hint="avatar person" />
              <AvatarFallback>{currentUser.name.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <CardTitle className="text-2xl">{currentUser.name}</CardTitle>
            <CardDescription>{currentUser.email}</CardDescription>
            <Button variant="outline" size="sm" className="mt-4">
              <Edit3 className="mr-2 h-4 w-4" /> Editar Perfil (No implementado)
            </Button>
          </CardHeader>
        </Card>

        <Card className="md:col-span-2 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center"><History className="mr-2 h-5 w-5 text-primary" /> Historial de Emociones</CardTitle>
            <CardDescription>Tus selecciones de emociones recientes.</CardDescription>
          </CardHeader>
          <CardContent>
            {emotionHistory.length > 0 ? (
              <ul className="space-y-3">
                {emotionHistory.map((entry, index) => {
                  const IconComponent = emotionIcons[entry.emotion];
                  return (
                    <li key={index} className="flex items-center justify-between p-3 bg-secondary/30 rounded-md">
                      <div className="flex items-center">
                        <IconComponent className="w-6 h-6 mr-3 text-accent" />
                        <span className="font-medium">{entry.emotion}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(entry.timestamp).toLocaleDateString()}
                      </span>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-muted-foreground text-center py-4">No hay historial de emociones disponible.</p>
            )}
             <Button onClick={() => router.push('/home')} className="w-full mt-6">
              Cambiar emoción actual
            </Button>
          </CardContent>
        </Card>

        <Card className="md:col-span-3 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center"><Star className="mr-2 h-5 w-5 text-yellow-500" /> Videos Guardados</CardTitle>
            <CardDescription>Un resumen de tus videos favoritos.</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-4xl font-bold text-primary mb-2">{savedVideosCount}</p>
            <p className="text-muted-foreground mb-4">videos guardados en tus favoritos.</p>
            <Button asChild variant="outline">
              <Link href="/favorites">Ver mis favoritos</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
