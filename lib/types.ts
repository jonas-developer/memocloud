export interface Memo {
  id: string;
  title: string;
  content: string;
  source: 'upload' | 'bookmark' | 'note';
  url?: string;
  fileType?: string;
  category: string;
  folder: string;
  subfolder?: string;
  createdAt: string;
  embedding?: number[];
}

export interface SearchResult {
  id: string;
  title: string;
  content: string;
  source: string;
  url?: string;
  createdAt: string;
  score: number;
}

export interface FolderNode {
  name: string;
  subfolders: FolderNode[];
  memos: Memo[];
}

export interface FolderStructure {
  categories: Record<string, FolderNode>;
}

export const DEFAULT_FOLDERS: FolderStructure = {
  categories: {
    Work: {
      name: 'Work',
      subfolders: [
        { name: 'Projects', subfolders: [], memos: [] },
        { name: 'Meetings', subfolders: [], memos: [] },
        { name: 'Notes', subfolders: [], memos: [] },
      ],
      memos: [],
    },
    Personal: {
      name: 'Personal',
      subfolders: [
        { name: 'Health', subfolders: [], memos: [] },
        { name: 'Finance', subfolders: [], memos: [] },
        { name: 'Ideas', subfolders: [], memos: [] },
      ],
      memos: [],
    },
    Learning: {
      name: 'Learning',
      subfolders: [
        { name: 'Courses', subfolders: [], memos: [] },
        { name: 'Books', subfolders: [], memos: [] },
      ],
      memos: [],
    },
    Research: {
      name: 'Research',
      subfolders: [
        { name: 'Tech', subfolders: [], memos: [] },
        { name: 'Market', subfolders: [], memos: [] },
      ],
      memos: [],
    },
  },
};