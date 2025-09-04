class Sudoku {
  constructor() {
    this.grid = Array(9).fill().map(() => Array(9).fill(0));
    this.originalGrid = Array(9).fill().map(() => Array(9).fill(0));
    this.initializeGrid();
    this.setupButtons();
  }

  initializeGrid() {
    const container = document.getElementById("sudokuGrid");
    container.innerHTML = "";
    for (let i = 0; i < 81; i++) {
      const cell = document.createElement("div");
      cell.className = "sudoku-cell";
      const input = document.createElement("input");
      input.type = "text";
      input.maxLength = 1;
      input.addEventListener("input", (e) => this.handleInput(e, i));
      cell.appendChild(input);
      container.appendChild(cell);
    }
  }

  setupButtons() {
    document.getElementById("newPuzzleBtn").addEventListener("click", () => this.generatePuzzle());
    document.getElementById("checkBtn").addEventListener("click", () => this.checkSolution());
    document.getElementById("solveBtn").addEventListener("click", () => this.solvePuzzle());
    document.getElementById("clearBtn").addEventListener("click", () => this.clearGrid());
  }

  handleInput(e, index) {
    const value = e.target.value;
    if (value && !/^[1-9]$/.test(value)) {
      e.target.value = "";
      return;
    }
    const r = Math.floor(index / 9), c = index % 9;
    this.grid[r][c] = value ? parseInt(value) : 0;
  }

  clearGrid() {
    this.grid = Array(9).fill().map(() => Array(9).fill(0));
    this.originalGrid = Array(9).fill().map(() => Array(9).fill(0));
    document.querySelectorAll(".sudoku-cell input").forEach(el => {
      el.value = "";
      el.parentElement.classList.remove("prefilled", "solution");
    });
    this.showMessage("🧹 Grid cleared");
  }

  /* --- Type-1: Generate Puzzle --- */
  generatePuzzle() {
    this.clearGrid();
    this.solveRecursive(this.grid); // generate full solved grid
    const puzzle = this.grid.map(row => [...row]);

    // Remove random cells for puzzle difficulty
    let removed = 40; // difficulty (higher = harder)
    while (removed > 0) {
      const r = Math.floor(Math.random() * 9);
      const c = Math.floor(Math.random() * 9);
      if (puzzle[r][c] !== 0) {
        puzzle[r][c] = 0;
        removed--;
      }
    }

    // Load into grid
    const inputs = document.querySelectorAll(".sudoku-cell input");
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const idx = r * 9 + c;
        this.grid[r][c] = puzzle[r][c];
        this.originalGrid[r][c] = puzzle[r][c];
        if (puzzle[r][c] !== 0) {
          inputs[idx].value = puzzle[r][c];
          inputs[idx].parentElement.classList.add("prefilled");
        } else {
          inputs[idx].value = "";
          inputs[idx].parentElement.classList.remove("prefilled");
        }
      }
    }
    this.showMessage("🎲 New puzzle generated!");
  }

  /* --- Type-2: Solve User Puzzle --- */
  solvePuzzle() {
    const copy = this.grid.map(r => [...r]);
    if (!this.isValidGrid(copy)) {
      this.showMessage("❌ Invalid puzzle input");
      return;
    }
    if (this.solveRecursive(copy)) {
      this.grid = copy;
      this.updateUI(true);
      this.showMessage("⚡ Puzzle solved!");
    } else {
      this.showMessage("❌ No solution found");
    }
  }

  /* Check if user solution is correct */
  checkSolution() {
    const copy = this.grid.map(r => [...r]);
    if (this.isValidGrid(copy) && !this.findEmpty(copy)) {
      this.showMessage("✔️ Correct solution!");
    } else {
      this.showMessage("❌ Incorrect solution");
    }
  }

  /* --- Sudoku Logic --- */
  isValid(grid, row, col, num) {
    for (let x = 0; x < 9; x++) {
      if (grid[row][x] === num || grid[x][col] === num) return false;
    }
    const sr = row - (row % 3), sc = col - (col % 3);
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (grid[sr+i][sc+j] === num) return false;
      }
    }
    return true;
  }

  findEmpty(grid) {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (grid[r][c] === 0) return [r, c];
      }
    }
    return null;
  }

  solveRecursive(grid) {
    const empty = this.findEmpty(grid);
    if (!empty) return true;
    const [r, c] = empty;
    const nums = [1,2,3,4,5,6,7,8,9].sort(() => Math.random()-0.5);
    for (let n of nums) {
      if (this.isValid(grid, r, c, n)) {
        grid[r][c] = n;
        if (this.solveRecursive(grid)) return true;
        grid[r][c] = 0;
      }
    }
    return false;
  }

  isValidGrid(grid) {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (grid[r][c] !== 0) {
          const num = grid[r][c];
          grid[r][c] = 0;
          if (!this.isValid(grid, r, c, num)) {
            grid[r][c] = num;
            return false;
          }
          grid[r][c] = num;
        }
      }
    }
    return true;
  }

  updateUI(showSolutions=false) {
    const inputs = document.querySelectorAll(".sudoku-cell input");
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const idx = r*9+c;
        inputs[idx].value = this.grid[r][c] || "";
        if (showSolutions && this.originalGrid[r][c] === 0 && this.grid[r][c] !== 0) {
          inputs[idx].parentElement.classList.add("solution");
        }
      }
    }
  }

  showMessage(msg) {
    const el = document.getElementById("statusMessage");
    el.textContent = msg;
    el.classList.remove("hidden");
  }
}

document.addEventListener("DOMContentLoaded", () => new Sudoku());
