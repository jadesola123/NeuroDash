// color-challenge.js

class ColorChallenge {
  constructor() {
    this.colors = ['red', 'blue', 'green', 'yellow'];
    this.currentColor = '';
    this.difficulty = 'easy';
    this.timeLimit = 5000;
    this.promptCount = 0;
    this.maxPrompts = 10;
    this.startTime = null;
  }

  setDifficulty(level) {
    this.difficulty = level;
    const timeMap = { easy: 5000, medium: 4000, hard: 3000, insane: 2000 };
    this.timeLimit = timeMap[level] || 5000;
  }

  generateColor() {
    const index = Math.floor(Math.random() * this.colors.length);
    this.currentColor = this.colors[index];
  }

  start() {
    this.promptCount = 0;
    this.renderNewColor();
  }

  stop() {
    clearTimeout(this.timer);
  }

  renderNewColor() {
    this.generateColor();
    this.startTime = performance.now();

    const container = document.getElementById('challenge-container');
    container.innerHTML = `
      <div class="challenge-title">Color Challenge</div>
      <div class="color-box" style="background:${this.currentColor}">${this.currentColor.toUpperCase()}</div>
      <div class="voice-instruction" id="voice-instruction">🗣️ Say: <strong>${this.currentColor}</strong></div>
      <div class="latency-display">Waiting for your voice...</div>
    `;
  }

  checkAnswer(transcript, confidence) {
    const latency = Math.round(performance.now() - this.startTime);
    const normalized = transcript.trim().toLowerCase();

    const latencyDisplay = document.querySelector('.latency-display');
    const instruction = document.getElementById('voice-instruction');

    latencyDisplay.innerHTML = `Response Time: <strong>${latency}ms</strong><br>Transcript: "${transcript}"`;

    if (normalized.includes(this.currentColor)) {
      new Audio('src/assets/sounds/correct.mp3').play();
      this.promptCount++;
      instruction.innerHTML = '✅ Correct! Get ready for the next one...';

      if (this.promptCount >= this.maxPrompts) {
        window.engine.endSession();
      } else {
        setTimeout(() => this.renderNewColor(), 2000);
      }

      return { correct: true, latency };
    } else {
      new Audio('src/assets/sounds/wrong.mp3').play();
      instruction.innerHTML = `❌ Incorrect. Try again: Say <strong>${this.currentColor}</strong>`;
      return { correct: false, latency };
    }
  }
}

export default ColorChallenge;
