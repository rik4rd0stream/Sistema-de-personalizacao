'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

// --- INSTRUÇÃO IMPORTANTE ---
// Adicione aqui os e-mails dos usuários que terão permissão para acessar a aplicação.
// Somente os e-mails nesta lista poderão fazer login.
const ALLOWED_EMAILS = [
  'seu-email-aqui@gmail.com' 
];

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logIn: () => Promise<void>;
  logOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      // Se um usuário estiver logado, verifique se ele está na lista de permissões
      if (currentUser && !ALLOWED_EMAILS.includes(currentUser.email || '')) {
        signOut(auth); // Desconecta se não estiver na lista
        setUser(null);
      } else {
        setUser(currentUser);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const logIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const userEmail = result.user.email;

      if (userEmail && ALLOWED_EMAILS.includes(userEmail)) {
        router.push('/');
      } else {
        // Se o usuário não estiver na lista, desconecte-o e mostre um erro
        await signOut(auth);
        toast({
          variant: "destructive",
          title: "Acesso Negado",
          description: "Você não tem permissão para acessar esta aplicação.",
        });
      }
    } catch (error) {
      console.error("Erro ao fazer login com o Google", error);
       toast({
          variant: "destructive",
          title: "Erro de Login",
          description: "Ocorreu um problema durante a autenticação. Tente novamente.",
        });
    }
  };

  const logOut = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error("Erro ao fazer logout", error);
    }
  };

  const value = {
    user,
    loading,
    logIn,
    logOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}
