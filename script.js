const PLAYER_X = "X";
const PLAYER_O = "O";
const PLAYER_VS_PLAYER = "player-vs-player";
const PLAYER_VS_COMPUTER = "player-vs-computer";

// UI Elements
const gameBoard = document.querySelector("#game-board");
const cells = document.querySelectorAll(".cell");
const resetButton = document.querySelector("#reset");
const statusText = document.querySelector("#status");
const PlayerVsPlayerButton = document.querySelector("#player-vs-player");
const PlayerVsComputerButton = document.querySelector("#player-vs-computer");

let currentPlayer = PLAYER_X;
let gameMode = PLAYER_VS_PLAYER;
let boardState = Array(9).fill(null);
let gameActive = true;

// Winning combinations
const winningCombos = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

// Initialize game
function initializeGame() {
  boardState.fill(null);
  gameActive = true;
  currentPlayer = PLAYER_X;
  statusText.textContent = `Player 1's turn`;
  statusText.style.color = "black";
  statusText.style.fontSize = "2rem";

  cells.forEach((cell, index) => {
    cell.textContent = "";
    cell.classList.remove("taken", "highlight", "X", "O");
    cell.addEventListener("click", () => handleCellClick(index), { once: true });
  });

  // Remove any existing winning highlights
  clearHighlights();
}

// Handle cell click
function handleCellClick(index) {
  if (!gameActive || boardState[index]) return;

  boardState[index] = currentPlayer;
  updateCell(index);
  checkGameStatus();

  if (gameActive) {
    switchPlayer();
    updateStatus();
    if (gameMode === PLAYER_VS_COMPUTER && currentPlayer === PLAYER_O) {
      setTimeout(makeComputerMove, 500);
    }
  }
}

// Update cell with the current player's symbol
function updateCell(index) {
  const cell = cells[index];
  cell.textContent = currentPlayer;
  cell.classList.add("taken");
}

// Switch player
function switchPlayer() {
  currentPlayer = currentPlayer === PLAYER_X ? PLAYER_O : PLAYER_X;
}

// Update the game status message
function updateStatus() {
  const playerTurn = gameMode === PLAYER_VS_PLAYER
    ? `Player ${currentPlayer === PLAYER_X ? 1 : 2}'s turn`
    : "Computer's turn";
  statusText.textContent = playerTurn;
}

// Check game status after every move
function checkGameStatus() {
  for (const combo of winningCombos) {
    const [a, b, c] = combo;
    if (boardState[a] && boardState[a] === boardState[b] && boardState[a] === boardState[c]) {
      gameActive = false;
      highlightWinningCombo(combo);
      updateWinnerStatus();
      return;
    }
  }

  if (!boardState.includes(null)) {
    gameActive = false;
    statusText.textContent = "It's a draw!";
    statusText.style.color = "#ff4500"; // Set color for draw
  }
}

// Update status after a win
function updateWinnerStatus() {
  statusText.textContent = gameMode === PLAYER_VS_COMPUTER
    ? (currentPlayer === PLAYER_X ? "Player 1 Wins!" : "Computer Wins!")
    : (currentPlayer === PLAYER_X ? "Player 1 Wins!" : "Player 2 Wins!");
  statusText.style.color = "#ff4500";
  statusText.style.fontSize = "2rem";
}

// Highlight the winning combination
function highlightWinningCombo(combo) {
  combo.forEach(index => {
    const cell = cells[index];
    cell.classList.add("highlight");
    cell.classList.add(boardState[index]);
    flickerEffect(cell);
  });
}

// Flicker effect for winning cells
function flickerEffect(cell) {
  let count = 0;
  const flickerInterval = setInterval(() => {
    if (count < 5) {
      cell.style.opacity = (cell.style.opacity === "0" ? "1" : "0");
      count++;
    } else {
      clearInterval(flickerInterval);
      cell.style.opacity = "1"; // Ensure final opacity is fully visible
    }
  }, 300); // Flicker every 300ms
}

// Minimax Algorithm to compute the best move
function minimax(board, depth, isMaximizing) {
  const winner = checkWinner(board);
  if (winner !== null) {
    return winner === PLAYER_O ? 1 : winner === PLAYER_X ? -1 : 0;
  }

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (let i = 0; i < board.length; i++) {
      if (board[i] === null) {
        board[i] = PLAYER_O;
        let score = minimax(board, depth + 1, false);
        board[i] = null;
        bestScore = Math.max(score, bestScore);
      }
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (let i = 0; i < board.length; i++) {
      if (board[i] === null) {
        board[i] = PLAYER_X;
        let score = minimax(board, depth + 1, true);
        board[i] = null;
        bestScore = Math.min(score, bestScore);
      }
    }
    return bestScore;
  }
}

// Computer move (using minimax algorithm)
function makeComputerMove() {
  let bestScore = -Infinity;
  let bestMove = null;
  for (let i = 0; i < boardState.length; i++) {
    if (boardState[i] === null) {
      boardState[i] = PLAYER_O;
      let score = minimax(boardState, 0, false);
      boardState[i] = null;
      if (score > bestScore) {
        bestScore = score;
        bestMove = i;
      }
    }
  }
  handleCellClick(bestMove);
}

// Check if the current board is a win, lose, or draw
function checkWinner(board) {
  for (const combo of winningCombos) {
    const [a, b, c] = combo;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a]; // Return 'X' or 'O' if there's a winner
    }
  }
  return board.includes(null) ? null : "draw"; // If no winner, check for draw
}

// Clear any highlights (useful for resetting the game)
function clearHighlights() {
  const highlightedCells = document.querySelectorAll(".highlight");
  highlightedCells.forEach(cell => cell.classList.remove("highlight", "X", "O"));
}

// Reset game
resetButton.addEventListener("click", initializeGame);

// Select game mode
PlayerVsPlayerButton.addEventListener("click", () => {
  gameMode = PLAYER_VS_PLAYER;
  highlightSelectedMode(PlayerVsPlayerButton);
  initializeGame();
});

PlayerVsComputerButton.addEventListener("click", () => {
  gameMode = PLAYER_VS_COMPUTER;
  highlightSelectedMode(PlayerVsComputerButton);
  initializeGame();
});

// Highlight the selected mode
function highlightSelectedMode(selectedButton) {
  const buttons = [PlayerVsPlayerButton, PlayerVsComputerButton];
  buttons.forEach(button => button.classList.toggle("selected", button === selectedButton));
}

// Start the game
initializeGame();
