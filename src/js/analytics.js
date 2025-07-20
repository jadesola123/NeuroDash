/**
 * GameAnalytics - Tracks performance metrics
 * - Average Latency
 * - Accuracy
 * - Current Streak
 * - Total Attempts
 */

class GameAnalytics {
    constructor() {
        this.reset();
    }

    recordResponse(transcription, correct, latency) {
        this.totalAttempts++;
        if (correct) {
            this.correctCount++;
            this.currentStreak++;
        } else {
            this.currentStreak = 0;
        }

        this.totalLatency += latency;
    }

    getStats() {
        const averageLatency = this.totalAttempts > 0
            ? this.totalLatency / this.totalAttempts
            : 0;
        const accuracy = this.totalAttempts > 0
            ? (this.correctCount / this.totalAttempts) * 100
            : 0;

        return {
            averageLatency,
            accuracy,
            currentStreak: this.currentStreak
        };
    }

    reset() {
        this.totalAttempts = 0;
        this.correctCount = 0;
        this.totalLatency = 0;
        this.currentStreak = 0;
    }
}
