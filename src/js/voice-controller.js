// voice-controller.js

import AssemblyAI from 'https://cdn.jsdelivr.net/npm/assemblyai@latest/dist/assemblyai.es.js';
import GameEngine from './game-engine.js';

const LATENCY_DISPLAY = document.getElementById('latency');
const TRANSCRIPT_DISPLAY = document.getElementById('transcript-display');
const FEEDBACK_DISPLAY = document.getElementById('feedback');

const CORRECT_SOUND = new Audio('./src/assets/sounds/correct.mp3');
const WRONG_SOUND = new Audio('./src/assets/sounds/wrong.mp3');

let game = null;
let currentChallenge = null;
let promptCount = 0;
let sessionStart = null;
let lastPromptTime = null;

const MAX_PROMPTS = 10;

export function initVoiceController(apiKey) {
  const aai = new AssemblyAI({ apiKey });
  const transcriber = aai.realtime.transcriber({
    sampleRate: 16000,
    onTranscript: handleTranscript,
    onOpen: () => console.log('WebSocket connected.'),
    onError: (err) => console.error('AssemblyAI error:', err),
    onClose: () => console.log('WebSocket closed.')
  });

  navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
    transcriber.attachAudio(stream);
    transcriber.start();
  });

  game = new GameEngine();
  game.loadChallenge('color'); // Start with color challenge by default
  currentChallenge = game.getCurrentChallenge();
  currentChallenge.start();
  promptCount = 1;
  sessionStart = Date.now();
  lastPromptTime = sessionStart;
}

function handleTranscript(msg) {
  const spoken = msg.text.trim();
  if (!spoken) return;

  const now = Date.now();
  const latency = now - lastPromptTime;
  LATENCY_DISPLAY.textContent = `${latency}ms`;
  TRANSCRIPT_DISPLAY.textContent = `You said: "${spoken}"`;

  const result = currentChallenge.checkAnswer(spoken);
  if (result.correct) {
    CORRECT_SOUND.play();
    FEEDBACK_DISPLAY.textContent = '✅ Correct';
    game.analytics.recordResult(true, latency);

    if (promptCount >= MAX_PROMPTS) {
      game.endSession();
    } else {
      setTimeout(() => {
        currentChallenge.generateNewColor();
        currentChallenge.render();
        lastPromptTime = Date.now();
        promptCount++;
        FEEDBACK_DISPLAY.textContent = '';
        TRANSCRIPT_DISPLAY.textContent = '';
      }, 1000);
    }
  } else {
    WRONG_SOUND.play();
    FEEDBACK_DISPLAY.textContent = result.instruction || '❌ Try again';
    game.analytics.recordResult(false, latency);
  }
}
