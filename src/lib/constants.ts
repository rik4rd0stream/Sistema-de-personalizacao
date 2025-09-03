import type { LucideIcon } from 'lucide-react';
import { Sword, Shield, Shirt, HardHat, Hand, Bot, CircleDot, Gem, RectangleHorizontal } from 'lucide-react';
import { FRAGMENTS_BY_TIER } from './fragments-by-tier';

export interface EquipmentType {
  id: string;
  name: string;
  icon: LucideIcon;
}

export const EQUIPMENT_TYPES: EquipmentType[] = [
  { id: 'primary_weapon', name: 'Arma Primária', icon: Sword },
  { id: 'secondary_weapon', name: 'Arma Secundária', icon: Shield },
  { id: 'chest', name: 'Peito', icon: Shirt },
  { id: 'helmet', name: 'Capacete', icon: HardHat },
  { id: 'pants', name: 'Calça', icon: RectangleHorizontal },
  { id: 'gloves', name: 'Luvas', icon: Hand },
  { id: 'boots', name: 'Botas', icon: Bot },
  { id: 'ring_1', name: 'Anel 1', icon: CircleDot },
  { id: 'ring_2', name: 'Anel 2', icon: CircleDot },
  { id: 'pendant', name: 'Pendant', icon: Gem },
];

export const ALL_RUNE_FRAGMENTS = [
  ...new Set(Object.values(FRAGMENTS_BY_TIER).flat().map(fragment => fragment.name))
].sort((a, b) => a.localeCompare(b));
