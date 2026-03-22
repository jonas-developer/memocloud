'use client';

import { useMemoStore } from '@/stores/memoStore';
import { FolderNode } from '@/lib/types';
import { useState } from 'react';

function FolderItem({ node, level = 0 }: { node: FolderNode; level?: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const { selectedCategory, selectedFolder, selectedSubfolder, setSelectedCategory, setSelectedFolder, setSelectedSubfolder } = useMemoStore();

  const isSelected = selectedCategory === node.name;
  const hasSubfolders = node.subfolders && node.subfolders.length > 0;
  const paddingLeft = 12 + level * 16;

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
          {node.memos?.length || 0}
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
            />
          ))}
        </div>
      )}
    </div>
  );
}

function SubfolderItem({ node, parent, level }: { node: FolderNode; parent: string; level: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const { selectedCategory, selectedFolder, selectedSubfolder, setSelectedCategory, setSelectedFolder, setSelectedSubfolder } = useMemoStore();

  const isSelectedFolder = selectedFolder === node.name && selectedCategory === parent;
  const isSelectedSubfolder = selectedSubfolder === node.name && selectedFolder === parent;
  const hasSubfolders = node.subfolders && node.subfolders.length > 0;
  const paddingLeft = 12 + level * 16;

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
          {node.memos?.length || 0}
        </span>
      </div>
    </div>
  );
}

export function FolderTree() {
  const { folderStructure } = useMemoStore();
  const categories = folderStructure.categories;

  return (
    <div className="space-y-0.5">
      {Object.values(categories).map((cat) => (
        <FolderItem key={cat.name} node={cat} />
      ))}
    </div>
  );
}