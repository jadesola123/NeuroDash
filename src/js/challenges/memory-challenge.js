// src/js/challenges/memory-challenge.js

class MemoryChallenge {
    constructor() {
        this.sequence = [];
        this.userInput = [];
        this.difficulty = 'easy';
        this.timeLimit = 5000; // milliseconds
        this.timer = null;
    }

    start() {
        this.generateSequence();
        this.render();
        this.startTimer();
    }

    stop() {
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }
        this.userInput = [];
    }

    generateSequence() {
        const lengthMap = { easy: 3, medium: 4, hard: 5, insane: 6 };
        const length = lengthMap[this.difficulty] || 3;
        this.sequence = Array.from({ length }, () => Math.floor(Math.random() * 9) + 1);
    }

    render() {
        const container = document.getElementById('challenge-container');
        const sequenceStr = this.sequence.join(' ');

        container.innerHTML = `
            <div class="challenge-title">Memory Challenge</div>
            <div class="color-box" style="background:#667eea; font-size: 2rem">
                ${sequenceStr}
            </div>
        `;

        const instruction = document.getElementById('voice-instruction');
        instruction.innerHTML = `🗣️ Repeat this sequence: <strong>${sequenceStr}</strong>`;
    }

    checkAnswer(transcription, confidence) {
        const userAnswer = transcription.trim().split(/\s+/).map(Number);
        const isCorrect = this.arraysEqual(userAnswer, this.sequence);

        if (isCorrect) {
            this.stop();
            return {
                correct: true,
                nextInstruction: '🧠 Sharp memory! Get ready for the next one...'
            };
        } else {
            return {
                correct: false,
                instruction: `❌ Incorrect. Repeat: ${this.sequence.join(' ')}`
            };
        }
    }

    arraysEqual(a, b) {
        return a.length === b.length && a.every((val, idx) => val === b[idx]);
    }

    setDifficulty(level) {
        this.difficulty = level;
        const timeMap = { easy: 5000, medium: 4000, hard: 3000, insane: 2000 };
        this.timeLimit = timeMap[level] || 5000;
    }

    startTimer() {
        this.timer = setTimeout(() => {
            this.generateSequence();
            this.render();
            this.startTimer();
        }, this.timeLimit);
    }
}

// Register globally if needed
typeof window !== 'undefined' && (window.MemoryChallenge = MemoryChallenge);
