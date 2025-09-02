'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, XCircle } from 'lucide-react';
import type { Equipment } from '@/app/personagem/[id]/runas/page';
import type { IdealRune } from '@/lib/runes';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RuneSuggestionDialog } from './rune-suggestion-dialog';
import { cn } from "@/lib/utils";

interface EquipmentCardProps {
  equipment: Equipment;
  tier: number;
  runeSlots: number;
  onRuneChange: (equipmentId: string, runeIndex: number, value: string) => void;
  idealRunesForTier: IdealRune[];
  allCurrentRunes: string[];
  availableRunes: string[];
}

const getRuneColorClass = (runeName: string): string => {
    if (runeName.includes('(Amarelo)')) return 'bg-yellow-400';
    if (runeName.includes('(Roxo)')) return 'bg-purple-500';
    if (runeName.includes('(Verde)')) return 'bg-green-500';
    if (runeName.includes('(Vermelho)')) return 'bg-red-500';
    return 'hidden';
};

export function EquipmentCard({ equipment, tier, runeSlots, onRuneChange, idealRunesForTier, allCurrentRunes, availableRunes }: EquipmentCardProps) {
  const Icon = equipment.icon;

  const isRuneCorrect = (currentRune: string) => {
    if (!currentRune || idealRunesForTier.length === 0) return false;
    
    const lowerCaseRune = currentRune.trim().toLowerCase();
    const idealRuneInfo = idealRunesForTier.find(r => r.name.toLowerCase() === lowerCaseRune);

    if (!idealRuneInfo) return false;

    const count = allCurrentRunes.filter(r => r === lowerCaseRune).length;
    return count <= idealRuneInfo.count;
  };

  return (
    <div className="flex items-center gap-4 rounded-lg border bg-background/50 p-3 transition-all hover:bg-background/80">
      <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary/10">
        <Icon className="h-7 w-7 text-primary" />
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
            <h3 className="font-semibold">{equipment.name}</h3>
            <RuneSuggestionDialog equipmentType={equipment.name} tier={tier} />
        </div>
        <div className="mt-2 flex items-center gap-2">
            {Array.from({ length: runeSlots }).map((_, index) => {
               const currentRune = equipment.currentRunes[index];
               const isFilled = currentRune && currentRune.trim() !== '';
               const isCorrect = isFilled && isRuneCorrect(currentRune);

              return (
                <div key={`current-${index}`} className="flex flex-1 items-center gap-2">
                  <Select value={currentRune || 'EMPTY_SLOT'} onValueChange={(value) => onRuneChange(equipment.id, index, value)}>
                    <SelectTrigger className="h-9">
                        <SelectValue asChild>
                            <div className="flex items-center gap-2">
                                <div className={cn("h-3 w-3 rounded-full", getRuneColorClass(currentRune || ''))}></div>
                                <span>{currentRune || `Runa ${index + 1}`}</span>
                            </div>
                        </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {availableRunes.map(runeName => (
                        <SelectItem key={runeName} value={runeName}>
                         <div className="flex items-center gap-3">
                            <div className={cn("h-3 w-3 rounded-full", getRuneColorClass(runeName))}></div>
                            <span>{runeName === 'EMPTY_SLOT' ? 'Vazio' : runeName}</span>
                         </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                   <div className="w-5 h-5 flex items-center justify-center">
                    {isFilled && idealRunesForTier.length > 0 && (
                        isCorrect ? (
                            <CheckCircle2 className="text-green-500" />
                        ) : (
                            <XCircle className="text-destructive" />
                        )
                    )}
                  </div>
                </div>
              )
            })}
        </div>
      </div>
    </div>
  );
}
