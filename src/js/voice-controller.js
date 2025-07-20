/**
 * Voice Controller - Handles AssemblyAI Universal-Streaming integration
 */

class VoiceController {
    constructor(options = {}) {
        this.onTranscription = options.onTranscription || (() => {});
        this.onLatencyUpdate = options.onLatencyUpdate || (() => {});
        this.onError = options.onError || (() => {});
        
        this.websocket = null;
        this.mediaRecorder = null;
        this.audioStream = null;
        this.isRecording = false;
        
        // Latency tracking
        this.startTime = null;
        this.latencyBuffer = [];
    }

    async start() {
        try {
            this.audioStream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    sampleRate: 16000,
                    channelCount: 1,
                    echoCancellation: true,
                    noiseSuppression: true
                }
            });

            await this.initializeWebSocket();
            this.startAudioCapture();
            console.log('VoiceController started');
        } catch (error) {
            console.error('VoiceController start error:', error);
            this.onError(error);
            throw error;
        }
    }

    async initializeWebSocket() {
        return new Promise((resolve, reject) => {
            const url = `wss://api.assemblyai.com/v2/realtime/ws?sample_rate=16000&token=${this.getApiToken()}`;
            this.websocket = new WebSocket(url);

            this.websocket.onopen = () => {
                console.log('WebSocket connected');
                resolve();
            };

            this.websocket.onmessage = (message) => {
                const data = JSON.parse(message.data);
                this.handleTranscription(data);
            };

            this.websocket.onerror = (error) => {
                console.error('WebSocket error:', error);
                reject(error);
            };

            this.websocket.onclose = () => {
                console.log('WebSocket closed');
            };
        });
    }

    startAudioCapture() {
        this.mediaRecorder = new MediaRecorder(this.audioStream, {
            mimeType: 'audio/webm;codecs=opus',
            audioBitsPerSecond: 16000
        });

        this.mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0 && this.websocket?.readyState === WebSocket.OPEN) {
                const reader = new FileReader();
                reader.onload = () => {
                    const base64Audio = reader.result.split(',')[1];
                    this.websocket.send(JSON.stringify({
                        audio_data: base64Audio
                    }));
                };
                reader.readAsDataURL(event.data);
            }
        };

        this.mediaRecorder.start(250); // 250ms chunks
        this.isRecording = true;
        this.startTime = Date.now();
    }

    handleTranscription(data) {
        if (data.message_type === 'FinalTranscript' && data.text) {
            const processingTime = Date.now() - this.startTime;

            const cleaned = this.cleanTranscription(data.text);
            if (cleaned.length > 0) {
                this.onTranscription(cleaned, data.confidence, processingTime);
                this.trackLatency(processingTime);
            }

            this.startTime = Date.now();
        }
    }

    cleanTranscription(text) {
        return text
            .toLowerCase()
            .replace(/[^\w\s]/g, '')
            .replace(/\b(um|uh|er|ah)\b/g, '')
            .replace(/\s+/g, ' ')
            .trim();
    }

    trackLatency(latency) {
        this.latencyBuffer.push(latency);
        if (this.latencyBuffer.length > 10) this.latencyBuffer.shift();

        const avg = this.latencyBuffer.reduce((a, b) => a + b, 0) / this.latencyBuffer.length;
        this.onLatencyUpdate(avg);
    }

    stop() {
        if (this.mediaRecorder && this.isRecording) {
            this.mediaRecorder.stop();
            this.isRecording = false;
        }

        if (this.audioStream) {
            this.audioStream.getTracks().forEach(track => track.stop());
            this.audioStream = null;
        }

        if (this.websocket) {
            this.websocket.close();
            this.websocket = null;
        }

        console.log('VoiceController stopped');
    }

    getApiToken() {
        // Inject your key here directly (since .env won't work on GitHub Pages)
        return '061a7f07085b47bbb22ca1941bd2b38e';
    }
}
