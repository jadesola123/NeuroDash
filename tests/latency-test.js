// latency-test.js
// Simple latency simulation to test performance of voice processing pipeline

const { performance } = require('perf_hooks');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log("NeuroDash Latency Tester\n");
console.log("Press ENTER to simulate voice command → processing start → response time\n");

let samples = [];

function simulateLatency() {
  rl.question("[User speaks] Press ENTER...", () => {
    const start = performance.now();

    setTimeout(() => {
      const latency = performance.now() - start;
      samples.push(latency);

      console.log(`🧠 Simulated processing complete. Latency: ${latency.toFixed(2)} ms\n`);
      promptNext();
    }, Math.random() * 300 + 100); // simulate 100ms–400ms latency
  });
}

function promptNext() {
  rl.question("Do you want to run another test? (y/n): ", (answer) => {
    if (answer.toLowerCase() === 'y') {
      simulateLatency();
    } else {
      rl.close();
      const average = samples.reduce((a, b) => a + b, 0) / samples.length;
      console.log(`\n📊 Average Latency: ${average.toFixed(2)} ms over ${samples.length} samples.`);
      process.exit(0);
    }
  });
}

simulateLatency();
