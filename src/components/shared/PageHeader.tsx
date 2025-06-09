import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description?: string | ReactNode;
  children?: ReactNode; // For additional elements like buttons
}

export function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <header className="bg-background/80 backdrop-blur-md sticky top-0 z-40 w-full border-b p-4 mb-6 shadow-sm">
      <div className="container mx-auto flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-primary">{title}</h1>
          {description && typeof description === 'string' ? (
            <p className="text-muted-foreground">{description}</p>
          ) : (
            description
          )}
        </div>
        {children && <div className="ml-auto">{children}</div>}
      </div>
    </header>
  );
}
