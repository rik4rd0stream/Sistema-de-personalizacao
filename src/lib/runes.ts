export interface IdealRune {
  name: string;
  count: number;
}

export const IDEAL_RUNES_BY_TIER: Record<number, IdealRune[]> = {
  2: [
    { name: 'Fragmento de Artesão (Amarela)', count: 7 },
    { name: 'Fragmento Inabalável (Amarela)', count: 7 },
    { name: 'Fragmento de Ataque Poderoso (Amarela)', count: 7 },
    { name: 'Fragmento do Luar (Roxo)', count: 7 },
    { name: 'Fragmento do Deus da Guerra (Roxo)', count: 7 },
    { name: 'Fragmento do Deus da Guerra (Verde)', count: 5 },
  ],
  3: [],
  4: [],
  5: [],
  6: [],
  7: [],
  8: [],
  9: [],
};
