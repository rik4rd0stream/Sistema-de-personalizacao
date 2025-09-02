export interface IdealRune {
  name: string;
  count: number;
}

export const IDEAL_RUNES_BY_TIER: Record<number, IdealRune[]> = {
  2: [
    { name: 'Fragmento de Maldição (Roxo)', count: 7 },
    { name: 'Fragmento do Pântano Venenoso (Roxo)', count: 7 },
    { name: 'Fragmento Inócuo (Roxo)', count: 7 },
    { name: 'Fragmento Venenoso (Roxo)', count: 7 },
    { name: 'Fragmento da Ira Celestial (Roxo)', count: 7 },
    { name: 'Fragmento de Congelar (Roxo)', count: 7 },
    { name: 'Fragmento de Transição (Roxo)', count: 7 },
    { name: 'Fragmento de Meteorito (Roxo)', count: 7 },
    { name: 'Fragmento de Maldição (Verde)', count: 7 },
    { name: 'Fragmento do Pântano Venenoso (Verde)', count: 7 },
    { name: 'Fragmento Inócuo (Verde)', count: 7 },
    { name: 'Fragmento Venenoso (Verde)', count: 7 },
    { name: 'Fragmento da Ira Celestial (Verde)', count: 7 },
    { name: 'Fragmento de Congelar (Verde)', count: 7 },
    { name: 'Fragmento de Transição (Verde)', count: 7 },
    { name: 'Fragmento de Meteorito (Verde)', count: 7 },
    { name: 'Fragmento de Sombra (Amarela)', count: 7 },
    { name: 'Fragmento de Proteção (Amarela)', count: 7 },
    { name: 'Fragmento de Artesão (Amarela)', count: 7 },
    { name: 'Fragmento Inabalável (Amarela)', count: 7 },
    { name: 'Fragmento de Ataque Poderoso (Amarela)', count: 7 },
  ],
  3: [],
  4: [],
  5: [],
  6: [],
  7: [],
  8: [],
  9: [],
};

// Lista de todas as runas para usar nos seletores
export const ALL_RUNE_FRAGMENTS = IDEAL_RUNES_BY_TIER[2].map(rune => rune.name);
