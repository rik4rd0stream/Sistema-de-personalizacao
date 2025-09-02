'use client';
import { CheckCircle2, XCircle } from 'lucide-react';
import type { Equipment } from '@/app/personagem/[id]/runas/page';
import type { IdealRune } from '@/lib/runes';
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import type { RuneSlotIdentifier } from "@/app/personagem/[id]/runas/page";

interface EquipmentCardProps {
  equipment: Equipment;
  tier: number;
  onRuneChange: (equipmentId: string, runeIndex: number, fragmentIndex: number, value: string) => void;
  idealRunesForTier: IdealRune[];
  allCurrentRunes: string[];
  availableRunes: string[];
  openRuneSlotDialog: (identifier: RuneSlotIdentifier) => void;
}

const getRuneColorClass = (runeName: string): string => {
    if (!runeName) return 'bg-gray-500';
    if (runeName.includes('(Amarelo)')) return 'bg-yellow-400';
    if (runeName.includes('(Roxo)')) return 'bg-purple-500';
    if (runeName.includes('(Verde)')) return 'bg-green-500';
    if (runeName.includes('(Vermelho)')) return 'bg-red-500';
    return 'bg-gray-500';
};

export function EquipmentCard({ equipment, tier, onRuneChange, idealRunesForTier, allCurrentRunes, availableRunes, openRuneSlotDialog }: EquipmentCardProps) {
  const Icon = equipment.icon;
  const numberOfRunes = tier === 2 ? 2 : 3;

  const isFragmentCorrect = (fragmentName: string) => {
    if (!fragmentName || idealRunesForTier.length === 0) return false;
    
    const lowerCaseFragment = fragmentName.trim().toLowerCase();
    const idealRuneInfo = idealRunesForTier.find(r => r.name.toLowerCase() === lowerCaseFragment);

    if (!idealRuneInfo) return false;

    const count = allCurrentRunes.filter(r => r === lowerCaseFragment).length;
    return count <= idealRuneInfo.count;
  };
  
  const RuneStatusIndicator = ({ fragment }: { fragment: string }) => {
    if (!fragment) return null;
    const isCorrect = isFragmentCorrect(fragment);
    return isCorrect ? 
      <CheckCircle2 className="h-4 w-4 text-green-500" /> : 
      <XCircle className="h-4 w-4 text-destructive" />;
  };

  return (
    <div className="flex items-start gap-4 rounded-lg border bg-background/50 p-3 transition-all hover:bg-background/80">
      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-md bg-primary/10">
        <Icon className="h-7 w-7 text-primary" />
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
            <h3 className="font-semibold">{equipment.name}</h3>
        </div>
        <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {Array.from({ length: numberOfRunes }).map((_, runeIndex) => {
               const fragment1 = equipment.fragments[runeIndex * 2];
               const fragment2 = equipment.fragments[runeIndex * 2 + 1];

              return (
                <Button 
                    key={`rune-${runeIndex}`} 
                    variant="outline" 
                    className="h-auto w-full justify-start p-2"
                    onClick={() => openRuneSlotDialog({ equipmentId: equipment.id, runeIndex })}
                >
                    <div className="flex flex-col w-full text-left">
                        <p className="font-semibold text-sm mb-1">Runa {runeIndex + 1}</p>
                        <div className="space-y-1">
                           <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <div className={cn("h-3 w-3 rounded-full", getRuneColorClass(fragment1))}></div>
                                <span className="flex-1 truncate">{fragment1 || 'Fragmento 1'}</span>
                                <RuneStatusIndicator fragment={fragment1}/>
                           </div>
                           <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <div className={cn("h-3 w-3 rounded-full", getRuneColorClass(fragment2))}></div>
                                <span className="flex-1 truncate">{fragment2 || 'Fragmento 2'}</span>
                               <RuneStatusIndicator fragment={fragment2}/>
                           </div>
                        </div>
                    </div>
                </Button>
              )
            })}
        </div>
      </div>
    </div>
  );
}
