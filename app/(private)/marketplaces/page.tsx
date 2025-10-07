import { Suspense } from 'react';
import { Content } from './_components/Content';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata = {
  title: 'Marketplaces | Filos',
  description: 'Gestiona tus integraciones con marketplaces externos',
};

export default function MarketplacesPage() {
  return (
    <Suspense fallback={<Skeleton className="h-screen" />}>
      <Content />
    </Suspense>
  );
}
