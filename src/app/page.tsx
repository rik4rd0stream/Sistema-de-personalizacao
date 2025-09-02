
'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { EQUIPMENT_TYPES } from '@/lib/constants';
import type { EquipmentType } from '@/lib/constants';
import { EquipmentCard } from '@/components/equipment-card';
import { IDEAL_RUNES_BY_TIER } from '@/lib/runes';
import { IdealRunesSummary } from '@/components/ideal-runes-summary';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth-context';
import { Loader2 } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';


export interface Equipment {
  id: string;
  name: string;
  icon: EquipmentType['icon'];
  currentRunes: string[];
}

function getInitialEquipmentState(tier: number): Equipment[] {
  const runeSlots = tier === 2 ? 2 : 3;
  return EQUIPMENT_TYPES.map(eq => ({
    ...eq,
    currentRunes: Array(runeSlots).fill(''),
  }));
}

// This page is now a placeholder and will be moved to /personagem/[id]
export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

   useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (!loading && user) {
        router.push('/personagens');
    }
  }, [user, loading, router]);


  return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Carregando...</p>
      </div>
    );
}
