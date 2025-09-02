
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Loader2, ArrowLeft, Gem, Swords, Shield, ChevronRight } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function CharacterHubPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const characterId = params.id as string;
  const { toast } = useToast();

  const [characterName, setCharacterName] = useState('');
  const [isLoading, setIsLoading] = useState(true);

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

  const handleComingSoon = () => {
    toast({
        title: 'Em construção',
        description: 'Esta funcionalidade será implementada em breve.',
    });
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Carregando dados do personagem...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-secondary/30">
      <Header />
      <main className="flex-1 p-4 md:p-8">
        <div className="mx-auto max-w-4xl">
            <div className="mb-6 flex items-center gap-4">
                <Button variant="outline" size="icon" asChild>
                    <Link href="/personagens">
                        <ArrowLeft />
                    </Link>
                </Button>
                <div>
                    <h2 className="text-sm text-muted-foreground">Personagem</h2>
                    <h1 className="text-3xl font-bold tracking-tight text-primary">{characterName}</h1>
                </div>
            </div>
            
            <div className="space-y-4">
                <h2 className="text-2xl font-bold tracking-tight">Selecione uma opção</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Link href={`/personagem/${characterId}/runas`} legacyBehavior>
                        <a className="block">
                            <Card className="hover:bg-primary/10 hover:border-primary transition-colors cursor-pointer h-full">
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <Gem className="h-8 w-8 text-accent"/>
                                        <div>
                                            <CardTitle>Otimizador de Runas</CardTitle>
                                            <CardDescription>
                                                Gerencie as runas do seu equipamento.
                                            </CardDescription>
                                        </div>
                                    </div>
                                    <ChevronRight className="h-6 w-6 text-muted-foreground"/>
                                </CardHeader>
                            </Card>
                        </a>
                    </Link>
                    <Card onClick={handleComingSoon} className="hover:bg-primary/10 hover:border-primary transition-colors cursor-pointer h-full">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Swords className="h-8 w-8 text-accent"/>
                                <div>
                                    <CardTitle>Conjunto</CardTitle>
                                    <CardDescription>
                                        Configure seu conjunto de itens.
                                    </CardDescription>
                                </div>
                            </div>
                            <ChevronRight className="h-6 w-6 text-muted-foreground"/>
                        </CardHeader>
                    </Card>
                     <Card onClick={handleComingSoon} className="hover:bg-primary/10 hover:border-primary transition-colors cursor-pointer h-full">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Shield className="h-8 w-8 text-accent"/>
                                <div>
                                    <CardTitle>Cruzada</CardTitle>
                                    <CardDescription>
                                        Gerencie sua build para a cruzada.
                                    </CardDescription>
                                </div>
                            </div>
                            <ChevronRight className="h-6 w-6 text-muted-foreground"/>
                        </CardHeader>
                    </Card>
                </div>
            </div>
        </div>
      </main>
    </div>
  );
}
