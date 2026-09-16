import { db } from '../config/db.config';
import { Embedder } from '../services/embedder';
import pluralize from 'pluralize';

import type { 
  Word, 
  Synset, 
  Pronunciation, 
  WordDetails, 
  CreateWordRequest 
} from '../types/dictionary.type';

export class WordModel {
  private static normalizeLookupWord(word: string) {
    const exact = word.trim().toLowerCase();
    return {
      exact,
      singular: pluralize.singular(exact),
    };
  }

  static async findByLemma(lemma: string): Promise<Word | null> {
    const { exact, singular } = this.normalizeLookupWord(lemma);
    const [word] = await db<Word[]>`
      SELECT *
      FROM words
      WHERE LOWER(lemma) = ${exact} OR LOWER(lemma) = ${singular}
      ORDER BY CASE WHEN LOWER(lemma) = ${exact} THEN 0 ELSE 1 END
      LIMIT 1
    `;
    return word || null;
  }

  static async create(lemma: string): Promise<Word | null> {
    const [word] = await db<Word[]>`
      INSERT INTO words (lemma)
      VALUES (${lemma})
      ON CONFLICT (lemma) DO UPDATE SET lemma = EXCLUDED.lemma
      RETURNING *
    `;
    return word || null;
  }

  static async getWordDetails(lemma: string): Promise<WordDetails | null> {
    const word = await this.findByLemma(lemma);
    if (!word) return null;

    const synsets = await db<Array<Synset & { sense_number: number | null }>>`
      SELECT 
        sy.synset_id,
        sy.pos,
        sy.gloss,
        sy.synonyms,
        se.sense_number
      FROM synsets sy
      INNER JOIN senses se ON sy.synset_id = se.synset_id
      WHERE se.word_id = ${word.word_id}
      ORDER BY se.sense_number NULLS LAST
    `;

    const pronunciations = await db<Pronunciation[]>`
      SELECT * FROM pronunciations WHERE word_id = ${word.word_id}
    `;

    return {
      word,
      synsets: synsets.map(s => ({
        synset: {
          synset_id: s.synset_id,
          pos: s.pos,
          gloss: s.gloss,
          synonyms: s.synonyms
        },
        sense_number: s.sense_number
      })),
      pronunciations
    };
  }

 static async searchWordInContext(word: string, context: string) {
  const embedder = Embedder.getInstance();
  const { exact, singular } = this.normalizeLookupWord(word);
  let embedding = await embedder.embed(context);

  const norm = Math.hypot(...embedding);
  if (norm > 0) embedding = embedding.map(v => v / norm);

  const wordRow = await db`
    SELECT word_id, lemma
    FROM words
    WHERE LOWER(lemma) = ${exact}
       OR LOWER(lemma) = ${singular}
    ORDER BY CASE WHEN LOWER(lemma) = ${exact} THEN 0 ELSE 1 END
    LIMIT 1
  `;

  if (!wordRow[0]) return null;

  const wordId = wordRow[0].word_id;

  const rows = await db`
    SELECT 
      sy.synset_id,
      sy.synonyms,
      sy.gloss,
      sy.pos,
      s.sense_number,
      (sy.embedding <-> (${db.array(embedding)}::float4[])::vector) AS distance
    FROM senses s
    JOIN synsets sy ON sy.synset_id = s.synset_id
    WHERE s.word_id = ${wordId}
    ORDER BY distance
    LIMIT 1;
  `;

  const r = rows[0];

  if (!r) return null;

  return {
    word_id:  wordRow[0].word_id,
    lemma: wordRow[0].lemma,
    synset_id: r.synset_id,
    gloss: r.gloss,
    synonyms: r.synonyms,
    pos: r.pos,
    sense_number: r.sense_number,
    distance: r.distance,
    similarity: 1 - r.distance
  };
}


}

export class SynsetModel {
  static async addSynsetToWord(
    word_id: number,
    synset_id: number,
    sense_number?: number
  ): Promise<void> {
    await db`
      INSERT INTO senses (word_id, synset_id, sense_number)
      VALUES (${word_id}, ${synset_id}, ${sense_number || null})
      ON CONFLICT (word_id, synset_id) DO NOTHING
    `;
  }

  static async findById(synset_id: number): Promise<Synset | null> {
    const [synset] = await db<Synset[]>`
      SELECT * FROM synsets WHERE synset_id = ${synset_id}
    `;
    return synset || null;
  }
}
