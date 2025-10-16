'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';
import { getTimeUntilNextAnalysis } from '../_utils/nextAnalysisDate';

export const NextAnalysisCountdown = () => {
  const [timeRemaining, setTimeRemaining] = useState(() => getTimeUntilNextAnalysis());

  useEffect(() => {
    // Actualizar cada minuto
    const interval = setInterval(() => {
      setTimeRemaining(getTimeUntilNextAnalysis());
    }, 60000); // 60 segundos

    return () => clearInterval(interval);
  }, []);

  return (
    <Badge variant="outline" className="text-xs flex items-center gap-1.5 px-3 py-1.5">
      <Clock className="h-3.5 w-3.5" />
      <span>Próximo análisis en {timeRemaining.formatted}</span>
    </Badge>
  );
};
