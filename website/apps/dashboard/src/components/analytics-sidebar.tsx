'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Icons } from './icons';

const navItems = [
  {
    section: 'Web Analytics',
    items: [
      { title: 'Overview', href: '/dashboard/analytics', icon: Icons.trendingUp },
      { title: 'Pages', href: '/dashboard/analytics/pages', icon: Icons.page },
      { title: 'Sessions', href: '/dashboard/analytics/sessions', icon: Icons.clock },
      { title: 'Events', href: '/dashboard/analytics/events', icon: Icons.calendar },
      { title: 'Errors', href: '/dashboard/analytics/errors', icon: Icons.alertCircle },
      { title: 'Countries', href: '/dashboard/analytics/countries', icon: Icons.world },
      { title: 'Performance', href: '/dashboard/analytics/performance', icon: Icons.speedometer },
      { title: 'Replay', href: '/dashboard/analytics/replay', icon: Icons.playerPlay }
    ]
  },
  {
    section: 'Product Analytics',
    items: [
      { title: 'Funnels', href: '/dashboard/analytics/funnels', icon: Icons.adjustments },
      { title: 'Journeys', href: '/dashboard/analytics/journeys', icon: Icons.gitBranch },
      { title: 'Retention', href: '/dashboard/analytics/retention', icon: Icons.teams }
    ]
  }
];

export function AnalyticsSidebar() {
  const pathname = usePathname();

  return (
    <aside className='flex w-56 flex-col border-r bg-sidebar text-sidebar-foreground'>
      <div className='flex h-14 items-center border-b px-4'>
        <span className='text-sm font-semibold'>Analytics</span>
      </div>
      <nav className='flex-1 overflow-y-auto p-2'>
        {navItems.map((group) => (
          <div key={group.section} className='mb-4'>
            <p className='mb-1 px-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground'>
              {group.section}
            </p>
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = item.href === '/dashboard/analytics'
                ? pathname === '/dashboard/analytics'
                : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-md px-2 py-1.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  <Icon className='size-4 shrink-0' />
                  <span>{item.title}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
    </aside>
  );
}
