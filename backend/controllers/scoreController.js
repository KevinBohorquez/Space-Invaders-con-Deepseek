import { ScoreService } from '../services/scoreService.js';

export class ScoreController {
    static async submitScore(req, res) {
        try {
            const { playerName, score } = req.body;
            const id = await ScoreService.createScore(playerName, score);
            
            res.status(201).json({
                success: true,
                id,
                message: 'Puntaje guardado exitosamente'
            });
        } catch (error) {
            console.error('Error submitting score:', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor'
            });
        }
    }
    
    static async getLeaderboard(req, res) {
        try {
            const limit = req.validLimit;
            const scores = await ScoreService.getTopScores(limit);
            
            res.json({
                success: true,
                data: scores,
                count: scores.length
            });
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor'
            });
        }
    }
    
    static async healthCheck(req, res) {
        try {
            // Verificar conexión a la base de datos
            await ScoreService.getTotalScores();
            
            res.json({
                status: 'OK',
                timestamp: new Date().toISOString(),
                service: 'Space Invaders API'
            });
        } catch (error) {
            res.status(503).json({
                status: 'ERROR',
                timestamp: new Date().toISOString(),
                service: 'Space Invaders API',
                error: 'Database connection failed'
            });
        }
    }
}