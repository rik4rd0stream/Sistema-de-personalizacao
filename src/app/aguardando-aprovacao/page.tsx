
'use client';

import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Mail } from 'lucide-react';

export default function PendingApprovalPage() {
  const { user, logOut } = useAuth();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-secondary/30 p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Clock className="h-10 w-10" />
          </div>
          <CardTitle className="mt-4 text-2xl">Aguardando Aprovação</CardTitle>
          <CardDescription>
            Sua conta foi criada com sucesso e está pendente de aprovação por um administrador.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Você será notificado por e-mail quando sua conta for aprovada.
          </p>
          <div className="rounded-md bg-secondary p-3">
            <p className="text-sm font-semibold text-foreground">Seu e-mail:</p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
          <p className="text-xs text-muted-foreground">
            Se a aprovação demorar muito, entre em contato com o suporte.
          </p>
        </CardContent>
        <div className="p-6 pt-0">
           <Button onClick={logOut} className="w-full">
            Sair
          </Button>
        </div>
      </Card>
    </div>
  );
}
