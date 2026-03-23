'use client';

import { useEffect, useState } from 'react';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { SearchBar } from '@/components/SearchBar';
import { MemoCard } from '@/components/MemoCard';
import { CreateMemoModal } from '@/components/CreateMemoModal';
import { useMemoStore } from '@/stores/memoStore';

export default function Home() {
  const { 
    memos, setMemos, 
    searchQuery, searchResults, setSearchResults,
    selectedCategory, selectedFolder, selectedSubfolder,
    ragAnswer, setRagAnswer 
  } = useMemoStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/memos')
      .then((res) => res.json())
      .then((data) => setMemos(data))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [setMemos]);

  // Filter memos by selected folder
  const filteredMemos = selectedCategory 
    ? memos.filter((m) => {
        if (m.category !== selectedCategory) return false;
        if (selectedFolder && m.folder !== selectedFolder) return false;
        if (selectedSubfolder && m.subfolder !== selectedSubfolder) return false;
        return true;
      })
    : [];

  const displayMemos = searchQuery ? searchResults : filteredMemos;

  const clearSearch = () => {
    setSearchResults([]);
    setRagAnswer(null);
    useMemoStore.getState().setSearchQuery('');
  };

  const getViewTitle = () => {
    if (searchQuery) return `Search: "${searchQuery}"`;
    if (selectedSubfolder) return `${selectedSubfolder}`;
    if (selectedFolder) return `${selectedFolder}`;
    if (selectedCategory) return `${selectedCategory}`;
    return 'All Memos';
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="max-w-3xl mx-auto space-y-6">
            <SearchBar />

            {/* RAG Answer */}
            {ragAnswer && (
              <div className="p-4 bg-indigo-900/20 border border-indigo-500/30 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-indigo-400">🤖</span>
                  <span className="font-medium text-indigo-300">AI Answer</span>
                </div>
                <p className="text-zinc-200">{ragAnswer}</p>
              </div>
            )}

            {/* View Title */}
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-zinc-200">
                {getViewTitle()}
              </h2>
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="text-sm text-zinc-500 hover:text-zinc-300 cursor-pointer"
                >
                  Clear search ↩
                </button>
              )}
            </div>

            {/* Results */}
            {isLoading ? (
              <div className="text-center py-12 text-zinc-500">Loading...</div>
            ) : displayMemos.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-3">📭</div>
                <p className="text-zinc-500">
                  {searchQuery 
                    ? 'No results found. Try different keywords or add more memos.'
                    : selectedCategory 
                      ? 'No memos in this folder yet. Create one!'
                      : 'No memos yet. Create your first one!'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {displayMemos.map((memo) => (
                  <MemoCard key={memo.id} memo={memo} />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
      <CreateMemoModal />
    </div>
  );
}