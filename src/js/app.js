// app.js

import ColorChallenge from './challenges/color-challenge.js';
import MemoryChallenge from './challenges/memory-challenge.js';
import StroopChallenge from './challenges/stroop-challenge.js';
import VoiceController from './voice-controller.js';

class GameEngine {
  constructor() {
    this.currentChallenge = null;
    this.voiceController = new VoiceController();
    this.challengeMap = {
      color: new ColorChallenge(),
      memory: new MemoryChallenge(),
      stroop: new StroopChallenge()
    };
    this.activeChallengeKey = 'color';
    this.stats = {
      total: 0,
      correct: 0,
      averageLatency: 0
    };
  }

  init() {
    this.setupEventListeners();
    this.voiceController.onFinalTranscription = this.handleVoiceInput.bind(this);
    this.startChallenge();
  }

  setupEventListeners() {
    document.getElementById('btn-color').addEventListener('click', () => this.switchChallenge('color'));
    document.getElementById('btn-memory').addEventListener('click', () => this.switchChallenge('memory'));
    document.getElementById('btn-stroop').addEventListener('click', () => this.switchChallenge('stroop'));

    document.getElementById('difficulty').addEventListener('change', (e) => {
      const level = e.target.value;
      if (this.currentChallenge?.setDifficulty) {
        this.currentChallenge.setDifficulty(level);
      }
    });
  }

  switchChallenge(key) {
    if (this.challengeMap[key]) {
      this.activeChallengeKey = key;
      this.startChallenge();
    }
  }

  startChallenge() {
    if (this.currentChallenge?.stop) {
      this.currentChallenge.stop();
    }
    this.currentChallenge = this.challengeMap[this.activeChallengeKey];
    this.stats = { total: 0, correct: 0, averageLatency: 0 };
    this.currentChallenge.setDifficulty(document.getElementById('difficulty').value);
    this.currentChallenge.start();
    this.voiceController.connect();
  }

  handleVoiceInput(transcript, confidence) {
    if (!this.currentChallenge) return;
    const result = this.currentChallenge.checkAnswer(transcript, confidence);
    if (!result) return;

    this.stats.total++;
    if (result.correct) {
      this.stats.correct++;
    }

    // Update average latency
    this.stats.averageLatency = Math.round(((this.stats.averageLatency * (this.stats.total - 1)) + result.latency) / this.stats.total);
    this.renderStats();
  }

  renderStats() {
    document.getElementById('stat-total').innerText = this.stats.total;
    document.getElementById('stat-correct').innerText = this.stats.correct;
    document.getElementById('stat-latency').innerText = `${this.stats.averageLatency}ms`;
  }

  endSession() {
    const container = document.getElementById('challenge-container');
    container.innerHTML = `
      <div class="challenge-title">🎉 Session Complete</div>
      <div class="voice-instruction">You answered ${this.stats.correct} out of ${this.stats.total} correctly!</div>
      <div class="latency-display">Average Latency: ${this.stats.averageLatency}ms</div>
    `;
    this.voiceController.disconnect();
  }
}

const engine = new GameEngine();
window.engine = engine;
window.addEventListener('DOMContentLoaded', () => engine.init());
