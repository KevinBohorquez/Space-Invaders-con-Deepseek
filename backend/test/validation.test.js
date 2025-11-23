import { expect } from 'chai';
import { validateScore, validateLimit } from '../middleware/validation.js';

describe('Validation Middleware', () => {
    describe('validateScore', () => {
        let req, res, next;

        beforeEach(() => {
            req = { body: {} };
            res = {
                status: function(code) {
                    this.statusCode = code;
                    return this;
                },
                json: function(data) {
                    this.data = data;
                    return this;
                }
            };
            next = () => {};
        });

        it('debe rechazar si falta playerName', () => {
            req.body = { score: 100 };
            validateScore(req, res, next);
            
            expect(res.statusCode).to.equal(400);
            expect(res.data).to.have.property('error');
            expect(res.data.error).to.equal('Nombre de jugador inválido');
        });

        it('debe rechazar si playerName no es string', () => {
            req.body = { playerName: 123, score: 100 };
            validateScore(req, res, next);
            
            expect(res.statusCode).to.equal(400);
            expect(res.data.error).to.equal('Nombre de jugador inválido');
        });

        it('debe rechazar si playerName está vacío', () => {
            req.body = { playerName: '   ', score: 100 };
            validateScore(req, res, next);
            
            expect(res.statusCode).to.equal(400);
            expect(res.data.error).to.equal('Nombre de jugador inválido');
        });

        it('debe rechazar si score no es número', () => {
            req.body = { playerName: 'Player1', score: '100' };
            validateScore(req, res, next);
            
            expect(res.statusCode).to.equal(400);
            expect(res.data.error).to.equal('Puntaje inválido');
        });

        it('debe rechazar si score es negativo', () => {
            req.body = { playerName: 'Player1', score: -10 };
            validateScore(req, res, next);
            
            expect(res.statusCode).to.equal(400);
            expect(res.data.error).to.equal('Puntaje inválido');
        });

        it('debe rechazar si score excede el máximo', () => {
            req.body = { playerName: 'Player1', score: 1000000 };
            validateScore(req, res, next);
            
            expect(res.statusCode).to.equal(400);
            expect(res.data.error).to.equal('Puntaje inválido');
        });

        it('debe truncar playerName si excede 50 caracteres', () => {
            const longName = 'a'.repeat(60);
            req.body = { playerName: longName, score: 100 };
            
            let nextCalled = false;
            const customNext = () => { nextCalled = true; };
            
            validateScore(req, res, customNext);
            
            expect(nextCalled).to.be.true;
            expect(req.body.playerName).to.have.lengthOf(50);
        });

        it('debe aceptar datos válidos', () => {
            req.body = { playerName: 'Player1', score: 1000 };
            
            let nextCalled = false;
            const customNext = () => { nextCalled = true; };
            
            validateScore(req, res, customNext);
            
            expect(nextCalled).to.be.true;
            expect(res.statusCode).to.be.undefined;
        });
    });

    describe('validateLimit', () => {
        let req, res, next;

        beforeEach(() => {
            req = { query: {} };
            res = {
                status: function(code) {
                    this.statusCode = code;
                    return this;
                },
                json: function(data) {
                    this.data = data;
                    return this;
                }
            };
            next = () => {};
        });

        it('debe usar 10 como límite por defecto', () => {
            let nextCalled = false;
            const customNext = () => { nextCalled = true; };
            
            validateLimit(req, res, customNext);
            
            expect(nextCalled).to.be.true;
            expect(req.validLimit).to.equal(10);
        });

        it('debe rechazar límite menor a 1', () => {
            req.query.limit = '0';
            validateLimit(req, res, next);
            
            expect(res.statusCode).to.equal(400);
            expect(res.data.error).to.equal('Límite debe estar entre 1 y 100');
        });

        it('debe rechazar límite mayor a 100', () => {
            req.query.limit = '101';
            validateLimit(req, res, next);
            
            expect(res.statusCode).to.equal(400);
            expect(res.data.error).to.equal('Límite debe estar entre 1 y 100');
        });

        it('debe aceptar límite válido', () => {
            req.query.limit = '50';
            
            let nextCalled = false;
            const customNext = () => { nextCalled = true; };
            
            validateLimit(req, res, customNext);
            
            expect(nextCalled).to.be.true;
            expect(req.validLimit).to.equal(50);
        });
    });
});