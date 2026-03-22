'use client';

import { useMemoStore } from '@/stores/memoStore';
import { FolderNode } from '@/lib/types';
import { useState, useMemo } from 'react';

function FolderItem({ node, level = 0, memoCounts }: { node: FolderNode; level?: number; memoCounts: Record<string, number> }) {
  const [isOpen, setIsOpen] = useState(false);
  const { selectedCategory, setSelectedCategory, setSelectedFolder, setSelectedSubfolder } = useMemoStore();

  const isSelected = selectedCategory === node.name;
  const hasSubfolders = node.subfolders && node.subfolders.length > 0;
  const paddingLeft = 12 + level * 16;
  const count = memoCounts[node.name] || 0;

  return (
    <div>
      <div
        className={`flex items-center gap-2 py-1.5 px-3 rounded-md cursor-pointer transition-colors text-sm ${
          isSelected
            ? 'bg-indigo-500/20 text-indigo-300'
            : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
        }`}
        style={{ paddingLeft: `${paddingLeft}px` }}
        onClick={() => {
          setSelectedCategory(node.name);
          setSelectedFolder(null);
          setSelectedSubfolder(null);
        }}
      >
        {hasSubfolders && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(!isOpen);
            }}
            className="w-4 h-4 flex items-center justify-center text-xs hover:text-white"
          >
            {isOpen ? '▼' : '▶'}
          </button>
        )}
        {!hasSubfolders && <span className="w-4" />}
        <span className="truncate">{node.name}</span>
        <span className="ml-auto text-xs text-zinc-600">
          {count}
        </span>
      </div>
      {isOpen && hasSubfolders && (
        <div>
          {node.subfolders.map((sub) => (
            <SubfolderItem
              key={sub.name}
              node={sub}
              parent={node.name}
              level={level + 1}
              memoCounts={memoCounts}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function SubfolderItem({ node, parent, level, memoCounts }: { node: FolderNode; parent: string; level: number; memoCounts: Record<string, number> }) {
  const [isOpen, setIsOpen] = useState(false);
  const { selectedCategory, selectedFolder, setSelectedCategory, setSelectedFolder, setSelectedSubfolder } = useMemoStore();

  const isSelectedFolder = selectedFolder === node.name && selectedCategory === parent;
  const hasSubfolders = node.subfolders && node.subfolders.length > 0;
  const paddingLeft = 12 + level * 16;
  const key = `${parent}:${node.name}`;
  const count = memoCounts[key] || 0;

  return (
    <div>
      <div
        className={`flex items-center gap-2 py-1.5 px-3 rounded-md cursor-pointer transition-colors text-sm ${
          isSelectedFolder
            ? 'bg-indigo-500/20 text-indigo-300'
            : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
        }`}
        style={{ paddingLeft: `${paddingLeft}px` }}
        onClick={() => {
          setSelectedCategory(parent);
          setSelectedFolder(node.name);
          setSelectedSubfolder(null);
        }}
      >
        {hasSubfolders && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(!isOpen);
            }}
            className="w-4 h-4 flex items-center justify-center text-xs hover:text-white"
          >
            {isOpen ? '▼' : '▶'}
          </button>
        )}
        {!hasSubfolders && <span className="w-4" />}
        <span className="truncate">{node.name}</span>
        <span className="ml-auto text-xs text-zinc-600">
          {count}
        </span>
      </div>
    </div>
  );
}

export function FolderTree() {
  const { folderStructure, memos } = useMemoStore();
  const categories = folderStructure.categories;

  // Calculate memo counts by category and folder
  const memoCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    
    // Category counts
    categoriesWork: for (const catName of Object.keys(categories)) {
      const cat = categories[catName];
      let count = 0;
      
      // Count memos in this category
      for (const memo of memos) {
        if (memo.category === catName) {
          count++;
        }
      }
      counts[catName] = count;
      
      // Folder counts (Category:Folder)
      for (const folder of cat.subfolders) {
        const key = `${catName}:${folder.name}`;
        let folderCount = 0;
        for (const memo of memos) {
          if (memo.category === catName && memo.folder === folder.name) {
            folderCount++;
          }
        }
        counts[key] = folderCount;
      }
    }
    
    return counts;
  }, [memos, categories]);

  return (
    <div className="space-y-0.5">
      {Object.values(categories).map((cat) => (
        <FolderItem key={cat.name} node={cat} memoCounts={memoCounts} />
      ))}
    </div>
  );
}