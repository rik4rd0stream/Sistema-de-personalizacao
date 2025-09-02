'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, XCircle } from 'lucide-react';
import type { Equipment } from '@/app/page';
import type { IdealRune } from '@/lib/runes';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RuneSuggestionDialog } from './rune-suggestion-dialog';

interface EquipmentCardProps {
  equipment: Equipment;
  tier: number;
  runeSlots: number;
  onRuneChange: (equipmentId: string, runeIndex: number, value: string) => void;
  idealRunesForTier: IdealRune[];
  allCurrentRunes: string[];
  availableRunes: string[];
}

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
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Icon className="h-8 w-8 text-accent" />
          <div>
            <CardTitle>{equipment.name}</CardTitle>
            <CardDescription>Tier {tier}</CardDescription>
          </div>
          <div className="ml-auto">
            <RuneSuggestionDialog equipmentType={equipment.name} tier={tier} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div>
          <h3 className="mb-2 font-semibold text-foreground/80">Runas Atuais</h3>
          <div className="grid gap-3">
            {Array.from({ length: runeSlots }).map((_, index) => {
               const currentRune = equipment.currentRunes[index];
               const isFilled = currentRune && currentRune.trim() !== '';
               const isCorrect = isFilled && isRuneCorrect(currentRune);

              return (
                <div key={`current-${index}`} className="flex items-center gap-2">
                  <Select value={currentRune} onValueChange={(value) => onRuneChange(equipment.id, index, value)}>
                    <SelectTrigger>
                      <SelectValue placeholder={`Runa ${index + 1}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {availableRunes.map(runeName => (
                        <SelectItem key={runeName} value={runeName}>
                          {runeName || 'Vazio'}
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
      </CardContent>
    </Card>
  );
}