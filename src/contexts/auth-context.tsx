
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  onAuthStateChanged, 
  User, 
  signInWithEmailAndPassword, 
  signOut,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
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
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/personagens');
    } catch (error: any) {
       toast({
          variant: "destructive",
          title: "Erro de Login",
          description: "E-mail ou senha inválidos. Verifique suas credenciais.",
        });
       throw error;
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      // No redirect here, user will be redirected via onAuthStateChanged
    } catch (error: any) {
        let description = "Ocorreu um erro ao criar a conta.";
        if (error.code === 'auth/email-already-in-use') {
            description = "Este e-mail já está sendo utilizado.";
        } else if (error.code === 'auth/weak-password') {
            description = "A senha é muito fraca. Use pelo menos 6 caracteres.";
        }
        toast({
            variant: "destructive",
            title: "Erro ao Criar Conta",
            description: description,
        });
        throw error;
    }
  };

  const logOut = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error("Erro ao fazer logout", error);
       toast({
          variant: "destructive",
          title: "Erro",
          description: "Ocorreu um erro ao tentar fazer logout.",
        });
    }
  };

  const value = {
    user,
    loading,
    logIn,
    signUp,
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
