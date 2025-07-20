// memory-challenge.js

class MemoryChallenge {
  constructor() {
    this.sequence = [];
    this.userInput = [];
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

  generateSequence() {
    const lengthMap = { easy: 3, medium: 4, hard: 5, insane: 6 };
    const length = lengthMap[this.difficulty] || 3;
    this.sequence = Array.from({ length }, () => Math.floor(Math.random() * 9) + 1);
  }

  start() {
    this.promptCount = 0;
    this.renderNewSequence();
  }

  stop() {
    clearTimeout(this.timer);
    this.userInput = [];
    this.sequence = [];
  }

  renderNewSequence() {
    this.generateSequence();
    this.startTime = performance.now();

    const container = document.getElementById('challenge-container');
    const sequenceStr = this.sequence.join(' ');
    container.innerHTML = `
      <div class="challenge-title">Memory Challenge</div>
      <div class="color-box" style="background:#667eea; font-size: 2rem">
        ${sequenceStr}
      </div>
      <div class="voice-instruction" id="voice-instruction">
        🗣️ Repeat this sequence: <strong>${sequenceStr}</strong>
      </div>
      <div class="latency-display">Waiting for your voice...</div>
    `;
  }

  checkAnswer(transcript, confidence) {
    const latency = Math.round(performance.now() - this.startTime);
    const userAnswer = transcript.trim().split(/\s+/).map(Number);
    const isCorrect = this.arraysEqual(userAnswer, this.sequence);

    const latencyDisplay = document.querySelector('.latency-display');
    const instruction = document.getElementById('voice-instruction');

    latencyDisplay.innerHTML = `Response Time: <strong>${latency}ms</strong>`;

    if (isCorrect) {
      new Audio('src/assets/sounds/correct.mp3').play();
      this.promptCount++;
      instruction.innerHTML = '✅ Correct! Get ready for the next one...';

      if (this.promptCount >= this.maxPrompts) {
        window.engine.endSession();
      } else {
        setTimeout(() => this.renderNewSequence(), 2000);
      }

      return { correct: true, latency };
    } else {
      new Audio('src/assets/sounds/wrong.mp3').play();
      instruction.innerHTML = `❌ Incorrect. Try again: ${this.sequence.join(' ')}`;
      return { correct: false, latency };
    }
  }

  arraysEqual(a, b) {
    return a.length === b.length && a.every((val, idx) => val === b[idx]);
  }
}

export default MemoryChallenge;
