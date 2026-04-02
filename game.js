/**
 * LOGICA DEL GIOCO
 */
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startMenu = document.getElementById('start-menu');
const gameOverScreen = document.getElementById('game-over');
const pauseBtn = document.getElementById('pause-btn');
const gameControls = document.getElementById('game-controls');
const btnAudio = document.getElementById('btnAudio');
btnAudio.addEventListener('click', toggleAudio);


// Assicura che i controlli siano nascosti all'avvio.
gameControls.classList.add('hidden');

// Configurazione Canvas
canvas.width = 800;
canvas.height = 400;

// Variabili di stato
let gameState = 'START'; // START, PLAYING, GAMEOVER
let score = 0;
let time = 0;
let gameSpeed = 5;
let obstacles = [];
let frameCount = 0;
let highScore = localStorage.getItem('dinoHighScore') || 0;
let lastTime = 0;
let accTime = 0;

// Variabili Difficoltà
let level = 1;
let spawnRate = 100;
let framesSinceLastSpawn = 0;
let nextLevelScore = 500;
let nextLevelTime = 30;
let lastLevelTime = 0;
let audioOnOff = false;
let dinoAudioUrl = '';
// resetLevels()

// Proprietà del Dinosauro
const dino = {
    x: 200,
    y: 330,
    width: 100,
    height: 100,
    dy: 0,
    jumpForce: 15,
    gravity: 0.7,
    isGrounded: false,
    type: 'T-Rex',
    margin: 10,
    audio: '',
};

// 1. Definiamo i percorsi delle immagini e configurazione hitbox
const dinoConfig = {
    'T-Rex': { src: '/img/dino_01.png', margin: 20 , weight: 0.8 , audio: '/audio/dino_01.wav'},
    'Triceratops': { src: '/img/dino_02.png', margin: 15 , weight: 0.7, audio: '/audio/dino_02.wav'},
    'Brachiosaurus': { src: '/img/dino_03.png', margin: 10 , weight: 1, audio: '/audio/dino_03.wav'},
    'Velociraptor': { src: '/img/dino_04.png', margin: 25, weight: 0.6, audio: '/audio/dino_04.wav'},
    'Pterodactyl': { src: '/img/dino_05.png', margin: 25, weight: 0.5, audio: '/audio/dino_05.wav'},
    'Stegosaurus': { src: '/img/dino_06.png', margin: 15, weight: 0.8, audio: '/audio/dino_06.wav'},
    'Dilophosaurus': { src: '/img/dino_07.png', margin: 25, weight: 0.6, audio: '/audio/dino_07.wav'},
    'Ankylosaurus': { src: '/img/dino_08.png', margin: 10, weight: 0.9, audio: '/audio/dino_08.wav'},
    'Spinosaurus': { src: '/img/dino_09.png', margin: 15, weight: 0.7, audio: '/audio/dino_09.wav'},
    'Diplodocus': { src: '/img/dino_10.png', margin: 20, weight: 1, audio: '/audio/dino_10.wav'},
};


function fillDinosSelection(){

    const dinoDiv = document.getElementById('char-selection');
    dinoDiv.innerHTML ='';

    Object.keys(dinoConfig).forEach(dinoType => {
        // Now you can use 'dinoType' (e.g., 'T-Rex') and 'config' (e.g., { src: '...', margin: ... })
        //console.log(`Dinosaur: ${dinoType}`, config);

        const config = dinoConfig[dinoType];

        let btn = document.createElement('button');
        btn.setAttribute('onclick', `startGame('${dinoType}')`);
        let img = document.createElement('img');
        img.setAttribute('src', config.src);
        img.setAttribute('alt', dinoType);
        let div = document.createElement('div');
        div.innerText = dinoType;
        btn.appendChild(img);
        btn.appendChild(div);
        dinoDiv.appendChild(btn);
        /* <div id="char-selection">
            <!--
            <button onclick="startGame('T-Rex')">
                <img src="/img/dino_01.png" alt="T-Rex">
                <div>T-Rex</div>
            </button>*/

    });
}


fillDinosSelection();

// Creiamo un oggetto Image globale
const dinoImg = new Image();

// 2. Caricamento Sprite Ostacoli
const cactusImg = new Image();
cactusImg.src = '/img/cactus.png';
const stoneImg = new Image();
stoneImg.src = '/img/stone.png';

// Sfondo
const bgImg = new Image();
bgImg.src = '/img/background.png';
let bgX = 0;

// Funzione Inizio Gioco
function startGame(type) {
    dino.type = type;
    const config = dinoConfig[type];
    dinoImg.src = config.src; // Carica l'immagine corrispondente
    dino.margin = config.margin; // Imposta il margine per la hitbox
    dino.gravity = config.weight; // imposta il peso, maggiore è il peso, aumenta la gravità
    dino.audio = config.audio; // imposto il verso.
    /*
    gameState = 'PLAYING';
    startMenu.classList.add('hidden');
    score = 0;
    time = 0;
    requestAnimationFrame(update);
    */

    // Aspettiamo che l'immagine sia caricata prima di partire (opzionale ma consigliato)
    dinoImg.onload = () => {

        gameState = 'PLAYING';
        startMenu.classList.add('hidden');
        gameControls.classList.remove('hidden');
        pauseBtn.innerText = '❚❚';
        score = 0;
        time = 0;
        bgX = 0;
        dino.x = 100; // Reset posizione iniziale
        obstacles = []; // Reset ostacoli
        
        // Reset Difficoltà
        resetLevels();
        
        lastTime = performance.now();
        accTime = 0;

        requestAnimationFrame(update);
    };

    
}

function resetLevels() {
    level = 1;
    gameSpeed = 5;
    spawnRate = 100;
    framesSinceLastSpawn = 0;
    nextLevelScore = 500;
    nextLevelTime = 30;
    lastLevelTime = 0;
}

// 3. Modifichiamo il disegno dentro la funzione update()
function drawDino() {
    // Se l'immagine è caricata la disegna, altrimenti usa un rettangolo di backup
    if (dinoImg.complete) {
        ctx.drawImage(dinoImg, dino.x, dino.y, dino.width, dino.height);
    } else {
        ctx.fillStyle = '#333';
        ctx.fillRect(dino.x, dino.y, dino.width, dino.height);
    }
}

// Classe Ostacoli
// 3. Classe Ostacolo modificata per usare le immagini
class Obstacle {
    constructor() {
        // Scegliamo casualmente tra cactus e pietra
        this.type = Math.random() > 0.5 ? 'cactus' : 'stone';
        this.img = this.type === 'cactus' ? cactusImg : stoneImg;
        
        // Dimensioni fisse per mantenere le proporzioni della pixel art
        this.width = 40;
        this.height = 40;
        this.x = canvas.width;
        this.y = 370 - this.height;
    }
    
    update() {
        this.x -= gameSpeed;
    }
    
    draw() {
        if (this.img.complete) {
            ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
        } else {
            // Backup se l'immagine non carica
            ctx.fillStyle = "#888";
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }
}

function update(currentTime) {
    if (gameState !== 'PLAYING') return;

    if (!currentTime) currentTime = performance.now();
    const deltaTime = currentTime - lastTime;
    lastTime = currentTime;

    // Pulizia schermo
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Disegno Sfondo Infinito
    if (bgImg.complete) {
        bgX -= gameSpeed * 0.5; // Velocità parallasse
        const scale = canvas.height / bgImg.height;
        const scaledWidth = bgImg.width * scale;

        if (bgX <= -scaledWidth) bgX = 0;

        ctx.drawImage(bgImg, bgX, 0, scaledWidth, canvas.height);
        ctx.drawImage(bgImg, bgX + scaledWidth, 0, scaledWidth, canvas.height);
        if (bgX + scaledWidth < canvas.width) ctx.drawImage(bgImg, bgX + scaledWidth * 2, 0, scaledWidth, canvas.height);
    }

    
    // Gestione tempo e punteggio
    accTime += deltaTime;
    while (accTime >= 1000) {
        time++;
        score += 5; // Punti per il tempo
        accTime -= 1000;
        //console.log("Livelli: ", lastLevelTime, nextLevelTime, level);
        // Aumento difficoltà per Tempo
        if (lastLevelTime >= nextLevelTime) {
            levelUp();
            lastLevelTime = 0;
        }
        lastLevelTime += 1;
    }

    // Movimento Dinosauro (Gravità)
    dino.dy += dino.gravity;
    dino.y += dino.dy;

    // Collisione con il suolo
    if (dino.y + dino.height > 370) {
        dino.y = 370 - dino.height;
        dino.dy = 0;
        dino.isGrounded = true;
    }

    // Disegno Dinosauro (Rettangolo temporaneo)
    /*
    ctx.fillStyle = '#333';
    ctx.fillRect(dino.x, dino.y, dino.width, dino.height);
    ctx.font = "12px monospace";
    ctx.fillText(dino.type, dino.x, dino.y - 5);
    */
   drawDino();

    // in base al livello deve aumentare la difficoltà
    // Generazione Ostacoli
    framesSinceLastSpawn++;
    if (framesSinceLastSpawn >= spawnRate) {
        obstacles.push(new Obstacle());
        framesSinceLastSpawn = 0;
    }

    // Aggiornamento e Disegno Ostacoli
    obstacles.forEach((obs, index) => {
        obs.update();
        obs.draw();

        // Collisione
        // Calcolo hitbox ridotta in base al margine del dinosauro
        const hitboxX = dino.x + dino.margin;
        const hitboxY = dino.y + dino.margin;
        const hitboxW = dino.width - (dino.margin * 2);
        const hitboxH = dino.height - (dino.margin * 2);

        if (
            hitboxX < obs.x + obs.width &&
            hitboxX + hitboxW > obs.x &&
            hitboxY < obs.y + obs.height &&
            hitboxY + hitboxH > obs.y
        ) {
            endGame();
        }

        // Rimoziostacoli fuori schermo e punti extra
        if (obs.x + obs.width < 0) {
            obstacles.splice(index, 1);
            score += 10;
        }
    });

    // Aumento difficoltà per Punteggio
    if (score >= nextLevelScore) {
        levelUp();
        nextLevelScore += 1000;
    }

    // UI: Punteggio e Tempo
    ctx.fillStyle = '#000';
    ctx.font = "20px monospace";
    ctx.fillText(`SCORE: ${score} | LVL: ${level} | SPD: ${gameSpeed}`, 20, 30);
    ctx.fillText(`TIME: ${time}s`, canvas.width - 150, 30);

    requestAnimationFrame(update);
}

function levelUp() {
    console.log("levelUp() called");
    level++;
    gameSpeed += 0.5; // Aumenta velocità

    // Diminuisce intervallo spawn (rocce più vicine), minimo 40 frames
    // valore iniziale: 100
    if (spawnRate > 30) { 
        spawnRate -= 5;
    }

    console.table("Aumento Livello",level,gameSpeed,spawnRate);
}

function endGame() {
    gameState = 'GAMEOVER';
    gameControls.classList.add('hidden');
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('dinoHighScore', highScore);
    }
    document.getElementById('final-stats').innerText = `Punteggio: ${score} | Tempo: ${time}s`;
    document.getElementById('high-score-msg').innerText = `Record: ${highScore}`;
    gameOverScreen.classList.remove('hidden');
}

function toggleAudio() {
    audioOnOff = !audioOnOff;
    btnAudio.innerText = audioOnOff === false ? '🔇' : '🔊';
    localStorage.setItem('audioOnOff', audioOnOff);
    //console.log('toggleAudio: ' + audioOnOff);
}

function playAudio(dino) {
    try{
        //console.log('playAudio: ' + audioOnOff);
        if(audioOnOff === true){
            const audio = new Audio(dino.audio);
            audio.currentTime = 0;
            // 0.9 = più grave/lento, 1.1 = più acuto/veloce
            audio.playbackRate = 0.8;
            audio.play().catch(error => {
                console.log("Riproduzione bloccata dal browser. L'utente deve interagire con la pagina.");
            });
        }
    }
    catch(err){
        console.log('playAudio; Error.', err);
    }
}

// Funzione Pausa
window.togglePause = function() {
    if (gameState === 'PLAYING') {
        gameState = 'PAUSED';
        pauseBtn.innerText = '▶';
        
        // Disegna scritta PAUSA
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#000';
        ctx.font = "40px monospace";
        ctx.fillText("PAUSA", canvas.width / 2 - 60, canvas.height / 2);
    } else if (gameState === 'PAUSED') {
        gameState = 'PLAYING';
        pauseBtn.innerText = '❚❚';
        pauseBtn.blur(); // Rimuove il focus dal bottone per evitare conflitti con la barra spaziatrice
        lastTime = performance.now();
        requestAnimationFrame(update);
    }
};

// Funzione Stop
window.stopGame = function() {
    location.reload();
};

// Input: Tastiera
window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.code === 'ArrowUp') {
        if (dino.isGrounded && gameState === 'PLAYING') {
            dino.dy = -dino.jumpForce;
            dino.isGrounded = false;
        }
        playAudio(dino);
    }

    if (e.code === 'ArrowRight' && gameState === 'PLAYING') {
        // Sposta in avanti di 2rem (circa 32px)
        dino.x = Math.min(dino.x + 32, canvas.width - dino.width);
    }

    if (e.code === 'ArrowLeft' && gameState === 'PLAYING') {
        // Sposta indietro di 2rem (circa 32px)
        dino.x = Math.max(dino.x - 32, 0);
    }

    if (e.code === 'Enter' && gameState === 'START') startGame('T-Rex');
    if (e.code === 'Enter' && gameState === 'GAMEOVER') location.reload();
    if (e.code === 'Escape') location.reload();
});

// Input: Touch per Mobile
let touchStartX = 0;
let touchStartY = 0;

canvas.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].clientX;
    touchStartY = e.changedTouches[0].clientY;
    e.preventDefault();
}, {passive: false});

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault(); // Previene lo scroll della pagina
}, {passive: false});

canvas.addEventListener('touchend', (e) => {
    if (gameState !== 'PLAYING') return;

    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;

    const diffX = touchEndX - touchStartX;
    const diffY = touchEndY - touchStartY;

    // Se lo spostamento orizzontale è significativo (> 30px) e prevale su quello verticale
    if (Math.abs(diffX) > 30 && Math.abs(diffX) > Math.abs(diffY)) {
        if (diffX > 0) {
            // Swipe Destra -> Avanti
            dino.x = Math.min(dino.x + 32, canvas.width - dino.width);
        } else {
            // Swipe Sinistra -> Indietro
            dino.x = Math.max(dino.x - 32, 0);
        }
    } else {
        // Tap (tocco breve) o Swipe Verticale -> Salto
        if (dino.isGrounded) {
            dino.dy = -dino.jumpForce;
            dino.isGrounded = false;
        }
    }
    e.preventDefault();
});


// Aggiunge la funzionalità di scorrimento tramite trascinamento per la selezione del personaggio
document.addEventListener('DOMContentLoaded', () => {

    audioOnOff = localStorage.getItem('audioOnOff') === 'false';
    toggleAudio();

    const slider = document.getElementById('char-selection');
    if (slider) {
        let isDown = false;
        let startX;
        let scrollLeft;

        slider.addEventListener('mousedown', (e) => {
            isDown = true;
            slider.style.userSelect = 'none';
            startX = e.pageX - slider.offsetLeft;
            scrollLeft = slider.scrollLeft;
        });

        slider.addEventListener('mouseleave', () => {
            isDown = false;
            slider.style.removeProperty('user-select');
        });

        slider.addEventListener('mouseup', () => {
            isDown = false;
            slider.style.removeProperty('user-select');
        });

        slider.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - slider.offsetLeft;
            const walk = (x - startX) * 2; // Moltiplicatore per rendere lo scorrimento più reattivo
            slider.scrollLeft = scrollLeft - walk;
        });
    }
});
