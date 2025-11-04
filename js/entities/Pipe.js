import { pipeConfig } from '../config/GameConfig.js';

export class Pipe {
  #x;
  #topHeight;
  #gapHeight;
  #width;
  #passed = false;
  #earthTopY;

  constructor(x, topHeight, gapHeight, birdWidth, coefficient, earthTopY) {
    this.#x = x;
    this.#topHeight = topHeight;
    this.#gapHeight = gapHeight;
    this.#width = pipeConfig.widthMultiplier * birdWidth;
    this.#earthTopY = earthTopY;
  }

  update(coefficient) {
    this.#x -= 2 * coefficient;
  }

  getCollisionRects() {
    const bottomY = this.#topHeight + this.#gapHeight;
    return [
      { x: this.#x, y: 0, width: this.#width, height: this.#topHeight },
      { x: this.#x, y: bottomY, width: this.#width, height: this.#earthTopY - bottomY }
    ];
  }

  getX() { 
    return this.#x; 
  }

  getWidth() { 
    return this.#width; 
  }

  hasPassed() { 
    return this.#passed; 
  }

  markPassed() { 
    this.#passed = true; 
  }

  isOffscreen(canvasWidth) {
    return this.#x + this.#width < 0;
  }

  getX() { 
    return this.#x;
  }

  getTopHeight() { 
    return this.#topHeight; 
  }

  getGapHeight() { 
    return this.#gapHeight; 
  }

  getWidth() { 
    return this.#width; 
  }

  getBottomY() { 
    return this.#topHeight + this.#gapHeight; 
  }
}