import { GameState } from './GameState.js';
import { CollisionSystem } from './CollisionSystem.js';
import { Bird } from '../entities/Bird.js';
import { Pipe } from '../entities/Pipe.js';
import { ScrollingBackground } from '../entities/ScrollingBackground.js';
import { birdConfig, pipeConfig } from '../config/GameConfig.js';

export class Game {
  constructor(renderer, physicsFactory, inputHandler, coefficient, canvas) {
    this.renderer = renderer;
    this.physicsFactory = physicsFactory;
    this.inputHandler = inputHandler;
    this.coefficient = coefficient;
    this.canvas = canvas;
    this.state = new GameState();
    this.collisionSystem = new CollisionSystem();
    this.background = new ScrollingBackground(coefficient);
  }

  initialize() {
    this.reset();
    this.inputHandler.onStart(() => {
      if (!this.state.isRunning) {
        this.reset();
      }
    });
    this.inputHandler.onJump(() => {
      if (this.state.isStarted && this.state.isRunning) {
        this.bird.jump();
      } else if (this.state.isRunning && !this.state.isStarted) {
        this.state.startGameplay();
        this.bird.jump();
      }
    });

    let replayButton = document.getElementById('replay');
    if (replayButton) {
      const resetHandler = () => this.reset();
      replayButton.replaceWith(replayButton.cloneNode(true));
      replayButton = document.getElementById('replay');
      replayButton.addEventListener('click', resetHandler);
    }
  }

  reset() {
    this.state.reset();

    const nowPointsEl = document.getElementById('now-points');
    const recordPointsEl = document.getElementById('record-points');
    if (nowPointsEl) nowPointsEl.textContent = '0';
    if (recordPointsEl) recordPointsEl.textContent = this.state.getRecord();

    const gameOverEl = document.getElementById('game-over');
    if (gameOverEl) gameOverEl.style.display = 'none';

    const groundY = this.canvas.height - (111 * this.coefficient);
    const gameHeight = groundY;
    const startY = gameHeight * birdConfig.startYRatio;

    this.bird = new Bird(
      this.physicsFactory(this.coefficient, startY),
      this.canvas.height,
      groundY,
      this.coefficient
    );

    this.pipes = [];
    this.lastSpawn = 0;
    this.state.isRunning = true;
    this.drawFrame();
  }

  update(currentTime, deltaTime) {
    if (!this.state.isRunning) 
      return;

    this.background.update();

    if (!this.state.isStarted) {
      this.drawFrame();
      return;
    }

    // Обновление птицы
    const birdUpdate = this.bird.update(deltaTime);
    if (birdUpdate.hitGround) {
      this.handleGameOver();
      return;
    }

    // Спавн труб
    if (currentTime - this.lastSpawn >= pipeConfig.spawnIntervalMs) {
      const gameHeight = this.canvas.height - (111 * this.coefficient);
      const gapHeight = birdConfig.gapHeightRatio * gameHeight;
      const minMargin = pipeConfig.minMargin * this.coefficient;
      let topHeight;
      if (gameHeight - gapHeight < 2 * minMargin) {
        topHeight = (gameHeight - gapHeight) / 2;
      } else {
        const maxTop = Math.min(gameHeight - gapHeight - minMargin, pipeConfig.maxHeight * this.coefficient);
        topHeight = minMargin + Math.random() * (Math.max(0, maxTop - minMargin));
      }

      const birdWidth = (birdConfig.spriteWidth / 2) * birdConfig.scale * this.coefficient;
      const earthTopY = this.canvas.height - (111 * this.coefficient);
      this.pipes.push(new Pipe(this.canvas.width, topHeight, gapHeight, birdWidth, this.coefficient, earthTopY));
      this.lastSpawn = currentTime;
    }

    // Обновление труб
    for (let i = this.pipes.length - 1; i >= 0; i--) {
      this.pipes[i].update(this.coefficient);
      if (this.pipes[i].isOffscreen(this.canvas.width)) {
        this.pipes.splice(i, 1);
      }
    }

    // Коллизии и очки
    for (const pipe of this.pipes) {
      if (this.collisionSystem.check(this.bird, pipe)) {
        this.handleGameOver();
        return;
      }
      if (this.collisionSystem.checkPass(this.bird, pipe)) {
        pipe.markPassed();
        this.state.addScore(1);
        if (typeof document !== 'undefined') {
          const nowPointsEl = document.getElementById('now-points');
          const recordPointsEl = document.getElementById('record-points');
          if (nowPointsEl) 
            nowPointsEl.textContent = this.state.getScore();
          if (recordPointsEl) 
            recordPointsEl.textContent = this.state.getRecord();
        }
      }
    }

    this.drawFrame();
  }

  drawFrame() {
    this.renderer.clear();
    this.renderer.drawSky(this.background.getSkyOffset());
    this.renderer.drawGround(this.background.getGroundOffset());

    for (const pipe of this.pipes) {
      this.renderer.drawPipe(pipe);
    }

    const frame = Math.floor((performance.now() / 100) % 3);
    this.renderer.drawBird(
      this.bird.getX(),
      this.bird.getY(),
      this.bird.getRotation(),
      frame
    );
  }

  handleGameOver() {
    this.state.endGame();

    const gameOverEl = document.getElementById('game-over');
    const recordGameOverEl = document.getElementById('recordGameOver');
    if (gameOverEl && recordGameOverEl) {
      recordGameOverEl.textContent = this.state.getScore();
      gameOverEl.style.display = 'block';
    }

    this.drawFrame();
  }
}