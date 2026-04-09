const ICONS = ['🦊','🐯','🐱','🐭','🐹','🐰','🐻','🐼','🦝','🐶','🦁','🐮','🐷','🐸','🐵','🐴','🦄','🐢'];
const GRID_SIZE = 6;
let board = [];
let selectedTile = null;
let score = 0;
let timeLeft = 60;
let timer = null;
let isPlaying = false;

const gridEl = document.getElementById('grid');
const scoreEl = document.getElementById('score');
const timeEl = document.getElementById('time');
const resetBtn = document.getElementById('reset-btn');
const modal = document.getElementById('game-over-modal');
const finalScoreEl = document.getElementById('final-score');
const playAgainBtn = document.getElementById('play-again-btn');
const modalTitle = document.getElementById('modal-title');

function initGame() {
    gridEl.style.gridTemplateColumns = `repeat(${GRID_SIZE}, 1fr)`;
    gridEl.innerHTML = '';
    
    board = Array(GRID_SIZE + 2).fill(0).map(() => Array(GRID_SIZE + 2).fill(0));
    
    let pairs = [];
    for (let i = 0; i < (GRID_SIZE * GRID_SIZE) / 2; i++) {
        pairs.push(ICONS[i % ICONS.length]);
        pairs.push(ICONS[i % ICONS.length]);
    }
    
    // Shuffle
    pairs.sort(() => Math.random() - 0.5);
    
    let pairIdx = 0;
    for (let r = 1; r <= GRID_SIZE; r++) {
        for (let c = 1; c <= GRID_SIZE; c++) {
            let icon = pairs[pairIdx++];
            board[r][c] = icon;
            
            const tile = document.createElement('div');
            tile.className = 'tile';
            tile.dataset.r = r;
            tile.dataset.c = c;
            tile.textContent = icon;
            
            tile.addEventListener('click', () => handleTileClick(r, c));
            gridEl.appendChild(tile);
        }
    }
    
    selectedTile = null;
    score = 0;
    timeLeft = 60;
    isPlaying = true;
    updateStats();
    
    if (timer) clearInterval(timer);
    timer = setInterval(gameLoop, 1000);
    
    modal.classList.add('hidden');
}

function handleTileClick(r, c) {
    if (!isPlaying || board[r][c] === 0) return;
    
    if (!selectedTile) {
        selectedTile = { r, c };
        getTileEl(r, c).classList.add('selected');
        return;
    }
    
    if (selectedTile.r === r && selectedTile.c === c) {
        getTileEl(r, c).classList.remove('selected');
        selectedTile = null;
        return;
    }
    
    const v1 = board[selectedTile.r][selectedTile.c];
    const v2 = board[r][c];
    
    if (v1 === v2) {
        if (canConnect(selectedTile.r, selectedTile.c, r, c)) {
            const tile1 = getTileEl(selectedTile.r, selectedTile.c);
            const tile2 = getTileEl(r, c);
            
            tile1.classList.remove('selected');
            tile1.classList.add('matched');
            tile2.classList.add('matched');
            
            setTimeout(() => {
                tile1.classList.add('hidden');
                tile2.classList.add('hidden');
            }, 400);
            
            board[selectedTile.r][selectedTile.c] = 0;
            board[r][c] = 0;
            
            score += 10;
            updateStats();
            
            selectedTile = null;
            checkWin();
            return;
        }
    }
    
    getTileEl(selectedTile.r, selectedTile.c).classList.remove('selected');
    selectedTile = { r, c };
    getTileEl(r, c).classList.add('selected');
}

function canConnect(r1, c1, r2, c2) {
    const dr = [-1, 0, 1, 0];
    const dc = [0, 1, 0, -1];
    
    const q = [];
    const turnsMap = Array(GRID_SIZE + 2).fill(0).map(() => 
        Array(GRID_SIZE + 2).fill(0).map(() => Array(4).fill(Infinity))
    );
    
    for (let i = 0; i < 4; i++) {
        let nr = r1 + dr[i];
        let nc = c1 + dc[i];
        if (nr >= 0 && nr < GRID_SIZE + 2 && nc >= 0 && nc < GRID_SIZE + 2) {
            if (board[nr][nc] === 0 || (nr === r2 && nc === c2)) {
                q.push([nr, nc, i, 0]);
                turnsMap[nr][nc][i] = 0;
            }
        }
    }
    
    let front = 0;
    while (front < q.length) {
        let [r, c, dir, turns] = q[front++];
        
        if (r === r2 && c === c2) return true;
        
        for (let i = 0; i < 4; i++) {
            let nr = r + dr[i];
            let nc = c + dc[i];
            
            if (nr >= 0 && nr < GRID_SIZE + 2 && nc >= 0 && nc < GRID_SIZE + 2) {
                let nTurns = turns + (dir !== i ? 1 : 0);
                if (nTurns <= 2) {
                    if (board[nr][nc] === 0 || (nr === r2 && nc === c2)) {
                        if (nTurns < turnsMap[nr][nc][i]) {
                            turnsMap[nr][nc][i] = nTurns;
                            q.push([nr, nc, i, nTurns]);
                        }
                    }
                }
            }
        }
    }
    
    return false;
}

function getTileEl(r, c) {
    let idx = (r - 1) * GRID_SIZE + (c - 1);
    return gridEl.children[idx];
}

function updateStats() {
    scoreEl.textContent = score;
    timeEl.textContent = timeLeft;
}

function gameLoop() {
    if (!isPlaying) return;
    
    timeLeft--;
    updateStats();
    
    if (timeLeft <= 0) {
        endGame(false);
    }
}

function checkWin() {
    for (let r = 1; r <= GRID_SIZE; r++) {
        for (let c = 1; c <= GRID_SIZE; c++) {
            if (board[r][c] !== 0) return;
        }
    }
    endGame(true);
}

function endGame(win) {
    isPlaying = false;
    clearInterval(timer);
    modalTitle.textContent = win ? "You Won!" : "Time's Up!";
    finalScoreEl.textContent = score;
    modal.classList.remove('hidden');
}

resetBtn.addEventListener('click', initGame);
playAgainBtn.addEventListener('click', initGame);

initGame();
