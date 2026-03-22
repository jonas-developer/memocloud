'use client';

import { FolderTree } from './FolderTree';
import { useMemoStore } from '@/stores/memoStore';

export function Sidebar() {
  const { memos, setSelectedCategory, setSelectedFolder, setSelectedSubfolder, selectedCategory, selectedFolder } = useMemoStore();

  return (
    <aside className="w-64 h-[calc(100vh-3.5rem)] border-r border-zinc-800 bg-zinc-950/30 flex flex-col">
      <div className="p-4 border-b border-zinc-800/50">
        <h2 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3">
          Folders
        </h2>
        <FolderTree />
      </div>
      
      <div className="p-4 mt-auto">
        <div className="text-xs text-zinc-600">
          <span className="font-medium text-zinc-400">{memos.length}</span> memos stored
        </div>
      </div>
    </aside>
  );
}