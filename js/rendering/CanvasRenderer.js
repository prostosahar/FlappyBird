import { birdConfig, canvasBase, renderingConfig } from '../config/GameConfig.js';
import { sprite } from '../config/SpriteConfig.js';

export class CanvasRenderer {
  constructor(ctx, img, coefficient, canvas) {
    this.ctx = ctx;
    this.img = img;
    this.coef = coefficient;
    this.canvas = canvas;
  }

  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  drawSky(offset) {
    const w = canvasBase.width * this.coef;
    const h = canvasBase.height * this.coef;
    this.ctx.drawImage(this.img, ...Object.values(sprite.sky), -offset, 0, w, h);
    this.ctx.drawImage(this.img, ...Object.values(sprite.sky), -offset + w, 0, w, h);
  }

  drawGround(offset) {
    const w = sprite.ground.width * this.coef;
    const h = sprite.ground.height * this.coef;
    const y = this.canvas.height - h;
    for (let i = 0; i < 3; i++) {
      this.ctx.drawImage(this.img, ...Object.values(sprite.ground), -offset + i * w, y, w, h);
    }
  }

  drawBird(x, y, rotation, frame) {
    const birdW = (birdConfig.spriteWidth / 2) * birdConfig.scale * this.coef;
    const gapHeight = 0.25 * (this.canvas.height - 111 * this.coef);
    const birdH = birdConfig.sizeRatio * gapHeight * birdConfig.scale;

    this.ctx.save();
    this.ctx.translate(x + birdW / 2, y + birdH / 2);
    this.ctx.rotate(rotation);
    this.ctx.drawImage(
      this.img,
      sprite.bird.x, sprite.bird.y + frame * sprite.bird.height,
      sprite.bird.width, sprite.bird.height,
      -birdW / 2, -birdH / 2,
      birdW, birdH
    );
    this.ctx.restore();
  }

  drawPipe(pipe) {
    
    const x = pipe.getX();
    const topHeight = pipe.getTopHeight();
    const gapHeight = pipe.getGapHeight();
    const width = pipe.getWidth();
    const capHeightPx = sprite.pipeCapHeight * this.coef;
    const bodyHeight = sprite.pipe.height - sprite.pipeCapHeight;
    const earthTopY = this.canvas.height - (111 * this.coef);

    // Верхняя труба — тело
    const topTotalHeight = topHeight;
    const topBodyHeight = Math.max(0, topTotalHeight - capHeightPx);
    if (topBodyHeight > 0) {
      let drawn = 0;
      while (drawn < topBodyHeight) {
        const segH = Math.min((sprite.pipe.height - sprite.pipeCapHeight) * this.coef, topBodyHeight - drawn);
        this.ctx.drawImage(
          this.img,
          sprite.pipe.x,
          sprite.pipeCapHeight,
          sprite.pipe.width,
          (sprite.pipe.height - sprite.pipeCapHeight),
          x,
          drawn,
          width,
          segH
        );
        drawn += segH;
      }
    }

    // Крышка верхней трубы
    if (topTotalHeight >= capHeightPx) {
      this.ctx.drawImage(
        this.img,
        sprite.pipe.x,
        0,
        sprite.pipe.width,
        sprite.pipeCapHeight,
        x,
        topTotalHeight - capHeightPx,
        width,
        capHeightPx
      );
    }

    // Нижняя труба
    const bottomY = topHeight + gapHeight;
    const bottomTotalHeight = earthTopY - bottomY;
    if (bottomTotalHeight > 0) {
      // Крышка
      this.ctx.drawImage(
        this.img, sprite.pipe.x, 0, sprite.pipe.width, sprite.pipeCapHeight,
        x, bottomY,
        width, capHeightPx
      );
      // Тело
      const bodyH = bottomTotalHeight - capHeightPx;
      if (bodyH > 0) {
        let drawn = 0;
        while (drawn < bodyH) {
          const segH = Math.min(bodyHeight * this.coef, bodyH - drawn);
          this.ctx.drawImage(
            this.img, sprite.pipe.x, sprite.pipeCapHeight, sprite.pipe.width, bodyHeight,
            x, bottomY + capHeightPx + drawn,
            width, segH
          );
          drawn += segH;
        }
      }
    }
  }
}