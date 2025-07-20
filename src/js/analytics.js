// analytics.js

class Analytics {
  constructor() {
    this.results = [];
  }

  recordResult({ challengeType, correct, latency }) {
    this.results.push({ challengeType, correct, latency });
  }

  getAverageLatency() {
    if (this.results.length === 0) return 0;
    const total = this.results.reduce((acc, r) => acc + r.latency, 0);
    return Math.round(total / this.results.length);
  }

  getCorrectCount() {
    return this.results.filter(r => r.correct).length;
  }

  getTotalCount() {
    return this.results.length;
  }

  getStats() {
    return {
      total: this.getTotalCount(),
      correct: this.getCorrectCount(),
      avgLatency: this.getAverageLatency()
    };
  }

  reset() {
    this.results = [];
  }
}

window.analytics = new Analytics();
export default window.analytics;
