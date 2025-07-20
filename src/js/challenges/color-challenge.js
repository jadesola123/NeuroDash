// color-challenge.js

class ColorChallenge {
  constructor() {
    this.colors = ['RED', 'BLUE', 'GREEN', 'YELLOW', 'PURPLE'];
    this.colorCodes = {
      RED: '#ff4757',
      BLUE: '#3742fa',
      GREEN: '#2ed573',
      YELLOW: '#ffa502',
      PURPLE: '#a55eea'
    };
    this.currentColor = null;
    this.promptStartTime = null;
    this.correctCount = 0;
    this.promptLimit = 10;
    this.userResponses = [];
  }

  start() {
    this.correctCount = 0;
    this.userResponses = [];
    this.nextPrompt();
  }

  stop() {
    clearTimeout(this.timer);
  }

  nextPrompt() {
    if (this.correctCount >= this.promptLimit) {
      window.gameEngine.endSession();
      return;
    }
    this.currentColor = this.colors[Math.floor(Math.random() * this.colors.length)];
    this.promptStartTime = performance.now();
    this.render();
  }

  render() {
    const container = document.getElementById('challenge-container');
    container.innerHTML = `
      <div class="challenge-title">Color Challenge</div>
      <div class="color-box" style="background:${this.colorCodes[this.currentColor]}">${this.currentColor}</div>
    `;
    const instruction = document.getElementById('voice-instruction');
    instruction.innerHTML = `🗣️ Say "${this.currentColor}"`;
  }

  checkAnswer(transcript) {
    const spoken = transcript.trim().toUpperCase();
    const responseTime = Math.floor(performance.now() - this.promptStartTime);
    const isCorrect = spoken === this.currentColor;
    this.userResponses.push({ spoken, expected: this.currentColor, responseTime, correct: isCorrect });

    const latencyDisplay = document.getElementById('latency-display');
    if (latencyDisplay) {
      latencyDisplay.textContent = `${responseTime}ms`;
    }

    const feedback = document.getElementById('feedback');
    if (isCorrect) {
      new Audio('src/assets/sounds/correct.mp3').play();
      feedback.innerHTML = `✅ Correct! (${spoken})`;
      this.correctCount++;
      setTimeout(() => this.nextPrompt(), 1000);
    } else {
      new Audio('src/assets/sounds/wrong.mp3').play();
      feedback.innerHTML = `❌ Wrong! You said "${spoken}" instead of "${this.currentColor}"`;
    }
  }

  setDifficulty(level) {
    // Future use if needed
  }
}

window.ColorChallenge = ColorChallenge;
export default ColorChallenge;
