// stroop-challenge.js

class StroopChallenge {
  constructor() {
    this.words = ['Red', 'Blue', 'Green', 'Yellow'];
    this.colors = ['red', 'blue', 'green', 'yellow'];
    this.currentWord = '';
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

  generatePrompt() {
    const wordIndex = Math.floor(Math.random() * this.words.length);
    const colorIndex = Math.floor(Math.random() * this.colors.length);
    this.currentWord = this.words[wordIndex];
    this.currentColor = this.colors[colorIndex];
  }

  start() {
    this.promptCount = 0;
    this.renderNewPrompt();
  }

  stop() {
    clearTimeout(this.timer);
  }

  renderNewPrompt() {
    this.generatePrompt();
    this.startTime = performance.now();

    const container = document.getElementById('challenge-container');
    container.innerHTML = `
      <div class="challenge-title">Stroop Challenge</div>
      <div class="color-box" style="background:${this.currentColor}; color:white">
        ${this.currentWord}
      </div>
      <div class="voice-instruction" id="voice-instruction">
        🧠 Say "Opposite" if word ≠ color, or "Same" if they match
      </div>
      <div class="latency-display">Waiting for your voice...</div>
    `;
  }

  checkAnswer(transcript, confidence) {
    const latency = Math.round(performance.now() - this.startTime);
    const normalized = transcript.trim().toLowerCase();

    const latencyDisplay = document.querySelector('.latency-display');
    const instruction = document.getElementById('voice-instruction');

    latencyDisplay.innerHTML = `Response Time: <strong>${latency}ms</strong><br>Transcript: "${transcript}"`;

    const isOpposite = this.currentWord.toLowerCase() !== this.currentColor;
    const userSaidOpposite = normalized.includes('opposite');
    const userSaidSame = normalized.includes('same');

    const isCorrect = (isOpposite && userSaidOpposite) || (!isOpposite && userSaidSame);

    if (isCorrect) {
      new Audio('src/assets/sounds/correct.mp3').play();
      this.promptCount++;
      instruction.innerHTML = '✅ Correct! Get ready for the next one...';

      if (this.promptCount >= this.maxPrompts) {
        window.engine.endSession();
      } else {
        setTimeout(() => this.renderNewPrompt(), 2000);
      }

      return { correct: true, latency };
    } else {
      new Audio('src/assets/sounds/wrong.mp3').play();
      instruction.innerHTML = `❌ Incorrect. Say "${isOpposite ? 'Opposite' : 'Same'}"`;
      return { correct: false, latency };
    }
  }
}

export default StroopChallenge;
