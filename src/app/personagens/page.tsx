
'use client';
import { useState, useEffect, FormEvent } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, getDocs, Timestamp, doc } from 'firebase/firestore';
import { Header } from '@/components/layout/Header';
import { Loader2, UserPlus, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface Character {
    id: string;
    name: string;
    characterClass: string;
    createdAt: Timestamp;
}

const CHARACTER_CLASSES = ["ELFA ENE", "Elfa AGI", "DW ENE", "DW AGI", "DK ENE", "DK STR", "DL ENE", "DL STR"];


export default function CharactersPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();

    const [characters, setCharacters] = useState<Character[]>([]);
    const [characterName, setCharacterName] = useState('');
    const [characterClass, setCharacterClass] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        if (user) {
            const fetchCharacters = async () => {
                try {
                    const charactersCollectionRef = collection(db, 'users', user.uid, 'characters');
                    const q = query(charactersCollectionRef);
                    const querySnapshot = await getDocs(q);
                    const chars = querySnapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    } as Character)).sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
                    setCharacters(chars);
                } catch (error) {
                    console.error("Error fetching characters:", error);
                    toast({
                        variant: 'destructive',
                        title: 'Erro ao buscar personagens',
                        description: 'Não foi possível carregar a lista de personagens.',
                    });
                } finally {
                    setIsLoading(false);
                }
            };
            fetchCharacters();
        }
    }, [user, toast]);

    const handleCreateCharacter = async (e: FormEvent) => {
        e.preventDefault();
        if (!characterName.trim() || !characterClass || !user) {
            toast({
                variant: 'destructive',
                title: 'Campos inválidos',
                description: 'Por favor, insira um nome e selecione uma classe para o personagem.',
            });
            return;
        }

        setIsCreating(true);
        try {
            const charactersCollectionRef = collection(db, 'users', user.uid, 'characters');
            const docRef = await addDoc(charactersCollectionRef, {
                name: characterName.trim(),
                characterClass: characterClass,
                createdAt: Timestamp.now()
            });

            const newChar = { id: docRef.id, name: characterName.trim(), characterClass, createdAt: Timestamp.now() };
            setCharacters(prev => [newChar, ...prev]);
            setCharacterName('');
            setCharacterClass('');
             toast({
                title: 'Personagem criado com sucesso!',
             });

        } catch (error) {
            console.error("Error creating character:", error);
            toast({
                variant: 'destructive',
                title: 'Erro ao criar personagem',
                description: 'Não foi possível criar o personagem. Verifique as regras do Firestore.',
            });
        } finally {
            setIsCreating(false);
        }
    };

    if (authLoading || isLoading) {
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
                    <h1 className="text-3xl font-bold tracking-tight text-primary mb-6">Meus Personagens</h1>

                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <UserPlus />
                                Criar Novo Personagem
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                             <form onSubmit={handleCreateCharacter} className="flex flex-col sm:flex-row items-center gap-4">
                                <Input
                                    placeholder="Nome do Personagem"
                                    value={characterName}
                                    onChange={(e) => setCharacterName(e.target.value)}
                                    disabled={isCreating}
                                    className="flex-grow"
                                />
                                 <Select value={characterClass} onValueChange={setCharacterClass} disabled={isCreating}>
                                    <SelectTrigger className="w-full sm:w-[180px]">
                                        <SelectValue placeholder="Selecione a classe" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {CHARACTER_CLASSES.map(c => (
                                            <SelectItem key={c} value={c}>{c}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Button type="submit" disabled={isCreating} className="w-full sm:w-auto">
                                    {isCreating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Criar Personagem'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    <div className="space-y-4">
                       <h2 className="text-2xl font-bold tracking-tight">Selecione um Personagem</h2>
                       {characters.length > 0 ? (
                           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                               {characters.map(char => (
                                   <Link href={`/personagem/${char.id}`} key={char.id} legacyBehavior>
                                        <a className="block">
                                            <Card className="hover:bg-primary/10 hover:border-primary transition-colors cursor-pointer">
                                                <CardHeader className="flex flex-row items-center justify-between">
                                                    <div>
                                                        <CardTitle>{char.name}</CardTitle>
                                                        <CardDescription>
                                                           <Badge variant="secondary" className="mt-2">{char.characterClass}</Badge>
                                                        </CardDescription>
                                                    </div>
                                                    <ChevronRight className="h-6 w-6 text-muted-foreground"/>
                                                </CardHeader>
                                            </Card>
                                        </a>
                                   </Link>
                               ))}
                           </div>
                       ) : (
                           <Card className="flex items-center justify-center p-8 border-dashed">
                               <p className="text-muted-foreground">Você ainda não tem nenhum personagem. Crie um acima para começar!</p>
                           </Card>
                       )}
                    </div>
                </div>
            </main>
        </div>
    )
}
