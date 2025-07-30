// app/api/suggest-promotions/route.ts
import { NextResponse } from 'next/server';
import { suggestPromotions } from '@/redux/google/gemini/forecast/suggest_promotions';

export async function POST(req: Request) {
  const input = await req.json();
  const result = await suggestPromotions(input);
  return NextResponse.json(result);
}
