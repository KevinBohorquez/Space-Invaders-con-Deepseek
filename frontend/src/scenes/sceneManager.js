export class SceneManager {
    constructor() {
        this.scenes = new Map();
        this.currentScene = null;
    }

    registerScene(name, scene) {
        this.scenes.set(name, scene);
    }

    changeScene(name, data = {}) {
        if (this.scenes.has(name)) {
            this.currentScene = name;
            const scene = this.scenes.get(name);
            scene.enter(data);
        }
    }

    getCurrentScene() {
        return this.scenes.get(this.currentScene);
    }
}