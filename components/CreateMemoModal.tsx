'use client';

import { useState, useRef } from 'react';
import { useMemoStore } from '@/stores/memoStore';
import { DEFAULT_FOLDERS } from '@/lib/types';

export function CreateMemoModal() {
  const { isModalOpen, setIsModalOpen, addMemo } = useMemoStore();
  const [source, setSource] = useState<'note' | 'upload' | 'bookmark'>('note');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState('');
  const [folder, setFolder] = useState('');
  const [subfolder, setSubfolder] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isModalOpen) return null;

  const categories = Object.keys(DEFAULT_FOLDERS.categories);
  const folders = category ? DEFAULT_FOLDERS.categories[category as keyof typeof DEFAULT_FOLDERS.categories]?.subfolders.map(s => s.name) : [];

  const resetForm = () => {
    setSource('note');
    setTitle('');
    setContent('');
    setUrl('');
    setCategory('');
    setFolder('');
    setSubfolder('');
    setFile(null);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !category || !folder) return;

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      formData.append('source', source);
      if (url) formData.append('url', url);
      if (file) formData.append('file', file);
      formData.append('category', category);
      formData.append('folder', folder);
      if (subfolder) formData.append('subfolder', subfolder);

      const res = await fetch('/api/memos', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const newMemo = await res.json();
        addMemo(newMemo);
        handleClose();
      }
    } catch (error) {
      console.error('Error creating memo:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-6 m-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-zinc-100">Create New Memo</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2 p-1 bg-zinc-800/50 rounded-lg">
            {(['note', 'upload', 'bookmark'] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSource(s)}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                  source === s
                    ? 'bg-indigo-600 text-white'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {s === 'note' ? '📝 Note' : s === 'upload' ? '📄 Upload' : '🔗 Bookmark'}
              </button>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter title..."
              required
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">Category *</label>
              <select
                value={category}
                onChange={(e) => { setCategory(e.target.value); setFolder(''); setSubfolder(''); }}
                required
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:border-indigo-500"
              >
                <option value="">Select...</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">Folder *</label>
              <select
                value={folder}
                onChange={(e) => { setFolder(e.target.value); setSubfolder(''); }}
                required
                disabled={!category}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:border-indigo-500 disabled:opacity-50"
              >
                <option value="">Select...</option>
                {folders.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">Subfolder</label>
              <input
                type="text"
                value={subfolder}
                onChange={(e) => setSubfolder(e.target.value)}
                placeholder="Optional..."
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {source === 'upload' && (
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">File *</label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.txt,.md"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-indigo-600 file:text-white hover:file:bg-indigo-500"
              />
            </div>
          )}

          {source === 'bookmark' && (
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">URL *</label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://..."
                required={source === 'bookmark'}
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">
              Content {source === 'upload' ? '(optional notes)' : '*'}
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={source === 'upload' ? 'Add notes about this file...' : 'Enter content...'}
              required={source !== 'upload' && source !== 'bookmark'}
              rows={4}
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium rounded-lg transition-colors"
            >
              {isLoading ? 'Creating...' : 'Create Memo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}