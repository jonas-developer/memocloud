'use client';

import { useState } from 'react';
import { Memo } from '@/lib/types';
import { useMemoStore } from '@/stores/memoStore';

interface MemoCardProps {
  memo: Memo;
}

export function MemoCard({ memo }: MemoCardProps) {
  const { removeMemo } = useMemoStore();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'upload': return '📄';
      case 'bookmark': return '🔗';
      case 'note': return '📝';
      default: return '📄';
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this memo?')) return;
    
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/memos/${memo.id}`, { method: 'DELETE' });
      if (res.ok) {
        removeMemo(memo.id);
      }
    } catch (error) {
      console.error('Error deleting memo:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const isLong = memo.content.length > 200;

  return (
    <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl hover:border-zinc-700 transition-colors group">
      <div className="flex items-start gap-3">
        <span className="text-xl">{getSourceIcon(memo.source)}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-zinc-100 truncate">{memo.title}</h3>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded transition-all text-red-400 hover:text-red-300"
              title="Delete memo"
            >
              {isDeleting ? '⏳' : '🗑️'}
            </button>
          </div>
          
          <div className="relative">
            <p className={`text-sm text-zinc-500 mt-1 ${isLong && !isExpanded ? 'line-clamp-2' : ''}`}>
              {memo.content}
            </p>
            {isLong && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-xs text-indigo-400 hover:text-indigo-300 mt-1"
              >
                {isExpanded ? 'Show less' : 'Read more...'}
              </button>
            )}
          </div>
          
          <div className="mt-3 flex items-center justify-between text-xs text-zinc-500">
            <div className="flex items-center gap-2">
              {memo.url && (
                <a
                  href={memo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-400 hover:text-indigo-300 truncate max-w-[200px]"
                >
                  {memo.url}
                </a>
              )}
              {memo.fileUrl && (
                <a
                  href={memo.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400 hover:text-cyan-300 truncate max-w-[200px]"
                >
                  📥 Download
                </a>
              )}
            </div>
            <span>{formatDate(memo.createdAt)}</span>
          </div>
          
          <div className="mt-2 flex items-center gap-2">
            <span className="px-2 py-0.5 bg-zinc-800 text-zinc-400 text-xs rounded">
              {memo.category}
            </span>
            {memo.folder && (
              <span className="px-2 py-0.5 bg-zinc-800/50 text-zinc-500 text-xs rounded">
                {memo.folder}
              </span>
            )}
            {memo.subfolder && (
              <span className="px-2 py-0.5 bg-zinc-800/30 text-zinc-600 text-xs rounded">
                {memo.subfolder}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}