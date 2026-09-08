// noinspection JSUnusedLocalSymbols
'use server';
/**
 * @fileOverview This file defines a Genkit flow for suggesting transaction categories based on a description.
 *
 * It exports:
 * - `suggestTransactionCategory`: An async function that takes a transaction description and returns a suggested category.
 * - `SuggestTransactionCategoryInput`: The input type for the `suggestTransactionCategory` function.
 * - `SuggestTransactionCategoryOutput`: The output type for the `suggestTransactionCategory` function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const SuggestTransactionCategoryInputSchema = z.object({
  description: z.string().describe('The description of the transaction.'),
});
export type SuggestTransactionCategoryInput = z.infer<typeof SuggestTransactionCategoryInputSchema>;

const SuggestTransactionCategoryOutputSchema = z.object({
  category: z.string().describe('The suggested category for the transaction.'),
});
export type SuggestTransactionCategoryOutput = z.infer<typeof SuggestTransactionCategoryOutputSchema>;

export async function suggestTransactionCategory(
  input: SuggestTransactionCategoryInput
): Promise<SuggestTransactionCategoryOutput> {
  return suggestTransactionCategoryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestTransactionCategoryPrompt',
  input: {
    schema: z.object({
      description: z.string().describe('The description of the transaction.'),
    }),
  },
  output: {
    schema: z.object({
      category: z.string().describe('The suggested category for the transaction.'),
    }),
  },
  prompt: `You are a financial expert helping categorize transactions.

  Based on the following transaction description, suggest a category for it.

  Description: {{{description}}}

  Respond with only the category name.
  `,
});

const suggestTransactionCategoryFlow = ai.defineFlow<
  typeof SuggestTransactionCategoryInputSchema,
  typeof SuggestTransactionCategoryOutputSchema
>({
  name: 'suggestTransactionCategoryFlow',
  inputSchema: SuggestTransactionCategoryInputSchema,
  outputSchema: SuggestTransactionCategoryOutputSchema,
},
async input => {
  const {output} = await prompt(input);
  return output!;
}
);
