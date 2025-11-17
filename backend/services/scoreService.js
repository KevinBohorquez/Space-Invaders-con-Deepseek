import { query } from '../config/database.js';

export class ScoreService {
    static async createScore(playerName, score) {
        const sql = 'INSERT INTO scores (playerName, score) VALUES (?, ?)';
        const result = await query(sql, [playerName, score]);
        return result.insertId;
    }
    
    static async getTopScores(limit = 10) {
        const sql = 'SELECT * FROM scores ORDER BY score DESC, createdAt DESC LIMIT 10';
        return await query(sql, [limit]);
    }
    
    static async getScoreById(id) {
        const sql = 'SELECT * FROM scores WHERE id = ?';
        const results = await query(sql, [id]);
        return results[0] || null;
    }
    
    static async getTotalScores() {
        const sql = 'SELECT COUNT(*) as total FROM scores';
        const results = await query(sql);
        return results[0].total;
    }
}