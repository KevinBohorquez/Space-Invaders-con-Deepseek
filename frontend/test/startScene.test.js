import { expect } from 'chai';
import { StartScene } from '../src/scenes/startScene.js';

describe('StartScene', () => {
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
                drawCalls.push({ type: 'text', text, x, y, style: this.fillStyle, font: this.font });
            },
            fillRect: function(x, y, w, h) {
                drawCalls.push({ type: 'rect', x, y, w, h, style: this.fillStyle });
            }
        };

        mockGame = {
            ctx: mockCtx
        };

        scene = new StartScene(mockGame);
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
    });

    describe('draw()', () => {
        beforeEach(() => {
            scene.draw();
        });

        it('should draw title text', () => {
            const titleCall = drawCalls.find(call => 
                call.type === 'text' && call.text === 'SPACE INVADERS'
            );
            expect(titleCall).to.exist;
        });

        it('should draw decorative line', () => {
            const lineCall = drawCalls.find(call => 
                call.type === 'rect' && call.y === 110 && call.w === 600
            );
            expect(lineCall).to.exist;
        });

        it('should draw player example', () => {
            const playerCall = drawCalls.find(call => 
                call.type === 'rect' && call.y === 150 && call.w === 80
            );
            expect(playerCall).to.exist;
        });

        it('should draw 5 enemy examples', () => {
            const enemyCalls = drawCalls.filter(call => 
                call.type === 'rect' && call.y === 200 && call.w === 50
            );
            expect(enemyCalls.length).to.equal(5);
        });

        it('should draw space instruction text', () => {
            const spaceText = drawCalls.find(call => 
                call.type === 'text' && call.text.includes('ESPACIO')
            );
            expect(spaceText).to.exist;
        });

        it('should draw enter instruction text', () => {
            const enterText = drawCalls.find(call => 
                call.type === 'text' && call.text.includes('ENTER')
            );
            expect(enterText).to.exist;
        });
    });
});