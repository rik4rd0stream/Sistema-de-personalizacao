'use client';
import type { ChangeEvent } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CheckCircle2, XCircle } from 'lucide-react';
import type { Equipment } from '@/app/page';
import { RuneSuggestionDialog } from './rune-suggestion-dialog';

interface EquipmentCardProps {
  equipment: Equipment;
  tier: number;
  runeSlots: number;
  onRuneChange: (equipmentId: string, runeType: 'currentRunes' | 'idealRunes', runeIndex: number, value: string) => void;
  onApplySuggestions: (equipmentId: string, suggestions: string[]) => void;
}

export function EquipmentCard({ equipment, tier, runeSlots, onRuneChange, onApplySuggestions }: EquipmentCardProps) {
  const Icon = equipment.icon;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Icon className="h-8 w-8 text-accent" />
          <div>
            <CardTitle>{equipment.name}</CardTitle>
            <CardDescription>Tier {tier}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div>
          <h3 className="mb-2 font-semibold text-foreground/80">Runas Atuais</h3>
          <div className="grid gap-3">
            {Array.from({ length: runeSlots }).map((_, index) => {
               const currentRune = equipment.currentRunes[index];
               const idealRune = equipment.idealRunes[index];
               const isCorrect = currentRune && idealRune && currentRune.trim().toLowerCase() === idealRune.trim().toLowerCase();
               const isFilled = currentRune && currentRune.trim() !== '';

              return (
                <div key={`current-${index}`} className="flex items-center gap-2">
                  <Input
                    value={currentRune}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => onRuneChange(equipment.id, 'currentRunes', index, e.target.value)}
                    placeholder={`Runa ${index + 1}`}
                    className="flex-1"
                  />
                  <div className="w-5 h-5 flex items-center justify-center">
                    {isFilled && idealRune && idealRune.trim() !== '' && (
                        isCorrect ? (
                            <CheckCircle2 className="text-accent" />
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
        
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-foreground/80">Runas Ideais</h3>
            <RuneSuggestionDialog 
              equipmentType={equipment.name} 
              tier={tier} 
              onApplySuggestions={(suggestions) => onApplySuggestions(equipment.id, suggestions)} 
            />
          </div>
          <div className="grid gap-3">
            {Array.from({ length: runeSlots }).map((_, index) => (
              <Input
                key={`ideal-${index}`}
                value={equipment.idealRunes[index]}
                onChange={(e: ChangeEvent<HTMLInputElement>) => onRuneChange(equipment.id, 'idealRunes', index, e.target.value)}
                placeholder={`Runa Ideal ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
