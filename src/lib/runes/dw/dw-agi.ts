
import type { IdealRuneSetup } from '@/lib/types/runes';

// Configuração de referência de runas para a classe DW AGI.
// Estes dados podem ser usados como um padrão inicial ou para referência futura.
// A configuração real de cada personagem é salva individualmente no Firestore.
export const DW_AGI_RUNES: IdealRuneSetup = {
  2: {
    primary_weapon: ['Fragmento de Transição (Roxo)', 'Fragmento de Transição (Verde)'],
    secondary_weapon: ['Fragmento de Transição (Roxo)', 'Fragmento de Transição (Verde)'],
    helmet: ['Fragmento de Transição (Roxo)', 'Fragmento de Transição (Verde)'],
    chest: ['Fragmento de Transição (Roxo)', 'Fragmento de Transição (Verde)'],
    pants: ['Fragmento de Transição (Roxo)', 'Fragmento de Transição (Verde)'],
    gloves: ['Fragmento de Transição (Roxo)', 'Fragmento de Transição (Verde)'],
    boots: ['Fragmento de Transição (Roxo)', 'Fragmento de Transição (Verde)'],
    pendant: ['Fragmento Inabalável (Amarelo)', 'Fragmento Inabalável (Amarelo)'],
    ring_1: ['Fragmento Inabalável (Amarelo)', 'Fragmento Inabalável (Amarelo)'],
    ring_2: ['Fragmento Inabalável (Amarelo)', 'Fragmento Inabalável (Amarelo)'],
  },
  // Tiers 3-9 podem ser adicionados aqui no futuro.
  3: {},
  4: {},
  5: {},
  6: {},
  7: {},
  8: {},
  9: {},
};
