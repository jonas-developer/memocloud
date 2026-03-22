import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { addMemo } from '@/lib/db';
import { generateEmbedding } from '@/lib/openai';

const UPLOADS_DIR = path.join(process.cwd(), 'uploads');

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

    // Ensure uploads directory exists
    if (!fs.existsSync(UPLOADS_DIR)) {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    }

    let filePath: string | undefined;
    let fileType: string | undefined;
    let extractedContent = content || '';

    // Handle file upload
    if (file && file.size > 0) {
      const ext = file.name.split('.').pop() || 'txt';
      fileType = ext;
      const fileName = `${uuidv4()}.${ext}`;
      const fullPath = path.join(UPLOADS_DIR, fileName);
      
      // Write file to disk
      const buffer = Buffer.from(await file.arrayBuffer());
      fs.writeFileSync(fullPath, buffer);
      
      filePath = `/uploads/${fileName}`;
    }

    // For bookmark URLs, fetch content (simplified)
    if (source === 'bookmark' && url) {
      try {
        const response = await fetch(url);
        const text = await response.text();
        extractedContent = text.replace(/<[^>]*>/g, ' ').slice(0, 10000);
      } catch (e) {
        console.error('Failed to fetch URL:', e);
      }
    }

    // For now, if no content provided and it's a file upload, note that needs parsing
    if (!extractedContent && file) {
      extractedContent = `[Uploaded file: ${file.name}] - Content extraction pending`;
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
      filePath: filePath || undefined,
      category,
      folder,
      subfolder: subfolder || undefined,
      embedding,
    });

    return NextResponse.json(newMemo, { status: 201 });
  } catch (error) {
    console.error('Error creating memo:', error);
    return NextResponse.json(
      { error: 'Failed to create memo' },
      { status: 500 }
    );
  }
}