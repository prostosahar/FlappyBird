export class CollisionSystem {
  check(bird, pipe) {
    const birdRect = bird.getBounds();
    const pipeRects = pipe.getCollisionRects();

    for (const rect of pipeRects) {
      if (
        birdRect.x < rect.x + rect.width &&
        birdRect.x + birdRect.width > rect.x &&
        birdRect.y < rect.y + rect.height &&
        birdRect.y + birdRect.height > rect.y
      ) {
        return true;
      }
    }
    return false;
  }

  checkPass(bird, pipe) {
    const birdRight = bird.getX() + bird.getWidth();
    const pipeCenterX = pipe.getX() + pipe.getWidth() / 2;
    return !pipe.hasPassed() && birdRight > pipeCenterX;
  }
}