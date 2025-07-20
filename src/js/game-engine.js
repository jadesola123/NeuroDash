/**
 * Game Engine - Manages challenges, difficulty, and game state
 */

class GameEngine {
    constructor(analytics) {
        this.analytics = analytics;
        this.challenges = [
            new ColorChallenge(),
            new MemoryChallenge(), 
            new StroopChallenge()
        ];
        this.currentChallengeIndex = 0;
        this.difficulty = 'easy';
        this.isActive = false;
    }

    start() {
        this.isActive = true;
        this.getCurrentChallenge().start();
    }

    stop() {
        this.isActive = false;
        this.getCurrentChallenge().stop();
    }

    processVoiceCommand(transcription, confidence) {
        if (!this.isActive) return { correct: false, instruction: 'Game not active' };
        
        const challenge = this.getCurrentChallenge();
        const result = challenge.checkAnswer(transcription, confidence);
        
        if (result.correct) {
            // Auto-advance to next challenge after correct answer
            setTimeout(() => this.nextChallenge(), 1500);
        }
        
        return result;
    }

    getCurrentChallenge() {
        return this.challenges[this.currentChallengeIndex];
    }

    nextChallenge() {
        if (this.isActive) {
            this.getCurrentChallenge().stop();
        }
        
        this.currentChallengeIndex = (this.currentChallengeIndex + 1) % this.challenges.length;
        
        if (this.isActive) {
            this.getCurrentChallenge().start();
        }
    }

    adjustDifficulty() {
        const levels = ['easy', 'medium', 'hard', 'insane'];
        const currentIndex = levels.indexOf(this.difficulty);
        this.difficulty = levels[(currentIndex + 1) % levels.length];
        
        // Update all challenges with new difficulty
        this.challenges.forEach(challenge => challenge.setDifficulty(this.difficulty));
    }

    getCurrentDifficulty() {
        return this.difficulty.charAt(0).toUpperCase() + this.difficulty.slice(1);
    }
}