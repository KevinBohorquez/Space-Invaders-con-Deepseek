import { expect } from 'chai';
import { GameOverScene } from '../src/scenes/gameOverScene.js';

describe('GameOverScene', () => {
    let scene;
    let mockGame;
    let mockCtx;
    let drawCalls;

    beforeEach(() => {
        drawCalls = [];
        
        mockCtx = {
            fillStyle: '',
            font: '',
            textAlign: '',
            fillText: function(text, x, y) {
                drawCalls.push({ type: 'text', text, x, y, style: this.fillStyle });
            }
        };

        mockGame = {
            ctx: mockCtx,
            playerName: 'TEST',
            scoreSubmitted: false
        };

        scene = new GameOverScene(mockGame);
    });

    describe('Constructor', () => {
        it('should store game reference', () => {
            expect(scene.game).to.equal(mockGame);
        });

        it('should store context reference', () => {
            expect(scene.ctx).to.equal(mockCtx);
        });
    });

    describe('enter()', () => {
        it('should store score from data', () => {
            scene.enter({ score: 5000, won: true });
            expect(scene.score).to.equal(5000);
        });

        it('should store won status from data', () => {
            scene.enter({ score: 1000, won: true });
            expect(scene.won).to.be.true;
        });

        it('should default to 0 score if not provided', () => {
            scene.enter({});
            expect(scene.score).to.equal(0);
        });

        it('should default to false won if not provided', () => {
            scene.enter({});
            expect(scene.won).to.be.false;
        });
    });

    describe('draw() - victory', () => {
        beforeEach(() => {
            scene.enter({ score: 5000, won: true });
            scene.draw();
        });

        it('should draw victory title', () => {
            const victoryCall = drawCalls.find(call => 
                call.type === 'text' && call.text === '¡VICTORIA!'
            );
            expect(victoryCall).to.exist;
        });

        it('should use green color for victory title', () => {
            const victoryCall = drawCalls.find(call => 
                call.type === 'text' && call.text === '¡VICTORIA!'
            );
            expect(victoryCall.style).to.equal('#00ff00');
        });

        it('should display score', () => {
            const scoreCall = drawCalls.find(call => 
                call.type === 'text' && call.text.includes('5000')
            );
            expect(scoreCall).to.exist;
        });
    });

    describe('draw() - defeat', () => {
        beforeEach(() => {
            scene.enter({ score: 2000, won: false });
            scene.draw();
        });

        it('should draw game over title', () => {
            const gameOverCall = drawCalls.find(call => 
                call.type === 'text' && call.text === 'GAME OVER'
            );
            expect(gameOverCall).to.exist;
        });

        it('should use red color for game over title', () => {
            const gameOverCall = drawCalls.find(call => 
                call.type === 'text' && call.text === 'GAME OVER'
            );
            expect(gameOverCall.style).to.equal('#ff0000');
        });
    });

    describe('draw() - common elements', () => {
        beforeEach(() => {
            mockGame.playerName = 'TESTPLAYER';
            mockGame.scoreSubmitted = true;
            scene.enter({ score: 3000, won: false });
            scene.draw();
        });

        it('should display player name', () => {
            const playerCall = drawCalls.find(call => 
                call.type === 'text' && call.text.includes('TESTPLAYER')
            );
            expect(playerCall).to.exist;
        });

        it('should show score saved message when submitted', () => {
            const savedCall = drawCalls.find(call => 
                call.type === 'text' && call.text.includes('GUARDADO')
            );
            expect(savedCall).to.exist;
        });

        it('should show error message when not submitted', () => {
            mockGame.scoreSubmitted = false;
            drawCalls = [];
            scene.draw();
            
            const errorCall = drawCalls.find(call => 
                call.type === 'text' && call.text.includes('ERROR')
            );
            expect(errorCall).to.exist;
        });

        it('should display instructions', () => {
            const instructionsCall = drawCalls.find(call => 
                call.type === 'text' && call.text.includes('ENTER')
            );
            expect(instructionsCall).to.exist;
        });
    });
});