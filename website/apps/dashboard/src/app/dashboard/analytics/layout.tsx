import { AnalyticsSidebar } from '@/components/analytics-sidebar';

export default function AnalyticsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className='flex flex-1'>
      <AnalyticsSidebar />
      <div className='flex flex-1 flex-col overflow-auto'>{children}</div>
    </div>
  );
}
