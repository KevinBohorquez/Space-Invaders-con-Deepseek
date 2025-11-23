import { expect } from 'chai';
import sinon from 'sinon';
import { ScoreController } from '../controllers/scoreController.js';
import { ScoreService } from '../services/scoreService.js';

describe('ScoreController', () => {
    let req, res, createScoreStub, getTopScoresStub, getTotalScoresStub;

    beforeEach(() => {
        req = {
            body: {},
            validLimit: 10
        };
        res = {
            status: sinon.stub().returnsThis(),
            json: sinon.stub().returnsThis()
        };
        createScoreStub = sinon.stub(ScoreService, 'createScore');
        getTopScoresStub = sinon.stub(ScoreService, 'getTopScores');
        getTotalScoresStub = sinon.stub(ScoreService, 'getTotalScores');
    });

    afterEach(() => {
        sinon.restore();
    });

    describe('submitScore', () => {
        it('debe crear un score exitosamente', async () => {
            req.body = { playerName: 'Player1', score: 1000 };
            createScoreStub.resolves(123);

            await ScoreController.submitScore(req, res);

            expect(res.status.calledWith(201)).to.be.true;
            expect(res.json.calledOnce).to.be.true;
            
            const responseData = res.json.firstCall.args[0];
            expect(responseData).to.deep.equal({
                success: true,
                id: 123,
                message: 'Puntaje guardado exitosamente'
            });
        });

        it('debe manejar errores del servicio', async () => {
            req.body = { playerName: 'Player1', score: 1000 };
            createScoreStub.rejects(new Error('Database error'));

            await ScoreController.submitScore(req, res);

            expect(res.status.calledWith(500)).to.be.true;
            expect(res.json.calledOnce).to.be.true;
            
            const responseData = res.json.firstCall.args[0];
            expect(responseData).to.deep.equal({
                success: false,
                error: 'Error interno del servidor'
            });
        });
    });

    describe('getLeaderboard', () => {
        it('debe retornar el leaderboard exitosamente', async () => {
            const mockScores = [
                { id: 1, playerName: 'Player1', score: 1000 },
                { id: 2, playerName: 'Player2', score: 900 }
            ];
            getTopScoresStub.resolves(mockScores);

            await ScoreController.getLeaderboard(req, res);

            expect(getTopScoresStub.calledWith(10)).to.be.true;
            expect(res.json.calledOnce).to.be.true;
            
            const responseData = res.json.firstCall.args[0];
            expect(responseData).to.deep.equal({
                success: true,
                data: mockScores,
                count: 2
            });
        });

        it('debe usar el límite validado del request', async () => {
            req.validLimit = 25;
            getTopScoresStub.resolves([]);

            await ScoreController.getLeaderboard(req, res);

            expect(getTopScoresStub.calledWith(25)).to.be.true;
        });

        it('debe retornar array vacío si no hay scores', async () => {
            getTopScoresStub.resolves([]);

            await ScoreController.getLeaderboard(req, res);

            const responseData = res.json.firstCall.args[0];
            expect(responseData).to.deep.equal({
                success: true,
                data: [],
                count: 0
            });
        });

        it('debe manejar errores del servicio', async () => {
            getTopScoresStub.rejects(new Error('Database error'));

            await ScoreController.getLeaderboard(req, res);

            expect(res.status.calledWith(500)).to.be.true;
            
            const responseData = res.json.firstCall.args[0];
            expect(responseData).to.deep.equal({
                success: false,
                error: 'Error interno del servidor'
            });
        });
    });

    describe('healthCheck', () => {
        it('debe retornar OK cuando la base de datos está disponible', async () => {
            getTotalScoresStub.resolves(10);

            await ScoreController.healthCheck(req, res);

            expect(res.json.calledOnce).to.be.true;
            
            const responseData = res.json.firstCall.args[0];
            expect(responseData).to.have.property('status', 'OK');
            expect(responseData).to.have.property('timestamp');
            expect(responseData).to.have.property('service', 'Space Invaders API');
        });

        it('debe retornar ERROR cuando la base de datos falla', async () => {
            getTotalScoresStub.rejects(new Error('Connection failed'));

            await ScoreController.healthCheck(req, res);

            expect(res.status.calledWith(503)).to.be.true;
            
            const responseData = res.json.firstCall.args[0];
            expect(responseData).to.have.property('status', 'ERROR');
            expect(responseData).to.have.property('timestamp');
            expect(responseData).to.have.property('service', 'Space Invaders API');
            expect(responseData).to.have.property('error', 'Database connection failed');
        });

        it('debe incluir timestamp en formato ISO', async () => {
            getTotalScoresStub.resolves(0);

            await ScoreController.healthCheck(req, res);

            const responseData = res.json.firstCall.args[0];
            const timestamp = new Date(responseData.timestamp);
            
            expect(timestamp).to.be.instanceOf(Date);
            expect(timestamp.toISOString()).to.equal(responseData.timestamp);
        });
    });
});