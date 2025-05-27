import type { Metadata } from 'next';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'MindFlow - Autenticación',
  description: 'Inicia sesión o crea tu cuenta en MindFlow.',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-background to-secondary p-4">
      <div className="mb-8 flex flex-col items-center">
        <Image src="https://placehold.co/100x100.png" alt="MindFlow Logo" width={80} height={80} className="rounded-full mb-4 shadow-md" data-ai-hint="logo brain" />
        <h1 className="text-4xl font-bold text-primary">MindFlow</h1>
        <p className="text-muted-foreground">Encuentra calma y claridad.</p>
      </div>
      {children}
    </div>
  );
}
