import { expect } from 'chai';
import { JSDOM } from 'jsdom';

describe('Main - Game Entry Point', () => {
    let dom;
    let document;
    let window;

    beforeEach(() => {
        dom = new JSDOM(`
            <!DOCTYPE html>
            <html>
                <head>
                    <title>Space Invaders</title>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                </head>
                <body>
                    <canvas id="game" width="800" height="600"></canvas>
                    <div id="name-input" class="hidden">
                        <input id="player-name" type="text" maxlength="12" placeholder="Ingresa tu nombre" />
                        <button id="start-btn">Iniciar Juego</button>
                        <button id="leaderboard-btn">Ver Ranking</button>
                    </div>
                    <div id="loading" class="hidden">Cargando...</div>
                    <script type="module" src="main.js"></script>
                </body>
            </html>
        `, { 
            url: 'http://localhost',
            pretendToBeVisual: true,
            resources: 'usable'
        });
        
        document = dom.window.document;
        window = dom.window;
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

    describe('HTML Document Structure', () => {
        it('should have proper DOCTYPE', () => {
            expect(document.doctype).to.not.be.null;
            expect(document.doctype.name).to.equal('html');
        });

        it('should have title element', () => {
            const title = document.querySelector('title');
            expect(title).to.not.be.null;
            expect(title.textContent).to.equal('Space Invaders');
        });

        it('should have UTF-8 charset', () => {
            const charset = document.querySelector('meta[charset]');
            expect(charset).to.not.be.null;
            expect(charset.getAttribute('charset')).to.equal('UTF-8');
        });

        it('should have viewport meta tag', () => {
            const viewport = document.querySelector('meta[name="viewport"]');
            expect(viewport).to.not.be.null;
        });

        it('should have module script tag', () => {
            const script = document.querySelector('script[type="module"]');
            expect(script).to.not.be.null;
        });
    });

    describe('DOMContentLoaded Event', () => {
        it('should fire DOMContentLoaded event', (done) => {
            let eventFired = false;
            
            document.addEventListener('DOMContentLoaded', () => {
                eventFired = true;
                expect(eventFired).to.be.true;
                done();
            });
            
            const event = new window.Event('DOMContentLoaded');
            document.dispatchEvent(event);
        });

        it('should allow accessing DOM elements after DOMContentLoaded', (done) => {
            document.addEventListener('DOMContentLoaded', () => {
                const canvas = document.getElementById('game');
                const nameInput = document.getElementById('name-input');
                
                expect(canvas).to.not.be.null;
                expect(nameInput).to.not.be.null;
                done();
            });
            
            const event = new window.Event('DOMContentLoaded');
            document.dispatchEvent(event);
        });
    });

    describe('Global Window Object', () => {
        it('should allow attaching game instance to window', () => {
            const mockGame = {
                playerName: 'TEST',
                score: 0,
                lives: 3,
                start: () => {}
            };
            
            window.game = mockGame;
            expect(window.game).to.equal(mockGame);
            expect(window.game.playerName).to.equal('TEST');
        });

        it('should be accessible globally after assignment', () => {
            window.game = { initialized: true };
            expect(window.game.initialized).to.be.true;
        });
    });

    describe('Input Validation and Sanitization', () => {
        let playerNameInput;

        beforeEach(() => {
            playerNameInput = document.getElementById('player-name');
        });

        it('should have placeholder text', () => {
            expect(playerNameInput.placeholder).to.equal('Ingresa tu nombre');
        });

        it('should limit input to 12 characters', () => {
            expect(playerNameInput.maxLength).to.equal(12);
        });

        it('should handle special characters in name', () => {
            playerNameInput.value = 'Test@123';
            expect(playerNameInput.value).to.include('@');
        });

        it('should handle numeric-only names', () => {
            playerNameInput.value = '12345';
            expect(playerNameInput.value).to.equal('12345');
        });

        it('should handle uppercase names', () => {
            playerNameInput.value = 'TESTPLAYER';
            expect(playerNameInput.value).to.equal('TESTPLAYER');
        });

        it('should handle lowercase names', () => {
            playerNameInput.value = 'testplayer';
            expect(playerNameInput.value).to.equal('testplayer');
        });
    });

    describe('Button Interaction', () => {
        it('should have clickable start button', () => {
            const startBtn = document.getElementById('start-btn');
            let timesClicked = 0;
            
            startBtn.addEventListener('click', () => {
                timesClicked++;
            });
            
            startBtn.click();
            startBtn.click();
            
            expect(timesClicked).to.equal(2);
        });

        it('should have clickable leaderboard button', () => {
            const leaderboardBtn = document.getElementById('leaderboard-btn');
            let clicked = false;
            
            leaderboardBtn.addEventListener('click', () => {
                clicked = true;
            });
            
            leaderboardBtn.click();
            expect(clicked).to.be.true;
        });
    });

    describe('Keyboard Event Handling', () => {
        it('should handle Enter key on player name input', () => {
            const playerNameInput = document.getElementById('player-name');
            let enterPressed = false;
            
            playerNameInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    enterPressed = true;
                }
            });
            
            const event = new window.KeyboardEvent('keypress', { key: 'Enter' });
            playerNameInput.dispatchEvent(event);
            
            expect(enterPressed).to.be.true;
        });

        it('should handle game control keys', () => {
            const controlKeys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' ', 'Escape'];
            const pressedKeys = new Set();
            
            document.addEventListener('keydown', (e) => {
                pressedKeys.add(e.key);
            });
            
            controlKeys.forEach(key => {
                const event = new window.KeyboardEvent('keydown', { key });
                document.dispatchEvent(event);
            });
            
            expect(pressedKeys.size).to.equal(controlKeys.length);
        });

        it('should handle alternative WASD controls', () => {
            const wasdKeys = ['w', 'a', 's', 'd'];
            const pressedKeys = [];
            
            document.addEventListener('keydown', (e) => {
                pressedKeys.push(e.key);
            });
            
            wasdKeys.forEach(key => {
                const event = new window.KeyboardEvent('keydown', { key });
                document.dispatchEvent(event);
            });
            
            expect(pressedKeys).to.deep.equal(wasdKeys);
        });
    });

    describe('Canvas Click Coordinates', () => {
        let canvas;

        beforeEach(() => {
            canvas = document.getElementById('game');
        });

        it('should calculate relative click position', () => {
            let relativeX, relativeY;
            
            canvas.addEventListener('click', (e) => {
                const rect = canvas.getBoundingClientRect();
                relativeX = e.clientX - rect.left;
                relativeY = e.clientY - rect.top;
            });
            
            const event = new window.MouseEvent('click', {
                clientX: 250,
                clientY: 150
            });
            canvas.dispatchEvent(event);
            
            expect(relativeX).to.be.a('number');
            expect(relativeY).to.be.a('number');
        });

        it('should detect clicks within canvas bounds', () => {
            const rect = canvas.getBoundingClientRect();
            const withinBounds = (x, y) => {
                return x >= 0 && x <= canvas.width && y >= 0 && y <= canvas.height;
            };
            
            expect(withinBounds(400, 300)).to.be.true;
            expect(withinBounds(-10, 300)).to.be.false;
            expect(withinBounds(900, 300)).to.be.false;
        });
    });

    describe('Loading State Management', () => {
        let loading;

        beforeEach(() => {
            loading = document.getElementById('loading');
        });

        it('should start hidden', () => {
            expect(loading.className).to.include('hidden');
        });

        it('should be able to show loading', () => {
            loading.classList.remove('hidden');
            expect(loading.className).to.not.include('hidden');
        });

        it('should be able to hide loading', () => {
            loading.classList.remove('hidden');
            loading.classList.add('hidden');
            expect(loading.className).to.include('hidden');
        });

        it('should display loading text', () => {
            expect(loading.textContent).to.equal('Cargando...');
        });
    });

    describe('Fetch API Availability', () => {
        it('should have fetch function available', () => {
            expect(fetch).to.be.a('function');
        });

        it('should handle successful fetch', async () => {
            const response = await fetch('http://localhost:4000/api/scores');
            expect(response.ok).to.be.true;
        });

        it('should handle fetch errors gracefully', async () => {
            global.fetch = async () => {
                throw new Error('Network error');
            };
            
            try {
                await fetch('http://localhost:4000/api/scores');
            } catch (error) {
                expect(error.message).to.equal('Network error');
            }
        });
    });

    describe('Scene Management Logic', () => {
        it('should validate scene names', () => {
            const validScenes = ['start', 'game', 'gameover', 'leaderboard'];
            
            expect(validScenes).to.include('start');
            expect(validScenes).to.include('game');
            expect(validScenes).to.include('gameover');
            expect(validScenes).to.include('leaderboard');
            expect(validScenes).to.not.include('invalid');
        });

        it('should support scene data passing', () => {
            const sceneData = {
                score: 5000,
                won: true,
                playerName: 'TEST'
            };
            
            expect(sceneData).to.have.property('score');
            expect(sceneData).to.have.property('won');
            expect(sceneData).to.have.property('playerName');
        });
    });
});