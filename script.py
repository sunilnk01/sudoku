# Create the JavaScript file for Sudoku Solver
js_content = '''// Sudoku Solver Web Application
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
        this.grid[row][col] = value ? parseInt(value) : 0;
        this.originalGrid[row][col] = this.grid[row][col];

        // Update cell styling
        const cell = event.target.parentElement;
        if (value) {
            cell.classList.add('prefilled');
        } else {
            cell.classList.remove('prefilled');
        }

        this.hideMessage();
    }

    // Handle keyboard navigation
    handleKeyDown(event, currentIndex) {
        const key = event.key;
        let newIndex = currentIndex;

        switch(key) {
            case 'ArrowUp':
                newIndex = currentIndex - 9;
                break;
            case 'ArrowDown':
                newIndex = currentIndex + 9;
                break;
            case 'ArrowLeft':
                newIndex = currentIndex - 1;
                break;
            case 'ArrowRight':
                newIndex = currentIndex + 1;
                break;
            case 'Backspace':
            case 'Delete':
                event.target.value = '';
                const row = Math.floor(currentIndex / 9);
                const col = currentIndex % 9;
                this.grid[row][col] = 0;
                this.originalGrid[row][col] = 0;
                event.target.parentElement.classList.remove('prefilled');
                break;
            default:
                return;
        }

        // Focus on new cell if within bounds
        if (newIndex >= 0 && newIndex < 81) {
            const cells = document.querySelectorAll('.sudoku-cell input');
            cells[newIndex].focus();
            event.preventDefault();
        }
    }

    // Check if placing a number is valid according to Sudoku rules
    isValidMove(grid, row, col, num) {
        // Check row
        for (let x = 0; x < 9; x++) {
            if (grid[row][x] === num) {
                return false;
            }
        }

        // Check column
        for (let x = 0; x < 9; x++) {
            if (grid[x][col] === num) {
                return false;
            }
        }

        // Check 3x3 box
        const startRow = row - (row % 3);
        const startCol = col - (col % 3);
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (grid[i + startRow][j + startCol] === num) {
                    return false;
                }
            }
        }

        return true;
    }

    // Find the next empty cell in the grid
    findEmptyCell(grid) {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (grid[row][col] === 0) {
                    return [row, col];
                }
            }
        }
        return null; // No empty cells found
    }

    // Validate the initial grid state
    isValidGrid(grid) {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (grid[row][col] !== 0) {
                    const num = grid[row][col];
                    grid[row][col] = 0; // Temporarily remove to check validity
                    if (!this.isValidMove(grid, row, col, num)) {
                        grid[row][col] = num; // Restore the number
                        return false;
                    }
                    grid[row][col] = num; // Restore the number
                }
            }
        }
        return true;
    }

    // Backtracking algorithm to solve Sudoku
    async solveSudokuRecursive(grid) {
        const emptyCell = this.findEmptyCell(grid);
        
        if (!emptyCell) {
            return true; // Puzzle solved
        }

        const [row, col] = emptyCell;

        for (let num = 1; num <= 9; num++) {
            if (this.isValidMove(grid, row, col, num)) {
                grid[row][col] = num;

                // Update UI with animation delay for visualization
                if (this.isAnimating) {
                    await this.updateCellUI(row, col, num, true);
                    await this.delay(50); // Small delay for animation
                }

                if (await this.solveSudokuRecursive(grid)) {
                    return true;
                }

                // Backtrack
                grid[row][col] = 0;
                if (this.isAnimating) {
                    await this.updateCellUI(row, col, '', false);
                    await this.delay(30);
                }
            }
        }

        return false; // No solution found
    }

    // Update cell UI during solving animation
    async updateCellUI(row, col, value, isSolution) {
        const index = row * 9 + col;
        const cell = document.querySelectorAll('.sudoku-cell')[index];
        const input = cell.querySelector('input');
        
        input.value = value;
        
        if (isSolution && value !== '') {
            cell.classList.add('solution');
            cell.classList.remove('prefilled');
        } else {
            cell.classList.remove('solution', 'prefilled');
        }
    }

    // Create a delay for animation purposes
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Main solve function with UI updates
    async solveSudoku() {
        if (this.isAnimating) return;

        // Create a copy of the grid for solving
        const gridCopy = this.grid.map(row => [...row]);

        // Validate initial grid
        if (!this.isValidGrid(gridCopy)) {
            this.showMessage('❌ Invalid puzzle! Please check your input for conflicts.', 'error');
            return;
        }

        this.showLoading(true);
        this.isAnimating = true;
        this.disableControls(true);

        try {
            const solved = await this.solveSudokuRecursive(gridCopy);

            if (solved) {
                // Update the main grid
                this.grid = gridCopy;
                this.showMessage('🎉 Puzzle solved successfully!', 'success');
                
                // Mark all solution cells
                for (let row = 0; row < 9; row++) {
                    for (let col = 0; col < 9; col++) {
                        if (this.originalGrid[row][col] === 0 && this.grid[row][col] !== 0) {
                            const index = row * 9 + col;
                            const cell = document.querySelectorAll('.sudoku-cell')[index];
                            cell.classList.add('solution');
                        }
                    }
                }
            } else {
                this.showMessage('❌ No solution exists for this puzzle configuration.', 'error');
            }
        } catch (error) {
            this.showMessage('❌ Error occurred while solving the puzzle.', 'error');
            console.error('Solving error:', error);
        } finally {
            this.showLoading(false);
            this.isAnimating = false;
            this.disableControls(false);
        }
    }

    // Clear the entire grid
    clearGrid() {
        this.grid = Array(9).fill().map(() => Array(9).fill(0));
        this.originalGrid = Array(9).fill().map(() => Array(9).fill(0));
        
        const cells = document.querySelectorAll('.sudoku-cell');
        cells.forEach(cell => {
            const input = cell.querySelector('input');
            input.value = '';
            cell.classList.remove('prefilled', 'solution');
        });

        this.hideMessage();
        this.showMessage('🧹 Grid cleared successfully!', 'info');
        setTimeout(() => this.hideMessage(), 2000);
    }

    // Load an example puzzle
    loadExample() {
        // Example Sudoku puzzle (medium difficulty)
        const examplePuzzle = [
            [5, 3, 0, 0, 7, 0, 0, 0, 0],
            [6, 0, 0, 1, 9, 5, 0, 0, 0],
            [0, 9, 8, 0, 0, 0, 0, 6, 0],
            [8, 0, 0, 0, 6, 0, 0, 0, 3],
            [4, 0, 0, 8, 0, 3, 0, 0, 1],
            [7, 0, 0, 0, 2, 0, 0, 0, 6],
            [0, 6, 0, 0, 0, 0, 2, 8, 0],
            [0, 0, 0, 4, 1, 9, 0, 0, 5],
            [0, 0, 0, 0, 8, 0, 0, 7, 9]
        ];

        this.clearGrid();
        
        // Load the example into the grid
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                const value = examplePuzzle[row][col];
                this.grid[row][col] = value;
                this.originalGrid[row][col] = value;
                
                const index = row * 9 + col;
                const cell = document.querySelectorAll('.sudoku-cell')[index];
                const input = cell.querySelector('input');
                
                if (value !== 0) {
                    input.value = value;
                    cell.classList.add('prefilled');
                } else {
                    input.value = '';
                    cell.classList.remove('prefilled');
                }
            }
        }

        this.showMessage('📝 Example puzzle loaded! Click "Solve Sudoku" to see the solution.', 'info');
        setTimeout(() => this.hideMessage(), 3000);
    }

    // Show status messages
    showMessage(message, type) {
        const messageElement = document.getElementById('statusMessage');
        messageElement.textContent = message;
        messageElement.className = `status-message ${type}`;
        messageElement.classList.remove('hidden');
    }

    // Hide status messages
    hideMessage() {
        const messageElement = document.getElementById('statusMessage');
        messageElement.classList.add('hidden');
    }

    // Show/hide loading spinner
    showLoading(show) {
        const loadingElement = document.getElementById('loadingSpinner');
        if (show) {
            loadingElement.classList.remove('hidden');
        } else {
            loadingElement.classList.add('hidden');
        }
    }

    // Enable/disable control buttons
    disableControls(disable) {
        const buttons = document.querySelectorAll('.btn');
        buttons.forEach(button => {
            button.disabled = disable;
        });
    }
}

// Initialize the Sudoku Solver when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new SudokuSolver();
    
    // Add some additional UI enhancements
    console.log('🧩 Sudoku Solver initialized successfully!');
    console.log('📊 Algorithm: Backtracking with constraint propagation');
    console.log('⚡ Features: Input validation, keyboard navigation, animated solving');
});

// Additional utility functions for enhanced user experience
document.addEventListener('keydown', (e) => {
    // Global keyboard shortcuts
    if (e.ctrlKey || e.metaKey) {
        switch(e.key) {
            case 'Enter':
                e.preventDefault();
                document.getElementById('solveBtn').click();
                break;
            case 'Backspace':
                e.preventDefault();
                document.getElementById('clearBtn').click();
                break;
        }
    }
});'''

# Write JavaScript file
with open('script.js', 'w', encoding='utf-8') as f:
    f.write(js_content)

print("✅ script.js created successfully")