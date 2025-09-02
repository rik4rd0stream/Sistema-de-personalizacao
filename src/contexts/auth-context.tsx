'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  onAuthStateChanged, 
  User, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut 
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

// --- INSTRUÇÃO IMPORTANTE ---
// Adicione aqui os e-mails dos usuários que terão permissão para CRIAR UMA CONTA.
// Somente os e-mails nesta lista poderão se cadastrar.
const ALLOWED_EMAILS = [
  'seu-email-aqui@gmail.com' 
];

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
      if (currentUser) {
        router.push('/');
      }
    });
    return () => unsubscribe();
  }, [router]);

  const signUp = async (email: string, password: string) => {
    if (!ALLOWED_EMAILS.includes(email)) {
      toast({
        variant: "destructive",
        title: "Cadastro não permitido",
        description: "Este e-mail não tem permissão para se cadastrar.",
      });
      throw new Error("Unauthorized email for signup");
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      let title = "Erro ao Criar Conta";
      let description = "Ocorreu um problema durante o cadastro. Tente novamente.";

      if (error.code === 'auth/email-already-in-use') {
        title = "E-mail já cadastrado";
        description = "Este e-mail já está sendo utilizado. Tente fazer login.";
      } else if (error.code === 'auth/weak-password') {
        title = "Senha Fraca";
        description = "A senha deve ter pelo menos 6 caracteres.";
      }
      
      toast({ variant: "destructive", title, description });
      throw error;
    }
  };

  const logIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/');
    } catch (error: any) {
       toast({
          variant: "destructive",
          title: "Erro de Login",
          description: "E-mail ou senha inválidos. Verifique suas credenciais.",
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
