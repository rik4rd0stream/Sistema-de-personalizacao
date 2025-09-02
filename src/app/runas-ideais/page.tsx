
'use client';
import { useState, useEffect, useCallback, ChangeEvent, FormEvent } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove, writeBatch } from 'firebase/firestore';
import { Header } from '@/components/layout/Header';
import { Loader2, PlusCircle, Trash2, Edit } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { ALL_RUNE_FRAGMENTS } from '@/lib/constants';
import { CHARACTER_CLASSES } from '@/lib/character-classes';

export interface IdealRune {
  name: string;
  count: number;
}

export default function UserRunesPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();

    const [tier, setTier] = useState<number>(2);
    const [characterClass, setCharacterClass] = useState<string>(CHARACTER_CLASSES[0]);
    const [idealRunes, setIdealRunes] = useState<IdealRune[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [newRuneName, setNewRuneName] = useState('');
    const [newRuneCount, setNewRuneCount] = useState('');

    const [editingRune, setEditingRune] = useState<IdealRune | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);
    
    const fetchIdealRunes = useCallback(async (currentTier: number, currentClass: string) => {
        if (!user || !currentClass) return;
        setIsLoading(true);
        try {
            const runesDocRef = doc(db, 'users', user.uid, 'idealRunes', currentClass, `tier${currentTier}`);
            const docSnap = await getDoc(runesDocRef);
            if (docSnap.exists()) {
                setIdealRunes(docSnap.data().runes as IdealRune[]);
            } else {
                setIdealRunes([]);
            }
        } catch (error) {
            console.error("Error fetching ideal runes:", error);
            toast({ variant: 'destructive', title: 'Erro ao buscar runas', description: 'Não foi possível carregar a lista de runas ideais.' });
        } finally {
            setIsLoading(false);
        }
    }, [user, toast]);

    useEffect(() => {
        if (user) {
            fetchIdealRunes(tier, characterClass);
        }
    }, [user, tier, characterClass, fetchIdealRunes]);


    const handleTierChange = (newTierValue: string) => {
        const newTier = parseInt(newTierValue, 10);
        setTier(newTier);
    };

    const handleClassChange = (newClass: string) => {
        setCharacterClass(newClass);
    }

    const handleAddRune = async (e: FormEvent) => {
        e.preventDefault();
        if (!user || !characterClass) return;
        
        const runeName = newRuneName;
        const runeCount = parseInt(newRuneCount, 10);

        if (!runeName || isNaN(runeCount) || runeCount <= 0) {
            toast({ variant: 'destructive', title: 'Campos inválidos', description: 'Selecione um fragmento e insira uma contagem válida.' });
            return;
        }

        setIsSubmitting(true);
        const newRune: IdealRune = { name: runeName, count: runeCount };
        
        try {
            const runesDocRef = doc(db, 'users', user.uid, 'idealRunes', characterClass, `tier${tier}`);
            const docSnap = await getDoc(runesDocRef);
            
            if (docSnap.exists()) {
                const existingRunes = docSnap.data().runes as IdealRune[];
                if (existingRunes.some(r => r.name === newRune.name)) {
                     toast({ variant: 'destructive', title: 'Fragmento já existe', description: 'Este fragmento já foi adicionado. Edite o existente se necessário.' });
                     setIsSubmitting(false);
                     return;
                }
                await updateDoc(runesDocRef, { runes: arrayUnion(newRune) });
            } else {
                await setDoc(runesDocRef, { runes: [newRune] });
            }
            
            setIdealRunes(prev => [...prev, newRune].sort((a,b) => a.name.localeCompare(b.name)));
            toast({ title: 'Runa adicionada com sucesso!' });
            setNewRuneName('');
            setNewRuneCount('');
        } catch (error) {
            console.error("Error adding rune:", error);
            toast({ variant: 'destructive', title: 'Erro ao adicionar runa' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRemoveRune = async (runeToRemove: IdealRune) => {
        if (!user || !characterClass || !confirm(`Tem certeza que deseja remover a runa "${runeToRemove.name}"?`)) return;

        setIsSubmitting(true);
        try {
            const runesDocRef = doc(db, 'users', user.uid, 'idealRunes', characterClass, `tier${tier}`);
            const docSnap = await getDoc(runesDocRef);
            if (docSnap.exists()) {
                 const existingRunes = docSnap.data().runes as IdealRune[];
                 const runeInDb = existingRunes.find(r => r.name === runeToRemove.name && r.count === runeToRemove.count);
                if (runeInDb) {
                     await updateDoc(runesDocRef, { runes: arrayRemove(runeInDb) });
                     setIdealRunes(prev => prev.filter(r => r.name !== runeToRemove.name || r.count !== runeToRemove.count));
                     toast({ title: 'Runa removida com sucesso!' });
                }
            }
        } catch (error) {
            console.error("Error removing rune:", error);
            toast({ variant: 'destructive', title: 'Erro ao remover runa' });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleUpdateRune = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!editingRune || !user || !characterClass) return;

        const form = e.currentTarget;
        const newName = (form.elements.namedItem('editRuneName') as HTMLInputElement).value.trim();
        const newCount = parseInt((form.elements.namedItem('editRuneCount') as HTMLInputElement).value, 10);
        
        if (!newName || isNaN(newCount) || newCount <= 0) {
            toast({ variant: 'destructive', title: 'Campos inválidos' });
            return;
        }
        
        setIsSubmitting(true);
        const updatedRune = { name: newName, count: newCount };
        
        try {
            const runesDocRef = doc(db, 'users', user.uid, 'idealRunes', characterClass, `tier${tier}`);
            const docSnap = await getDoc(runesDocRef);

            if (!docSnap.exists()) {
                throw new Error("Document does not exist to update.");
            }
            
            const existingRunes = docSnap.data().runes as IdealRune[];
            const oldRune = existingRunes.find(r => r.name === editingRune.name);

            if (!oldRune) {
                throw new Error("Rune to update not found in database.");
            }

            const newRunes = existingRunes.map(r => r.name === editingRune.name ? updatedRune : r);
            await setDoc(runesDocRef, { runes: newRunes });
            setIdealRunes(newRunes.sort((a,b) => a.name.localeCompare(b.name)));
            
            toast({ title: 'Runa atualizada com sucesso!' });
            setIsEditModalOpen(false);
            setEditingRune(null);

        } catch(error) {
             console.error("Error updating rune:", error);
            toast({ variant: 'destructive', title: 'Erro ao atualizar runa' });
        } finally {
            setIsSubmitting(false);
        }
    }

    if (authLoading) {
        return (
            <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="mt-4 text-muted-foreground">Carregando...</p>
            </div>
        );
    }
    
    return (
        <div className="flex min-h-screen w-full flex-col bg-secondary/30">
            <Header />
            <main className="flex-1 p-4 md:p-8">
                <div className="mx-auto max-w-4xl">
                     <div className="mb-6 flex items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-primary">Gerenciar Minhas Runas Ideais</h1>
                            <p className="text-muted-foreground">Adicione os fragmentos ideais para cada classe e tier.</p>
                        </div>
                         <div className="ml-auto flex items-end gap-4">
                            <div className="w-full max-w-[180px]">
                              <Label htmlFor="class-select" className="mb-2 block text-muted-foreground">Classe</Label>
                              <Select value={characterClass} onValueChange={handleClassChange}>
                                <SelectTrigger id="class-select">
                                  <SelectValue placeholder="Selecione a Classe" />
                                </SelectTrigger>
                                <SelectContent>
                                  {CHARACTER_CLASSES.map(c => (
                                    <SelectItem key={c} value={c}>{c}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
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
                        </div>
                    </div>

                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><PlusCircle/> Adicionar Novo Fragmento</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleAddRune} className="flex items-end gap-4">
                                <div className="flex-grow space-y-2">
                                    <Label htmlFor="runeName">Nome do Fragmento</Label>
                                    <Select 
                                        value={newRuneName} 
                                        onValueChange={setNewRuneName}
                                        disabled={isSubmitting}
                                    >
                                        <SelectTrigger id="runeName">
                                            <SelectValue placeholder="Selecione o fragmento" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {ALL_RUNE_FRAGMENTS.map(fragment => (
                                                <SelectItem key={fragment} value={fragment}>
                                                    {fragment}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="runeCount">Contagem</Label>
                                    <Input 
                                        id="runeCount" 
                                        name="runeCount" 
                                        type="text" 
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        placeholder="Ex: 14" 
                                        required 
                                        disabled={isSubmitting} 
                                        className="w-24"
                                        value={newRuneCount}
                                        onChange={(e: ChangeEvent<HTMLInputElement>) => setNewRuneCount(e.target.value.replace(/[^0-9]/g, ''))}
                                    />
                                </div>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? <Loader2 className="animate-spin" /> : "Adicionar"}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Lista de Fragmentos para {characterClass} - Tier {tier}</CardTitle>
                        </CardHeader>
                        <CardContent>
                             {isLoading ? (
                                <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>
                             ) : idealRunes.length > 0 ? (
                                <ul className="space-y-2">
                                    {idealRunes.sort((a, b) => a.name.localeCompare(b.name)).map(rune => (
                                        <li key={rune.name} className="flex items-center justify-between rounded-md border p-3 bg-background">
                                            <div>
                                                <p className="font-semibold">{rune.name}</p>
                                                <p className="text-sm text-muted-foreground">Contagem necessária: {rune.count}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button variant="ghost" size="icon" disabled={isSubmitting} onClick={() => { setEditingRune(rune); setIsEditModalOpen(true);}}>
                                                    <Edit className="h-4 w-4"/>
                                                </Button>
                                                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" disabled={isSubmitting} onClick={() => handleRemoveRune(rune)}>
                                                    <Trash2 className="h-4 w-4"/>
                                                </Button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                             ) : (
                                <div className="flex items-center justify-center p-8 border-dashed border rounded-md">
                                    <p className="text-muted-foreground">Nenhum fragmento ideal cadastrado para esta classe e tier.</p>
                                </div>
                             )}
                        </CardContent>
                    </Card>
                </div>
            </main>

            {editingRune && (
                 <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Editar Runa Ideal</DialogTitle>
                            <DialogDescription>
                                Altere a contagem necessária para este fragmento.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleUpdateRune}>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="editRuneName">Nome do Fragmento</Label>
                                    <Input id="editRuneName" name="editRuneName" defaultValue={editingRune.name} required disabled/>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="editRuneCount">Contagem</Label>
                                    <Input 
                                      id="editRuneCount" 
                                      name="editRuneCount" 
                                      type="text" 
                                      inputMode="numeric"
                                      pattern="[0-9]*"
                                      defaultValue={editingRune.count} 
                                      required
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button type="button" variant="outline">Cancelar</Button>
                                </DialogClose>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? <Loader2 className="animate-spin" /> : "Salvar Alterações"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    )
}
