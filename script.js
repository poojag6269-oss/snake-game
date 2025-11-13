const board = document.querySelector(".board");
const startButton = document.querySelector(".btn-start");
const modal = document.querySelector(".modal");
const startGameModal = document.querySelector(".start-game");
const gameOverModal = document.querySelector(".game-over");
const restartButton = document.querySelector(".btn-restart");

const blockSize = 50;
const cols = Math.floor(board.clientWidth / blockSize);
const rows = Math.floor(board.clientHeight / blockSize);

const scoreEl = document.getElementById("score");
const highScoreEl = document.getElementById("high-score");
const timeEl = document.getElementById("time");

board.style.gridTemplateColumns = `repeat(${cols}, ${blockSize}px)`;
board.style.gridTemplateRows = `repeat(${rows}, ${blockSize}px)`;

let intervalId = null;
let timerInterval = null;
let direction = "right";
let nextDirection = "right";

let snake = [{ x: 5, y: 5 }];
let food = randomFood();
let score = 0;
let highScore = localStorage.getItem("highScore") ? parseInt(localStorage.getItem("highScore")) : 0;
let startTime = null;

highScoreEl.textContent = highScore;

const blocks = {};
for (let row = 0; row < rows; row++) {
  for (let col = 0; col < cols; col++) {
    const block = document.createElement("div");
    block.classList.add("block");
    board.appendChild(block);
    blocks[`${row}-${col}`] = block;
  }
}

function randomFood() {
  return {
    x: Math.floor(Math.random() * rows),
    y: Math.floor(Math.random() * cols),
  };
}

function render() {
  document.querySelectorAll(".fill, .food").forEach((el) => {
    el.classList.remove("fill", "food");
  });

  blocks[`${food.x}-${food.y}`]?.classList.add("food");

  direction = nextDirection;

  const head = { ...snake[0] };

  if (direction === "up") head.x--;
  if (direction === "down") head.x++;
  if (direction === "left") head.y--;
  if (direction === "right") head.y++;

  if (head.x < 0 || head.x >= rows || head.y < 0 || head.y >= cols) return gameOver();
  if (snake.some((seg) => seg.x === head.x && seg.y === head.y)) return gameOver();

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    score++;
    scoreEl.textContent = score;
    if (score > highScore) {
      highScore = score;
      highScoreEl.textContent = highScore;
      localStorage.setItem("highScore", highScore);
    }
    food = randomFood();
  } else {
    snake.pop();
  }

  snake.forEach((seg) => {
    blocks[`${seg.x}-${seg.y}`]?.classList.add("fill");
  });
}

function gameOver() {
  clearInterval(intervalId);
  clearInterval(timerInterval);
  intervalId = null;
  modal.style.display = "flex";
  startGameModal.style.display = "none";
  gameOverModal.style.display = "flex";
}

function startGame() {
  modal.style.display = "none";
  gameOverModal.style.display = "none";
  snake = [{ x: 5, y: 5 }];
  direction = "right";
  nextDirection = "right";
  food = randomFood();
  score = 0;
  scoreEl.textContent = score;

  clearInterval(intervalId);
  clearInterval(timerInterval);

  startTime = Date.now();
  updateTimer();
  timerInterval = setInterval(updateTimer, 1000);
  let speed = 200 - Math.min(score * 5, 150);
  intervalId = setInterval(render, speed);
}

function updateTimer() {
  const elapsed = Math.floor((Date.now() - startTime) / 1000);
  const minutes = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const seconds = String(elapsed % 60).padStart(2, "0");
  timeEl.textContent = `${minutes}:${seconds}`;
}

startButton.addEventListener("click", startGame);
restartButton.addEventListener("click", startGame);

document.addEventListener("keydown", (e) => {
  if (e.key === " " || e.key === "Enter") {
    if (!intervalId) startGame();
  }

  if (e.key === "ArrowUp" && direction !== "down") nextDirection = "up";
  if (e.key === "ArrowDown" && direction !== "up") nextDirection = "down";
  if (e.key === "ArrowLeft" && direction !== "right") nextDirection = "left";
  if (e.key === "ArrowRight" && direction !== "left") nextDirection = "right";
});
