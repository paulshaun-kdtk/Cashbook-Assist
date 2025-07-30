import { runGeminiPrompt } from "../config";

export const analyzeCashFlow = async (cashFlowSummarry:string) => {
  const prompt = `
    You are a financial assistant. Based on the following data of income and expenses for the current annual period to date, predict the user's likely future cash flow and give financial advice.

    cashFlow:
    ${cashFlowSummarry}

    Please return your prediction and a short explanation in the following format: {
    'next_month': {
        percentage_change: number(negative/positive),
        prediction_amount_estimate: number,
        explanation: string
      },
    'next_quarter': {
        percentage_change: number(negative/positive),
        prediction_amount_estimate: number,
        explanation: string
    }, 
    'next_6_months': {
        percentage_change: number(negative/positive),
        prediction_amount_estimate: number,
        explanation: string
        }
    }
    `;

  const result = await runGeminiPrompt(prompt);
  return result;
};
