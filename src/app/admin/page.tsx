
'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { Header } from '@/components/layout/Header';
import { Loader2, ShieldCheck, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { UserProfile } from '@/contexts/auth-context';

export default function AdminPage() {
    const { user, userProfile, loading: authLoading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();

    const [pendingUsers, setPendingUsers] = useState<UserProfile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState<string | null>(null);

    useEffect(() => {
        if (!authLoading) {
            if (!user || userProfile?.role !== 'admin') {
                toast({ variant: 'destructive', title: 'Acesso Negado', description: 'Você não tem permissão para acessar esta página.' });
                router.push('/personagens');
            }
        }
    }, [user, userProfile, authLoading, router, toast]);

    useEffect(() => {
        if (userProfile?.role === 'admin') {
            const fetchPendingUsers = async () => {
                setIsLoading(true);
                try {
                    const usersCollectionRef = collection(db, 'users');
                    const q = query(usersCollectionRef, where('status', '==', 'pending'));
                    const querySnapshot = await getDocs(q);
                    const users = querySnapshot.docs.map(doc => ({ ...doc.data(), uid: doc.id } as UserProfile));
                    setPendingUsers(users);
                } catch (error) {
                    console.error("Error fetching pending users. Firestore index might be missing.", error);
                     toast({
                        variant: 'destructive',
                        title: 'Erro de Índice',
                        description: 'Verifique o console para o link de criação de índice do Firestore.',
                    });
                } finally {
                    setIsLoading(false);
                }
            };
            fetchPendingUsers();
        }
    }, [userProfile, toast]);
    
    const handleUpdateStatus = async (uid: string, status: 'approved' | 'rejected') => {
        setIsUpdating(uid);
        try {
            const userDocRef = doc(db, 'users', uid);
            await updateDoc(userDocRef, { status });
            setPendingUsers(prev => prev.filter(u => u.uid !== uid));
            toast({
                title: 'Usuário atualizado!',
                description: `O status do usuário foi alterado para ${status}.`,
            });
        } catch (error) {
            console.error("Error updating user status:", error);
            toast({
                variant: 'destructive',
                title: 'Erro ao atualizar',
                description: 'Não foi possível atualizar o status do usuário.',
            });
        } finally {
            setIsUpdating(null);
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
                    <div className="mb-6 flex items-center gap-3">
                        <ShieldCheck className="h-8 w-8 text-primary"/>
                        <h1 className="text-3xl font-bold tracking-tight text-primary">Painel do Administrador</h1>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Usuários Pendentes de Aprovação</CardTitle>
                            <CardDescription>Aprove ou rejeite os novos cadastros no sistema.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {pendingUsers.length > 0 ? (
                               <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Email</TableHead>
                                            <TableHead>Data de Cadastro</TableHead>
                                            <TableHead className="text-right">Ações</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {pendingUsers.map(pUser => (
                                            <TableRow key={pUser.uid}>
                                                <TableCell className="font-medium">{pUser.email}</TableCell>
                                                <TableCell>{pUser.createdAt?.toDate().toLocaleDateString()}</TableCell>
                                                <TableCell className="text-right space-x-2">
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        onClick={() => handleUpdateStatus(pUser.uid, 'approved')}
                                                        disabled={!!isUpdating}
                                                    >
                                                        {isUpdating === pUser.uid ? <Loader2 className="animate-spin" /> : <CheckCircle className="text-green-500"/>}
                                                    </Button>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        onClick={() => handleUpdateStatus(pUser.uid, 'rejected')}
                                                        disabled={!!isUpdating}
                                                    >
                                                        {isUpdating === pUser.uid ? <Loader2 className="animate-spin" /> : <XCircle className="text-red-500"/>}
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <div className="flex items-center justify-center p-8 border-dashed border rounded-md">
                                    <p className="text-muted-foreground">Nenhum usuário aguardando aprovação.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    )
}
