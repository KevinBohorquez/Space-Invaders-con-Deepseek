import { expect } from 'chai';
import { SceneManager } from '../src/scenes/sceneManager.js';

describe('SceneManager', () => {
    let sceneManager;
    let mockScene;

    beforeEach(() => {
        sceneManager = new SceneManager();
        mockScene = {
            entered: false,
            enteredData: null,
            enter: function(data) {
                this.entered = true;
                this.enteredData = data;
            }
        };
    });

    describe('Constructor', () => {
        it('should initialize with empty scenes map', () => {
            expect(sceneManager.scenes).to.be.instanceof(Map);
            expect(sceneManager.scenes.size).to.equal(0);
        });

        it('should initialize with null currentScene', () => {
            expect(sceneManager.currentScene).to.be.null;
        });
    });

    describe('registerScene()', () => {
        it('should add scene to scenes map', () => {
            sceneManager.registerScene('start', mockScene);
            expect(sceneManager.scenes.has('start')).to.be.true;
        });

        it('should store scene with correct key', () => {
            sceneManager.registerScene('game', mockScene);
            expect(sceneManager.scenes.get('game')).to.equal(mockScene);
        });

        it('should allow multiple scenes to be registered', () => {
            const mockScene2 = { enter: () => {} };
            sceneManager.registerScene('start', mockScene);
            sceneManager.registerScene('game', mockScene2);
            expect(sceneManager.scenes.size).to.equal(2);
        });
    });

    describe('changeScene()', () => {
        beforeEach(() => {
            sceneManager.registerScene('start', mockScene);
        });

        it('should set currentScene to specified scene name', () => {
            sceneManager.changeScene('start');
            expect(sceneManager.currentScene).to.equal('start');
        });

        it('should call enter() on the new scene', () => {
            sceneManager.changeScene('start');
            expect(mockScene.entered).to.be.true;
        });

        it('should pass data to scene enter method', () => {
            const testData = { score: 100 };
            sceneManager.changeScene('start', testData);
            expect(mockScene.enteredData).to.deep.equal(testData);
        });

        it('should pass empty object if no data provided', () => {
            sceneManager.changeScene('start');
            expect(mockScene.enteredData).to.deep.equal({});
        });

        it('should do nothing if scene does not exist', () => {
            sceneManager.changeScene('nonexistent');
            expect(sceneManager.currentScene).to.be.null;
        });
    });

    describe('getCurrentScene()', () => {
        beforeEach(() => {
            sceneManager.registerScene('start', mockScene);
        });

        it('should return null when no scene is active', () => {
            expect(sceneManager.getCurrentScene()).to.be.undefined;
        });

        it('should return current scene after changeScene', () => {
            sceneManager.changeScene('start');
            expect(sceneManager.getCurrentScene()).to.equal(mockScene);
        });

        it('should return correct scene after multiple changes', () => {
            const mockScene2 = { enter: () => {} };
            sceneManager.registerScene('game', mockScene2);
            
            sceneManager.changeScene('start');
            sceneManager.changeScene('game');
            
            expect(sceneManager.getCurrentScene()).to.equal(mockScene2);
        });
    });
});