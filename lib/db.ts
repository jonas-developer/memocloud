import { Redis } from '@upstash/redis';
import { generateEmbedding } from './openai';
import { Memo, MemoChunk, SearchResult } from './types';

// Initialize Upstash Redis
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || 'https://better-crab-81351.upstash.io',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
});

const MEMOS_KEY = 'memocloud:memos';

// Cosine similarity search
const cosineSimilarity = (a: number[], b: number[]): number => {
  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (magA * magB);
};

export async function loadMemos(): Promise<Memo[]> {
  try {
    const data = await redis.get(MEMOS_KEY);
    return (data as Memo[]) || [];
  } catch (error) {
    console.error('Error loading memos:', error);
    return [];
  }
}

export async function saveMemos(memos: Memo[]): Promise<void> {
  await redis.set(MEMOS_KEY, JSON.stringify(memos));
}

export async function searchMemos(query: string, limit = 10): Promise<SearchResult[]> {
  const memos = await loadMemos();
  
  if (memos.length === 0) return [];
  
  const queryEmbedding = await generateEmbedding(query);
  
  // Score each memo based on best chunk match or full content
  const results = memos
    .map((memo) => {
      let bestScore = 0;
      let bestContent = memo.content;
      
      // Check chunk embeddings first (more precise)
      if (memo.chunks && memo.chunks.length > 0) {
        for (const chunk of memo.chunks) {
          const score = cosineSimilarity(queryEmbedding, chunk.embedding);
          if (score > bestScore) {
            bestScore = score;
            bestContent = chunk.content;
          }
        }
      }
      
      // Also check full content embedding
      if (memo.embedding) {
        const score = cosineSimilarity(queryEmbedding, memo.embedding);
        if (score > bestScore) {
          bestScore = score;
          bestContent = memo.content;
        }
      }
      
      return {
        ...memo,
        score: bestScore,
        content: bestContent,
      };
    })
    .filter((m) => m.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
  
  // Remove embeddings from results (don't send to client)
  return results.map(({ embedding, chunks, ...rest }) => rest as SearchResult);
}

export async function addMemo(memo: { 
  title: string; 
  content: string; 
  source: 'upload' | 'bookmark' | 'note'; 
  url?: string; 
  fileType?: string; 
  fileUrl?: string; 
  category: string; 
  folder: string; 
  subfolder?: string; 
  embedding?: number[];
  chunks?: MemoChunk[];
}): Promise<Memo> {
  const memos = await loadMemos();
  
  const newMemo: Memo = {
    ...memo,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  
  memos.push(newMemo);
  await saveMemos(memos);
  
  return newMemo;
}

export function getMemo(id: string): Promise<Memo | undefined> {
  return loadMemos().then(memos => memos.find((m) => m.id === id));
}

export async function deleteMemo(id: string): Promise<boolean> {
  const memos = await loadMemos();
  const index = memos.findIndex((m) => m.id === id);
  if (index === -1) return false;
  
  memos.splice(index, 1);
  await saveMemos(memos);
  return true;
}

export async function getMemosByFolder(category: string, folder?: string, subfolder?: string): Promise<Memo[]> {
  const memos = await loadMemos();
  return memos.filter((m) => {
    if (m.category !== category) return false;
    if (folder && m.folder !== folder) return false;
    if (subfolder && m.subfolder !== subfolder) return false;
    return true;
  });
}