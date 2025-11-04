let nowPoints = 0;
let recordPoints = localStorage.getItem("flappyRecord") ? parseInt(localStorage.getItem("flappyRecord")) : 0;
document.getElementById("record-points").textContent = recordPoints;

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const imgFile = "../image/sprite.png";
const img = new Image();
img.src = imgFile;

const startWidthField = 275;
const startHeightField = 362;
const interface = document.querySelector(".interface-game");

// === Настройка размера птицы ===
const BIRD_SCALE = 1.3;

let coof = interface.offsetHeight / startHeightField;
let gameRunning = false;
let gameStarted = false;
let animationId = null;

let currentHandleClick = null;

class Sky {
    #ctx;
    #canvas;
    #img;
    #newCoord = 0;
    #startSpeed = 2;
    #coof;

    constructor(ctx, canvas, img, coof) {
        this.#ctx = ctx;
        this.#canvas = canvas;
        this.#img = img;
        this.#coof = coof;
    }

    updateScale(coof) {
        this.#coof = coof;
    }

    draw() {
        this.#newCoord += 0.5;
        const offsetOriginal = (this.#newCoord * this.#startSpeed) % 275;
        const offsetScreen = offsetOriginal * this.#coof;

        const w = 275 * this.#coof;
        const h = 362 * this.#coof;

        this.#ctx.drawImage(this.#img, 0, 0, 275, 362, -offsetScreen, 0, w, h);
        this.#ctx.drawImage(this.#img, 0, 0, 275, 362, -offsetScreen + w, 0, w, h);
    }
}

class Earth {
    #ctx;
    #canvas;
    #img;
    #newCoord = 0;
    #startSpeed = 30;
    #coof;

    constructor(ctx, canvas, img, coof) {
        this.#ctx = ctx;
        this.#canvas = canvas;
        this.#img = img;
        this.#coof = coof;
    }

    updateScale(coof) {
        this.#coof = coof;
    }

    draw() {
        this.#newCoord += 0.5;
        const offsetOriginal = (this.#newCoord * this.#startSpeed) % 224;
        const offsetScreen = offsetOriginal * this.#coof;

        const drawWidth = 224 * this.#coof;
        const drawHeight = 111 * this.#coof;
        const y = this.#canvas.height - drawHeight;

        this.#ctx.drawImage(this.#img, 276, 0, 224, 111, -offsetScreen, y, drawWidth, drawHeight);
        this.#ctx.drawImage(this.#img, 276, 0, 224, 111, -offsetScreen + drawWidth, y, drawWidth, drawHeight);
        this.#ctx.drawImage(this.#img, 276, 0, 224, 111, -offsetScreen + drawWidth * 2, y, drawWidth, drawHeight);
    }

    getTopY() {
        return this.#canvas.height - (111 * this.#coof);
    }
}

class Bird {
    #ctx;
    #canvas;
    #img;
    #coof;
    #earth;
    #heightBird;
    #y;
    #velocity = 0;
    #gravity;
    #rotation = 0;

    constructor(ctx, canvas, img, coof, earth) {
        this.#ctx = ctx;
        this.#canvas = canvas;
        this.#img = img;
        this.#coof = coof;
        this.#earth = earth;

        const gameHeight = canvas.height - (111 * coof);
        const gapHeight = 0.25 * gameHeight;
        this.#heightBird = 0.2 * gapHeight;

        this.#y = canvas.height * 0.3;
        this.#velocity = 0;
        this.#rotation = 0;
        this.#updatePhysics();
    }

    updateScale(coof) {
        this.#coof = coof;
        const gameHeight = this.#canvas.height - (111 * coof);
        const gapHeight = 0.25 * gameHeight;
        this.#heightBird = 0.2 * gapHeight;
        this.#updatePhysics();
    }

    #updatePhysics() {
        this.#gravity = 0.4 * this.#coof;
    }

    jump() {
        const gameHeight = this.#canvas.height - (111 * this.#coof);
        const gapHeight = 0.25 * gameHeight;
        const jumpHeight = gapHeight / 2;
        this.#velocity = -Math.sqrt(2 * this.#gravity * jumpHeight);
    }

    update(deltaTime) {
        const dt = deltaTime / 25;
        this.#velocity += this.#gravity * dt;
        this.#y += this.#velocity * dt;

        if (this.#y < 0) {
            this.#y = 0;
            this.#velocity = 0;
        }

        if (this.#velocity < 0) {
            this.#rotation = -0.4;
        } else {
            this.#rotation = Math.min(this.#rotation + 0.05, 0.8);
        }

        const birdBottom = this.#y + this.getHeight();
        const groundY = this.#earth.getTopY();
        if (birdBottom >= groundY) {
            this.#y = groundY - this.getHeight();
            this.end();
        }
    }

    draw() {
        const frame = Math.floor((performance.now() / 100) % 9 / 3);
        const birdX = this.#canvas.width / 5;
        const birdY = this.#y;
        const birdW = (34 * this.#coof / 2) * BIRD_SCALE;
        const birdH = this.#heightBird * BIRD_SCALE;

        this.#ctx.save();
        this.#ctx.translate(birdX + birdW / 2, birdY + birdH / 2);
        this.#ctx.rotate(this.#rotation);
        this.#ctx.drawImage(
            this.#img,
            276, 114 + frame * 24, 34, 24,
            -birdW / 2, -birdH / 2, birdW, birdH
        );
        this.#ctx.restore();
    }

    end() {
        gameRunning = false;
        gameStarted = false;
        if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }

        if (nowPoints > recordPoints) {
            recordPoints = nowPoints;
            localStorage.setItem("flappyRecord", recordPoints);
            document.getElementById("record-points").textContent = recordPoints;
        }

        document.getElementById("recordGameOver").textContent = nowPoints;
        document.getElementById("game-over").style.display = "block";
    }

    getX() { 
        return this.#canvas.width / 5; 
    }

    getY() {
        return this.#y; 
    }

    getWidth() {
        return (34 * this.#coof / 2) * BIRD_SCALE; 
    }

    getHeight() {
        return this.#heightBird * BIRD_SCALE; 
    }
}

class Pipe {
    #ctx;
    #canvas;
    #img;
    #coof;
    #earth;
    #pipes = [];
    #lastSpawnTime = 0;

    constructor(ctx, canvas, img, coof, earth) {
        this.#ctx = ctx;
        this.#canvas = canvas;
        this.#img = img;
        this.#coof = coof;
        this.#earth = earth;
    }

    updateScale(coof) {
        this.#coof = coof;
    }

    update(currentTime) {
        if (currentTime - this.#lastSpawnTime >= 1000) {
            this.#lastSpawnTime = currentTime;

            const gameHeight = this.#canvas.height - (111 * this.#coof);
            const gapHeight = 0.25 * gameHeight;
            const minMargin = 50 * this.#coof;

            let topHeight;
            if (gameHeight - gapHeight < 2 * minMargin) {
                topHeight = (gameHeight - gapHeight) / 2;
            } 
            else {
                const maxTop = Math.min(gameHeight - gapHeight - minMargin, 320 * this.#coof);
                if (maxTop < minMargin) 
                    maxTop = minMargin;
                topHeight = minMargin + Math.random() * (maxTop - minMargin);
            }

            const birdWidth = (34 * this.#coof / 2) * BIRD_SCALE;
            const pipeWidth = 2 * birdWidth;

            this.#pipes.push({
                x: this.#canvas.width,
                topHeight: topHeight,
                gapHeight: gapHeight,
                width: pipeWidth,
                passed: false
            });
        }

        for (let i = this.#pipes.length - 1; i >= 0; i--) {
            this.#pipes[i].x -= 2 * this.#coof;
            if (this.#pipes[i].x + this.#pipes[i].width < 0) {
                this.#pipes.splice(i, 1);
            }
        }
    }

    draw() {
        const pipeSrcX = 503;
        const capHeight = 24;
        const bodySrcY = capHeight;
        const bodySrcHeight = 320 - capHeight;
        const capWidth = 52;

        const earthTopY = this.#earth.getTopY();

        for (const pipe of this.#pipes) {
            // === Верхняя труба ===
            const topCapY = pipe.topHeight - (capHeight * this.#coof);
            const topBodyHeight = pipe.topHeight - (capHeight * this.#coof);

            if (topBodyHeight > 0) {
                let drawn = 0;
                while (drawn < topBodyHeight) {
                    const segmentHeight = Math.min(bodySrcHeight * this.#coof, topBodyHeight - drawn);
                    this.#ctx.drawImage(
                        this.#img,
                        pipeSrcX, bodySrcY, capWidth, bodySrcHeight,
                        pipe.x, topCapY - topBodyHeight + drawn,
                        pipe.width, segmentHeight
                    );
                    drawn += segmentHeight;
                }
            }

            // Крышка верхней трубы
            this.#ctx.drawImage(
                this.#img,
                pipeSrcX, 0, capWidth, capHeight,
                pipe.x, topCapY,
                pipe.width, capHeight * this.#coof
            );

            // === Нижняя труба ===
            const bottomY = pipe.topHeight + pipe.gapHeight;
            const bottomHeight = earthTopY - bottomY;

            if (bottomHeight > 0) {
                // Крышка нижней трубы
                this.#ctx.drawImage(
                    this.#img,
                    pipeSrcX, 0, capWidth, capHeight,
                    pipe.x, bottomY,
                    pipe.width, capHeight * this.#coof
                );

                // Тело нижней трубы
                const bodyHeight = bottomHeight - (capHeight * this.#coof);
                if (bodyHeight > 0) {
                    let drawn = 0;
                    while (drawn < bodyHeight) {
                        const segmentHeight = Math.min(bodySrcHeight * this.#coof, bodyHeight - drawn);
                        this.#ctx.drawImage(
                            this.#img,
                            pipeSrcX, bodySrcY, capWidth, bodySrcHeight,
                            pipe.x, bottomY + (capHeight * this.#coof) + drawn,
                            pipe.width, segmentHeight
                        );
                        drawn += segmentHeight;
                    }
                }
            }
        }
    }

    checkCollision(birdX, birdY, birdW, birdH) {
        for (const pipe of this.#pipes) {
            if (birdX + birdW > pipe.x && birdX < pipe.x + pipe.width) {
                if (birdY < pipe.topHeight || birdY + birdH > pipe.topHeight + pipe.gapHeight) {
                    return true;
                }
            }
        }
        return false;
    }

    checkPass(birdX) {
        let scored = 0;
        for (const pipe of this.#pipes) {
            const centerX = pipe.x + pipe.width / 2;
            if (!pipe.passed && birdX > centerX) {
                pipe.passed = true;
                scored++;
            }
        }
        return scored;
    }
}

function startGame() {
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
    gameRunning = false;
    gameStarted = false;

    canvas.height = interface.offsetHeight;
    coof = interface.offsetHeight / startHeightField;
    canvas.width = startWidthField * coof;

    document.getElementById("game-over").style.display = "none";
    nowPoints = 0;
    document.getElementById("now-points").textContent = nowPoints;

    const sky = new Sky(ctx, canvas, img, coof);
    const earth = new Earth(ctx, canvas, img, coof);
    const bird = new Bird(ctx, canvas, img, coof, earth);
    const pipe = new Pipe(ctx, canvas, img, coof, earth);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    sky.draw();
    earth.draw();
    bird.draw();

    const newHandleClick = () => {
        if (!gameRunning) return;

        if (!gameStarted) {
            gameStarted = true;
            let lastTime = performance.now();

            function gameLoop(currentTime) {
                if (!gameRunning || !gameStarted) return;

                const deltaTime = currentTime - lastTime;
                lastTime = currentTime;

                ctx.clearRect(0, 0, canvas.width, canvas.height);

                bird.update(deltaTime);
                pipe.update(currentTime);

                const birdX = bird.getX();
                const birdY = bird.getY();
                const birdW = bird.getWidth();
                const birdH = bird.getHeight();

                if (pipe.checkCollision(birdX, birdY, birdW, birdH)) {
                    sky.draw();
                    pipe.draw();
                    earth.draw();
                    bird.draw();
                    bird.end();
                    return;
                }

                nowPoints += pipe.checkPass(birdX);
                document.getElementById("now-points").textContent = nowPoints;

                sky.draw();
                pipe.draw();
                earth.draw();
                bird.draw();

                animationId = requestAnimationFrame(gameLoop);
            }

            gameLoop(lastTime);
            bird.jump();
        } else {
            bird.jump();
        }
    };

    if (currentHandleClick) {
        canvas.removeEventListener("click", currentHandleClick);
    }
    canvas.addEventListener("click", newHandleClick);
    currentHandleClick = newHandleClick;

    gameRunning = true;
    gameStarted = false;

    const resizeHandler = () => {
        canvas.height = interface.offsetHeight;
        coof = interface.offsetHeight / startHeightField;
        canvas.width = startWidthField * coof;
    };
    window.addEventListener("resize", resizeHandler);
}

let replayHandlerAdded = false;
img.onload = () => {
    startGame();
    if (!replayHandlerAdded) {
        document.getElementById("replay").addEventListener("click", startGame);
        replayHandlerAdded = true;
    }
};