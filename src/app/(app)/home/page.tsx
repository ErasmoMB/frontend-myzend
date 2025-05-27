import { EmotionSelector } from '@/components/shared/EmotionSelector';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'MindFlow - ¿Cómo te sientes?',
  description: 'Selecciona tu emoción actual para recibir contenido personalizado.',
};

export default function HomePage() {
  return <EmotionSelector />;
}
