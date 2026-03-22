import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { v4 as uuidv4 } from 'uuid';
import { addMemo } from '@/lib/db';
import { generateEmbedding } from '@/lib/openai';
import * as cheerio from 'cheerio';

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
        
        // Get title from page title tag or og:title
        const pageTitle = $('title').text() || $('meta[property="og:title"]').attr('content') || '';
        
        // Get main content - prefer article, main, or body
        let text = $('article').text() || $('main').text() || $('body').text();
        
        // Clean up whitespace
        text = text.replace(/\s+/g, ' ').trim().slice(0, 10000);
        
        // Use page title if no custom title provided
        if (!title && pageTitle) {
          // Would need to handle this differently, but for now use URL as fallback
        }
        
        extractedContent = text;
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