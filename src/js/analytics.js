/**
 * GameAnalytics - Tracks player performance and feedback
 * Includes latency, accuracy, streaks, and more
 */

class GameAnalytics {
    constructor() {
        this.reset();
    }

    reset() {
        this.totalAttempts = 0;
        this.correctAttempts = 0;
        this.latencies = [];
        this.currentStreak = 0;
        this.bestStreak = 0;
    }

    recordResponse(transcription, correct, latency) {
        this.totalAttempts++;
        if (correct) {
            this.correctAttempts++;
            this.currentStreak++;
            if (this.currentStreak > this.bestStreak) {
                this.bestStreak = this.currentStreak;
            }
        } else {
            this.currentStreak = 0;
        }
        this.latencies.push(latency);
    }

    getStats() {
        const total = this.totalAttempts;
        const correct = this.correctAttempts;
        const avgLatency =
            this.latencies.length > 0
                ? this.latencies.reduce((a, b) => a + b, 0) / this.latencies.length
                : 0;

        return {
            totalAttempts: total,
            correctAttempts: correct,
            accuracy: total > 0 ? (correct / total) * 100 : 0,
            averageLatency: avgLatency,
            currentStreak: this.currentStreak,
            bestStreak: this.bestStreak,
        };
    }
}

// Export for use in app
if (typeof module !== 'undefined') {
    module.exports = GameAnalytics;
}
