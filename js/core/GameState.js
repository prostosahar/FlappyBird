import { storageKeys } from '../config/GameConfig.js';

export class GameState {
  constructor() {
    this.score = 0;
    this.record = localStorage.getItem(storageKeys.record)
      ? parseInt(localStorage.getItem(storageKeys.record), 10)
      : 0;
    this.isRunning = false;
    this.isStarted = false;
  }

  startGameplay() {
    this.isStarted = true;
    this.isRunning = true;
  }

  endGame() {
    this.isRunning = false;
    this.isStarted = false;
    if (this.score > this.record) {
      this.record = this.score;
      localStorage.setItem(storageKeys.record, this.record);
    }
  }

  addScore(points) {
    this.score += points;
  }

  reset() {
    this.score = 0;
    this.isRunning = false;
    this.isStarted = false;
  }

  getScore() { 
    return this.score; 
  }
  
  getRecord() { 
    return this.record; 
  }
}