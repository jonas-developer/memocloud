import { NextRequest, NextResponse } from 'next/server';
import { addMemo, loadMemos, getMemosByFolder } from '@/lib/db';
import { generateEmbedding } from '@/lib/openai';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const folder = searchParams.get('folder');
  const subfolder = searchParams.get('subfolder');

  if (category) {
    const memos = getMemosByFolder(category, folder || undefined, subfolder || undefined);
    return NextResponse.json(memos);
  }

  const memos = loadMemos();
  return NextResponse.json(memos);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content, source, url, fileType, category, folder, subfolder } = body;

    if (!title || !category || !folder) {
      return NextResponse.json(
        { error: 'Title, category, and folder are required' },
        { status: 400 }
      );
    }

    const embedding = await generateEmbedding(title + ' ' + content);

    const memo = await addMemo({
      title,
      content,
      source: source || 'note',
      url,
      fileType,
      category,
      folder,
      subfolder,
      embedding,
    });

    return NextResponse.json(memo, { status: 201 });
  } catch (error) {
    console.error('Error creating memo:', error);
    return NextResponse.json(
      { error: 'Failed to create memo' },
      { status: 500 }
    );
  }
}