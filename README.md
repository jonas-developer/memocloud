# MemoCloud 🧠☁️

**Demo:** https://memocloud.io

Your personal "second brain" with semantic search and AI-powered answers (RAG).

---

## Features

- **Create Memos** — Upload PDF/DOCX, bookmarks, or write notes
- **Folder Organization** — Category → Folder → Subfolder hierarchy
- **Semantic Search** — Search by meaning, not just keywords (OpenAI embeddings)
- **RAG Mode** — Get AI answers based on your knowledge base

---

## Tech Stack

- Next.js 15 + TypeScript + Tailwind CSS
- OpenAI (embeddings + GPT)
- LangChain concepts (semantic search + RAG)
- Local JSON storage (easily upgrade to ChromaDB/Pinecone)

---

## Getting Started

### 1. Install

```bash
cd memocloud
npm install
```

### 2. Configure

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Add your OpenAI API key:

```
OPENAI_API_KEY=sk-...
```

### 3. Run

```bash
npm run dev
```

Open http://localhost:3000

---

## How It Works

1. **Add content** — Upload a file, paste a URL, or write a note
2. **Auto-embed** — Content is converted to embeddings using OpenAI
3. **Search** — Type a natural language query (e.g., "what did I save about TypeScript?")
4. **RAG** — Enable "Use RAG" to get AI-generated answers with sources

---

## Project Structure

```
memocloud/
├── app/
│   ├── api/
│   │   ├── memos/        # CRUD for memos
│   │   └── search/       # Semantic search + RAG
│   ├── page.tsx          # Main UI
│   └── globals.css       # Dark theme
├── components/            # UI components
├── lib/
│   ├── db.ts             # File-based DB
│   ├── openai.ts         # OpenAI client
│   └── types.ts          # TypeScript types
└── stores/               # Zustand state
```

---

## License

MIT
