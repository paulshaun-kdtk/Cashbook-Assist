'use server';
/**
 * @fileOverview AI agent that suggests relevant promotions based on the items in the current transaction.
 *
 * - suggestPromotions - A function that suggests promotions.
 * - SuggestPromotionsInput - The input type for the suggestPromotions function.
 * - SuggestPromotionsOutput - The return type for the suggestPromotions function.
 */

import {z} from 'genkit';
import { ai } from '../../firebase/genkit-config';

const SuggestPromotionsInputSchema = z.object({
  items: z
    .array(
      z.object({
        name: z.string(),
        quantity: z.number(),
      })
    )
    .describe('The items currently in the transaction.'),
});
export type SuggestPromotionsInput = z.infer<typeof SuggestPromotionsInputSchema>;

const SuggestPromotionsOutputSchema = z.object({
  hasSufficientInfo: z
    .boolean()
    .describe(
      'Whether the AI has sufficient information to suggest promotions. If false, the promotions field will be empty.'
    ),
  promotions: z.array(z.string()).describe('The suggested promotions.'),
});
export type SuggestPromotionsOutput = z.infer<typeof SuggestPromotionsOutputSchema>;

export async function suggestPromotions(input: SuggestPromotionsInput): Promise<SuggestPromotionsOutput> {
  return suggestPromotionsFlow(input);
}

const suggestPromotionsPrompt = ai.definePrompt({
  name: 'suggestPromotionsPrompt',
  input: {schema: SuggestPromotionsInputSchema},
  output: {schema: SuggestPromotionsOutputSchema},
  prompt: `You are an AI assistant that suggests relevant promotions based on the items currently in the transaction.

  Given the following items in the transaction:
  {{#each items}}
  - {{name}} (Quantity: {{quantity}})
  {{/each}}

  Suggest relevant promotions that would increase sales. If you don't have enough information to suggest promotions, set hasSufficientInfo to false and promotions to an empty array.
  `,
});

const suggestPromotionsFlow = ai.defineFlow(
  {
    name: 'suggestPromotionsFlow',
    inputSchema: SuggestPromotionsInputSchema,
    outputSchema: SuggestPromotionsOutputSchema,
  },
  async input => {
    const {output} = await suggestPromotionsPrompt(input);
    return output!;
  }
);
