// Sudoku Solver Web Application
// Implements backtracking algorithm to solve Sudoku puzzles

class SudokuSolver {
    constructor() {
        this.grid = Array(9).fill().map(() => Array(9).fill(0));
        this.originalGrid = Array(9).fill().map(() => Array(9).fill(0));
        this.isAnimating = false;

        this.initializeGrid();
        this.setupEventListeners();
    }

    // Initialize the 9x9 Sudoku grid in the DOM
    initializeGrid() {
        const gridContainer = document.getElementById('sudokuGrid');
        gridContainer.innerHTML = '';

        for (let i = 0; i < 81; i++) {
            const cell = document.createElement('div');
            cell.className = 'sudoku-cell';
            cell.setAttribute('data-index', i);

            const input = document.createElement('input');
            input.type = 'text';
            input.maxLength = 1;
            input.pattern = '[1-9]';
            input.addEventListener('input', (e) => this.handleCellInput(e, i));
            input.addEventListener('keydown', (e) => this.handleKeyDown(e, i));

            cell.appendChild(input);
            gridContainer.appendChild(cell);
        }
    }

    // Set up event listeners for buttons
    setupEventListeners() {
        document.getElementById('solveBtn').addEventListener('click', () => this.solveSudoku());
        document.getElementById('clearBtn').addEventListener('click', () => this.clearGrid());
        document.getElementById('exampleBtn').addEventListener('click', () => this.loadExample());
    }

    // Handle user input in grid cells
    handleCellInput(event, index) {
        const value = event.target.value;
        const row = Math.floor(index / 9);
        const col = index % 9;

        // Validate input (only numbers 1-9)
        if (value && !/^[1-9]$/.test(value)) {
            event.target.value = '';
            this.showMessage('Please enter only numbers 1-9', 'error');
            return;
        }

        // Update grid array
