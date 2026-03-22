'use client';

import { Memo } from '@/lib/types';

interface MemoCardProps {
  memo: Memo;
}

export function MemoCard({ memo }: MemoCardProps) {
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
      case 'upload':
        return '📄';
      case 'bookmark':
        return '🔗';
      case 'note':
        return '📝';
      default:
        return '📄';
    }
  };

  return (
    <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl hover:border-zinc-700 transition-colors">
      <div className="flex items-start gap-3">
        <span className="text-xl">{getSourceIcon(memo.source)}</span>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-zinc-100 truncate">{memo.title}</h3>
          <p className="text-sm text-zinc-500 mt-1 line-clamp-2">{memo.content}</p>
          
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