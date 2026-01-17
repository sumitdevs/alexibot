import { db } from '../config/db.config';
import type {
  User,
  RegisterDTO
} from '../types/auth.type';

export class UserModel {

  static async create(userData: RegisterDTO & { password_hash: string }): Promise<User | null> {
    const [user] = await db<User[]>`
      INSERT INTO users (name, email, password_hash)
      VALUES (${userData.name}, ${userData.email}, ${userData.password_hash})
      RETURNING *
    `;
    return user || null;
  }

  static async findByEmail(email: string): Promise<User | null> {
    const [user] = await db<User[]>`
      SELECT * FROM users WHERE email = ${email}
    `;
    return user || null;
  }

  static async findById(id: number): Promise<User | null> {
    const [user] = await db<User[]>`
      SELECT * FROM users WHERE id = ${id}
    `;
    return user || null;
  }

  static async emailExists(email: string): Promise<boolean> {
    const [result] = await db<[{ exists: boolean }]>`
      SELECT EXISTS(SELECT 1 FROM users WHERE email = ${email})
    `;
    return result.exists;
  }

  static async updatePassword(userId: number, password_hash: string): Promise<void> {
    await db`
      UPDATE users 
      SET password_hash = ${password_hash}
      WHERE id = ${userId}
    `;
  }

  static async getAllUsers(): Promise<Omit<User, 'password_hash'>[]> {
    const users = await db<User[]>`
      SELECT id, name, email, created_at FROM users
      ORDER BY created_at DESC
    `;
    return users;
  }

  static async deleteUser(userId: number): Promise<void> {
    await db`
      DELETE FROM users WHERE id = ${userId}
    `;
  }
}


export class UserWordBankModel {
  static async addToBank(user_id: number, word_id: number, synset_id: number): Promise<any> {
    const [item] = await db`
      INSERT INTO word_bank (word_id, synset_id, user_id)
      VALUES (${word_id}, ${synset_id}, ${user_id})
      RETURNING *
    `;
    return item;
  }

  static async removeFromBank(id: number, user_id: number): Promise<boolean> {
    const result = await db`
      DELETE FROM word_bank 
      WHERE id = ${id} AND user_id = ${user_id}
    `;
    return result.count > 0;
  }

  static async getUserWords(user_id: number, page = 1, limit = 20): Promise<{ items: any[], total: number }> {
    const offset = (page - 1) * limit;

    const items = await db`
      SELECT 
        wb.id,
        wb.created_at,
        w.word_id,
        w.lemma,
        sy.synset_id,
        sy.pos,
        sy.gloss,
        sy.synonyms
      FROM word_bank wb
      INNER JOIN words w ON wb.word_id = w.word_id
      INNER JOIN synsets sy ON wb.synset_id = sy.synset_id
      WHERE wb.id = ${user_id}
      ORDER BY wb.created_at DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `;

    const [{ count }] = await db<[{ count: number }]>`
      SELECT COUNT(*)::int as count 
      FROM word_bank 
      WHERE user_id = ${user_id}
    `;

    return { items, total: count };
  }

  static async checkExists(user_id: number, word_id: number, synset_id: number): Promise<boolean> {
    const [result] = await db<[{ exists: boolean }]>`
      SELECT EXISTS(
        SELECT 1 FROM word_bank 
        WHERE user_id = ${user_id} AND word_id = ${word_id} AND synset_id = ${synset_id}
      ) as exists
    `;
    return result.exists;
  }
}

export class UserHistoryModel {
  static async addToHistory(
    user_id: number ,
    word_id: number,
    synset_id: number,
    context: string | null = null
  ): Promise<any> {
    const [history] = await db`
      INSERT INTO user_history (user_id, word_id, synset_id, context)
      VALUES (${user_id}, ${word_id}, ${synset_id}, ${context})
      RETURNING *
    `;
    return history;
  }

  static async getUserHistory(
    user_id: number,
    page = 1,
    limit = 20
  ): Promise<{ items: any[], total: number }> {
    const offset = (page - 1) * limit;

    const items = await db`
      SELECT 
        uh.id,
        uh.context,
        uh.created_at,
        w.word_id,
        w.lemma,
        sy.synset_id,
        sy.pos,
        sy.gloss,
        sy.synonyms
      FROM user_history uh
      INNER JOIN words w ON uh.word_id = w.word_id
      INNER JOIN synsets sy ON uh.synset_id = sy.synset_id
      WHERE uh.user_id = ${user_id}
      ORDER BY uh.created_at DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `;

    const [{ count }] = await db<[{ count: number }]>`
      SELECT COUNT(*)::int as count 
      FROM user_history 
      WHERE user_id = ${user_id}
    `;

    return { items, total: count };
  }

  static async deleteHistory(id: number, user_id: number): Promise<boolean> {
    const result = await db`
      DELETE FROM user_history 
      WHERE id = ${id} AND user_id = ${user_id}
    `;
    return result.count > 0;
  }

  static async clearUserHistory(user_id: number): Promise<void> {
    await db`DELETE FROM user_history WHERE user_id = ${user_id}`;
  }

  static async getRecentWords(user_id: number, limit = 5): Promise<any[]> {
    return await db`
      SELECT DISTINCT ON (w.word_id)
        w.word_id,
        w.lemma,
        uh.created_at
      FROM user_history uh
      INNER JOIN words w ON uh.word_id = w.word_id
      WHERE uh.user_id = ${user_id}
      ORDER BY w.word_id, uh.created_at DESC
      LIMIT ${limit}
    `;
  }
}
