
'use client';
import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Gem } from 'lucide-react';

interface CurrentRunesSummaryProps {
  allCurrentRunes: string[];
  tier: number;
  characterClass: string;
}

export function CurrentRunesSummary({ allCurrentRunes, tier, characterClass }: CurrentRunesSummaryProps) {
  const runeCounts = useMemo(() => {
    if (allCurrentRunes.length === 0) return [];

    const counts: Record<string, number> = {};
    for (const rune of allCurrentRunes) {
      counts[rune] = (counts[rune] || 0) + 1;
    }

    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  }, [allCurrentRunes]);

  const totalRunesCount = allCurrentRunes.length;

  const renderContent = () => {
    if (runeCounts.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-8 h-[calc(100vh-220px)]">
            <Gem className="h-12 w-12 mb-4" />
            <p className="font-semibold">Nenhum fragmento equipado.</p>
            <p className="text-xs mt-2 max-w-xs">
                Comece a adicionar fragmentos aos seus equipamentos para ver o resumo aqui.
            </p>
        </div>
      );
    }
    
    return (
        <ScrollArea className="h-[calc(100vh-220px)]">
            <div className="grid grid-cols-2 gap-3 p-1">
                {runeCounts.map(rune => (
                <div key={rune.name} className="flex flex-col items-center justify-center rounded-lg border bg-background/50 p-4 shadow-sm text-center">
                    <span className="text-xs font-medium text-foreground/80 leading-tight">{rune.name}</span>
                    <Badge variant='default' className="mt-3 text-lg">
                     {rune.count}
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
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle>Resumo de Fragmentos</CardTitle>
            <CardDescription>Total: {totalRunesCount}</CardDescription>
          </div>
          <div className='text-right'>
            <Badge variant="secondary" className="text-base mb-1 whitespace-nowrap">{characterClass}</Badge>
            <Badge variant="secondary" className="text-base">Tier {tier}</Badge>
          </div>
        </div>
      </CardHeader>
        <CardContent>
            {renderContent()}
        </CardContent>
    </Card>
  );
}
