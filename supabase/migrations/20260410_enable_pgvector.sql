-- 2026-04-10: Enable pgvector for Semantic Heritage Search
-- This migration initializes the vector storage capabilities for the Life Story Archive.

-- 1. Enable the pgvector extension to work with embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Add an embedding column to audio_recordings
-- We use 768 dimensions for Gemini-Embedding-004 compatibility
ALTER TABLE audio_recordings 
ADD COLUMN IF NOT EXISTS embedding vector(768);

-- 3. Create a specialized index for fast semantic traversal (IVFFlat)
-- This ensures the "Interactive Q&A Mechanism" stays responsive
CREATE INDEX IF NOT EXISTS audio_recordings_embedding_idx 
ON audio_recordings 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- 4. RPC for Semantic Matching
-- This function is called by the Interaction Service to discover relevant memory clusters
CREATE OR REPLACE FUNCTION match_recordings (
  query_embedding vector(768),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id uuid,
  title text,
  transcript text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ar.id,
    ar.title,
    ar.transcript,
    1 - (ar.embedding <=> query_embedding) AS similarity
  FROM audio_recordings ar
  WHERE 1 - (ar.embedding <=> query_embedding) > match_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$;
