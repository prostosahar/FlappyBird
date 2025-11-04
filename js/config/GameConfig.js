export const gameAssets = {
  spritePath: '../image/sprite.png'
};

export const canvasBase = {
  width: 275,
  height: 362
};

export const birdConfig = {
  scale: 1.3,
  spriteWidth: 34,
  spriteHeight: 24,
  startYRatio: 0.3,
  gapHeightRatio: 0.25,
  sizeRatio: 0.2
};

export const pipeConfig = {
  spawnIntervalMs: 1000,
  widthMultiplier: 2,
  minMargin: 50,
  maxHeight: 320
};

export const physicsConfig = {
  gravityMultiplier: 0.4,
  jumpHeightRatio: 0.5
};

export const renderingConfig = {
  skySpeed: 2,
  groundSpeed: 30
};

export const storageKeys = {
  record: 'flappyRecord'
};