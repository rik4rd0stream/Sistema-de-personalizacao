
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
      if (currentUser) {
        setUser(currentUser);
        // Fetch user profile from Firestore
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const profile = userDoc.data() as UserProfile;
          setUserProfile(profile);
          
          // --- Redirection Logic ---
          if (profile.status === 'pending') {
            if (pathname !== '/aguardando-aprovacao') {
              router.push('/aguardando-aprovacao');
            }
          } else if (profile.status === 'rejected') {
            toast({ variant: "destructive", title: "Acesso Negado", description: "Sua conta foi rejeitada." });
            await signOut(auth); // This will trigger onAuthStateChanged again
          } else if (profile.status === 'approved') {
            const isRestrictedPage = ['/login', '/aguardando-aprovacao'].includes(pathname);
            if (isRestrictedPage) {
               router.push('/personagens');
            }
          }
        } else {
            // User exists in Auth but not in Firestore DB. This is an inconsistent state.
            toast({ variant: "destructive", title: "Erro de Conta", description: "Seu perfil não foi encontrado. Contate o suporte." });
            await signOut(auth);
        }

      } else {
        // User is not logged in
        setUser(null);
        setUserProfile(null);
        const protectedRoutes = ['/personagens', '/admin', '/aguardando-aprovacao'];
        const isProtected = protectedRoutes.some(route => pathname.startsWith(route));
        if (isProtected) {
          router.push('/login');
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

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

      const newUserProfile = {
          uid: newUser.uid,
          email: newUser.email!,
          role: isMasterAdmin ? 'admin' : ('user' as const),
          status: isMasterAdmin ? ('approved' as const) : ('pending' as const),
          createdAt: serverTimestamp(),
      };

      await setDoc(doc(db, "users", newUser.uid), newUserProfile);
      
      // onAuthStateChanged will now handle the user and redirect appropriately
      if (isMasterAdmin) {
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
      router.push('/login'); // Redirect to login after sign out
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
