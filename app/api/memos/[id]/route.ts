import { NextRequest, NextResponse } from 'next/server';
import { getMemo, deleteMemo } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const memo = getMemo(id);
  
  if (!memo) {
    return NextResponse.json({ error: 'Memo not found' }, { status: 404 });
  }
  
  return NextResponse.json(memo);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const deleted = deleteMemo(id);
  
  if (!deleted) {
    return NextResponse.json({ error: 'Memo not found' }, { status: 404 });
  }
  
  return NextResponse.json({ success: true });
}