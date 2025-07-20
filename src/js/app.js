/**
 * NeuroDash - Main Application Controller
 * Coordinates all game components and manages application state
 */

class NeuroDashApp {
    constructor() {
        this.gameEngine = null;
        this.voiceController = null;
        this.analytics = null;
        this.isTraining = false;

        this.init();
    }

    async init() {
        try {
            // Initialize modules
            this.analytics = new GameAnalytics();
            this.gameEngine = new GameEngine(this.analytics);
            this.voiceController = new VoiceController({
                onTranscription: this.handleVoiceCommand.bind(this),
                onLatencyUpdate: this.updateLatencyDisplay.bind(this),
                onError: this.handleVoiceError.bind(this)
            });

            // Setup event listeners
            this.setupEventListeners();

            // Initialize UI
            this.updateUI();

            console.log('NeuroDash initialized');
        } catch (error) {
            console.error('Initialization failed:', error);
            this.showError('Initialization failed. Check your internet connection.');
        }
    }

    setupEventListeners() {
        document.getElementById('start-btn').addEventListener('click', () => this.toggleTraining());
        document.getElementById('challenge-btn').addEventListener('click', () => this.nextChallenge());
        document.getElementById('difficulty-btn').addEventListener('click', () => this.adjustDifficulty());
        document.getElementById('reset-btn').addEventListener('click', () => this.resetStats());
    }

    async toggleTraining() {
        const startBtn = document.getElementById('start-btn');

        if (!this.isTraining) {
            try {
                await this.voiceController.start();
                this.gameEngine.start();
                this.isTraining = true;
                startBtn.textContent = '⏸️ Pause Training';
                startBtn.classList.add('active');
                this.updateMicStatus('active');
            } catch (error) {
                console.error('Start failed:', error);
                this.showError('Failed to start voice recognition. Check mic permissions.');
            }
        } else {
            this.voiceController.stop();
            this.gameEngine.stop();
            this.isTraining = false;
            startBtn.textContent = '🎮 Start Training';
            startBtn.classList.remove('active');
            this.updateMicStatus('inactive');
        }
    }

    handleVoiceCommand(transcription, confidence, processingTime) {
        if (!this.isTraining) return;

        const startTime = Date.now();
        const result = this.gameEngine.processVoiceCommand(transcription, confidence);
        const totalLatency = Date.now() - startTime + processingTime;

        // 🔊 Play feedback sounds
        const correctSound = new Audio('src/assets/sounds/correct.mp3');
        const wrongSound = new Audio('src/assets/sounds/wrong.mp3');
        result.correct ? correctSound.play() : wrongSound.play();

        // 🧠 Show debug feedback
        const instructionEl = document.getElementById('voice-instruction');
        instructionEl.innerHTML = `
            🗣️ You said: <strong>${transcription}</strong><br>
            ✅ Correct? <strong>${result.correct ? 'Yes' : 'No'}</strong><br>
            🕒 Latency: <strong>${totalLatency}ms</strong>
        `;
        instructionEl.className = result.correct ? 'voice-instruction correct' : 'voice-instruction incorrect';

        // 📊 Update metrics
        this.analytics.recordResponse(transcription, result.correct, totalLatency);
        this.updateLatencyDisplay(totalLatency);
        this.updateStats();

        // ⏳ Reset message
        setTimeout(() => {
            instructionEl.className = 'voice-instruction';
            instructionEl.innerText = result.correct
                ? result.nextInstruction
                : result.instruction;
        }, 1500);
    }

    updateLatencyDisplay(latency) {
        const el = document.getElementById('latency-value');
        el.textContent = `${Math.round(latency)}ms`;
        el.className = latency < 300 ? 'excellent' : latency < 500 ? 'good' : 'slow';
    }

    updateStats() {
        const stats = this.analytics.getStats();
        document.getElementById('avg-latency').textContent = `${Math.round(stats.averageLatency)}ms`;
        document.getElementById('accuracy').textContent = `${Math.round(stats.accuracy)}%`;
        document.getElementById('streak').textContent = stats.currentStreak;
    }

    nextChallenge() {
        this.gameEngine.nextChallenge();
        this.updateUI();
    }

    adjustDifficulty() {
        this.gameEngine.adjustDifficulty();
        document.getElementById('difficulty').textContent = this.gameEngine.getCurrentDifficulty();
    }

    resetStats() {
        this.analytics.reset();
        this.updateStats();
    }

    updateMicStatus(status) {
        const micStatus = document.getElementById('mic-status');
        micStatus.className = `mic-status ${status}`;
    }

    updateUI() {
        const currentChallenge = this.gameEngine.getCurrentChallenge();
        if (currentChallenge) currentChallenge.render();
    }

    handleVoiceError(error) {
        console.error('Voice error:', error);
        this.showError('Voice recognition error. Please try again.');
    }

    showError(message) {
        const instruction = document.getElementById('voice-instruction');
        instruction.innerHTML = `⚠️ ${message}`;
        instruction.className = 'voice-instruction error';
    }
}

// Launch on DOM load
document.addEventListener('DOMContentLoaded', () => {
    window.neuroDashApp = new NeuroDashApp();
});
