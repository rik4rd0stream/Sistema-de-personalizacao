
'use client';
import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Gem, Loader2 } from 'lucide-react';

export interface IdealRune {
  name: string;
  count: number;
}

interface IdealRunesSummaryProps {
  idealRunesForTier: IdealRune[];
  allCurrentRunes: string[];
  tier: number;
  isLoading: boolean;
}

export function IdealRunesSummary({ idealRunesForTier, allCurrentRunes, tier, isLoading }: IdealRunesSummaryProps) {
  const missingRunes = useMemo(() => {
    if (idealRunesForTier.length === 0) return [];

    return idealRunesForTier.map(idealRune => {
      const idealName = idealRune.name.toLowerCase();
      const currentCount = allCurrentRunes.filter(r => r === idealName).length;
      const missingCount = Math.max(0, idealRune.count - currentCount);
      const total = idealRune.count;
      return { ...idealRune, currentCount, missingCount, total };
    }).sort((a, b) => {
      if (b.missingCount !== a.missingCount) {
        return b.missingCount - a.missingCount;
      }
      return a.name.localeCompare(b.name);
    });
  }, [idealRunesForTier, allCurrentRunes]);

  const totalRunesCount = useMemo(() => missingRunes.reduce((sum, r) => sum + r.total, 0), [missingRunes]);
  const currentRunesCount = useMemo(() => missingRunes.reduce((sum, r) => sum + r.currentCount, 0), [missingRunes]);

  const renderContent = () => {
    if (isLoading) {
       return (
        <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-8 h-[calc(100vh-220px)]">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p>Carregando runas ideais...</p>
        </div>
      );
    }
    
    if (idealRunesForTier.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-8 h-[calc(100vh-220px)]">
            <Gem className="h-12 w-12 mb-4" />
            <p>Nenhuma runa ideal cadastrada para o Tier {tier}.</p>
            <p className="text-xs mt-2">Um administrador pode adicioná-las no painel de admin.</p>
        </div>
      );
    }
    
    return (
        <ScrollArea className="h-[calc(100vh-220px)]">
            <div className="grid grid-cols-2 gap-3 p-1">
                {missingRunes.map(rune => (
                <div key={rune.name} className="flex flex-col items-center justify-center rounded-lg border bg-background/50 p-4 shadow-sm text-center">
                    <span className="text-xs font-medium text-foreground/80 leading-tight">{rune.name}</span>
                    <Badge variant={rune.missingCount === 0 ? 'default' : 'destructive'} className="mt-3 text-lg">
                    {rune.currentCount}/{rune.total}
                    </Badge>
                </div>
                ))}
            </div>
      </ScrollArea>
    )
  }

  return (
    <Card className="sticky top-24 bg-secondary/30 border-secondary">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Fragmentos Ideais</CardTitle>
            {!isLoading && idealRunesForTier.length > 0 && (
                <CardDescription>Faltam {totalRunesCount - currentRunesCount} de {totalRunesCount} fragmentos</CardDescription>
            )}
          </div>
          <Badge variant="secondary" className="text-base">Tier {tier}</Badge>
        </div>
      </CardHeader>
        <CardContent>
            {renderContent()}
        </CardContent>
    </Card>
  );
}
