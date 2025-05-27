import { EmotionSelector } from '@/components/shared/EmotionSelector';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'myzend - ¿Cómo te sientes?',
  description: 'Selecciona tu emoción actual para recibir contenido personalizado en myzend.',
};

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center mt-8">
      {/* Logo myzend arriba del título */}
      <img
        src="/logo.jpg"
        alt="myzend logo"
        width={80}
        height={80}
        className="rounded-full mb-2 shadow-md"
      />
      <h1 className="text-4xl font-bold text-primary mb-1">myzend</h1>
      <p className="text-muted-foreground mb-6">Encuentra calma y claridad.</p>
      <EmotionSelector />
    </div>
  );
}
