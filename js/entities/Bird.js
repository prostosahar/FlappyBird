import { birdConfig } from '../config/GameConfig.js';

export class Bird {
  #x;
  #y;
  #width;
  #height;
  #physics;
  #groundY;
  #gapHeight;
  #hasHitGround = false;
  #coefficient;

  constructor(physics, canvasHeight, groundY, coefficient) {
    this.#physics = physics;
    this.#groundY = groundY;
    const gameHeight = canvasHeight - (111 * coefficient);
    this.#gapHeight = birdConfig.gapHeightRatio * gameHeight;
    this.#height = birdConfig.sizeRatio * this.#gapHeight;
    this.#width = birdConfig.spriteWidth;
    this.#y = groundY * birdConfig.startYRatio;
    this.#x = canvasHeight / 5;
    this.#coefficient = coefficient;
  }

  jump() {
    this.#physics.jump(this.#gapHeight);
  }

  update(deltaTime) {
    const result = this.#physics.update(deltaTime, this.#groundY, this.#height);
    this.#y = result.y;
    this.#hasHitGround = result.hitGround;
    return result;
  }

  getBounds() {
  const w = (birdConfig.spriteWidth / 2) * birdConfig.scale * this.#coefficient;
  const h = this.#height * birdConfig.scale;
  return {
    x: this.#x,
    y: this.#y,
    width: w,
    height: h
  };
}

  getX() { 
    return this.#x; 
  }

  getY() { 
    return this.#y; 
  }
  
  getWidth() { 
    return (this.#width / 2) * birdConfig.scale; 
  }

  getHeight() { 
    return this.#height * birdConfig.scale; 
  }

  getRotation() { 
    return this.#physics.getRotation(); 
  }

  hasHitGround() { 
    return this.#hasHitGround; 
  }
}