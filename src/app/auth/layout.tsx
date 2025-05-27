import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'myzend',
  description: 'Inicia sesión o crea tu cuenta en myzend.',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-background to-secondary p-4">
      <div className="mb-8 flex flex-col items-center">
        {/* Logo eliminado */}
        <h1 className="text-4xl font-bold text-primary">myzend</h1>
        <p className="text-muted-foreground">Encuentra calma y claridad.</p>
      </div>
      {children}
    </div>
  );
}
