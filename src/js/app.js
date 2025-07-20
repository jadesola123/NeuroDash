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
            // Initialize components
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
            
            console.log('NeuroDash initialized successfully');
        } catch (error) {
            console.error('Failed to initialize NeuroDash:', error);
            this.showError('Failed to initialize. Please check your internet connection.');
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
                console.error('Failed to start training:', error);
                this.showError('Failed to start voice recognition. Please check microphone permissions.');
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

        // Update analytics
        this.analytics.recordResponse(transcription, result.correct, totalLatency);
        
        // Update UI
        this.updateLatencyDisplay(totalLatency);
        this.updateStats();
        
        // Provide feedback
        this.provideFeedback(result);
    }

    updateLatencyDisplay(latency) {
        document.getElementById('latency-value').textContent = `${latency}ms`;
        
        // Color code based on performance
        const latencyEl = document.getElementById('latency-value');
        if (latency < 300) {
            latencyEl.className = 'excellent';
        } else if (latency < 500) {
            latencyEl.className = 'good';
        } else {
            latencyEl.className = 'slow';
        }
    }

    updateStats() {
        const stats = this.analytics.getStats();
        document.getElementById('avg-latency').textContent = `${Math.round(stats.averageLatency)}ms`;
        document.getElementById('accuracy').textContent = `${Math.round(stats.accuracy)}%`;
        document.getElementById('streak').textContent = stats.currentStreak;
    }

    provideFeedback(result) {
        const instruction = document.getElementById('voice-instruction');
        if (result.correct) {
            instruction.innerHTML = '✅ Correct! ' + result.nextInstruction;
            instruction.className = 'voice-instruction correct';
        } else {
            instruction.innerHTML = '❌ Try again! ' + result.instruction;
            instruction.className = 'voice-instruction incorrect';
        }
        
        // Reset styling after delay
        setTimeout(() => {
            instruction.className = 'voice-instruction';
        }, 1500);
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
        if (currentChallenge) {
            currentChallenge.render();
        }
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

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.neuroDashApp = new NeuroDashApp();
});