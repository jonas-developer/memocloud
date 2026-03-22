import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: filePath } = await params;
  const uploadsDir = path.join(process.cwd(), 'uploads');
  const fullPath = path.join(uploadsDir, filePath.join('/'));

  if (!fs.existsSync(fullPath)) {
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }

  const file = fs.readFileSync(fullPath);
  const ext = path.extname(fullPath).toLowerCase();
  
  const contentTypes: Record<string, string> = {
    '.pdf': 'application/pdf',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.txt': 'text/plain',
    '.md': 'text/markdown',
  };

  return new NextResponse(file, {
    headers: {
      'Content-Type': contentTypes[ext] || 'application/octet-stream',
    },
  });
}