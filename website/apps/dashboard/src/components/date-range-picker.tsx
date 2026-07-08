'use client';

import { useQueryState } from 'nuqs';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';

const presets = [
  { label: '7d', days: 7 },
  { label: '30d', days: 30 },
  { label: '90d', days: 90 }
] as const;

export function DateRangePicker() {
  const [range, setRange] = useQueryState('range', { defaultValue: '30' });

  return (
    <div className='flex items-center gap-1 rounded-lg border p-1'>
      <Icons.calendar className='ml-1 size-3.5 text-muted-foreground' />
      {presets.map((p) => (
        <Button
          key={p.label}
          variant={range === String(p.days) ? 'secondary' : 'ghost'}
          size='sm'
          className='h-7 px-2 text-xs'
          onClick={() => setRange(String(p.days))}
        >
          {p.label}
        </Button>
      ))}
    </div>
  );
}
