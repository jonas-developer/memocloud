import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { v4 as uuidv4 } from 'uuid';
import { addMemo } from '@/lib/db';
import { generateEmbedding } from '@/lib/openai';
import { splitText } from '@/lib/splitter';
import * as cheerio from 'cheerio';

export const runtime = 'nodejs';

async function extractTextFromFile(file: File): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase();
  const buffer = Buffer.from(await file.arrayBuffer());
  
  if (ext === 'pdf') {
    // @ts-ignore - pdf-parse type issue
    const pdfParse = (await import('pdf-parse')).default;
    const data = await pdfParse(buffer);
    return data.text || '';
  }
  
  if (ext === 'docx') {
    // Dynamic import mammoth
    const mammoth = await import('mammoth');
    const result = await mammoth.extractRawText({ buffer });
    return result.value || '';
  }
  
  if (ext === 'txt' || ext === 'md') {
    return buffer.toString('utf-8');
  }
  
  return '';
}

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

      // Extract text from file if not provided
      if (!extractedContent) {
        try {
          extractedContent = await extractTextFromFile(file);
          if (!extractedContent.trim()) {
            extractedContent = `[Uploaded file: ${file.name}] (Could not extract text)`;
          }
        } catch (e) {
          console.error('Failed to extract text:', e);
          extractedContent = `[Uploaded file: ${file.name}] (Extraction failed)`;
        }
      }
    }

    // For bookmark URLs, fetch and parse the page
    if (source === 'bookmark' && url) {
      try {
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; MemoCloud/1.0)',
          },
        });
        const html = await response.text();
        const $ = cheerio.load(html);
        
        // Remove scripts, styles, nav, footer, etc.
        $('script, style, nav, footer, header, aside, noscript, iframe').remove();
        
        // Get main content - prefer article, main, or body
        let text = $('article').text() || $('main').text() || $('body').text();
        
        // Clean up whitespace
        text = text.replace(/\s+/g, ' ').trim().slice(0, 10000);
        
        extractedContent = text;
      } catch (e) {
        console.error('Failed to fetch URL:', e);
      }
    }

    // Split content into chunks using LangChain splitter
    const chunks = await splitText(extractedContent);
    
    // Generate embeddings for each chunk
    const chunkEmbeddings = await Promise.all(
      chunks.map(async (chunk) => {
        const embedding = await generateEmbedding(chunk);
        return {
          id: uuidv4(),
          content: chunk,
          embedding,
        };
      })
    );

    // Generate a single embedding for the full content (for backward compatibility)
    const fullEmbedding = await generateEmbedding(title + ' ' + extractedContent);

    // Create memo with chunks
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
      embedding: fullEmbedding,
      chunks: chunkEmbeddings,
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