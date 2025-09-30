let board = Array(9).fill().map(() => Array(9).fill(0));
let startBoard = Array(9).fill().map(() => Array(9).fill(0));
let time = 0;
let timerId = null;
let gameStarted = false;

function createGrid() {
  const grid = document.getElementById('grid');
  grid.innerHTML = '';
  
  for (let i = 0; i < 81; i++) {
    const cell = document.createElement('div');
    cell.className = 'cell';
    const input = document.createElement('input');
    input.type = 'text';
    input.maxLength = 1;
    
    input.addEventListener('input', function(e) {
      const val = e.target.value;
      if (val && !'123456789'.includes(val)) {
        e.target.value = '';
        return;
      }
      
      const row = Math.floor(i / 9);
      const col = i % 9;
      board[row][col] = val ? Number(val) : 0;
      
      if (!gameStarted && val) {
        startTimer();
      }
    });
    
    cell.appendChild(input);
    grid.appendChild(cell);
  }
}

function startTimer() {
  gameStarted = true;
  time = 0;
  document.getElementById('timer').style.display = 'block';
  
  timerId = setInterval(() => {
    time++;
    const min = String(Math.floor(time / 60)).padStart(2, '0');
    const sec = String(time % 60).padStart(2, '0');
    document.getElementById('timer').textContent = `Time: ${min}:${sec}`;
  }, 1000);
}

function stopTimer() {
  gameStarted = false;
  clearInterval(timerId);
}

function newGame() {
  stopTimer();
  document.getElementById('timer').style.display = 'none';
  document.getElementById('message').textContent = '';
  
  // Create solved board
  solveSudoku(board);
  
  // Remove some numbers
  const tempBoard = board.map(row => [...row]);
  let toRemove = 40;
  
  while (toRemove > 0) {
    const r = Math.floor(Math.random() * 9);
    const c = Math.floor(Math.random() * 9);
    if (tempBoard[r][c] !== 0) {
      tempBoard[r][c] = 0;
      toRemove--;
    }
  }
  
  // Update display
  const inputs = document.querySelectorAll('.cell input');
  for (let i = 0; i < 81; i++) {
    const row = Math.floor(i / 9);
    const col = i % 9;
    const val = tempBoard[row][col];
    
    inputs[i].value = val || '';
    inputs[i].parentElement.className = 'cell';
    if (val !== 0) {
      inputs[i].parentElement.classList.add('fixed');
    }
    
    board[row][col] = val;
    startBoard[row][col] = val;
  }
  
  showMessage('New game started!');
}

function checkAnswer() {
  if (isBoardValid(board)) {
    showMessage('Correct! Well done!');
    stopTimer();
  } else {
    showMessage('Some numbers are wrong. Keep trying!');
  }
}

function solveGame() {
  stopTimer();
  document.getElementById('timer').style.display = 'none';
  
  const solved = solveSudoku(board);
  if (solved) {
    updateDisplay();
    showMessage('Puzzle solved!');
  } else {
    showMessage('Cannot solve this puzzle');
  }
}

function clearAll() {
  stopTimer();
  document.getElementById('timer').style.display = 'none';
  
  board = Array(9).fill().map(() => Array(9).fill(0));
  startBoard = Array(9).fill().map(() => Array(9).fill(0));
  
  const inputs = document.querySelectorAll('.cell input');
  inputs.forEach(input => {
    input.value = '';
    input.parentElement.className = 'cell';
  });
  
  showMessage('Board cleared');
}

function updateDisplay() {
  const inputs = document.querySelectorAll('.cell input');
  for (let i = 0; i < 81; i++) {
    const row = Math.floor(i / 9);
    const col = i % 9;
    inputs[i].value = board[row][col] || '';
    
    if (startBoard[row][col] === 0 && board[row][col] !== 0) {
      inputs[i].parentElement.classList.add('solved');
    }
  }
}

function showMessage(text) {
  document.getElementById('message').textContent = text;
}

// Sudoku solving functions
function solveSudoku(grid) {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (grid[row][col] === 0) {
        for (let num = 1; num <= 9; num++) {
          if (canPlace(grid, row, col, num)) {
            grid[row][col] = num;
            if (solveSudoku(grid)) return true;
            grid[row][col] = 0;
          }
        }
        return false;
      }
    }
  }
  return true;
}

function canPlace(grid, row, col, num) {
  // Check row
  for (let x = 0; x < 9; x++) {
    if (grid[row][x] === num) return false;
  }
  
  // Check column
  for (let x = 0; x < 9; x++) {
    if (grid[x][col] === num) return false;
  }
  
  // Check 3x3 box
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (grid[boxRow + i][boxCol + j] === num) return false;
    }
  }
  
  return true;
}

function isBoardValid(grid) {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (grid[row][col] === 0) return false;
      
      const num = grid[row][col];
      grid[row][col] = 0;
      
      if (!canPlace(grid, row, col, num)) {
        grid[row][col] = num;
        return false;
      }
      
      grid[row][col] = num;
    }
  }
  return true;
}

// Initialize game
createGrid();
