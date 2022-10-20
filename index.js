/** @type {HTMLCanvasElement} */
const canvas = document.querySelector("#canvas");
canvas.setAttribute("width", window.innerWidth);
canvas.setAttribute("height", window.innerHeight);
window.onresize = () => {
    canvas.setAttribute("width", window.innerWidth);
    canvas.setAttribute("height", window.innerHeight);
};

const ctx = canvas.getContext("2d");

const grounds = [
    // высота должна быть кратна 20
    // только положительные числа
    {
        x: 0,
        y: 800,
        width: 1600,
        height: 0,
        type: "ground",
    },
    {
        x: 300,
        y: 660,
        width: -100,
        height: 0,
        type: "ground",
    },
    {
        x: 100,
        y: 520,
        width: 100,
        height: 0,
        type: "ground",
    },
];

class Player {
    constructor(speed, height, width, x, y) {
        this.spawnX = x;
        this.spawnY = y;
        this.speed = speed;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.moveX = 0;
        this.moveY = 0;
        this.isJump = false;
        this.jumpFrames = 0;
        this.weight = height / 5;
        this.inSpace = false;
    }

    draw(fps) {
        if (this.x < 0) {
            this.x = 0;
        }
        if (this.x + this.width > canvas.width) {
            this.x = canvas.width - this.width;
        }

        if (this.isJump) {
            if (this.jumpFrames == fps / 2 + 1) {
                this.isJump = false;
                this.jumpFrames = 0;
            } else {
                this.y -= Math.round(
                    (((this.height * (fps / 4 - this.jumpFrames)) / fps) * 35) /
                        fps
                );
                this.jumpFrames++;
            }
        }
        if (this.y > canvas.height) {
            this.y = -this.height;
        }

        this.checkCollision(fps);

        this.x += this.moveX;

        ctx.beginPath();
        ctx.fillStyle = "#000";
        ctx.fillRect(this.x - 2, this.y - 2, this.width + 4, this.height);
        ctx.fillStyle = "#fff";
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = "#000";
        ctx.fillRect(
            this.x +
                this.width / 6.5 +
                (Math.floor(this.moveX / this.speed) * 2 * this.width) / 20,
            this.y +
                this.height / 10 +
                ((this.jumpFrames * (this.jumpFrames - fps / 2)) / 500) *
                    this.height *
                    0.2,
            this.width / 4,
            this.width / 4
        );
        ctx.fillRect(
            this.x +
                this.width / 4 +
                this.width / 3 +
                (Math.floor(this.moveX / this.speed) * 2 * this.width) / 20,
            this.y +
                this.height / 10 +
                ((this.jumpFrames * (this.jumpFrames - fps / 2)) / 500) *
                    this.height *
                    0.2,
            this.width / 4,
            this.width / 4
        );
        ctx.closePath();
    }

    moveRight(isDown) {
        if (isDown) {
            if (this.moveX == this.speed) return;
            this.moveX += this.speed;
        } else {
            this.moveX -= this.speed;
        }
    }

    moveLeft(isDown) {
        if (isDown) {
            if (-this.moveX == this.speed) return;
            this.moveX -= this.speed;
        } else {
            this.moveX += this.speed;
        }
    }

    jump() {
        if (this.isJump || this.inSpace) return;
        this.isJump = true;
    }

    checkCollision(fps) {
        let inSpace = true;
        let place = "";
        let top = false;
        grounds.forEach((ground) => {
            if (
                ground.y == Math.round(this.y / 10) * 10 + this.height &&
                ((ground.x <= this.x + 1 &&
                    ground.x + ground.width >= this.x + 1) ||
                    (ground.x <= this.x + this.width - 1 &&
                        ground.x + ground.width >= this.x + this.width - 1) ||
                    (ground.x >= this.x &&
                        ground.x + ground.width <= this.x + this.width - 1))
            ) {
                inSpace = false;
                place = ground.type;
            }

            if (
                ground.y == Math.round(this.y / 10) * 10 &&
                ((ground.x <= this.x + 1 &&
                    ground.x + ground.width >= this.x + 1) ||
                    (ground.x <= this.x + this.width - 1 &&
                        ground.x + ground.width >= this.x + this.width - 1))
            ) {
                top = true;
            }

            if (
                ground.x <= this.x &&
                ground.x + ground.width >= this.x &&
                ((ground.y <= this.y && ground.y + ground.height >= this.y) ||
                    (ground.y <= this.y + this.height - 1 &&
                        ground.y + ground.height >= this.y + this.height - 1) ||
                    (ground.y >= this.y &&
                        ground.y + ground.height <=
                            this.y + this.height - 1)) &&
                this.moveX < 0
            ) {
                console.log(1);
                this.x -= this.moveX;
            }

            if (
                ground.x <= this.x + this.width &&
                ground.x + ground.width >= this.x + this.width &&
                ((ground.y <= this.y && ground.y + ground.height >= this.y) ||
                    (ground.y <= this.y + this.height - 1 &&
                        ground.y + ground.height >= this.y + this.height - 1) ||
                    (ground.y >= this.y &&
                        ground.y + ground.height <=
                            this.y + this.height - 1)) &&
                this.moveX > 0
            ) {
                console.log(2);
                this.x -= this.moveX;
            }
        });
        if (inSpace && !this.isJump) {
            this.y = Math.round((this.y + this.speed) / 10) * 10;
            this.inSpace = true;
        }
        if (!inSpace) {
            if (place == "lava") {
                this.y = this.spawnY;
                this.x = this.spawnX;
            }
        }
        if (!inSpace && this.inSpace) this.inSpace = false;
        if (!inSpace && this.isJump) {
            this.isJump = false;
            this.jumpFrames = 0;
            this.y = Math.round(this.y / 10) * 10;
        }

        if (top && this.isJump) {
            this.jumpFrames = fps / 2 - this.jumpFrames + 1;
        }
    }
}

class World {
    constructor(fps) {
        this.fps = fps;
    }

    render() {
        setInterval(() => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            player.draw(this.fps);

            grounds.forEach((ground) => {
                ctx.beginPath();
                ctx.strokeStyle = (() => {
                    if (ground.type === "ground") {
                        return "#752800";
                    }
                    if (ground.type == "lava") {
                        return "#C90F1F";
                    }
                })();
                ctx.lineWidth = 10;
                ctx.moveTo(ground.x, ground.y);
                ctx.lineTo(ground.x + ground.width, ground.y + ground.height);
                ctx.stroke();
                ctx.closePath();
            });
        }, 1000 / this.fps);
    }
}

const player = new Player(10, 120, 40, 400, 500);
const world = new World(60);
world.render();

document.addEventListener("keydown", (event) => {
    if (
        event.key.toLowerCase() === "d" ||
        event.key.toLowerCase() === "в" ||
        event.key === "ArrowRight"
    ) {
        player.moveRight(true);
    }
    if (
        event.key.toLowerCase() === "a" ||
        event.key.toLowerCase() === "ф" ||
        event.key === "ArrowLeft"
    ) {
        player.moveLeft(true);
    }
    if (
        event.key.toLowerCase() === "w" ||
        event.key.toLowerCase() === " " ||
        event.key.toLowerCase() === "ц" ||
        event.key === "ArrowUp"
    ) {
        player.jump();
    }
});

document.addEventListener("keyup", (event) => {
    if (
        event.key.toLowerCase() === "d" ||
        event.key.toLowerCase() === "в" ||
        event.key === "ArrowRight"
    ) {
        player.moveRight(false);
    }
    if (
        event.key.toLowerCase() === "a" ||
        event.key.toLowerCase() === "ф" ||
        event.key === "ArrowLeft"
    ) {
        player.moveLeft(false);
    }
});
