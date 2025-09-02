
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  onAuthStateChanged, 
  User, 
  signInWithEmailAndPassword, 
  signOut,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useRouter, usePathname } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

export interface UserProfile {
  uid: string;
  email: string;
  role: 'admin' | 'user';
  status: 'approved' | 'pending' | 'rejected';
  createdAt: any;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  logIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  logOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  const MASTER_ADMIN_EMAIL = "rik4rd0stream@gmail.com";

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true);
      setUser(currentUser);
      if (currentUser) {
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const profile = userDoc.data() as UserProfile;
          setUserProfile(profile);

          if (profile.status === 'pending') {
            if (pathname !== '/aguardando-aprovacao') {
               router.push('/aguardando-aprovacao');
            }
          } else if (profile.status === 'rejected') {
            await signOut(auth);
            toast({ variant: "destructive", title: "Acesso Negado", description: "Sua conta foi rejeitada." });
          } else if (profile.status === 'approved') {
             const publicRoutes = ['/aguardando-aprovacao', '/login'];
             if (publicRoutes.includes(pathname)) {
               router.push('/personagens');
            }
          }

        } else {
            // This case might happen if user is created in Auth but not in Firestore, e.g. manual deletion.
            // We should log them out to avoid an inconsistent state.
            await signOut(auth);
            setUserProfile(null);
        }
      } else {
        setUserProfile(null);
        const protectedRoutes = ['/personagens', '/admin', '/aguardando-aprovacao'];
        if (protectedRoutes.some(route => pathname.startsWith(route))) {
          router.push('/login');
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router, pathname, toast]);

  const logIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // The onAuthStateChanged listener will handle redirection.
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
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newUser = userCredential.user;

      const isMasterAdmin = newUser.email === MASTER_ADMIN_EMAIL;

      const newUserProfile: Omit<UserProfile, 'createdAt'> = {
          uid: newUser.uid,
          email: newUser.email!,
          role: isMasterAdmin ? 'admin' : 'user',
          status: isMasterAdmin ? 'approved' : 'pending',
      };

      await setDoc(doc(db, "users", newUser.uid), {
          ...newUserProfile,
          createdAt: serverTimestamp(),
      });
      
      if (!isMasterAdmin) {
          await signOut(auth);
          toast({
            title: 'Cadastro enviado!',
            description: 'Sua conta foi criada e está aguardando aprovação de um administrador.',
          });
      } else {
        toast({
            title: 'Conta de Administrador criada!',
            description: 'Login realizado com sucesso.',
        });
      }
      
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
    userProfile,
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
