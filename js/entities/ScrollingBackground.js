import { renderingConfig } from '../config/GameConfig.js';
import { sprite } from '../config/SpriteConfig.js';

export class ScrollingBackground {
  #skyOffset = 0;
  #groundOffset = 0;
  #coefficient;

  constructor(coefficient) {
    this.#coefficient = coefficient;
  }

  update() {
    this.#skyOffset = (this.#skyOffset + renderingConfig.skySpeed * this.#coefficient) % (sprite.sky.width * this.#coefficient);
    this.#groundOffset = (this.#groundOffset + renderingConfig.groundSpeed * this.#coefficient) % (sprite.ground.width * this.#coefficient);
  }

  getSkyOffset() { return this.#skyOffset; }
  getGroundOffset() { return this.#groundOffset; }
}