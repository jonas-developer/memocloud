'use client';

import { useMemoStore } from '@/stores/memoStore';
import { FolderTree } from './FolderTree';
import { useEffect, useState } from 'react';

export function Sidebar() {
  const { memos, isSidebarOpen, setIsSidebarOpen } = useMemoStore();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    if (!isMobile && isSidebarOpen) {
      setIsSidebarOpen(false);
    }
  }, [isMobile, isSidebarOpen, setIsSidebarOpen]);

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      <aside className={`
        ${isMobile ? 'fixed' : 'relative'} 
        ${isMobile ? 'z-50' : ''}
        ${isMobile ? (isSidebarOpen ? 'translate-x-0' : '-translate-x-full') : ''}
        w-64 h-[calc(100vh-3.5rem)] border-r border-zinc-800 bg-black flex flex-col transition-transform duration-200
      `}>
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
    </>
  );
}