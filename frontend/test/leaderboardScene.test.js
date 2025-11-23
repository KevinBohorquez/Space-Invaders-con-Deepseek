import { expect } from 'chai';
import { LeaderboardScene } from '../src/scenes/leaderboardScene.js';

describe('LeaderboardScene', () => {
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
                drawCalls.push({ type: 'text', text, x, y });
            },
            fillRect: function(x, y, w, h) {
                drawCalls.push({ type: 'rect', x, y, w, h });
            }
        };

        mockGame = {
            ctx: mockCtx,
            leaderboardData: []
        };

        scene = new LeaderboardScene(mockGame);
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
        it('should not throw error when called', () => {
            expect(() => scene.enter()).to.not.throw();
        });

        it('should accept data parameter', () => {
            expect(() => scene.enter({ test: 'data' })).to.not.throw();
        });
    });

    describe('draw() - empty leaderboard', () => {
        beforeEach(() => {
            mockGame.leaderboardData = [];
            scene.draw();
        });

        it('should draw title', () => {
            const titleCall = drawCalls.find(call => 
                call.type === 'text' && call.text.includes('RANKING')
            );
            expect(titleCall).to.exist;
        });

        it('should show no scores message', () => {
            const noScoresCall = drawCalls.find(call => 
                call.type === 'text' && call.text.includes('NO HAY PUNTAJES')
            );
            expect(noScoresCall).to.exist;
        });

        it('should show server unavailable message', () => {
            const serverMsg = drawCalls.find(call => 
                call.type === 'text' && call.text.includes('servidor')
            );
            expect(serverMsg).to.exist;
        });
    });

    describe('draw() - with scores', () => {
        beforeEach(() => {
            mockGame.leaderboardData = [
                { playerName: 'PLAYER1', score: 1000 },
                { playerName: 'PLAYER2', score: 900 },
                { playerName: 'PLAYER3', score: 800 }
            ];
            scene.draw();
        });

        it('should draw header columns', () => {
            const headers = drawCalls.filter(call => 
                call.type === 'text' && 
                (call.text === '#' || call.text === 'JUGADOR' || call.text === 'PUNTAJE')
            );
            expect(headers.length).to.equal(3);
        });

        it('should draw separator line', () => {
            const line = drawCalls.find(call => 
                call.type === 'rect' && call.y === 130
            );
            expect(line).to.exist;
        });

        it('should draw all player names', () => {
            const player1 = drawCalls.find(call => 
                call.type === 'text' && call.text === 'PLAYER1'
            );
            const player2 = drawCalls.find(call => 
                call.type === 'text' && call.text === 'PLAYER2'
            );
            expect(player1).to.exist;
            expect(player2).to.exist;
        });

        it('should draw padded scores', () => {
            const score1 = drawCalls.find(call => 
                call.type === 'text' && call.text === '001000'
            );
            expect(score1).to.exist;
        });

        it('should limit to top 10 scores', () => {
            mockGame.leaderboardData = Array(15).fill(null).map((_, i) => ({
                playerName: `PLAYER${i}`,
                score: 1000 - i * 10
            }));
            
            drawCalls = [];
            scene.draw();
            
            const positions = drawCalls.filter(call => 
                call.type === 'text' && call.text.match(/^\d+\./)
            );
            expect(positions.length).to.be.at.most(10);
        });
    });
});