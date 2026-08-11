let board = [];
let solution = [];
let initialBoard = [];
let selectedCell = null;
let currentLevel = 1;
let lockedBoxes = Array(9).fill(false);

document.addEventListener('DOMContentLoaded', () => {
    startNewGame();
});

function startNewGame() {
    board = Array(9).fill().map(() => Array(9).fill(0));
    generateFullGrid();
    solution = JSON.parse(JSON.stringify(board));
    preparePuzzle();
    lockedBoxes = Array(9).fill(false);
    selectedCell = null;
    renderBoard();
    document.getElementById('level-display').innerText = `Seviye: ${currentLevel}`;
}

function confirmNewGame() {
    if (confirm("Yeni oyun başlatmak istediğinize emin misiniz?")) {
        startNewGame();
    }
}

function generateFullGrid() {
    fillGrid(0, 0);
}

function fillGrid(row, col) {
    if (col === 9) { row++; col = 0; }
    if (row === 9) return true;
    let nums = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
    for (let num of nums) {
        if (isValid(board, row, col, num)) {
            board[row][col] = num;
            if (fillGrid(row, col + 1)) return true;
            board[row][col] = 0;
        }
    }
    return false;
}

function isValid(b, row, col, num) {
    for (let i = 0; i < 9; i++) {
        if (b[row][i] === num || b[i][col] === num) return false;
    }
    let startRow = Math.floor(row / 3) * 3;
    let startCol = Math.floor(col / 3) * 3;
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (b[startRow + i][startCol + j] === num) return false;
        }
    }
    return true;
}

function preparePuzzle() {
    let cells = [];
    for (let i = 0; i < 81; i++) cells.push(i);
    cells.sort(() => Math.random() - 0.5);

    for (let idx of cells) {
        let r = Math.floor(idx / 9);
        let c = idx % 9;
        let boxIdx = Math.floor(r / 3) * 3 + Math.floor(c / 3);

        // Her 3x3 bölgede en az 4 rakam kalsın ve TEK çözüm olsun.
        if (countInBox(board, boxIdx) > 4) {
            let temp = board[r][c];
            board[r][c] = 0;
            if (countSolutions(JSON.parse(JSON.stringify(board))) !== 1) {
                board[r][c] = temp;
            }
        }
    }
    initialBoard = JSON.parse(JSON.stringify(board));
}

function countInBox(b, boxIdx) {
    let count = 0;
    let startRow = Math.floor(boxIdx / 3) * 3;
    let startCol = (boxIdx % 3) * 3;
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (b[startRow + i][startCol + j] !== 0) count++;
        }
    }
    return count;
}

function countSolutions(b) {
    let count = 0;
    function solve() {
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                if (b[r][c] === 0) {
                    for (let n = 1; n <= 9; n++) {
                        if (isValid(b, r, c, n)) {
                            b[r][c] = n;
                            solve();
                            if (count > 1) return;
                            b[r][c] = 0;
                        }
                    }
                    return;
                }
            }
        }
        count++;
    }
    solve();
    return count;
}

function renderBoard() {
    const boardElement = document.getElementById('game-board');
    boardElement.innerHTML = '';
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            let boxIdx = Math.floor(r / 3) * 3 + Math.floor(c / 3);

            if (initialBoard[r][c] !== 0) {
                cell.innerText = initialBoard[r][c];
                cell.classList.add('fixed');
            } else if (board[r][c] !== 0) {
                cell.innerText = board[r][c];
                cell.classList.add('user');
            }

            if (lockedBoxes[boxIdx]) {
                cell.classList.add('locked');
            } else {
                cell.onclick = () => selectCell(r, c, cell);
            }
            boardElement.appendChild(cell);
        }
    }
}

function selectCell(r, c, element) {
    if (element.classList.contains('fixed') || element.classList.contains('locked')) return;
    if (selectedCell) selectedCell.element.classList.remove('selected');
    selectedCell = { r, c, element };
    element.classList.add('selected');
}

function inputNumber(num) {
    if (!selectedCell) return;
    const { r, c } = selectedCell;
    board[r][c] = num;
    checkBox(r, c);
    renderBoard();
    checkGameOver();
}

function deleteNumber() {
    if (!selectedCell) return;
    board[selectedCell.r][selectedCell.c] = 0;
    renderBoard();
}

function checkBox(r, c) {
    let boxR = Math.floor(r / 3);
    let boxC = Math.floor(c / 3);
    let boxIdx = boxR * 3 + boxC;
    let isFull = true;
    let isCorrect = true;

    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            let row = boxR * 3 + i;
            let col = boxC * 3 + j;
            if (board[row][col] === 0) isFull = false;
            if (board[row][col] !== solution[row][col]) isCorrect = false;
        }
    }
    if (isFull && isCorrect) {
        lockedBoxes[boxIdx] = true;
        selectedCell = null;
    }
}

function checkGameOver() {
    let isComplete = true;
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            if (board[r][c] !== solution[r][c]) {
                isComplete = false;
                break;
            }
        }
    }
    if (isComplete) {
        setTimeout(() => {
            alert("OYUN BİTTİ!");
            currentLevel++;
            startNewGame();
        }, 300);
    }
}

// "Sağ tık ile menü açma" özelliği devre dışı
document.addEventListener('contextmenu', (event) => {
    event.preventDefault();
});