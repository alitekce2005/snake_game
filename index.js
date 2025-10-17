// Preloader
        window.addEventListener('load', function() {
            setTimeout(function() {
                document.getElementById('preloader').classList.add('fade-out');
                setTimeout(function() {
                    document.getElementById('preloader').style.display = 'none';
                }, 500);
            }, 1500);
        });

        // Particle animation
        function createParticles() {
            const container = document.getElementById('particles');
            for (let i = 0; i < 20; i++) {
                const particle = document.createElement('div');
                particle.className = 'particle';
                particle.style.width = Math.random() * 5 + 2 + 'px';
                particle.style.height = particle.style.width;
                particle.style.left = Math.random() * 100 + '%';
                particle.style.animationDelay = Math.random() * 20 + 's';
                particle.style.animationDuration = (Math.random() * 10 + 15) + 's';
                container.appendChild(particle);
            }
        }
        createParticles();

        let canvas = document.getElementById("game");
        let ctx = canvas.getContext("2d");

        class SnakePart {
            constructor(x, y) {
                this.x = x;
                this.y = y;
            }
        }

        let gameMode = 'classic';
        let speed = 7;
        let tileCount = 20;
        let tileSize = canvas.width / tileCount - 2;
        let headX = 10;
        let headY = 10;
        let snakeParts = [];
        let tailLength = 2;
        let appleX = 5;
        let appleY = 5;
        let inputsXVelocity = 0;
        let inputsYVelocity = 0;
        let xVelocity = 0;
        let yVelocity = 0;
        let score = 0;
        let gameLoopId = null;
        let gulpSound = new Audio();
        let gameOverSound = new Audio();
        let currentSoundPack = 'classic'; 

        function updateSoundPaths() {
            gulpSound.src = `sounds/${currentSoundPack}/gulp.mp3`;
            gameOverSound.src = `sounds/${currentSoundPack}/gameover.mp3`;
        }
        
        function changeSoundPack() {
            currentSoundPack = document.getElementById('soundPackSelect').value;
            updateSoundPaths();
            gulpSound.play();
        }
        
        updateSoundPaths();

        function startGame(mode) {
            gameMode = mode;
            document.getElementById('menuScreen').classList.add('hidden');
            document.getElementById('gameScreen').classList.remove('hidden');
            document.getElementById('gameOverOverlay').classList.remove('show');
            
            // Background change
            document.body.className = '';
            if (mode === 'night') {
                document.body.classList.add('bg-night');
            } else if (mode === 'speed') {
                document.body.classList.add('bg-speed');
            } else if (mode === 'segmented') {
                document.body.classList.add('bg-segmented');
            }

            resetGame();
            document.getElementById('modeDisplay').textContent = 'Mod: ' + getModeText(mode);
            drawGame();
        }

        function resetGame() {
            headX = 10;
            headY = 10;
            snakeParts = [];
            tailLength = 2;
            score = 0;
            inputsXVelocity = 0;
            inputsYVelocity = 0;
            xVelocity = 0;
            yVelocity = 0;
            appleX = 5;
            appleY = 5;

            if (gameMode === 'speed') {
                speed = 15;
            } else {
                speed = 7;
            }
        }

        function replayGame() {
            document.getElementById('gameOverOverlay').classList.remove('show');
            resetGame();
            drawGame();
        }

        function getModeText(mode) {
            const modes = {
                'classic': 'Klasik',
                'speed': 'Hızlandırılmış',
                'night': 'Gece',
                'segmented': 'Kesikli Yılan'
            };
            return modes[mode] || mode;
        }

        function backToMenu() {
            if (gameLoopId) {
                clearTimeout(gameLoopId);
                gameLoopId = null;
            }
            document.getElementById('gameScreen').classList.add('hidden');
            document.getElementById('menuScreen').classList.remove('hidden');
            document.getElementById('gameOverOverlay').classList.remove('show');
            document.body.className = '';
        }

        function drawGame() {
            xVelocity = inputsXVelocity;
            yVelocity = inputsYVelocity;

            changeSnakePosition();
            let result = isGameOver();
            if (result) {
                return;
            }

            clearScreen();
            checkAppleCollision();
            drawApple();
            drawSnake();
            drawScore();

            if (gameMode === 'classic') {
                if (score > 5) speed = 9;
                if (score > 10) speed = 11;
            }

            gameLoopId = setTimeout(drawGame, 1000 / speed);
        }

        function isGameOver() {
            let gameOver = false;

            if (yVelocity === 0 && xVelocity === 0) {
                return false;
            }

            if (headX < 0 || headX >= tileCount || headY < 0 || headY >= tileCount) {
                gameOver = true;
            }

            for (let i = 0; i < snakeParts.length; i++) {
                let part = snakeParts[i];
                if (part.x === headX && part.y === headY) {
                    gameOver = true;
                    break;
                }
            }

            if (gameOver) {
                ctx.fillStyle = "white";
                ctx.font = "50px Verdana";
                var gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
                gradient.addColorStop("0", "magenta");
                gradient.addColorStop("0.5", "blue");
                gradient.addColorStop("1.0", "red");
                ctx.fillStyle = gradient;
                ctx.fillText("Game Over!", canvas.width / 6.5, canvas.height / 2);
                
                gameOverSound.play();
                document.getElementById('finalScore').textContent = 'Skorunuz: ' + score;
                document.getElementById('gameOverOverlay').classList.add('show');
            }

            return gameOver;
        }

        function drawScore() {
            document.getElementById('scoreDisplay').textContent = 'Skor: ' + score;
        }

        function clearScreen() {
            if (gameMode === 'night') {
                ctx.fillStyle = "#0a0a0a";
            } else {
                ctx.fillStyle = "black";
            }
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        function drawSnake() {
            if (gameMode === 'segmented') {
                for (let i = 0; i < snakeParts.length; i++) {
                    if ((i + 1) % 5 === 0) continue;
                    
                    let part = snakeParts[i];
                    ctx.fillStyle = "green";
                    ctx.fillRect(part.x * tileCount, part.y * tileCount, tileSize, tileSize);
                }
            } else {
                ctx.fillStyle = "green";
                for (let i = 0; i < snakeParts.length; i++) {
                    let part = snakeParts[i];
                    ctx.fillRect(part.x * tileCount, part.y * tileCount, tileSize, tileSize);
                }
            }

            snakeParts.push(new SnakePart(headX, headY));
            while (snakeParts.length > tailLength) {
                snakeParts.shift();
            }

            ctx.fillStyle = "orange";
            ctx.fillRect(headX * tileCount, headY * tileCount, tileSize, tileSize);
        }

        function changeSnakePosition() {
            headX = headX + xVelocity;
            headY = headY + yVelocity;
        }

        function drawApple() {
            if (gameMode === 'night') {
                let distance = Math.abs(appleX - headX) + Math.abs(appleY - headY);
                if (distance <= 2) {
                    ctx.fillStyle = "red";
                    ctx.fillRect(appleX * tileCount, appleY * tileCount, tileSize, tileSize);
                }
            } else {
                ctx.fillStyle = "red";
                ctx.fillRect(appleX * tileCount, appleY * tileCount, tileSize, tileSize);
            }
        }

        function checkAppleCollision() {
            if (appleX === headX && appleY === headY) {
                appleX = Math.floor(Math.random() * tileCount);
                appleY = Math.floor(Math.random() * tileCount);
                tailLength++;
                score++;
                gulpSound.play();
            }
        }

        function changeDirection(dir) {
            if (dir === 'up' && inputsYVelocity !== 1) {
                inputsYVelocity = -1;
                inputsXVelocity = 0;
            } else if (dir === 'down' && inputsYVelocity !== -1) {
                inputsYVelocity = 1;
                inputsXVelocity = 0;
            } else if (dir === 'left' && inputsXVelocity !== 1) {
                inputsYVelocity = 0;
                inputsXVelocity = -1;
            } else if (dir === 'right' && inputsXVelocity !== -1) {
                inputsYVelocity = 0;
                inputsXVelocity = 1;
            }
        }

        document.body.addEventListener("keydown", keyDown);

        function keyDown(event) {
            if (event.keyCode == 38 || event.keyCode == 87) {
                changeDirection('up');
            }
            if (event.keyCode == 40 || event.keyCode == 83) {
                changeDirection('down');
            }
            if (event.keyCode == 37 || event.keyCode == 65) {
                changeDirection('left');
            }
            if (event.keyCode == 39 || event.keyCode == 68) {
                changeDirection('right');
            }
        }