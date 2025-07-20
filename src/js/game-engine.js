// game-engine.js

import ColorChallenge from './challenges/color-challenge.js';
import MemoryChallenge from './challenges/memory-challenge.js';
import StroopChallenge from './challenges/stroop-challenge.js';
import analytics from './analytics.js';

class GameEngine {
  constructor() {
    this.challenges = {
      color: new ColorChallenge(),
      memory: new MemoryChallenge(),
      stroop: new StroopChallenge(),
    };
    this.currentChallenge = null;
    this.challengeKeys = Object.keys(this.challenges);
    this.challengeIndex = 0;
    this.voiceController = null;
  }

  init(voiceController) {
    this.voiceController = voiceController;
    this.voiceController.setTranscriptionCallback(this.handleTranscript.bind(this));
  }

  start() {
    analytics.reset();
    this.challengeIndex = 0;
    this.launchNextChallenge();
  }

  launchNextChallenge() {
    if (this.challengeIndex >= this.challengeKeys.length) {
      this.endSession();
      return;
    }

    const key = this.challengeKeys[this.challengeIndex];
    this.currentChallenge = this.challenges[key];
    this.currentChallenge.setDifficulty('easy');
    this.currentChallenge.start();
  }

  handleTranscript(transcript) {
    if (!this.currentChallenge || !transcript) return;

    const result = this.currentChallenge.checkAnswer(transcript);

    if (result && typeof result.correct === 'boolean') {
      analytics.recordResult({
        challengeType: this.challengeKeys[this.challengeIndex],
        correct: result.correct,
        latency: result.latency || 0
      });

      if (result.correct && this.currentChallenge.promptCount >= this.currentChallenge.maxPrompts) {
        this.challengeIndex++;
        setTimeout(() => this.launchNextChallenge(), 2000);
      }
    }
  }

  endSession() {
    const stats = analytics.getStats();
    const container = document.getElementById('challenge-container');
    container.innerHTML = `
      <div class="challenge-title">Session Complete!</div>
      <div class="voice-instruction">
        ✅ Correct Answers: <strong>${stats.correct}/${stats.total}</strong><br/>
        ⚡ Avg Latency: <strong>${stats.avgLatency}ms</strong>
      </div>
    `;
  }
}

window.engine = new GameEngine();
export default window.engine;
