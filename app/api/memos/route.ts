import { NextRequest, NextResponse } from 'next/server';
import { addMemo, getMemosByFolder, loadMemos } from '@/lib/db';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const folder = searchParams.get('folder');
  const subfolder = searchParams.get('subfolder');

  if (category) {
    const memos = await getMemosByFolder(category, folder || undefined, subfolder || undefined);
    return NextResponse.json(memos);
  }

  const memos = await loadMemos();
  return NextResponse.json(memos);
}