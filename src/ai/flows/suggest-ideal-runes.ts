'use server';
/**
 * @fileOverview An AI agent that suggests ideal rune combinations for equipment.
 *
 * - suggestIdealRunes - A function that handles the suggestion of ideal rune combinations.
 * - SuggestIdealRunesInput - The input type for the suggestIdealRunes function.
 * - SuggestIdealRunesOutput - The return type for the suggestIdealRunes function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestIdealRunesInputSchema = z.object({
  equipmentType: z
    .string()
    .describe('The type of equipment (e.g., primary weapon, helmet).'),
  tier: z.number().min(2).max(9).describe('The tier of the equipment (2-9).'),
  characterClass: z.string().describe('The character class (e.g., DW AGI, ELFA ENE).'),
});
export type SuggestIdealRunesInput = z.infer<typeof SuggestIdealRunesInputSchema>;

const SuggestIdealRunesOutputSchema = z.object({
  runeSuggestions: z
    .array(z.string())
    .describe('An array of suggested ideal rune combinations.'),
});
export type SuggestIdealRunesOutput = z.infer<typeof SuggestIdealRunesOutputSchema>;

export async function suggestIdealRunes(input: SuggestIdealRunesInput): Promise<SuggestIdealRunesOutput> {
  return suggestIdealRunesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestIdealRunesPrompt',
  input: {schema: SuggestIdealRunesInputSchema},
  output: {schema: SuggestIdealRunesOutputSchema},
  prompt: `You are an expert in rune combinations for the game Sett.

You will be given the equipment type, tier, and character class. Based on this information, you will suggest the ideal rune combination for that specific equipment and build.

Equipment Type: {{{equipmentType}}}
Tier: {{{tier}}}
Character Class: {{{characterClass}}}

Suggest the ideal rune combination, considering the character's build:
`,config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_LOW_AND_ABOVE',
      },
    ],
  },
});

const suggestIdealRunesFlow = ai.defineFlow(
  {
    name: 'suggestIdealRunesFlow',
    inputSchema: SuggestIdealRunesInputSchema,
    outputSchema: SuggestIdealRunesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
