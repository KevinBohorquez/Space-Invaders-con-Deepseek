import request from 'supertest';
import app from '../server.js';

describe('Score API', () => {
    describe('POST /api/scores', () => {
        it('debería crear un nuevo puntaje', async () => {
            const testScore = {
                playerName: 'TEST_PLAYER',
                score: 1000
            };
            
            const response = await request(app)
                .post('/api/scores')
                .send(testScore)
                .expect(201);
            
            expect(response.body.success).toBe(true);
            expect(response.body.id).toBeDefined();
        });
        
        it('debería fallar con nombre vacío', async () => {
            const response = await request(app)
                .post('/api/scores')
                .send({ playerName: '', score: 1000 })
                .expect(400);
            
            expect(response.body.error).toBeDefined();
        });
        
        it('debería fallar con puntaje inválido', async () => {
            const response = await request(app)
                .post('/api/scores')
                .send({ playerName: 'TEST', score: -100 })
                .expect(400);
            
            expect(response.body.error).toBeDefined();
        });
    });
    
    describe('GET /api/scores', () => {
        it('debería obtener el leaderboard', async () => {
            const response = await request(app)
                .get('/api/scores?limit=5')
                .expect(200);
            
            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
            expect(response.body.data.length).toBeLessThanOrEqual(5);
        });
        
        it('debería usar límite por defecto de 10', async () => {
            const response = await request(app)
                .get('/api/scores')
                .expect(200);
            
            expect(response.body.data.length).toBeLessThanOrEqual(10);
        });
    });
    
    describe('GET /api/health', () => {
        it('debería retornar estado OK', async () => {
            const response = await request(app)
                .get('/api/health')
                .expect(200);
            
            expect(response.body.status).toBe('OK');
            expect(response.body.service).toBe('Space Invaders API');
        });
    });
});