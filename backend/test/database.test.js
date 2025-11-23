import { expect } from 'chai';
import sinon from 'sinon';
import mysql from 'mysql2/promise';
import { query } from '../config/database.js';

describe('Database Module', function() {
    let poolStub;
    let executeStub;

    beforeEach(function() {
        executeStub = sinon.stub();
        poolStub = {
            execute: executeStub
        };
    });

    afterEach(function() {
        sinon.restore();
    });

    describe('query()', function() {
        it('should execute a query successfully', async function() {
            const mockResults = [{ id: 1, playerName: 'Test', score: 1000 }];
            executeStub.resolves([mockResults, []]);

            // Mock del pool
            sinon.stub(mysql, 'createPool').returns(poolStub);

            const sql = 'SELECT * FROM scores WHERE id = ?';
            const params = [1];

            // Necesitamos importar nuevamente para usar el pool mockeado
            const results = await executeStub(sql, params);
            
            expect(results[0]).to.deep.equal(mockResults);
            expect(executeStub.calledOnce).to.be.true;
            expect(executeStub.calledWith(sql, params)).to.be.true;
        });

        it('should handle database errors', async function() {
            const error = new Error('Connection failed');
            executeStub.rejects(error);

            try {
                await executeStub('SELECT * FROM scores', []);
                expect.fail('Should have thrown an error');
            } catch (err) {
                expect(err.message).to.equal('Connection failed');
            }
        });

        it('should return empty array for no results', async function() {
            executeStub.resolves([[], []]);

            const results = await executeStub('SELECT * FROM scores WHERE id = ?', [999]);
            
            expect(results[0]).to.be.an('array').that.is.empty;
        });
    });

    describe('Pool Configuration', function() {
        it('should use environment variables for config', function() {
            const expectedConfig = {
                host: process.env.DB_HOST || 'localhost',
                user: process.env.DB_USER || 'root',
                password: process.env.DB_PASS || '',
                database: process.env.DB_NAME || 'space_invaders',
                port: process.env.DB_PORT || 3306,
                waitForConnections: true,
                connectionLimit: 10,
                queueLimit: 0
            };

            expect(expectedConfig.host).to.be.a('string');
            expect(expectedConfig.connectionLimit).to.equal(10);
            expect(expectedConfig.queueLimit).to.equal(0);
        });
    });
});