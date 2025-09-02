
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
    "Fragmento de Fogo (Vermelho)",
    "Fragmento de Gelo (Verde)",
    "Fragmento de Relâmpago (Amarelo)",
    "Fragmento de Maldição (Roxo)",
    "Fragmento de Vento (Verde)",
    "Fragmento de Água (Verde)",
    "Fragmento de Terra (Amarelo)",
    "Fragmento de Escuridão (Roxo)",
    "Fragmento de Luz (Amarelo)",
    "Fragmento de Veneno (Verde)",
    "Fragmento de Sangue (Vermelho)",
    "Fragmento de Magia (Roxo)",
    "Fragmento de Proteção (Amarelo)",
    "Fragmento de Ataque (Vermelho)",
    "Fragmento de Defesa (Amarelo)",
    "Fragmento de Vida (Verde)",
    "Fragmento de Mana (Roxo)",
    "Fragmento de Velocidade (Verde)",
    "Fragmento de Crítico (Vermelho)",
    "Fragmento de Dano Crítico (Vermelho)",
    "Fragmento de Resistência (Amarelo)",
    "Fragmento de Penetração (Roxo)"
].sort();
