import fs from 'fs';
import path from 'path';
import { Memo, SearchResult } from './types';
import { generateEmbedding } from './openai';

const DATA_FILE = path.join(process.cwd(), 'data', 'memos.json');

// Initialize data directory
const dataDir = path.dirname(DATA_FILE);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

export function loadMemos(): Memo[] {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading memos:', error);
  }
  return [];
}

export function saveMemos(memos: Memo[]): void {
  fs.writeFileSync(DATA_FILE, JSON.stringify(memos, null, 2));
}

export async function searchMemos(query: string, limit = 10): Promise<SearchResult[]> {
  const memos = loadMemos();
  
  if (memos.length === 0) return [];
  
  const queryEmbedding = await generateEmbedding(query);
  
  // Calculate cosine similarity
  const similarity = (a: number[], b: number[]): number => {
    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dotProduct / (magA * magB);
  };
  
  const results = memos
    .map((memo) => ({
      ...memo,
      score: memo.embedding ? similarity(queryEmbedding, memo.embedding) : 0,
    }))
    .filter((m) => m.embedding)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
  
  return results.map(({ embedding, ...rest }) => rest as SearchResult);
}

export async function addMemo(memo: { title: string; content: string; source: 'upload' | 'bookmark' | 'note'; url?: string; fileType?: string; fileUrl?: string; category: string; folder: string; subfolder?: string; embedding?: number[] }): Promise<Memo> {
  const memos = loadMemos();
  
  const newMemo: Memo = {
    ...memo,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    embedding: memo.embedding || await generateEmbedding(memo.title + ' ' + memo.content),
  };
  
  memos.push(newMemo);
  saveMemos(memos);
  
  return newMemo;
}

export function getMemo(id: string): Memo | undefined {
  const memos = loadMemos();
  return memos.find((m) => m.id === id);
}

export function deleteMemo(id: string): boolean {
  const memos = loadMemos();
  const index = memos.findIndex((m) => m.id === id);
  if (index === -1) return false;
  
  memos.splice(index, 1);
  saveMemos(memos);
  return true;
}

export function getMemosByFolder(category: string, folder?: string, subfolder?: string): Memo[] {
  const memos = loadMemos();
  return memos.filter((m) => {
    if (m.category !== category) return false;
    if (folder && m.folder !== folder) return false;
    if (subfolder && m.subfolder !== subfolder) return false;
    return true;
  });
}