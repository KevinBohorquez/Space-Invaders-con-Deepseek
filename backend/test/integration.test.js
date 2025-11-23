import { expect } from 'chai';
import request from 'supertest';
import sinon from 'sinon';
import app from '../server.js';
import * as database from '../config/database.js';

describe('Integration Tests - API Endpoints', () => {
    let queryStub;

    beforeEach(() => {
        queryStub = sinon.stub(database, 'query');
    });

    afterEach(() => {
        sinon.restore();
    });

    describe('POST /api/scores', () => {
        it('debe crear un score exitosamente', async () => {
            queryStub.resolves({ insertId: 1 });

            const response = await request(app)
                .post('/api/scores')
                .send({ playerName: 'TestPlayer', score: 5000 })
                .expect(201);

            expect(response.body).to.have.property('success', true);
            expect(response.body).to.have.property('id', 1);
            expect(response.body).to.have.property('message', 'Puntaje guardado exitosamente');
        });

        it('debe rechazar score sin playerName', async () => {
            const response = await request(app)
                .post('/api/scores')
                .send({ score: 5000 })
                .expect(400);

            expect(response.body).to.have.property('error', 'Nombre de jugador inválido');
        });

        it('debe rechazar score negativo', async () => {
            const response = await request(app)
                .post('/api/scores')
                .send({ playerName: 'TestPlayer', score: -100 })
                .expect(400);

            expect(response.body).to.have.property('error', 'Puntaje inválido');
        });

        it('debe rechazar score que excede el máximo', async () => {
            const response = await request(app)
                .post('/api/scores')
                .send({ playerName: 'TestPlayer', score: 1000000 })
                .expect(400);

            expect(response.body).to.have.property('error', 'Puntaje inválido');
        });

        it('debe truncar nombres muy largos', async () => {
            queryStub.resolves({ insertId: 1 });

            const longName = 'a'.repeat(60);
            const response = await request(app)
                .post('/api/scores')
                .send({ playerName: longName, score: 1000 })
                .expect(201);

            expect(response.body).to.have.property('success', true);
        });

        it('debe manejar errores de base de datos', async () => {
            queryStub.rejects(new Error('Database connection failed'));

            const response = await request(app)
                .post('/api/scores')
                .send({ playerName: 'TestPlayer', score: 1000 })
                .expect(500);

            expect(response.body).to.have.property('success', false);
            expect(response.body).to.have.property('error', 'Error interno del servidor');
        });
    });

    describe('GET /api/scores', () => {
        it('debe retornar el leaderboard con límite por defecto', async () => {
            const mockScores = [
                { id: 1, playerName: 'Player1', score: 5000, createdAt: new Date() },
                { id: 2, playerName: 'Player2', score: 4000, createdAt: new Date() }
            ];
            queryStub.resolves(mockScores);

            const response = await request(app)
                .get('/api/scores')
                .expect(200);

            expect(response.body).to.have.property('success', true);
            expect(response.body).to.have.property('data').that.is.an('array');
            expect(response.body).to.have.property('count', 2);
            expect(response.body.data).to.have.lengthOf(2);
        });

        it('debe aceptar límite personalizado', async () => {
            queryStub.resolves([]);

            const response = await request(app)
                .get('/api/scores?limit=5')
                .expect(200);

            expect(response.body).to.have.property('success', true);
            expect(response.body).to.have.property('data').that.is.an('array');
        });

        it('debe rechazar límite menor a 1', async () => {
            const response = await request(app)
                .get('/api/scores?limit=0')
                .expect(400);

            expect(response.body).to.have.property('error', 'Límite debe estar entre 1 y 100');
        });

        it('debe rechazar límite mayor a 100', async () => {
            const response = await request(app)
                .get('/api/scores?limit=101')
                .expect(400);

            expect(response.body).to.have.property('error', 'Límite debe estar entre 1 y 100');
        });

        it('debe retornar array vacío cuando no hay scores', async () => {
            queryStub.resolves([]);

            const response = await request(app)
                .get('/api/scores')
                .expect(200);

            expect(response.body).to.have.property('success', true);
            expect(response.body.data).to.be.an('array').that.is.empty;
            expect(response.body).to.have.property('count', 0);
        });

        it('debe manejar errores de base de datos', async () => {
            queryStub.rejects(new Error('Database error'));

            const response = await request(app)
                .get('/api/scores')
                .expect(500);

            expect(response.body).to.have.property('success', false);
            expect(response.body).to.have.property('error', 'Error interno del servidor');
        });
    });

    describe('GET /api/health', () => {
        it('debe retornar OK cuando el servicio está funcionando', async () => {
            queryStub.resolves([{ total: 10 }]);

            const response = await request(app)
                .get('/api/health')
                .expect(200);

            expect(response.body).to.have.property('status', 'OK');
            expect(response.body).to.have.property('timestamp');
            expect(response.body).to.have.property('service', 'Space Invaders API');
        });

        it('debe retornar ERROR cuando la base de datos falla', async () => {
            queryStub.rejects(new Error('Connection failed'));

            const response = await request(app)
                .get('/api/health')
                .expect(503);

            expect(response.body).to.have.property('status', 'ERROR');
            expect(response.body).to.have.property('timestamp');
            expect(response.body).to.have.property('service', 'Space Invaders API');
            expect(response.body).to.have.property('error', 'Database connection failed');
        });
    });

    describe('404 Errors', () => {
        it('debe retornar 404 para endpoints API no existentes', async () => {
            const response = await request(app)
                .get('/api/nonexistent')
                .expect(404);

            expect(response.body).to.have.property('error', 'Endpoint no encontrado');
        });
    });
});