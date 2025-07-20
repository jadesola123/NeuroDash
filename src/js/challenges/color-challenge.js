// File: src/js/challenges/color-challenge.js

/**
 * Color Challenge - Say the color you see
 */

class ColorChallenge {
    constructor() {
        this.colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];
        this.colorCodes = {
            'red': '#ff4757', 'blue': '#3742fa', 'green': '#2ed573',
            'yellow': '#ffa502', 'purple': '#a55eea', 'orange': '#ff6348'
        };
        this.currentColor = null;
        this.difficulty = 'easy';
        this.timeLimit = 5000; // default to 5 seconds
        this.timer = null;
    }

    start() {
        this.generateNewColor();
        this.render();
        this.startTimer();
    }

    stop() {
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }
    }

    generateNewColor() {
        this.currentColor = this.colors[Math.floor(Math.random() * this.colors.length)];
    }

    render() {
        const container = document.getElementById('challenge-container');
        container.innerHTML = `
            <div class="challenge-title">Color Recognition Challenge</div>
            <div class="color-box" style="background-color: ${this.colorCodes[this.currentColor]}">
                ${this.difficulty === 'easy' ? this.currentColor.toUpperCase() : ''}
            </div>
        `;

        const instruction = document.getElementById('voice-instruction');
        instruction.innerHTML = `🗣️ Say "${this.currentColor.toUpperCase()}!" out loud`;
    }

    checkAnswer(transcription, confidence) {
        const userAnswer = transcription.toLowerCase().trim();
        const correct = userAnswer === this.currentColor || userAnswer.includes(this.currentColor);

        if (correct) {
            this.stop();
            return {
                correct: true,
                nextInstruction: 'Great job! Next challenge coming up...'
            };
        } else {
            return {
                correct: false,
                instruction: `Say "${this.currentColor.toUpperCase()}" - you said "${transcription}"`
            };
        }
    }

    setDifficulty(level) {
        this.difficulty = level;
        const timeMap = { easy: 5000, medium: 3000, hard: 2000, insane: 1000 };
        this.timeLimit = timeMap[level] || 5000;
    }

    startTimer() {
        this.timer = setTimeout(() => {
            this.generateNewColor();
            this.render();
            this.startTimer();
        }, this.timeLimit);
    }
}
