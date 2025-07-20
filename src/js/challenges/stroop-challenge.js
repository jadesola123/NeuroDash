/**
 * Stroop Challenge - Say the color of the word, not the text
 */

class StroopChallenge {
    constructor() {
        this.words = ['RED', 'BLUE', 'GREEN', 'YELLOW', 'PURPLE', 'ORANGE'];
        this.colors = {
            'RED': '#ff4757',
            'BLUE': '#3742fa',
            'GREEN': '#2ed573',
            'YELLOW': '#ffa502',
            'PURPLE': '#a55eea',
            'ORANGE': '#ff6348'
        };
        this.currentWord = null;
        this.currentColor = null;
        this.difficulty = 'easy';
        this.timeLimit = 5000;
        this.timer = null;
    }

    start() {
        this.generateNewWord();
        this.render();
        this.startTimer();
    }

    stop() {
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }
    }

    generateNewWord() {
        this.currentWord = this.words[Math.floor(Math.random() * this.words.length)];

        // Ensure the font color does NOT match the word itself (Stroop effect)
        let possibleColors = this.words.filter(color => color !== this.currentWord);
        this.currentColor = possibleColors[Math.floor(Math.random() * possibleColors.length)];
    }

    render() {
        const container = document.getElementById('challenge-container');
        container.innerHTML = `
            <div class="challenge-title">Stroop Effect Challenge</div>
            <div class="color-box" style="background: white; color: ${this.colors[this.currentColor]}; font-size: 2rem;">
                ${this.currentWord}
            </div>
        `;

        const instruction = document.getElementById('voice-instruction');
        instruction.innerHTML = `🧠 Say the COLOR of the word, not the text: <strong>${this.currentColor}</strong>`;
    }

    checkAnswer(transcription, confidence) {
        const userAnswer = transcription.toLowerCase().trim();
        const correct = userAnswer.includes(this.currentColor.toLowerCase());

        if (correct) {
            this.stop();
            return {
                correct: true,
                nextInstruction: '🟢 Nice! That was tricky! Next challenge...'
            };
        } else {
            return {
                correct: false,
                instruction: `Try again! Say the COLOR: "${this.currentColor}" not the word: "${this.currentWord}".`
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
            this.generateNewWord();
            this.render();
            this.startTimer();
        }, this.timeLimit);
    }
}
