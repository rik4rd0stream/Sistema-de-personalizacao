
'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
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
import { Loader2, ArrowLeft } from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { RuneSlotDialog } from '@/components/rune-slot-dialog';

export interface Equipment {
  id: string;
  name: string;
  icon: EquipmentType['icon'];
  fragments: string[];
}

export interface RuneSlotIdentifier {
  equipmentId: string;
  runeIndex: number;
}


function getInitialEquipmentState(tier: number): Equipment[] {
  const fragmentSlots = (tier === 2 ? 2 : 3) * 2;
  return EQUIPMENT_TYPES.map(eq => ({
    ...eq,
    fragments: Array(fragmentSlots).fill(''),
  }));
}

export default function CharacterRunesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const characterId = params.id as string;
  const { toast } = useToast();

  const [characterName, setCharacterName] = useState('');
  const [tier, setTier] = useState<number>(2);
  const [equipments, setEquipments] = useState<Equipment[]>(() => getInitialEquipmentState(tier));
  const [isLoading, setIsLoading] = useState(true);
  const [editingRuneSlot, setEditingRuneSlot] = useState<RuneSlotIdentifier | null>(null);

  const openRuneSlotDialog = (identifier: RuneSlotIdentifier) => {
    setEditingRuneSlot(identifier);
  };
  
  const closeRuneSlotDialog = () => {
    setEditingRuneSlot(null);
  };


  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchCharacterData = async () => {
        if (user && characterId) {
            try {
                const charDocRef = doc(db, 'users', user.uid, 'characters', characterId);
                const charDoc = await getDoc(charDocRef);

                if (charDoc.exists()) {
                    const data = charDoc.data();
                    setCharacterName(data.name);
                    // Aqui você pode carregar dados salvos do personagem no futuro
                } else {
                    toast({
                        variant: 'destructive',
                        title: 'Acesso Negado',
                        description: 'Personagem não encontrado ou você não tem permissão para acessá-lo.',
                    });
                    router.push('/personagens');
                }
            } catch (error) {
                console.error("Error fetching character data: ", error);
                 toast({
                    variant: 'destructive',
                    title: 'Erro ao carregar',
                    description: 'Não foi possível carregar os dados do personagem.',
                });
                router.push('/personagens');
            } finally {
                setIsLoading(false);
            }
        }
    };
    if (!authLoading) {
      fetchCharacterData();
    }
  }, [user, characterId, router, authLoading, toast]);


  const idealRunesForTier = useMemo(() => IDEAL_RUNES_BY_TIER[tier] || [], [tier]);
  
  const allCurrentFragments = useMemo(() => {
    return equipments.flatMap(eq => eq.fragments.map(r => r.trim().toLowerCase()).filter(r => r));
  }, [equipments]);
  
  const handleTierChange = (newTierValue: string) => {
    const newTier = parseInt(newTierValue, 10);
    setTier(newTier);
    setEquipments(getInitialEquipmentState(newTier));
  };
  
  const handleRuneChange = useCallback((equipmentId: string, runeIndex: number, fragmentIndex: number, value: string) => {
    const finalValue = value === 'EMPTY_SLOT' ? '' : value;
    const fullFragmentIndex = runeIndex * 2 + fragmentIndex;

    setEquipments(prev => prev.map(eq => 
      eq.id === equipmentId 
        ? { ...eq, fragments: eq.fragments.map((fragment, index) => index === fullFragmentIndex ? finalValue : fragment) }
        : eq
    ));
  }, []);
  
  const availableRunesForTier = useMemo(() => {
    const idealRuneNames = idealRunesForTier.map(r => r.name);
    // Ensure 'EMPTY_SLOT' is always first and available.
    return ['EMPTY_SLOT', ...Array.from(new Set(idealRuneNames)).sort()];
  }, [idealRunesForTier]);

  const currentlyEditingEquipment = useMemo(() => {
    if (!editingRuneSlot) return null;
    return equipments.find(e => e.id === editingRuneSlot.equipmentId) ?? null;
  }, [editingRuneSlot, equipments]);

  if (authLoading || isLoading) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Carregando dados do personagem...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
         <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" asChild>
                <Link href={`/personagem/${characterId}`}>
                    <ArrowLeft />
                </Link>
            </Button>
          <h1 className="text-2xl font-bold tracking-tight text-primary">
            Otimizador de Runas: <span className="text-accent">{characterName}</span>
          </h1>
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
                  idealRunesForTier={idealRunesForTier}
                  allCurrentRunes={allCurrentFragments}
                  availableRunes={availableRunesForTier}
                  openRuneSlotDialog={openRuneSlotDialog}
                />
              ))}
          </Card>

          <div className="col-span-1">
            <IdealRunesSummary
              idealRunesForTier={idealRunesForTier}
              allCurrentRunes={allCurrentFragments}
              tier={tier}
            />
          </div>
        </div>

         {editingRuneSlot && currentlyEditingEquipment && (
            <RuneSlotDialog
                isOpen={!!editingRuneSlot}
                onClose={closeRuneSlotDialog}
                equipment={currentlyEditingEquipment}
                runeIndex={editingRuneSlot.runeIndex}
                availableFragments={availableRunesForTier}
                onFragmentChange={handleRuneChange}
            />
        )}
      </main>
    </div>
  );
}
