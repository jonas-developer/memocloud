'use client';

import { useState } from 'react';
import { useMemoStore } from '@/stores/memoStore';

export function SearchBar() {
  const { searchQuery, setSearchQuery, setSearchResults, setIsSearching, setRagAnswer } = useMemoStore();
  const [useRag, setUseRag] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    setIsSearching(true);
    setRagAnswer(null);
    
    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery, useRag }),
      });
      
      const data = await res.json();
      if (data.results) {
        setSearchResults(data.results);
      }
      if (data.answer) {
        setRagAnswer(data.answer);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
      setIsSearching(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search your knowledge base..."
            className="w-full pl-10 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
          />
        </div>
        <button
          onClick={handleSearch}
          disabled={isLoading || !searchQuery.trim()}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors"
        >
          {isLoading ? 'Searching...' : 'Search'}
        </button>
      </div>
      
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={useRag}
            onChange={(e) => setUseRag(e.target.checked)}
            className="w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0"
          />
          <span className="text-sm text-zinc-400">Use RAG (AI Answer)</span>
        </label>
      </div>
    </div>
  );
}