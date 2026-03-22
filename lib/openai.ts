import OpenAI from 'openai';

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  });
  return response.data[0].embedding;
}

export async function generateAnswerWithRAG(
  question: string,
  context: string
): Promise<string> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'You are a helpful assistant answering questions based on the user\'s personal knowledge base. Use only the provided context to answer. Be concise and factual.',
      },
      {
        role: 'user',
        content: `Context from user's knowledge base:\n\n${context}\n\nQuestion: ${question}\n\nAnswer:`,
      },
    ],
  });
  return response.choices[0].message.content || '';
}