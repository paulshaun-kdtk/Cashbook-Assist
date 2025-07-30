// src/ai/flows/generate-financial-insights.ts
'use server';

/**
 * @fileOverview Generates insightful summaries of financial data using AI.
 *
 * - generateFinancialInsights - A function that generates financial insights from P&L data.
 * - GenerateFinancialInsightsInput - The input type for the generateFinancialInsights function.
 * - GenerateFinancialInsightsOutput - The return type for the generateFinancialInsights function.
 */

import { ai } from '../../firebase/genkit-config';
import {z} from 'genkit';

const GenerateFinancialInsightsInputSchema = z.object({
  revenue: z.number().describe('Total revenue for the period.'),
  expenses: z.number().describe('Total expenses for the period.'),
  netProfit: z.number().describe('Net profit for the period.'),
  dateRange: z.string().describe('The date range for the P&L data.'),
  additionalContext: z
    .string()
    .optional()
    .describe('Any additional context about the P&L data.'),
});

export type GenerateFinancialInsightsInput = z.infer<
  typeof GenerateFinancialInsightsInputSchema
>;

const GenerateFinancialInsightsOutputSchema = z.object({
  summary: z
    .string()
    .describe(
      'A concise summary of the financial performance, highlighting key trends and anomalies.'
    ),
  recommendations:
    z.string().describe('Actionable recommendations for improvement.'),
});

export type GenerateFinancialInsightsOutput = z.infer<
  typeof GenerateFinancialInsightsOutputSchema
>;

export async function generateFinancialInsights(
  input: GenerateFinancialInsightsInput
): Promise<GenerateFinancialInsightsOutput> {
  return generateFinancialInsightsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateFinancialInsightsPrompt',
  input: {schema: GenerateFinancialInsightsInputSchema},
  output: {schema: GenerateFinancialInsightsOutputSchema},
  prompt: `You are a financial analyst providing insights on Profit and Loss data.

  Based on the following P&L data for the period {{{dateRange}}}, generate a summary of the financial performance, highlighting key trends and anomalies, and provide actionable recommendations for improvement.

  Revenue: {{{revenue}}}
  Expenses: {{{expenses}}}
  Net Profit: {{{netProfit}}}

  {{#if additionalContext}}
  Additional Context: {{{additionalContext}}}
  {{/if}}`,
});

const generateFinancialInsightsFlow = ai.defineFlow(
  {
    name: 'generateFinancialInsightsFlow',
    inputSchema: GenerateFinancialInsightsInputSchema,
    outputSchema: GenerateFinancialInsightsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
