import { EmotionSelector } from '@/components/shared/EmotionSelector';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'myzend - ¿Cómo te sientes?',
  description: 'Selecciona tu emoción actual para recibir contenido personalizado en myzend.',
};

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center mt-8">
      <EmotionSelector />
    </div>
  );
}
