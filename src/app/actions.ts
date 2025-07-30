'use server';

import {
  generateFinancialInsights,
  type GenerateFinancialInsightsInput,
  type GenerateFinancialInsightsOutput,
} from "@/redux/google/gemini/analysis/financial-insights";

export async function generateAiInsightsAction(
  input: GenerateFinancialInsightsInput
): Promise<GenerateFinancialInsightsOutput | null> {
  try {
    const output = await generateFinancialInsights(input);
    return output;
  } catch (error) {
    console.error('Error in generateAiInsightsAction:', error);
    return null;
  }
}
