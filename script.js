const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const levelEl = document.getElementById("level");
const remainingEl = document.getElementById("remaining");
const levelScreen = document.getElementById("levelScreen");

let score = 0;
let currentLevel = 1;
let targets = [];
let gameActive = false;
let phaseScore = 0;

class Target {
  constructor() {
    this.radius = Math.max(12, 48 - currentLevel * 6);        // Menor a cada fase
    this.x = Math.random() * (canvas.width - this.radius * 2) + this.radius;
    this.y = Math.random() * (canvas.height - this.radius * 2) + this.radius;
    
    // Tempo de vida (fica mais difícil)
    this.life = Math.max(45, 95 - currentLevel * 9);
    
    // Movimento (a partir da fase 3)
    this.speed = currentLevel >= 3 ? (currentLevel - 2) * 0.8 : 0;
    this.dx = (Math.random() - 0.5) * this.speed;
    this.dy = (Math.random() - 0.5) * this.speed;
  }

  update() {
    if (this.speed > 0) {
      this.x += this.dx;
      this.y += this.dy;

      // Rebote nas bordas
      if (this.x - this.radius < 0 || this.x + this.radius > canvas.width) this.dx *= -1;
      if (this.y - this.radius < 0 || this.y + this.radius > canvas.height) this.dy *= -1;
    }
    this.life--;
  }
}

function spawnTargets() {
  const amount = 3 + currentLevel * 2;   // Muito mais alvos nas fases altas
  targets = [];
  for (let i = 0; i < amount; i++) {
    targets.push(new Target());
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  targets.forEach((target, index) => {
    target.update();

    const alpha = target.life / 90;

    // Alvo
    ctx.beginPath();
    ctx.arc(target.x, target.y, target.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 60, 60, ${alpha})`;
    ctx.fill();

    // Círculo branco
    ctx.beginPath();
    ctx.arc(target.x, target.y, target.radius * 0.65, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.fill();

    // Centro
    ctx.beginPath();
    ctx.arc(target.x, target.y, target.radius * 0.25, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 0, 0, ${alpha})`;
    ctx.fill();

    if (target.life <= 0) {
      targets.splice(index, 1);
    }
  });

  remainingEl.textContent = targets.length;
}

function gameLoop() {
  if (!gameActive) return;
  draw();

  if (targets.length === 0) {
    endPhase();
  }
}

function endPhase() {
  gameActive = false;
  document.getElementById("currentLevel").textContent = currentLevel;
  document.getElementById("phasePoints").textContent = phaseScore;
  document.getElementById("totalScore").textContent = score;
  levelScreen.style.display = "block";
}

function nextPhase() {
  levelScreen.style.display = "none";
  currentLevel++;

  if (currentLevel > 5) {
    alert(`🏆 PARABÉNS! Você completou o jogo!\nPontuação Final: ${score}`);
    currentLevel = 1;
    score = 0;
  }

  levelEl.textContent = currentLevel;
  phaseScore = 0;
  startPhase();
}

function startPhase() {
  phaseScore = 0;
  spawnTargets();
  gameActive = true;
}

// Clique para atirar
canvas.addEventListener("click", (e) => {
  if (!gameActive) return;

  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  for (let i = targets.length - 1; i >= 0; i--) {
    const t = targets[i];
    const distance = Math.hypot(t.x - mouseX, t.y - mouseY);

    if (distance < t.radius) {
      const points = Math.floor(t.radius) * 4; // mais pontos por acerto
      score += points;
      phaseScore += points;

      scoreEl.textContent = score;
      targets.splice(i, 1);

      // Respawn de novo alvo
      if (targets.length < 3 + currentLevel * 2) {
        targets.push(new Target());
      }
      break;
    }
  }
});

function startNewGame() {
  score = 0;
  currentLevel = 1;
  phaseScore = 0;
  scoreEl.textContent = score;
  levelEl.textContent = currentLevel;
  levelScreen.style.display = "none";
  startPhase();
}

// Loop do jogo
setInterval(gameLoop, 16);
