import { physicsConfig } from '../config/GameConfig.js';

export class BirdPhysics {
  #velocity = 0;
  #gravity = 0;
  #rotation = 0;
  #y = 0;

  constructor(coefficient, startY = 0) {
    this.#y = startY;
    this.updateGravity(coefficient);
  }

  updateGravity(coefficient) {
    this.#gravity = physicsConfig.gravityMultiplier * coefficient;
  }

  jump(gapHeight) {
    const jumpHeight = gapHeight * physicsConfig.jumpHeightRatio;
    this.#velocity = -Math.sqrt(2 * this.#gravity * jumpHeight);
  }

  update(deltaTime, groundY, birdHeight) {
    const dt = deltaTime / 25;
    this.#velocity += this.#gravity * dt;
    this.#y += this.#velocity * dt;

    let hitGround = false;

    if (this.#y < 0) {
      this.#y = 0;
      this.#velocity = 0;
    }

    let rotation = this.#rotation;
    if (this.#velocity < 0) {
      rotation = -0.4;
    } else {
      rotation = Math.min(rotation + 0.05, 0.8);
    }

    if (this.#y + birdHeight >= groundY) {
      this.#y = groundY - birdHeight;
      this.#velocity = 0;
      hitGround = true;
    }

    this.#rotation = rotation;
    return { y: this.#y, velocity: this.#velocity, rotation, hitGround };
  }

  getY() { 
    return this.#y; 
  }

  getVelocity() { 
    return this.#velocity; 
  }

  getRotation() { 
    return this.#rotation; 
  }
}