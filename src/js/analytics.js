// analytics.js

class Analytics {
  constructor() {
    this.responses = [];
  }

  logResult({ challenge, correct, latency }) {
    this.responses.push({ challenge, correct, latency });
  }

  getSummary() {
    const total = this.responses.length;
    const correct = this.responses.filter(r => r.correct).length;
    const incorrect = total - correct;
    const averageLatency = total > 0 ? Math.round(this.responses.reduce((sum, r) => sum + r.latency, 0) / total) : 0;

    return { total, correct, incorrect, averageLatency };
  }

  reset() {
    this.responses = [];
  }
}

window.analytics = new Analytics();
