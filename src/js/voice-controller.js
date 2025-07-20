// voice-controller.js

class VoiceController {
  constructor({ onTranscription, onFinalTranscription }) {
    this.ws = null;
    this.mic = null;
    this.listening = false;
    this.transcriptionHandler = onTranscription;
    this.finalHandler = onFinalTranscription;
    this.sampleRate = 16000;
    this.apiKey = import.meta.env ? import.meta.env.VITE_ASSEMBLY_API_KEY : (window.ASSEMBLY_API_KEY || '');
  }

  async init() {
    if (!this.apiKey) {
      console.error("❌ AssemblyAI API key missing.");
      alert("AssemblyAI API key missing. Check .env or index.html.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioContext = new AudioContext();
      const source = this.audioContext.createMediaStreamSource(stream);
      const processor = this.audioContext.createScriptProcessor(4096, 1, 1);

      this.ws = new WebSocket(`wss://api.assemblyai.com/v2/realtime/ws?sample_rate=${this.sampleRate}`);

      this.ws.onopen = () => {
        this.listening = true;
        console.log("🎤 Connected to AssemblyAI.");
        processor.onaudioprocess = (e) => {
          if (!this.listening) return;
          const floatData = e.inputBuffer.getChannelData(0);
          const int16Data = this._convertFloat32ToInt16(floatData);
          if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(int16Data);
          }
        };
        source.connect(processor);
        processor.connect(this.audioContext.destination);
      };

      this.ws.onmessage = (message) => {
        const res = JSON.parse(message.data);
        if (res.text && res.message_type === 'PartialTranscript') {
          this.transcriptionHandler?.(res.text);
        }
        if (res.text && res.message_type === 'FinalTranscript') {
          const latency = res.audio_end - res.audio_start;
          this.finalHandler?.(res.text, latency);
        }
      };

      this.ws.onerror = (err) => {
        console.error("WebSocket error:", err);
        alert("❌ WebSocket error. Check console.");
      };

      this.ws.onclose = () => {
        this.listening = false;
        console.log("🔇 Disconnected from AssemblyAI.");
      };
    } catch (error) {
      console.error("🎤 Mic error:", error);
      alert("Microphone access error. Make sure it's allowed.");
    }
  }

  stop() {
    this.listening = false;
    if (this.ws) this.ws.close();
    if (this.audioContext) this.audioContext.close();
  }

  _convertFloat32ToInt16(buffer) {
    const l = buffer.length;
    const result = new Int16Array(l);
    for (let i = 0; i < l; i++) {
      result[i] = Math.min(1, buffer[i]) * 0x7FFF;
    }
    return result.buffer;
  }
}

export default VoiceController;
