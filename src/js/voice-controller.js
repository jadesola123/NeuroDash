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
        
        // Performance tracking
        this.startTime = null;
        this.latencyBuffer = [];
    }

    async start() {
        try {
            // Get microphone access
            this.audioStream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    sampleRate: 16000,
                    channelCount: 1,
                    echoCancellation: true,
                    noiseSuppression: true
                }
            });

            // Initialize AssemblyAI WebSocket
            await this.initializeWebSocket();
            
            // Start audio recording
            this.startAudioCapture();
            
            console.log('Voice controller started successfully');
        } catch (error) {
            console.error('Failed to start voice controller:', error);
            this.onError(error);
            throw error;
        }
    }

    async initializeWebSocket() {
        return new Promise((resolve, reject) => {
            // Note: In production, you'd get this token from your backend
            const websocketUrl = `wss://api.assemblyai.com/v2/realtime/ws?sample_rate=16000&token=${this.getApiToken()}`;
            
            this.websocket = new WebSocket(websocketUrl);
            
            this.websocket.onopen = () => {
                console.log('AssemblyAI WebSocket connected');
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
                console.log('AssemblyAI WebSocket disconnected');
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
                // Convert to base64 and send to AssemblyAI
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

        // Start recording in small chunks for real-time processing
        this.mediaRecorder.start(250); // 250ms chunks
        this.isRecording = true;
        this.startTime = Date.now();
    }

    handleTranscription(data) {
        if (data.message_type === 'FinalTranscript' && data.text) {
            const processingTime = Date.now() - this.startTime;
            
            // Filter out common filler words and normalize
            const cleanedText = this.cleanTranscription(data.text);
            
            if (cleanedText.length > 0) {
                this.onTranscription(cleanedText, data.confidence, processingTime);
                
                // Track latency for performance analysis
                this.trackLatency(processingTime);
            }
            
            // Reset timing for next command
            this.startTime = Date.now();
        }
    }

    cleanTranscription(text) {
        return text
            .toLowerCase()
            .trim()
            .replace(/[^\w\s]/g, '') // Remove punctuation
            .replace(/\b(um|uh|er|ah)\b/g, '') // Remove filler words
            .replace(/\s+/g, ' ') // Normalize spaces
            .trim();
    }

    trackLatency(latency) {
        this.latencyBuffer.push(latency);
        
        // Keep only recent measurements for moving average
        if (this.latencyBuffer.length > 10) {
            this.latencyBuffer.shift();
        }
        
        const averageLatency = this.latencyBuffer.reduce((a, b) => a + b, 0) / this.latencyBuffer.length;
        this.onLatencyUpdate(averageLatency);
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
        
        console.log('Voice controller stopped');
    }

    getApiToken() {
        // In production, this should be fetched from your backend
        // For demo purposes, you'd need to implement a token endpoint
        return 'YOUR_ASSEMBLYAI_TOKEN_HERE';
    }
}