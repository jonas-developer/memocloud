import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { v4 as uuidv4 } from 'uuid';
import { addMemo } from '@/lib/db';
import { generateEmbedding } from '@/lib/openai';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    const title = formData.get('title') as string;
    const category = formData.get('category') as string;
    const folder = formData.get('folder') as string;
    const subfolder = formData.get('subfolder') as string;
    const source = formData.get('source') as string;
    const url = formData.get('url') as string;
    const content = formData.get('content') as string;
    const file = formData.get('file') as File | null;

    if (!title || !category || !folder) {
      return NextResponse.json(
        { error: 'Title, category, and folder are required' },
        { status: 400 }
      );
    }

    let fileUrl: string | undefined;
    let fileType: string | undefined;
    let extractedContent = content || '';

    // Handle file upload with Vercel Blob
    if (file && file.size > 0) {
      const ext = file.name.split('.').pop() || 'txt';
      fileType = ext;
      const blobFileName = `${uuidv4()}.${ext}`;
      
      // Upload to Vercel Blob
      const blob = await put(blobFileName, file, {
        access: 'public',
      });
      
      fileUrl = blob.url;

      if (!extractedContent) {
        extractedContent = `[Uploaded file: ${file.name}] (Content extraction will happen on download)`;
      }
    }

    // For bookmark URLs, fetch content
    if (source === 'bookmark' && url) {
      try {
        const response = await fetch(url);
        const text = await response.text();
        extractedContent = text.replace(/<[^>]*>/g, ' ').slice(0, 10000);
      } catch (e) {
        console.error('Failed to fetch URL:', e);
      }
    }

    // Generate embedding
    const embedding = await generateEmbedding(title + ' ' + extractedContent);

    // Create memo
    const newMemo = await addMemo({
      title,
      content: extractedContent,
      source: (source || 'note') as 'upload' | 'bookmark' | 'note',
      url: url || undefined,
      fileType,
      fileUrl: fileUrl || undefined,
      category,
      folder,
      subfolder: subfolder || undefined,
      embedding,
    });

    return NextResponse.json(newMemo, { status: 201 });
  } catch (error) {
    console.error('Error creating memo:', error);
    return NextResponse.json(
      { error: 'Failed to create memo', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}