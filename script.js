const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// === LOAD GAMBAR ===
const birdImg = new Image();
birdImg.src = "assets/bird.png";

let birdX = 50;
let birdY = 150;
let birdWidth = 40;
let birdHeight = 40;
birdImg.onload = function() {
  let scale = 0.023;
  birdWidth = birdImg.width * scale;
  birdHeight = birdImg.height * scale;
};

const pipeImg = new Image();
pipeImg.src = "assets/pipe.png";

const bgImg = new Image();
bgImg.src = "assets/bg.png";

// === BURUNG ===
let gravity = 0.2;
let velocity = 0;
let jump = -3.5;

// === PIPA ===
let pipes = [];
let pipeWidth = 60;
let pipeGap = 180;
let frame = 0;
let lastPipeType = 0;

// === SKOR ===
let score = 0;
let bestScore = 0;

// === GAME STATE ===
let gameOver = false;

// === LOAD MUSIC ===
let bgMusic = new Audio("assets/bgm.mp3"); 
bgMusic.loop = true;      
bgMusic.volume = 0.5;

let hitSound = new Audio("assets/hit.mp3");
hitSound.volume = 0.8;

// === EVENT LISTENER ===
// Left click → lompat atau restart
document.addEventListener("click", function() {
  if (gameOver) {
    resetGame(); // restart
  } else {
    fly();       // lompat
    if (bgMusic.paused) bgMusic.play();
  }
});

// Space → lompat saja
document.addEventListener("keydown", function(e) {
  if (e.code === "Space" && !gameOver) {
    fly();
    if (bgMusic.paused) bgMusic.play();
    e.preventDefault();
  }
});

function fly() {
  velocity = jump;
}

function resetGame() {
  birdY = 150;
  velocity = 0;
  pipes = [];
  score = 0;
  frame = 0;
  gameOver = false;
  lastPipeType = 0;

  hitSound.pause();
  hitSound.currentTime = 0;

  bgMusic.currentTime = 0;
  bgMusic.play();
}

// === GAME LOOP ===
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Background
  if (bgImg.complete && bgImg.naturalWidth > 0) {
    ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
  } else {
    ctx.fillStyle = "skyblue";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  // Burung
  if (birdImg.complete && birdImg.naturalWidth > 0) {
    ctx.drawImage(birdImg, birdX, birdY, birdWidth, birdHeight);
  } else {
    ctx.fillStyle = "yellow";
    ctx.fillRect(birdX, birdY, birdWidth, birdHeight);
  }

  // Fisika jatuh
  velocity += gravity * 0.5;
  birdY += velocity;

  if (!gameOver) {
    // Generate pipes
    if (frame % 100 === 0) {
      let pipeType = lastPipeType === 0 ? (Math.random() < 0.5 ? 1 : 2) : 0;
      lastPipeType = pipeType;

      let minPipeY = 80;
      let maxPipeY = canvas.height - pipeGap - 80;
      let pipeY = Math.floor(Math.random() * (maxPipeY - minPipeY + 1)) + minPipeY;

      pipes.push({ x: canvas.width, y: pipeY, passed: false, type: pipeType });
    }

    for (let i = 0; i < pipes.length; i++) {
      let pipe = pipes[i];

      // Pipe atas
      if (pipe.type === 0 || pipe.type === 1) {
        if (pipeImg.complete && pipeImg.naturalWidth > 0) {
          ctx.drawImage(pipeImg, pipe.x, 0, pipeWidth, pipe.y);
        } else {
          ctx.fillStyle = "green";
          ctx.fillRect(pipe.x, 0, pipeWidth, pipe.y);
        }
      }

      // Pipe bawah
      if (pipe.type === 0 || pipe.type === 2) {
        let bottomHeight = canvas.height - pipe.y - pipeGap;
        if (pipeImg.complete && pipeImg.naturalWidth > 0) {
          ctx.drawImage(pipeImg, pipe.x, pipe.y + pipeGap, pipeWidth, bottomHeight);
        } else {
          ctx.fillStyle = "green";
          ctx.fillRect(pipe.x, pipe.y + pipeGap, pipeWidth, bottomHeight);
        }
      }

      // Geser
      pipe.x -= 2;

      // Skor
      if (!pipe.passed && pipe.x + pipeWidth <= birdX) {
        score++;
        pipe.passed = true;
        if (score > bestScore) bestScore = score;
      }

      // Collision
      if (
        birdX < pipe.x + pipeWidth &&
        birdX + birdWidth > pipe.x &&
        (
          (pipe.type === 0 && (birdY < pipe.y || birdY + birdHeight > pipe.y + pipeGap)) ||
          (pipe.type === 1 && birdY < pipe.y) ||
          (pipe.type === 2 && birdY + birdHeight > pipe.y + pipeGap)
        )
      ) {
        gameOver = true;
        bgMusic.pause();
        hitSound.currentTime = 0;
        hitSound.play();
      }
    }

    if (birdY + birdHeight > canvas.height || birdY < 0) {
      gameOver = true;
      bgMusic.pause();
      hitSound.currentTime = 0;
      hitSound.play();
    }
  }

  // Skor
  ctx.fillStyle = "white";
  ctx.font = "20px 'Oswald'";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText("Score: " + score, 10, 25);
  ctx.fillText("Best: " + bestScore, 10, 50);

  if (gameOver) {
    ctx.fillStyle = "white";
    ctx.font = "40px 'Oswald'";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("YOU DEAD, LOL", canvas.width / 2, canvas.height / 2);

    ctx.font = "20px 'Oswald'";
    ctx.fillText("Click to Restart", canvas.width / 2, canvas.height / 2 + 50);
  }

  frame++;
  requestAnimationFrame(draw);
}

draw();
