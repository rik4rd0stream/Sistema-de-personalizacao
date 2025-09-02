'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { EQUIPMENT_TYPES } from '@/lib/constants';
import type { EquipmentType } from '@/lib/constants';
import { EquipmentCard } from '@/components/equipment-card';
import { IDEAL_RUNES_BY_TIER } from '@/lib/runes';
import { IdealRunesSummary } from '@/components/ideal-runes-summary';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth-context';
import { Loader2 } from 'lucide-react';

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
  const { user, loading } = useAuth();
  const router = useRouter();
  const [tier, setTier] = useState<number>(9);
  const [equipments, setEquipments] = useState<Equipment[]>(() => getInitialEquipmentState(tier));

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

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

  if (loading || !user) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold tracking-tight text-primary">Painel de Equipamentos</h1>
          <div className="ml-auto w-full max-w-[180px]">
            <Label htmlFor="tier-select" className="mb-2 block text-muted-foreground">Tier do Set</Label>
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

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <Card className="col-span-1 space-y-4 p-4 lg:col-span-2 bg-secondary/30 border-secondary">
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
          </Card>

          <div className="col-span-1">
            <IdealRunesSummary
              idealRunesForTier={idealRunesForTier}
              allCurrentRunes={allCurrentRunes}
              tier={tier}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
