import { create } from 'zustand';
import { Memo, FolderStructure, DEFAULT_FOLDERS } from '@/lib/types';

interface MemoStore {
  memos: Memo[];
  selectedCategory: string | null;
  selectedFolder: string | null;
  selectedSubfolder: string | null;
  searchQuery: string;
  searchResults: Memo[];
  isSearching: boolean;
  ragAnswer: string | null;
  isModalOpen: boolean;
  folderStructure: FolderStructure;
  setMemos: (memos: Memo[]) => void;
  addMemo: (memo: Memo) => void;
  removeMemo: (id: string) => void;
  setSelectedCategory: (category: string | null) => void;
  setSelectedFolder: (folder: string | null) => void;
  setSelectedSubfolder: (subfolder: string | null) => void;
  setSearchQuery: (query: string) => void;
  setSearchResults: (results: Memo[]) => void;
  setIsSearching: (isSearching: boolean) => void;
  setRagAnswer: (answer: string | null) => void;
  setIsModalOpen: (isOpen: boolean) => void;
}

export const useMemoStore = create<MemoStore>((set) => ({
  memos: [],
  selectedCategory: null,
  selectedFolder: null,
  selectedSubfolder: null,
  searchQuery: '',
  searchResults: [],
  isSearching: false,
  ragAnswer: null,
  isModalOpen: false,
  folderStructure: DEFAULT_FOLDERS,
  setMemos: (memos) => set({ memos }),
  addMemo: (memo) => set((state) => ({ memos: [...state.memos, memo] })),
  removeMemo: (id) => set((state) => ({ memos: state.memos.filter((m) => m.id !== id) })),
  setSelectedCategory: (category) => set({ selectedCategory: category, selectedFolder: null, selectedSubfolder: null, searchQuery: '', searchResults: [], ragAnswer: null }),
  setSelectedFolder: (folder) => set({ selectedFolder: folder, selectedSubfolder: null }),
  setSelectedSubfolder: (subfolder) => set({ selectedSubfolder: subfolder }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSearchResults: (results) => set({ searchResults: results }),
  setIsSearching: (isSearching) => set({ isSearching }),
  setRagAnswer: (answer) => set({ ragAnswer: answer }),
  setIsModalOpen: (isOpen) => set({ isModalOpen: isOpen }),
}));