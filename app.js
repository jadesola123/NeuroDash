const startBtn = document.getElementById("start-btn");
const colorBox = document.getElementById("color-box");
const reactionDisplay = document.getElementById("reaction");
const scoreDisplay = document.getElementById("score");
const livesDisplay = document.getElementById("lives");
const difficulty = document.getElementById("difficulty");

const colors = ["red", "blue", "green", "yellow"];
let currentColor = "";
let score = 0;
let lives = 3;

function getRandomColor() {
  return colors[Math.floor(Math.random() * colors.length)];
}

function showColorPrompt() {
  currentColor = getRandomColor();
  colorBox.style.backgroundColor = currentColor;
  startTime = Date.now();
}

function updateScore(isCorrect, reactionTime) {
  if (isCorrect) {
    score++;
    reactionDisplay.textContent = `${reactionTime}ms`;
  } else {
    lives--;
    reactionDisplay.textContent = "Wrong or late!";
  }

  scoreDisplay.textContent = score;
  livesDisplay.textContent = "❤️".repeat(lives);

  if (lives <= 0) {
    endGame();
  } else {
    setTimeout(showColorPrompt, 1000);
  }
}

function endGame() {
  alert(`Game Over!\nScore: ${score}`);
  location.reload();
}

startBtn.onclick = () => {
  score = 0;
  lives = 3;
  scoreDisplay.textContent = "0";
  livesDisplay.textContent = "❤️❤️❤️";
  showColorPrompt();
};

