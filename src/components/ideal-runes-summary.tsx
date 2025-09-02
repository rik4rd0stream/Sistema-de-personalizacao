'use client';
import { useMemo, useState } from 'react';
import type { IdealRune } from '@/lib/runes';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';

interface IdealRunesSummaryProps {
  idealRunesForTier: IdealRune[];
  allCurrentRunes: string[];
  tier: number;
}

export function IdealRunesSummary({ idealRunesForTier, allCurrentRunes, tier }: IdealRunesSummaryProps) {
  const [isOpen, setIsOpen] = useState(false);

  const missingRunes = useMemo(() => {
    if (idealRunesForTier.length === 0) return [];

    return idealRunesForTier.map(idealRune => {
      const idealName = idealRune.name.toLowerCase();
      const currentCount = allCurrentRunes.filter(r => r === idealName).length;
      const missingCount = Math.max(0, idealRune.count - currentCount);
      const total = idealRune.count;
      return { ...idealRune, currentCount, missingCount, total };
    }).sort((a, b) => {
      // Sort by missing count descending, then by name
      if (b.missingCount !== a.missingCount) {
        return b.missingCount - a.missingCount;
      }
      return a.name.localeCompare(b.name);
    });
  }, [idealRunesForTier, allCurrentRunes]);

  const totalRunesCount = useMemo(() => missingRunes.reduce((sum, r) => sum + r.total, 0), [missingRunes]);
  const currentRunesCount = useMemo(() => missingRunes.reduce((sum, r) => sum + r.currentCount, 0), [missingRunes]);
  const overallProgress = totalRunesCount > 0 ? (currentRunesCount / totalRunesCount) * 100 : 0;

  if (idealRunesForTier.length === 0) {
    return (
       <Card>
        <CardHeader>
          <CardTitle>Resumo de Runas Ideais para o Tier {tier}</CardTitle>
          <CardDescription>Nenhuma runa ideal cadastrada para este tier.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
        <div>
          <CardTitle>Resumo de Runas Ideais para o Tier {tier}</CardTitle>
          <CardDescription>Clique para expandir e ver as runas que faltam.</CardDescription>
        </div>
        <div className="flex items-center gap-4">
            <div className='w-40'>
                <Progress value={overallProgress} className='h-3'/>
            </div>
            <Badge variant="secondary">{`${currentRunesCount} / ${totalRunesCount}`}</Badge>
            <Button variant="ghost" size="icon">
                {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </Button>
        </div>
      </CardHeader>
      {isOpen && (
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {missingRunes.map(rune => (
              <div key={rune.name} className="flex items-center justify-between rounded-lg border bg-card p-3 shadow-sm">
                <span className="text-sm font-medium text-card-foreground">{rune.name}</span>
                <Badge variant={rune.missingCount === 0 ? 'default' : 'destructive'} className="text-sm">
                  {rune.currentCount}/{rune.total}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
