import { SceneManager } from './scenes/sceneManager.js';
import { StartScene } from './scenes/startScene.js';
import { GameScene } from './scenes/gameScene.js';
import { GameOverScene } from './scenes/gameOverScene.js';
import { LeaderboardScene } from './scenes/leaderboardScene.js';
import { submitScore, getLeaderboard } from './utils/apiClient.js';

class SpaceInvadersGame {
    constructor() {
        this.canvas = document.getElementById('game');
        this.ctx = this.canvas.getContext('2d');
        this.nameInput = document.getElementById('name-input');
        this.playerNameInput = document.getElementById('player-name');
        this.startBtn = document.getElementById('start-btn');
        this.leaderboardBtn = document.getElementById('leaderboard-btn');
        this.loading = document.getElementById('loading');
        
        this.sceneManager = new SceneManager();
        this.playerName = 'JUGADOR';
        this.scoreSubmitted = false;
        this.leaderboardData = [];
        
        this.keys = {};
        
        this.init();
    }
    
    init() {
        console.log("Inicializando Space Invaders...");
        this.setupScenes();
        this.setupEventListeners();
        this.showNameInput();
        this.gameLoop();
    }
    
    setupScenes() {
        this.sceneManager.registerScene('start', new StartScene(this));
        this.sceneManager.registerScene('game', new GameScene(this));
        this.sceneManager.registerScene('gameover', new GameOverScene(this));
        this.sceneManager.registerScene('leaderboard', new LeaderboardScene(this));
        this.sceneManager.changeScene('start');
    }
    
    setupEventListeners() {
        // Teclado
        document.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
            this.handleGlobalKeys(e);
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });
        
        // Botones
        this.startBtn.addEventListener('click', () => this.startGame());
        this.leaderboardBtn.addEventListener('click', () => this.showLeaderboard());
        
        // Enter en el input de nombre
        this.playerNameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.startGame();
            }
        });

        // Validación en tiempo real del input
        this.playerNameInput.addEventListener('input', () => {
            this.updateStartButtonState();
        });

        // Click en el canvas para menú principal
        this.canvas.addEventListener('click', (e) => {
            if (this.sceneManager.currentScene === 'start') {
                this.showNameInput();
            } else if (this.sceneManager.currentScene === 'gameover' || this.sceneManager.currentScene === 'leaderboard') {
                this.changeScene('start');
            }
        });
    }

    updateStartButtonState() {
        const name = this.playerNameInput.value.trim();
        if (name === '') {
            this.startBtn.disabled = true;
            this.startBtn.style.opacity = '0.5';
            this.startBtn.style.cursor = 'not-allowed';
        } else {
            this.startBtn.disabled = false;
            this.startBtn.style.opacity = '1';
            this.startBtn.style.cursor = 'pointer';
        }
    }
    
    handleGlobalKeys(e) {
        const currentScene = this.sceneManager.getCurrentScene();
        
        switch(e.key) {
            case 'Escape':
                if (this.sceneManager.currentScene === 'game') {
                    this.changeScene('start');
                }
                break;
            case 'Enter':
                if (this.sceneManager.currentScene === 'start') {
                    this.showLeaderboard();
                } else if (this.sceneManager.currentScene === 'gameover' || this.sceneManager.currentScene === 'leaderboard') {
                    this.changeScene('start');
                }
                break;
            case ' ':
                if (this.sceneManager.currentScene === 'start') {
                    this.showNameInput();
                } else if (this.sceneManager.currentScene === 'game') {
                    currentScene.handleInput(this.keys);
                }
                break;
            default:
                if (this.sceneManager.currentScene === 'game') {
                    currentScene.handleInput(this.keys);
                }
                break;
        }
    }
    
    showNameInput() {
        this.nameInput.classList.remove('hidden');
        this.playerNameInput.focus();
        this.playerNameInput.value = '';
        this.updateStartButtonState();
    }
    
    hideNameInput() {
        this.nameInput.classList.add('hidden');
    }
    
    showLoading() {
        this.loading.classList.remove('hidden');
    }
    
    hideLoading() {
        this.loading.classList.add('hidden');
    }
    
    startGame() {
        const name = this.playerNameInput.value.trim();
        
        // Validar que el nombre no esté vacío
        if (name === '') {
            this.playerNameInput.focus();
            this.playerNameInput.style.borderColor = '#ff0000';
            setTimeout(() => {
                this.playerNameInput.style.borderColor = '';
            }, 500);
            return;
        }
        
        this.playerName = name;
        if (this.playerName.length > 15) {
            this.playerName = this.playerName.substring(0, 15);
        }
        this.hideNameInput();
        this.changeScene('game');
    }
    
    async showLeaderboard() {
        this.showLoading();
        try {
            const response = await getLeaderboard(10);
            this.leaderboardData = response.data || [];
            console.log('Leaderboard cargado:', this.leaderboardData);
        } catch (error) {
            console.error('Error cargando leaderboard:', error);
            this.leaderboardData = [];
        }
        this.hideLoading();
        this.hideNameInput();
        this.changeScene('leaderboard');
    }
    
    changeScene(newScene, data = {}) {
        const currentScene = this.sceneManager.getCurrentScene();
        if (currentScene && currentScene.exit) {
            const exitData = currentScene.exit();
            if (exitData) {
                Object.assign(data, exitData);
            }
        }
        
        this.sceneManager.changeScene(newScene, data);
        
        if (newScene === 'gameover' && data.score !== undefined) {
            this.submitScore(data.score);
        }
    }
    
    async submitScore(score) {
        if (this.scoreSubmitted) return;
        
        try {
            await submitScore(this.playerName, score);
            this.scoreSubmitted = true;
            console.log('Puntaje enviado correctamente');
        } catch (error) {
            console.error('Error enviando puntaje:', error);
        }
    }
    
    gameLoop() {
        const currentScene = this.sceneManager.getCurrentScene();
        
        if (currentScene && currentScene.update) {
            currentScene.update();
        }
        
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
    
    draw() {
        // Limpiar canvas
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        const currentScene = this.sceneManager.getCurrentScene();
        if (currentScene && currentScene.draw) {
            currentScene.draw();
        }
    }
}

// Iniciar el juego cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    const game = new SpaceInvadersGame();
    window.game = game;
});