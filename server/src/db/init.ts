import { db } from "../config/db.config";



// words table

await db`
CREATE TABLE IF NOT EXISTS words (
  word_id SERIAL PRIMARY KEY,
  lemma VARCHAR(255) NOT NULL UNIQUE
);
`;

// synsets table
await db`
CREATE TABLE IF NOT EXISTS synsets (
  synset_id BIGINT PRIMARY KEY,
  pos CHAR(1) NOT NULL CHECK (pos IN ('n','v','a','r','s')),
  gloss TEXT NOT NULL,
  synonyms JSONB NOT NULL DEFAULT '[]'::jsonb,
  embedding vector(384)  
);
`;

// senses link table
await db`
CREATE TABLE IF NOT EXISTS senses (
  sense_id SERIAL PRIMARY KEY,
  word_id INTEGER NOT NULL REFERENCES words(word_id) ON DELETE CASCADE,
  synset_id BIGINT NOT NULL REFERENCES synsets(synset_id) ON DELETE CASCADE,
  sense_number INTEGER,
  UNIQUE(word_id, synset_id)
);
`;

// pronunciations table
await db`
CREATE TABLE IF NOT EXISTS pronunciations (
  pronunciation_id SERIAL PRIMARY KEY,
  word_id INTEGER NOT NULL REFERENCES words(word_id) ON DELETE CASCADE,
  ipa TEXT,
  audio_url TEXT
);
`;

await db`
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
`;

await db `
CREATE TABLE IF NOT EXISTS word_bank (
  id BIGSERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  word_id INTEGER NOT NULL REFERENCES WORDS(word_id) ON DELETE CASCADE,
  synset_id BIGINT NOT NULL REFERENCES synsets(synset_id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW()
);
`;

await db `
CREATE TABLE IF NOT EXISTS user_history (
  id BIGSERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  word_id INTEGER NOT NULL REFERENCES WORDS(word_id) ON DELETE CASCADE,
  context TEXT,
  synset_id BIGINT NOT NULL REFERENCES synsets(synset_id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW()
);
`;

await db.end();
