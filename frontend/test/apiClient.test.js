import { expect } from 'chai';
import { submitScore, getLeaderboard } from '../src/utils/apiClient.js';

describe('ApiClient - Additional Coverage', () => {
    let originalFetch;

    beforeEach(() => {
        originalFetch = global.fetch;
    });

    afterEach(() => {
        global.fetch = originalFetch;
    });

    describe('submitScore() - error scenarios', () => {
        it('should throw error when response not ok', async () => {
            global.fetch = async () => ({
                ok: false,
                status: 400,
                statusText: 'Bad Request'
            });

            try {
                await submitScore('TEST', 1000);
                expect.fail('Should have thrown error');
            } catch (error) {
                expect(error.message).to.include('Error al enviar puntaje');
            }
        });

        it('should log error to console on failure', async () => {
            const consoleErrors = [];
            const originalConsoleError = console.error;
            console.error = (...args) => consoleErrors.push(args);

            global.fetch = async () => {
                throw new Error('Network error');
            };

            try {
                await submitScore('TEST', 1000);
            } catch (error) {
                // Expected
            }

            expect(consoleErrors.length).to.be.greaterThan(0);
            console.error = originalConsoleError;
        });

        it('should handle fetch network errors', async () => {
            global.fetch = async () => {
                throw new Error('Failed to fetch');
            };

            try {
                await submitScore('TEST', 1000);
                expect.fail('Should have thrown error');
            } catch (error) {
                expect(error.message).to.include('Failed to fetch');
            }
        });

        it('should send correct request body', async () => {
            let capturedBody = null;

            global.fetch = async (url, options) => {
                capturedBody = JSON.parse(options.body);
                return {
                    ok: true,
                    json: async () => ({ success: true })
                };
            };

            await submitScore('PLAYER1', 5000);

            expect(capturedBody).to.deep.equal({
                playerName: 'PLAYER1',
                score: 5000
            });
        });

        it('should use POST method', async () => {
            let capturedMethod = null;

            global.fetch = async (url, options) => {
                capturedMethod = options.method;
                return {
                    ok: true,
                    json: async () => ({ success: true })
                };
            };

            await submitScore('TEST', 1000);

            expect(capturedMethod).to.equal('POST');
        });

        it('should include Content-Type header', async () => {
            let capturedHeaders = null;

            global.fetch = async (url, options) => {
                capturedHeaders = options.headers;
                return {
                    ok: true,
                    json: async () => ({ success: true })
                };
            };

            await submitScore('TEST', 1000);

            expect(capturedHeaders['Content-Type']).to.equal('application/json');
        });
    });

    describe('getLeaderboard() - error scenarios', () => {
        it('should return empty data on fetch error', async () => {
            global.fetch = async () => {
                throw new Error('Network error');
            };

            const result = await getLeaderboard();

            expect(result.success).to.be.true;
            expect(result.data).to.deep.equal([]);
            expect(result.count).to.equal(0);
        });

        it('should return empty data when response not ok', async () => {
            global.fetch = async () => ({
                ok: false,
                status: 500,
                statusText: 'Internal Server Error'
            });

            const result = await getLeaderboard();

            expect(result.success).to.be.true;
            expect(result.data).to.deep.equal([]);
        });

        it('should log error to console on failure', async () => {
            const consoleErrors = [];
            const originalConsoleError = console.error;
            console.error = (...args) => consoleErrors.push(args);

            global.fetch = async () => {
                throw new Error('Connection refused');
            };

            await getLeaderboard();

            expect(consoleErrors.length).to.be.greaterThan(0);
            console.error = originalConsoleError;
        });

        it('should include limit parameter in URL', async () => {
            let capturedUrl = null;

            global.fetch = async (url) => {
                capturedUrl = url;
                return {
                    ok: true,
                    json: async () => ({ 
                        success: true, 
                        data: [], 
                        count: 0 
                    })
                };
            };

            await getLeaderboard(5);

            expect(capturedUrl).to.include('limit=5');
        });

        it('should use default limit of 10', async () => {
            let capturedUrl = null;

            global.fetch = async (url) => {
                capturedUrl = url;
                return {
                    ok: true,
                    json: async () => ({ 
                        success: true, 
                        data: [], 
                        count: 0 
                    })
                };
            };

            await getLeaderboard();

            expect(capturedUrl).to.include('limit=10');
        });

        it('should log leaderboard data on success', async () => {
            const consoleLogs = [];
            const originalConsoleLog = console.log;
            console.log = (...args) => consoleLogs.push(args);

            global.fetch = async () => ({
                ok: true,
                json: async () => ({ 
                    success: true, 
                    data: [{ playerName: 'TEST', score: 1000 }], 
                    count: 1 
                })
            });

            await getLeaderboard();

            expect(consoleLogs.some(log => 
                log[0] === 'Datos del leaderboard:'
            )).to.be.true;

            console.log = originalConsoleLog;
        });

        it('should return parsed JSON data on success', async () => {
            const mockData = {
                success: true,
                data: [
                    { playerName: 'PLAYER1', score: 5000 },
                    { playerName: 'PLAYER2', score: 3000 }
                ],
                count: 2
            };

            global.fetch = async () => ({
                ok: true,
                json: async () => mockData
            });

            const result = await getLeaderboard();

            expect(result).to.deep.equal(mockData);
        });
    });

    describe('API_BASE_URL configuration', () => {
        it('should use correct base URL for scores endpoint', async () => {
            let capturedUrl = null;

            global.fetch = async (url) => {
                capturedUrl = url;
                return {
                    ok: true,
                    json: async () => ({ success: true })
                };
            };

            await submitScore('TEST', 1000);

            expect(capturedUrl).to.include('http://localhost:4000/api/scores');
        });

        it('should use correct base URL for leaderboard endpoint', async () => {
            let capturedUrl = null;

            global.fetch = async (url) => {
                capturedUrl = url;
                return {
                    ok: true,
                    json: async () => ({ success: true, data: [], count: 0 })
                };
            };

            await getLeaderboard();

            expect(capturedUrl).to.include('http://localhost:4000/api/scores');
        });
    });
});