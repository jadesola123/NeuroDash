// game-engine.js

import ColorChallenge from './challenges/color-challenge.js';
import MemoryChallenge from './challenges/memory-challenge.js';
import StroopChallenge from './challenges/stroop-challenge.js';
import Analytics from './analytics.js';

class GameEngine {
  constructor() {
    this.challengeMap = {
      color: new ColorChallenge(),
      memory: new MemoryChallenge(),
      stroop: new StroopChallenge()
    };
    this.currentChallengeKey = 'color';
    this.analytics = new Analytics();
  }

  loadChallenge(type) {
    if (this.challengeMap[type]) {
      if (this.getCurrentChallenge()) {
        this.getCurrentChallenge().stop();
      }
      this.currentChallengeKey = type;
      this.analytics.reset();
    }
  }

  getCurrentChallenge() {
    return this.challengeMap[this.currentChallengeKey];
  }

  endSession() {
    const container = document.getElementById('challenge-container');
    const summary = this.analytics.getSummary();

    container.innerHTML = `
      <div class="challenge-title">🎉 Session Complete!</div>
      <div class="summary-box">
        <p>✅ Correct Answers: ${summary.correct}</p>
        <p>❌ Incorrect Answers: ${summary.incorrect}</p>
        <p>🎯 Accuracy: ${summary.accuracy}%</p>
        <p>⚡ Avg Response Time: ${summary.averageLatency}ms</p>
      </div>
      <div style="margin-top: 1rem">
        <button class="btn btn-primary" onclick="window.location.reload()">🔁 Restart</button>
      </div>
    `;
  }
}

export default GameEngine;
