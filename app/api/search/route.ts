import { NextRequest, NextResponse } from 'next/server';
import { searchMemos, loadMemos } from '@/lib/db';
import { generateAnswerWithRAG } from '@/lib/openai';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, useRag } = body;

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    const results = await searchMemos(query);

    let answer: string | undefined;
    if (useRag && results.length > 0) {
      const context = results
        .slice(0, 5)
        .map((r) => `- ${r.title}: ${r.content.substring(0, 500)}`)
        .join('\n');
      answer = await generateAnswerWithRAG(query, context);
    }

    return NextResponse.json({
      results,
      answer: answer || undefined,
    });
  } catch (error) {
    console.error('Error searching:', error);
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    );
  }
}