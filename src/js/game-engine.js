// game-engine.js

class GameEngine {
  constructor() {
    this.currentChallenge = null;
    this.challengeType = 'color';
    this.difficulty = 'easy';
  }

  setChallenge(type) {
    this.challengeType = type;
  }

  setDifficulty(level) {
    this.difficulty = level;
  }

  startChallenge() {
    let ChallengeClass;
    switch (this.challengeType) {
      case 'color':
        ChallengeClass = window.ColorChallenge;
        break;
      case 'stroop':
        ChallengeClass = window.StroopChallenge;
        break;
      case 'memory':
        ChallengeClass = window.MemoryChallenge;
        break;
      default:
        console.error('Unknown challenge type');
        return;
    }

    this.currentChallenge = new ChallengeClass();
    this.currentChallenge.setDifficulty(this.difficulty);
    this.currentChallenge.start();
  }

  handleTranscript(transcript, confidence) {
    if (!this.currentChallenge || typeof this.currentChallenge.checkAnswer !== 'function') return;

    const result = this.currentChallenge.checkAnswer(transcript, confidence);
    if (result) {
      window.analytics.logResult({
        challenge: this.challengeType,
        correct: result.correct,
        latency: result.latency,
      });
    }
  }

  endSession() {
    const summary = window.analytics.getSummary();
    const container = document.getElementById('challenge-container');
    container.innerHTML = `
      <div class="challenge-title">Session Complete!</div>
      <div class="voice-instruction">
        ✅ Correct: <strong>${summary.correct}</strong><br>
        ❌ Incorrect: <strong>${summary.incorrect}</strong><br>
        ⏱️ Average Latency: <strong>${summary.averageLatency}ms</strong><br><br>
        <button class="btn btn-primary" onclick="window.location.reload()">🔁 Restart</button>
      </div>
    `;
  }
}

window.engine = new GameEngine();
