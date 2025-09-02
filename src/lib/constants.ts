import type { LucideIcon } from 'lucide-react';
import { Sword, Shield, Shirt, HardHat, Hand, Bot, CircleDot, Gem, RectangleHorizontal } from 'lucide-react';

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
  "Fragmento da Ira Celestial (Verde)",
  "Fragmento da Ira Celestial (Roxo)",
  "Fragmento de Artesão (Amarelo)",
  "Fragmento de Ataque Poderoso (Amarelo)",
  "Fragmento de Congelar (Verde)",
  "Fragmento de Congelar (Roxo)",
  "Fragmento de Maldição (Verde)",
  "Fragmento de Maldição (Roxo)",
  "Fragmento de Meteorito (Verde)",
  "Fragmento de Meteorito (Roxo)",
  "Fragmento de Proteção (Amarelo)",
  "Fragmento de Sombra (Amarelo)",
  "Fragmento de Transição (Verde)",
  "Fragmento de Transição (Roxo)",
  "Fragmento do Pântano Venenoso (Verde)",
  "Fragmento do Pântano Venenoso (Roxo)",
  "Fragmento Inabalável (Amarelo)",
  "Fragmento Inócuo (Verde)",
  "Fragmento Inócuo (Roxo)",
  "Fragmento Venenoso (Verde)",
  "Fragmento Venenoso (Roxo)",
  "Nenhum Fragmento (Vermelho)"
].sort((a, b) => a.localeCompare(b));
