
'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { EQUIPMENT_TYPES } from '@/lib/constants';
import type { EquipmentType } from '@/lib/constants';
import { EquipmentCard } from '@/components/equipment-card';
import { CurrentRunesSummary } from '@/components/current-runes-summary';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth-context';
import { Loader2, ArrowLeft } from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { RuneSlotDialog } from '@/components/rune-slot-dialog';
import { FRAGMENTS_BY_TIER } from '@/lib/fragments-by-tier';

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
  const fragmentSlots = (tier >= 3 ? 3 : 2) * 2;
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
  const [characterClass, setCharacterClass] = useState('');
  const [tier, setTier] = useState<number>(2);
  const [equipments, setEquipments] = useState<Equipment[]>(() => getInitialEquipmentState(2));
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

  const fetchCharacterData = useCallback(async () => {
    if (user && characterId) {
        setIsLoading(true);
        try {
            const charDocRef = doc(db, 'users', user.uid, 'characters', characterId);
            const charDoc = await getDoc(charDocRef);

            if (charDoc.exists()) {
                const data = charDoc.data();
                setCharacterName(data.name);
                setCharacterClass(data.characterClass);
                
                const savedRunesDocRef = doc(db, 'users', user.uid, 'characters', characterId, 'runes', 'config');
                const savedRunes = await getDoc(savedRunesDocRef);

                let initialTier = 2;
                if (savedRunes.exists()) {
                  const runesData = savedRunes.data();
                  initialTier = runesData.tier || 2;
                  setTier(initialTier);
                  // Re-hydrate equipment with icons
                  const savedEquipments = runesData.equipments || [];
                  const hydratedEquipments = EQUIPMENT_TYPES.map(eqType => {
                      const savedEq = savedEquipments.find((s: Equipment) => s.id === eqType.id);
                      return savedEq ? { ...eqType, fragments: savedEq.fragments } : getInitialEquipmentState(initialTier).find(i => i.id === eqType.id)!;
                  });
                  setEquipments(hydratedEquipments);
                } else {
                  setTier(2);
                  setEquipments(getInitialEquipmentState(2));
                }
            } else {
                toast({
                    variant: 'destructive',
                    title: 'Acesso Negado',
                    description: 'Personagem não encontrado.',
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
  }, [user, characterId, router, toast]);

  useEffect(() => {
    if (!authLoading && user) {
      fetchCharacterData();
    }
  }, [user, authLoading, fetchCharacterData]);

  
  const allCurrentFragments = useMemo(() => {
    return equipments.flatMap(eq => eq.fragments.map(r => r.trim().toLowerCase()).filter(r => r));
  }, [equipments]);
  
  const handleTierChange = async (newTierValue: string) => {
    const newTier = parseInt(newTierValue, 10);
    setTier(newTier);
    
    // We only reset equipments if we don't find a saved config for that tier.
    // The useEffect listening on `tier` will handle fetching the appropriate runes.
    if (user && characterId) {
        try {
            const savedRunesDocRef = doc(db, 'users', user.uid, 'characters', characterId, 'runes', 'config');
            const savedRunes = await getDoc(savedRunesDocRef);
            if (savedRunes.exists() && savedRunes.data().tier === newTier) {
                const savedEquipments = savedRunes.data().equipments;
                const hydratedEquipments = EQUIPMENT_TYPES.map(eqType => {
                    const savedEq = savedEquipments.find((s: Equipment) => s.id === eqType.id);
                    return savedEq ? { ...eqType, fragments: savedEq.fragments } : getInitialEquipmentState(newTier).find(i => i.id === eqType.id)!;
                });
                setEquipments(hydratedEquipments);
            } else {
                // If no config for the new tier, or no config at all, reset.
                setEquipments(getInitialEquipmentState(newTier));
            }
        } catch (error) {
             console.error("Error fetching runes on tier change: ", error);
             // Fallback to initial state on error
             setEquipments(getInitialEquipmentState(newTier));
        }
    }
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

  const handleSave = useCallback(async () => {
    if (!user || !characterId) return;

    // Create a deep copy of equipments and remove non-serializable 'icon' property
    const equipmentsToSave = equipments.map(({ icon, ...rest }) => rest);

    try {
      const runesDocRef = doc(db, 'users', user.uid, 'characters', characterId, 'runes', 'config');
      await setDoc(runesDocRef, {
        tier,
        equipments: equipmentsToSave
      }, { merge: true });
      toast({ title: 'Progresso Salvo!', description: 'Suas runas foram salvas com sucesso.' });
    } catch (error) {
      console.error("Error saving data: ", error);
      toast({ variant: 'destructive', title: 'Erro ao Salvar', description: 'Não foi possível salvar seu progresso.' });
    }
  }, [user, characterId, tier, equipments, toast]);
  
  const availableRunesForDialog = useMemo(() => {
    const tierRunes = FRAGMENTS_BY_TIER[tier as keyof typeof FRAGMENTS_BY_TIER] || [];
    const fragmentNames = tierRunes.map(rune => rune.name);
    return ['EMPTY_SLOT', ...[...new Set(fragmentNames)].sort((a, b) => a.localeCompare(b))];
  }, [tier]);

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
          <div className="ml-auto flex items-center gap-4">
            <div className="w-full max-w-[180px]">
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
            <Button onClick={handleSave} className="self-end">Salvar</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <Card className="col-span-1 space-y-4 p-4 lg:col-span-2 bg-secondary/30 border-secondary">
              {equipments.map(equipment => (
                <EquipmentCard
                  key={equipment.id}
                  equipment={equipment}
                  tier={tier}
                  openRuneSlotDialog={openRuneSlotDialog}
                />
              ))}
          </Card>

          <div className="col-span-1">
            <CurrentRunesSummary
              allCurrentRunes={allCurrentFragments}
              tier={tier}
              characterClass={characterClass}
            />
          </div>
        </div>

         {editingRuneSlot && currentlyEditingEquipment && (
            <RuneSlotDialog
                isOpen={!!editingRuneSlot}
                onClose={closeRuneSlotDialog}
                equipment={currentlyEditingEquipment}
                runeIndex={editingRuneSlot.runeIndex}
                availableFragments={availableRunesForDialog}
                onFragmentChange={handleRuneChange}
            />
        )}
      </main>
    </div>
  );
}
