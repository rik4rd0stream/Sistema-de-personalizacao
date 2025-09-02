
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  onAuthStateChanged, 
  User, 
  signInWithEmailAndPassword, 
  signOut,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useRouter, usePathname } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

export interface UserProfile {
  uid: string;
  email: string;
  role: 'admin' | 'user';
  status: 'approved' | 'pending' | 'rejected';
  createdAt: Timestamp;
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
      if (currentUser) {
        setUser(currentUser);
        const userDocRef = doc(db, 'users', currentUser.uid);
        let userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
          const isMasterAdmin = currentUser.email === MASTER_ADMIN_EMAIL;
          const newUserProfileData = {
              uid: currentUser.uid,
              email: currentUser.email!,
              role: isMasterAdmin ? 'admin' : ('user' as const),
              status: isMasterAdmin ? ('approved' as const) : ('pending' as const),
              createdAt: serverTimestamp(),
          };
          await setDoc(userDocRef, newUserProfileData);
          userDoc = await getDoc(userDocRef);
        }

        const profile = userDoc.data() as UserProfile;
        setUserProfile(profile);
        
        if (profile.status === 'pending') {
          if (pathname !== '/aguardando-aprovacao') {
            router.push('/aguardando-aprovacao');
          }
        } else if (profile.status === 'rejected') {
          toast({ variant: "destructive", title: "Acesso Negado", description: "Sua conta foi rejeitada." });
          await signOut(auth);
        } else if (profile.status === 'approved') {
          const isAuthPage = ['/login', '/aguardando-aprovacao'].includes(pathname);
          if (isAuthPage) {
             router.push('/personagens');
          }
        }
      } else {
        setUser(null);
        setUserProfile(null);
        const protectedRoutes = ['/personagens', '/admin', '/aguardando-aprovacao', '/personagem'];
        const isProtected = protectedRoutes.some(route => pathname.startsWith(route));
        if (isProtected) {
          router.push('/login');
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  const logIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
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
      toast({
          title: 'Conta criada com sucesso!',
          description: 'Aguarde a aprovação de um administrador.',
      });
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
