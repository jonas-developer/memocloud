import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';

export const createTextSplitter = () => {
  return new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 50,
    separators: ['\n\n', '\n', ' ', ''],
  });
};

export async function splitText(text: string): Promise<string[]> {
  const splitter = createTextSplitter();
  const chunks = await splitter.splitText(text);
  return chunks;
}