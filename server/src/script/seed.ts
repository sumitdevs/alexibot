import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Embedder } from "../services/embedder";
import { db } from "../config/db.config";

type PartOfSpeech = "n" | "v" | "a" | "r";

const WORDNET_FILES: ReadonlyArray<{ file: string; pos: PartOfSpeech }> = [
  { file: "noun", pos: "n" },
  { file: "verb", pos: "v" },
  { file: "adj", pos: "a" },
  { file: "adv", pos: "r" },
];

const POS_ID_PREFIX: Record<PartOfSpeech, number> = { n: 1, v: 2, a: 3, r: 4 };
const DICT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../dict");

function parseGloss(line: string): string {
  return line.split("|", 2)[1]?.trim() ?? "";
}

function parseLemmas(line: string): string[] {
  const data = line.split("|", 1).at(0) ?? "";
  const parts = data.trim().split(/\s+/);
  const wordCount = Number.parseInt(parts[3] ?? "", 16);
  if (!Number.isFinite(wordCount)) {
    throw new Error(`Invalid WordNet word count in line: ${line.slice(0, 40)}`);
  }

  const lemmas: string[] = [];
  for (let index = 4; index < 4 + wordCount * 2; index += 2) {
    const lemma = parts[index];
    if (!lemma) throw new Error(`Missing WordNet lemma in line: ${line.slice(0, 40)}`);
    lemmas.push(lemma.replaceAll("_", " "));
  }
  return lemmas;
}

function buildIndexMap(indexText: string): Map<string, string[]> {
  const indexMap = new Map<string, string[]>();

  for (const line of indexText.split(/\r?\n/)) {
    if (!line || line.startsWith(" ")) continue;
    const parts = line.trim().split(/\s+/);
    const lemma = parts[0]?.replaceAll("_", " ");
    if (!lemma) continue;
    const synsetCount = Number.parseInt(parts[2] ?? "", 10);
    if (!Number.isFinite(synsetCount)) continue;

    for (const offset of parts.slice(-synsetCount)) {
      const synonyms = indexMap.get(offset) ?? [];
      synonyms.push(lemma);
      indexMap.set(offset, synonyms);
    }
  }

  return indexMap;
}

// WordNet offsets are only unique within a POS file. Namespace them in the BIGINT key.
function databaseSynsetId(offset: string, pos: PartOfSpeech): number {
  return POS_ID_PREFIX[pos] * 100_000_000 + Number.parseInt(offset, 10);
}

async function seedPartOfSpeech(file: string, expectedPos: PartOfSpeech, embedder: Embedder): Promise<number> {
  const indexText = fs.readFileSync(path.join(DICT_DIR, `index.${file}`), "utf8");
  const dataText = fs.readFileSync(path.join(DICT_DIR, `data.${file}`), "utf8");
  const indexMap = buildIndexMap(indexText);
  let total = 0;

  console.log(`Loading WordNet ${file} data...`);
  for (const line of dataText.split(/\r?\n/)) {
    if (!line || line.startsWith(" ")) continue;
    const parts = line.trim().split(/\s+/);
    const sourcePos = parts[2];
    const offset = parts[0];
    if (!sourcePos || !offset) continue;
    if (sourcePos !== expectedPos && !(expectedPos === "a" && sourcePos === "s")) continue;

    const synsetId = databaseSynsetId(offset, expectedPos);
    const gloss = parseGloss(line);
    const lemmas = parseLemmas(line);
    const synonyms = indexMap.get(offset) ?? lemmas;

    let embedding: number[] | null = null;
    try {
      embedding = await embedder.embed(gloss || lemmas.join(" "));
    } catch (error) {
      console.warn(`Embedding failed for ${expectedPos}:${offset}; storing NULL.`, error);
    }

    await db.begin(async (tx) => {
      const vector = embedding ? JSON.stringify(embedding) : null;
      await tx`
        INSERT INTO synsets (synset_id, pos, gloss, synonyms, embedding)
        VALUES (${synsetId}, ${sourcePos}, ${gloss}, ${JSON.stringify(synonyms)}::jsonb, ${vector}::vector)
        ON CONFLICT (synset_id) DO UPDATE
        SET pos = EXCLUDED.pos,
            gloss = EXCLUDED.gloss,
            synonyms = EXCLUDED.synonyms,
            embedding = COALESCE(EXCLUDED.embedding, synsets.embedding)
      `;

      for (const [index, lemma] of lemmas.entries()) {
        const [word] = await tx`
          INSERT INTO words (lemma) VALUES (${lemma})
          ON CONFLICT (lemma) DO UPDATE SET lemma = EXCLUDED.lemma
          RETURNING word_id
        `;
        if (!word) throw new Error(`Unable to create word: ${lemma}`);
        await tx`
          INSERT INTO senses (word_id, synset_id, sense_number)
          VALUES (${word.word_id}, ${synsetId}, ${index + 1})
          ON CONFLICT (word_id, synset_id) DO UPDATE SET sense_number = EXCLUDED.sense_number
        `;
      }
    });

    total += 1;
    if (total % 500 === 0) console.log(`Seeded ${total} ${file} synsets...`);
  }
  return total;
}

async function main(): Promise<void> {
  const embedder = Embedder.getInstance();
  let total = 0;
  try {
    for (const { file, pos } of WORDNET_FILES) total += await seedPartOfSpeech(file, pos, embedder);
    console.log(`Done. Seeded ${total} WordNet synsets.`);
  } finally {
    await db.end();
  }
}

main().catch((error) => {
  console.error("Seed script failed:", error);
  process.exitCode = 1;
});