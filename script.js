const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const healthEl = document.getElementById("health");
const playersEl = document.getElementById("players");
const zoneEl = document.getElementById("zone");
const gameOverEl = document.getElementById("game-over");

let player = {
    x: 500,
    y: 350,
    size: 13,
    speed: 5.5,
    health: 100,
    angle: 0
};

let bullets = [];
let bots = [];
let particles = [];
let safeRadius = 800;
let timeUntilShrink = 8000;
let gameRunning = true;

const keys = {};

// Criar bots
for (let i = 0; i < 10; i++) {
    bots.push({
        x: Math.random() * 880 + 60,
        y: Math.random() * 580 + 60,
        size: 12,
        speed: 2.9,
        health: 85,
        color: "#ff4444"
    });
}

// ====================== CONTROLES ======================
window.addEventListener("keydown", e => keys[e.key] = true);
window.addEventListener("keyup", e => keys[e.key] = false);

canvas.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    player.angle = Math.atan2(my - player.y, mx - player.x);
});

canvas.addEventListener("click", () => {
    if (!gameRunning) return;
    
    bullets.push({
        x: player.x,
        y: player.y,
        speed: 13,
        angle: player.angle,
        damage: 28
    });
});

// ====================== UPDATE ======================
function update() {
    if (!gameRunning) return;

    // Movimento
    if (keys['w'] || keys['W']) player.y -= player.speed;
    if (keys['s'] || keys['S']) player.y += player.speed;
    if (keys['a'] || keys['A']) player.x -= player.speed;
    if (keys['d'] || keys['D']) player.x += player.speed;

    player.x = Math.max(25, Math.min(975, player.x));
    player.y = Math.max(25, Math.min(675, player.y));

    // Balas
    for (let i = bullets.length - 1; i >= 0; i--) {
        let b = bullets[i];
        b.x += Math.cos(b.angle) * b.speed;
        b.y += Math.sin(b.angle) * b.speed;

        if (b.x < 0 || b.x > 1000 || b.y < 0 || b.y > 700) {
            bullets.splice(i, 1);
        }
    }

    // Bots
    bots.forEach(bot => {
        if (bot.health <= 0) return;

        const dx = player.x - bot.x;
        const dy = player.y - bot.y;
        const dist = Math.hypot(dx, dy);

        if (dist > 0) {
            bot.x += (dx / dist) * bot.speed;
            bot.y += (dy / dist) * bot.speed;
        }

        // Colisão bala x bot
        for (let i = bullets.length - 1; i >= 0; i--) {
            let b = bullets[i];
            if (Math.hypot(b.x - bot.x, b.y - bot.y) < bot.size + 6) {
                bot.health -= b.damage;
                bullets.splice(i, 1);
                createParticles(b.x, b.y, 10, "#ffaa00");
            }
        }
    });

    bots = bots.filter(bot => bot.health > 0);

    // Zona
    if (timeUntilShrink > 0) timeUntilShrink -= 16;
    else if (safeRadius > 130) safeRadius -= 0.85;

    // Dano fora da zona
    const distFromCenter = Math.hypot(player.x - 500, player.y - 350);
    if (distFromCenter > safeRadius) {
        player.health -= 0.2;
    }

    // UI
    healthEl.textContent = Math.max(0, Math.floor(player.health));
    playersEl.textContent = bots.length + 1;
    zoneEl.textContent = Math.floor(safeRadius);

    // Game Over
    if (player.health <= 0) {
        gameRunning = false;
        gameOverEl.style.display = "block";
    }

    // Vitória
    if (bots.length === 0) {
        alert("🎉 VOCÊ VENCEU A BATTLE ROYALE!");
        location.reload();
    }
}

// ====================== PARTICLES ======================
function createParticles(x, y, count, color) {
    for (let i = 0; i < count; i++) {
        particles.push({
            x: x,
            y: y,
            vx: Math.random() * 7 - 3.5,
            vy: Math.random() * 7 - 3.5,
            life: 28,
            color: color
        });
    }
}

// ====================== DRAW ======================
function draw() {
    ctx.fillStyle = "#0a1f0a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#1e3a1e";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Zona
    ctx.strokeStyle = "#ff0000";
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.arc(500, 350, safeRadius, 0, Math.PI * 2);
    ctx.stroke();

    // Bots
    bots.forEach(bot => {
        ctx.fillStyle = bot.color;
        ctx.beginPath();
        ctx.arc(bot.x, bot.y, bot.size, 0, Math.PI * 2);
        ctx.fill();
    });

    // Jogador
    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.rotate(player.angle);
    ctx.fillStyle = "#00aaff";
    ctx.beginPath();
    ctx.arc(0, 0, player.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#005588";
    ctx.fillRect(10, -5, 22, 10);
    ctx.restore();

    // Balas
    ctx.fillStyle = "#ffff00";
    bullets.forEach(b => {
        ctx.beginPath();
        ctx.arc(b.x, b.y, 4.5, 0, Math.PI * 2);
        ctx.fill();
    });

    // Partículas
    for (let i = particles.length - 1; i >= 0; i--) {
        let p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        p.vx *= 0.95;
        p.vy *= 0.95;

        ctx.globalAlpha = p.life / 28;
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x - 2, p.y - 2, 5, 5);

        if (p.life <= 0) particles.splice(i, 1);
    }
    ctx.globalAlpha = 1;
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();
