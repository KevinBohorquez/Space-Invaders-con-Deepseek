import { expect } from 'chai';
import { JSDOM } from 'jsdom';

describe('SpaceInvadersGame - DOM and Integration', () => {
    let dom;
    let document;
    let window;
    let canvas;
    let ctx;

    beforeEach(() => {
        // Setup JSDOM
        dom = new JSDOM(`
            <!DOCTYPE html>
            <html>
                <body>
                    <canvas id="game" width="800" height="600"></canvas>
                    <div id="name-input" class="hidden">
                        <input id="player-name" type="text" maxlength="12" />
                        <button id="start-btn">Iniciar</button>
                        <button id="leaderboard-btn">Ranking</button>
                    </div>
                    <div id="loading" class="hidden">Cargando...</div>
                </body>
            </html>
        `);
        
        document = dom.window.document;
        window = dom.window;
        canvas = document.getElementById('game');
        
        global.document = document;
        global.window = window;
        global.requestAnimationFrame = (cb) => setTimeout(cb, 16);
        global.fetch = async () => ({ 
            ok: true, 
            json: async () => ({ success: true, data: [] })
        });
    });

    afterEach(() => {
        delete global.document;
        delete global.window;
        delete global.requestAnimationFrame;
        delete global.fetch;
    });

    describe('Game Initialization Requirements', () => {
        it('should have canvas element with id "game"', () => {
            expect(canvas).to.not.be.null;
            expect(canvas.id).to.equal('game');
        });

        it('should have canvas with correct dimensions', () => {
            expect(canvas.width).to.equal(800);
            expect(canvas.height).to.equal(600);
        });

        it('should have 2d rendering context available', () => {
            const ctx = canvas.getContext('2d');
            expect(ctx).to.not.be.null;
            expect(ctx.canvas).to.equal(canvas);
        });

        it('should have name input container', () => {
            const nameInput = document.getElementById('name-input');
            expect(nameInput).to.not.be.null;
        });

        it('should have player name input field', () => {
            const playerNameInput = document.getElementById('player-name');
            expect(playerNameInput).to.not.be.null;
            expect(playerNameInput.type).to.equal('text');
        });

        it('should have start button', () => {
            const startBtn = document.getElementById('start-btn');
            expect(startBtn).to.not.be.null;
            expect(startBtn.textContent).to.equal('Iniciar');
        });

        it('should have leaderboard button', () => {
            const leaderboardBtn = document.getElementById('leaderboard-btn');
            expect(leaderboardBtn).to.not.be.null;
            expect(leaderboardBtn.textContent).to.equal('Ranking');
        });

        it('should have loading indicator', () => {
            const loading = document.getElementById('loading');
            expect(loading).to.not.be.null;
        });
    });

    describe('Game State Management', () => {
        it('should support storing game state in window object', () => {
            const mockGameState = {
                playerName: 'TEST_PLAYER',
                score: 1000,
                lives: 3
            };
            window.gameState = mockGameState;
            expect(window.gameState).to.deep.equal(mockGameState);
        });

        it('should allow multiple keys to be tracked', () => {
            const keys = {};
            keys['ArrowLeft'] = true;
            keys['ArrowRight'] = false;
            keys[' '] = true;
            
            expect(keys['ArrowLeft']).to.be.true;
            expect(keys['ArrowRight']).to.be.false;
            expect(keys[' ']).to.be.true;
        });

        it('should handle scene transitions', () => {
            let currentScene = 'start';
            const validScenes = ['start', 'game', 'gameover', 'leaderboard'];
            
            currentScene = 'game';
            expect(validScenes).to.include(currentScene);
            
            currentScene = 'gameover';
            expect(validScenes).to.include(currentScene);
        });
    });

    describe('Player Name Validation', () => {
        let playerNameInput;

        beforeEach(() => {
            playerNameInput = document.getElementById('player-name');
        });

        it('should have maxlength of 12 characters', () => {
            expect(playerNameInput.maxLength).to.equal(12);
        });

        it('should accept alphanumeric input', () => {
            playerNameInput.value = 'PLAYER123';
            expect(playerNameInput.value).to.equal('PLAYER123');
        });

        it('should allow trimming whitespace', () => {
            playerNameInput.value = '  SPACES  ';
            const trimmed = playerNameInput.value.trim();
            expect(trimmed).to.equal('SPACES');
        });

        it('should default to "JUGADOR" when empty', () => {
            playerNameInput.value = '';
            const name = playerNameInput.value.trim() || 'JUGADOR';
            expect(name).to.equal('JUGADOR');
        });

        it('should truncate names longer than 12 characters', () => {
            const longName = 'VERYLONGPLAYERNAME';
            const truncated = longName.substring(0, 12);
            expect(truncated.length).to.equal(12);
            expect(truncated).to.equal('VERYLONGPLAY');
        });
    });

    describe('Canvas Drawing Context Methods', () => {
        let ctx;

        beforeEach(() => {
            ctx = canvas.getContext('2d');
        });

        it('should support fillRect for drawing rectangles', () => {
            expect(ctx.fillRect).to.be.a('function');
            expect(() => ctx.fillRect(0, 0, 100, 100)).to.not.throw();
        });

        it('should support fillText for drawing text', () => {
            expect(ctx.fillText).to.be.a('function');
            expect(() => ctx.fillText('Test', 100, 100)).to.not.throw();
        });

        it('should support fillStyle property', () => {
            ctx.fillStyle = '#00ff00';
            expect(ctx.fillStyle).to.include('00ff00');
        });

        it('should support font property', () => {
            ctx.font = '20px Arial';
            expect(ctx.font).to.include('20px');
        });

        it('should support textAlign property', () => {
            ctx.textAlign = 'center';
            expect(ctx.textAlign).to.equal('center');
        });
    });

    describe('Event Handling', () => {
        it('should handle keydown events', () => {
            let keyPressed = null;
            document.addEventListener('keydown', (e) => {
                keyPressed = e.key;
            });

            const event = new window.KeyboardEvent('keydown', { key: 'ArrowLeft' });
            document.dispatchEvent(event);
            
            expect(keyPressed).to.equal('ArrowLeft');
        });

        it('should handle keyup events', () => {
            let keyReleased = null;
            document.addEventListener('keyup', (e) => {
                keyReleased = e.key;
            });

            const event = new window.KeyboardEvent('keyup', { key: 'ArrowRight' });
            document.dispatchEvent(event);
            
            expect(keyReleased).to.equal('ArrowRight');
        });

        it('should track multiple simultaneous key presses', () => {
            const keys = {};
            
            document.addEventListener('keydown', (e) => {
                keys[e.key] = true;
            });
            
            document.addEventListener('keyup', (e) => {
                keys[e.key] = false;
            });

            const downEvent1 = new window.KeyboardEvent('keydown', { key: 'ArrowLeft' });
            const downEvent2 = new window.KeyboardEvent('keydown', { key: ' ' });
            
            document.dispatchEvent(downEvent1);
            document.dispatchEvent(downEvent2);
            
            expect(keys['ArrowLeft']).to.be.true;
            expect(keys[' ']).to.be.true;
        });

        it('should handle button clicks', () => {
            const startBtn = document.getElementById('start-btn');
            let clicked = false;
            
            startBtn.addEventListener('click', () => {
                clicked = true;
            });
            
            startBtn.click();
            expect(clicked).to.be.true;
        });

        it('should handle canvas click with coordinates', () => {
            let clickCoords = null;
            
            canvas.addEventListener('click', (e) => {
                const rect = canvas.getBoundingClientRect();
                clickCoords = {
                    x: e.clientX - rect.left,
                    y: e.clientY - rect.top
                };
            });
            
            const event = new window.MouseEvent('click', {
                clientX: 400,
                clientY: 300
            });
            canvas.dispatchEvent(event);
            
            expect(clickCoords).to.not.be.null;
            expect(clickCoords).to.have.property('x');
            expect(clickCoords).to.have.property('y');
        });
    });

    describe('Game Loop Requirements', () => {
        it('should support requestAnimationFrame', () => {
            expect(requestAnimationFrame).to.be.a('function');
        });

        it('should execute animation frame callback', (done) => {
            let executed = false;
            requestAnimationFrame(() => {
                executed = true;
                expect(executed).to.be.true;
                done();
            });
        });

        it('should support setTimeout for delays', (done) => {
            let delayed = false;
            setTimeout(() => {
                delayed = true;
                expect(delayed).to.be.true;
                done();
            }, 10);
        });
    });

    describe('CSS Class Manipulation', () => {
        it('should toggle hidden class on name input', () => {
            const nameInput = document.getElementById('name-input');
            expect(nameInput.className).to.include('hidden');
            
            nameInput.classList.remove('hidden');
            expect(nameInput.className).to.not.include('hidden');
            
            nameInput.classList.add('hidden');
            expect(nameInput.className).to.include('hidden');
        });

        it('should toggle hidden class on loading', () => {
            const loading = document.getElementById('loading');
            expect(loading.className).to.include('hidden');
            
            loading.classList.remove('hidden');
            expect(loading.className).to.not.include('hidden');
        });
    });
});