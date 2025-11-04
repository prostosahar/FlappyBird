import { Game } from './core/Game.js';
import { CanvasRenderer } from './rendering/CanvasRenderer.js';
import { BirdPhysics } from './physics/BirdPhysics.js';
import { gameAssets, canvasBase } from './config/GameConfig.js';

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const img = new Image();
img.src = gameAssets.spritePath;

const interfaceElement = document.querySelector('.interface-game');
canvas.height = interfaceElement.offsetHeight;
const coefficient = canvas.height / canvasBase.height;
canvas.width = canvasBase.width * coefficient;

class ClickInputHandler {
  constructor(element) {
    this.element = element;
    this.onStartCallback = null;
    this.onJumpCallback = null;
    this.element.addEventListener('click', () => {
      if (this.onStartCallback) this.onStartCallback();
      if (this.onJumpCallback) this.onJumpCallback();
    });
  }
  onStart(cb) { this.onStartCallback = cb; }
  onJump(cb) { this.onJumpCallback = cb; }
}

img.onload = () => {
  const renderer = new CanvasRenderer(ctx, img, coefficient, canvas);
  const inputHandler = new ClickInputHandler(canvas);

  const game = new Game(
    renderer,
    (coef, startY) => new BirdPhysics(coef, startY),
    inputHandler,
    coefficient,
    canvas
  );

  game.initialize();

  let lastTime = performance.now();
  function gameLoop(now) {
    const deltaTime = now - lastTime;
    lastTime = now;
    game.update(now, deltaTime);
    requestAnimationFrame(gameLoop);
  }
  requestAnimationFrame(gameLoop);
};