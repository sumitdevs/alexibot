
export interface User {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  created_at: Date;
}

export interface RegisterDTO {
  name: string;
  email: string;
  password: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

// export interface AuthResponse {
//   user: Omit<User, 'password_hash'>;
//   token: string;
// }

export interface JWTPayload {
  userId: number;
  name: string,
  email: string;
}

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