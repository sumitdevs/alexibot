
export interface Word {
  word_id: number;
  lemma: string;
}

export interface Synset {
  synset_id: number;
  pos: 'n' | 'v' | 'a' | 'r' | 's';
  gloss: string;
  synonyms: string[];
  embedding?: number[];
}

export interface Sense {
  sense_id: number;
  word_id: number;
  synset_id: number;
  sense_number: number | null;
}

export interface Pronunciation {
  pronunciation_id: number;
  word_id: number;
  ipa: string | null;
  audio_url: string | null;
}

export interface WordDetails {
  word: Word;
  synsets: Array<{
    synset: Synset;
    sense_number: number | null;
  }>;
  pronunciations: Pronunciation[];
}

export interface CreateWordRequest {
  lemma: string;
  synsets: Array<{
    pos: 'n' | 'v' | 'a' | 'r' | 's';
    gloss: string;
    synonyms: string[];
    sense_number?: number;
  }>;
  pronunciations?: Array<{
    ipa?: string;
    audio_url?: string;
  }>;
}