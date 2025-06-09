'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Star, User as UserIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
	{ href: '/home', label: 'Inicio', icon: Home },
	{ href: '/favorites', label: 'Favoritos', icon: Star },
	{ href: '/profile', label: 'Perfil', icon: UserIcon },
];

export function BottomNavigationBar() {
	const pathname = usePathname();

	return (
		<nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/80 backdrop-blur-md shadow-lg md:hidden">
			<div className="mx-auto flex h-16 max-w-md items-center justify-around px-4">
				{navItems.map((item) => {
					const isActive =
						pathname === item.href ||
						(item.href === '/home' && pathname === '/feed'); // Consider /feed as /home for active state
					return (
						<Link
							key={item.href}
							href={item.href}
							className={cn(
								'flex flex-col items-center justify-center space-y-1 rounded-md p-2 text-sm font-medium transition-colors',
								isActive
									? 'text-primary'
									: 'text-muted-foreground hover:text-foreground'
							)}
						>
							<item.icon
								className={cn(
									'h-6 w-6',
									isActive
										? 'fill-primary stroke-primary-foreground'
										: ''
								)}
							/>
							<span>{item.label}</span>
						</Link>
					);
				})}
			</div>
		</nav>
	);
}
