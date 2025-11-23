import { expect } from 'chai';
import sinon from 'sinon';
import { ScoreService } from '../services/scoreService.js';
import * as database from '../config/database.js';

describe('ScoreService', () => {
    let queryStub;

    beforeEach(() => {
        queryStub = sinon.stub(database, 'query');
    });

    afterEach(() => {
        sinon.restore();
    });

    describe('createScore', () => {
        it('debe crear un nuevo score y retornar el insertId', async () => {
            const mockResult = { insertId: 123 };
            queryStub.resolves(mockResult);

            const result = await ScoreService.createScore('Player1', 1000);

            expect(result).to.equal(123);
            expect(queryStub.calledOnce).to.be.true;
            expect(queryStub.firstCall.args[0]).to.include('INSERT INTO scores');
            expect(queryStub.firstCall.args[1]).to.deep.equal(['Player1', 1000]);
        });

        it('debe propagar errores de la base de datos', async () => {
            queryStub.rejects(new Error('Database error'));

            try {
                await ScoreService.createScore('Player1', 1000);
                expect.fail('Debería haber lanzado un error');
            } catch (error) {
                expect(error.message).to.equal('Database error');
            }
        });
    });

    describe('getTopScores', () => {
        it('debe retornar los top scores con límite por defecto', async () => {
            const mockScores = [
                { id: 1, playerName: 'Player1', score: 1000 },
                { id: 2, playerName: 'Player2', score: 900 }
            ];
            queryStub.resolves(mockScores);

            const result = await ScoreService.getTopScores();

            expect(result).to.deep.equal(mockScores);
            expect(queryStub.calledOnce).to.be.true;
            expect(queryStub.firstCall.args[0]).to.include('ORDER BY score DESC');
        });

        it('debe aceptar un límite personalizado', async () => {
            const mockScores = [
                { id: 1, playerName: 'Player1', score: 1000 }
            ];
            queryStub.resolves(mockScores);

            const result = await ScoreService.getTopScores(5);

            expect(result).to.deep.equal(mockScores);
            expect(queryStub.calledOnce).to.be.true;
            expect(queryStub.firstCall.args[1]).to.deep.equal([5]);
        });

        it('debe retornar array vacío si no hay scores', async () => {
            queryStub.resolves([]);

            const result = await ScoreService.getTopScores();

            expect(result).to.be.an('array').that.is.empty;
        });
    });

    describe('getScoreById', () => {
        it('debe retornar un score por id', async () => {
            const mockScore = { id: 1, playerName: 'Player1', score: 1000 };
            queryStub.resolves([mockScore]);

            const result = await ScoreService.getScoreById(1);

            expect(result).to.deep.equal(mockScore);
            expect(queryStub.calledOnce).to.be.true;
            expect(queryStub.firstCall.args[0]).to.include('WHERE id = ?');
            expect(queryStub.firstCall.args[1]).to.deep.equal([1]);
        });

        it('debe retornar null si no encuentra el score', async () => {
            queryStub.resolves([]);

            const result = await ScoreService.getScoreById(999);

            expect(result).to.be.null;
        });
    });

    describe('getTotalScores', () => {
        it('debe retornar el total de scores', async () => {
            queryStub.resolves([{ total: 42 }]);

            const result = await ScoreService.getTotalScores();

            expect(result).to.equal(42);
            expect(queryStub.calledOnce).to.be.true;
            expect(queryStub.firstCall.args[0]).to.include('COUNT(*)');
        });

        it('debe retornar 0 si no hay scores', async () => {
            queryStub.resolves([{ total: 0 }]);

            const result = await ScoreService.getTotalScores();

            expect(result).to.equal(0);
        });
    });
});