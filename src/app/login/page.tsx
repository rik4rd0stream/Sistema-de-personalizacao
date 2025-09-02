
'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Gem, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const { user, loading, userProfile, logIn, signUp } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  // O useEffect que estava aqui foi removido para centralizar a lógica no AuthContext.

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        variant: 'destructive',
        title: 'Campos obrigatórios',
        description: 'Por favor, preencha o e-mail e a senha.',
      });
      return;
    }
    setIsSubmitting(true);
    try {
      if (isSignUp) {
        await signUp(email, password);
        // Não é mais necessário setar `isSignUp` para false, o contexto irá redirecionar ou exibir a tela de aprovação.
      } else {
        await logIn(email, password);
      }
    } catch (error: any) {
      // As mensagens de erro já são tratadas no auth-context
    } finally {
      setIsSubmitting(false);
    }
  };

  // Se o contexto ainda está carregando ou se o usuário já está logado, mostramos um loader.
  // O AuthContext será responsável por redirecionar para a página correta.
  if (loading || (user && userProfile)) {
     return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-secondary/30 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Gem className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-2xl">{isSignUp ? 'Criar Conta' : 'Personalização de Personagem'}</CardTitle>
          <CardDescription>
            {isSignUp ? 'Crie sua conta para começar a gerenciar.' : 'Faça login para gerenciar seus equipamentos.'}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (isSignUp ? 'Criar conta' : 'Entrar')}
            </Button>
             <Button variant="link" type="button" onClick={() => setIsSignUp(!isSignUp)} disabled={isSubmitting}>
              {isSignUp ? 'Já tem uma conta? Faça login' : 'Não tem uma conta? Crie uma'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
