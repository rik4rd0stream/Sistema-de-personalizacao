'use client';

import { useState, useCallback, useMemo } from 'react';
import { Header } from '@/components/layout/Header';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { EQUIPMENT_TYPES } from '@/lib/constants';
import type { EquipmentType } from '@/lib/constants';
import { EquipmentCard } from '@/components/equipment-card';
import { IDEAL_RUNES_BY_TIER } from '@/lib/runes';
import { IdealRunesSummary } from '@/components/ideal-runes-summary';

export interface Equipment {
  id: string;
  name: string;
  icon: EquipmentType['icon'];
  currentRunes: string[];
}

function getInitialEquipmentState(tier: number): Equipment[] {
  const runeSlots = tier === 2 ? 2 : 3;
  return EQUIPMENT_TYPES.map(eq => ({
    ...eq,
    currentRunes: Array(runeSlots).fill(''),
  }));
}

export default function Home() {
  const [tier, setTier] = useState<number>(9);
  const [equipments, setEquipments] = useState<Equipment[]>(() => getInitialEquipmentState(tier));

  const idealRunesForTier = useMemo(() => IDEAL_RUNES_BY_TIER[tier] || [], [tier]);
  
  const allCurrentRunes = useMemo(() => {
    return equipments.flatMap(eq => eq.currentRunes.map(r => r.trim().toLowerCase()).filter(r => r));
  }, [equipments]);
  
  const handleTierChange = (newTierValue: string) => {
    const newTier = parseInt(newTierValue, 10);
    setTier(newTier);
    setEquipments(getInitialEquipmentState(newTier));
  };
  
  const handleRuneChange = useCallback((equipmentId: string, runeIndex: number, value: string) => {
    const finalValue = value === 'EMPTY_SLOT' ? '' : value;
    setEquipments(prev => prev.map(eq => 
      eq.id === equipmentId 
        ? { ...eq, currentRunes: eq.currentRunes.map((rune, index) => index === runeIndex ? finalValue : rune) }
        : eq
    ));
  }, []);
  
  const runeSlots = useMemo(() => (tier === 2 ? 2 : 3), [tier]);
  const availableRunesForTier = useMemo(() => {
    const idealRuneNames = idealRunesForTier.map(r => r.name);
    return ['EMPTY_SLOT', ...new Set(idealRuneNames)].sort();
  }, [idealRunesForTier]);

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

        <IdealRunesSummary
          idealRunesForTier={idealRunesForTier}
          allCurrentRunes={allCurrentRunes}
          tier={tier}
        />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {equipments.map(equipment => (
            <EquipmentCard
              key={equipment.id}
              equipment={equipment}
              tier={tier}
              onRuneChange={handleRuneChange}
              runeSlots={runeSlots}
              idealRunesForTier={idealRunesForTier}
              allCurrentRunes={allCurrentRunes}
              availableRunes={availableRunesForTier}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
