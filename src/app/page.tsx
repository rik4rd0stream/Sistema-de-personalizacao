'use client';

import { useState, useCallback, useMemo } from 'react';
import { Header } from '@/components/layout/Header';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { EQUIPMENT_TYPES } from '@/lib/constants';
import type { EquipmentType } from '@/lib/constants';
import { EquipmentCard } from '@/components/equipment-card';

export interface Equipment {
  id: string;
  name: string;
  icon: EquipmentType['icon'];
  currentRunes: string[];
  idealRunes: string[];
}

function getInitialEquipmentState(tier: number): Equipment[] {
  const runeSlots = tier === 2 ? 2 : 3;
  return EQUIPMENT_TYPES.map(eq => ({
    ...eq,
    currentRunes: Array(runeSlots).fill(''),
    idealRunes: Array(runeSlots).fill(''),
  }));
}

export default function Home() {
  const [tier, setTier] = useState<number>(9);
  const [equipments, setEquipments] = useState<Equipment[]>(() => getInitialEquipmentState(tier));

  const handleTierChange = (newTierValue: string) => {
    const newTier = parseInt(newTierValue, 10);
    setTier(newTier);
    setEquipments(getInitialEquipmentState(newTier));
  };
  
  const handleRuneChange = useCallback((equipmentId: string, runeType: 'currentRunes' | 'idealRunes', runeIndex: number, value: string) => {
    setEquipments(prev => prev.map(eq => 
      eq.id === equipmentId 
        ? { ...eq, [runeType]: eq[runeType].map((rune, index) => index === runeIndex ? value : rune) }
        : eq
    ));
  }, []);

  const handleApplySuggestions = useCallback((equipmentId: string, suggestions: string[]) => {
    setEquipments(prev => prev.map(eq => {
      if (eq.id === equipmentId) {
        const newIdealRunes = [...eq.idealRunes];
        for (let i = 0; i < Math.min(suggestions.length, newIdealRunes.length); i++) {
          newIdealRunes[i] = suggestions[i];
        }
        return { ...eq, idealRunes: newIdealRunes };
      }
      return eq;
    }));
  }, []);
  
  const runeSlots = useMemo(() => (tier === 2 ? 2 : 3), [tier]);

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold tracking-tight">Painel de Equipamentos</h1>
          <div className="ml-auto w-full max-w-[180px]">
            <Label htmlFor="tier-select" className="mb-2 block">Tier do Set</Label>
            <Select value={String(tier)} onValueChange={handleTierChange}>
              <SelectTrigger id="tier-select">
                <SelectValue placeholder="Selecione o Tier" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 8 }, (_, i) => i + 2).map(t => (
                  <SelectItem key={t} value={String(t)}>Tier {t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {equipments.map(equipment => (
            <EquipmentCard
              key={equipment.id}
              equipment={equipment}
              tier={tier}
              onRuneChange={handleRuneChange}
              onApplySuggestions={handleApplySuggestions}
              runeSlots={runeSlots}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
