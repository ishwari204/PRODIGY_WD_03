const board = document.getElementById("board");
const statusText = document.getElementById("status");
const scoreX = document.getElementById("scoreX");
const scoreO = document.getElementById("scoreO");
const scoreDraw = document.getElementById("scoreDraw");
const clickSound = document.getElementById("clickSound");
const winSound = document.getElementById("winSound");

let cells = Array(9).fill("");
let currentPlayer = "X";
let isGameOver = false;
let vsAI = true;
let scores = { X: 0, O: 0, draw: 0 };

const winPatterns = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6]
];

function createBoard() {
  board.innerHTML = "";
  cells.forEach((cell, index) => {
    const div = document.createElement("div");
    div.classList.add("cell");
    div.textContent = cell;
    div.addEventListener("click", () => makeMove(index));
    board.appendChild(div);
  });
}

function makeMove(index) {
  if (cells[index] || isGameOver) return;
  cells[index] = currentPlayer;
  clickSound.play();
  checkGame();
  if (!isGameOver) {
    currentPlayer = currentPlayer === "X" ? "O" : "X";
    if (vsAI && currentPlayer === "O") {
      setTimeout(() => aiMoveMinimax(), 500);
    }
  }
  createBoard();
}

function aiMoveMinimax() {
  let bestScore = -Infinity;
  let move;
  for (let i = 0; i < 9; i++) {
    if (cells[i] === "") {
      cells[i] = "O";
      let score = minimax(cells, 0, false);
      cells[i] = "";
      if (score > bestScore) {
        bestScore = score;
        move = i;
      }
    }
  }
  makeMove(move);
}

function minimax(boardState, depth, isMaximizing) {
  let winner = checkWinner(boardState);
  if (winner !== null) {
    if (winner === "O") return 10 - depth;
    else if (winner === "X") return depth - 10;
    else return 0;
  }
  if (isMaximizing) {
    let bestScore = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (boardState[i] === "") {
        boardState[i] = "O";
        let score = minimax(boardState, depth + 1, false);
        boardState[i] = "";
        bestScore = Math.max(score, bestScore);
      }
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (let i = 0; i < 9; i++) {
      if (boardState[i] === "") {
        boardState[i] = "X";
        let score = minimax(boardState, depth + 1, true);
        boardState[i] = "";
        bestScore = Math.min(score, bestScore);
      }
    }
    return bestScore;
  }
}

function checkWinner(state) {
  for (let pattern of winPatterns) {
    const [a, b, c] = pattern;
    if (state[a] && state[a] === state[b] && state[a] === state[c]) {
      highlightCells([a, b, c]);
      return state[a];
    }
  }
  return state.includes("") ? null : "draw";
}

function highlightCells(indices) {
  const allCells = document.querySelectorAll(".cell");
  indices.forEach(i => allCells[i].classList.add("highlight"));
}

function checkGame() {
  let result = checkWinner(cells);
  if (result !== null) {
    isGameOver = true;
    if (result === "draw") {
      statusText.textContent = "It's a draw!";
      scores.draw++;
      logMatch("Draw");
    } else {
      statusText.textContent = `${result} wins!`;
      winSound.play();
      scores[result]++;
      logMatch(`${result} wins`);
    }
    updateScores();
  } else {
    statusText.textContent = `Current Turn: ${currentPlayer}`;
  }
}

function updateScores() {
  scoreX.textContent = scores.X;
  scoreO.textContent = scores.O;
  scoreDraw.textContent = scores.draw;
}

function restartGame() {
  cells = Array(9).fill("");
  currentPlayer = "X";
  isGameOver = false;
  document.querySelectorAll(".cell").forEach(cell => cell.classList.remove("highlight"));
  statusText.textContent = `Current Turn: ${currentPlayer}`;
  createBoard();
}

function toggleTheme() {
  document.body.classList.toggle("dark");
  localStorage.setItem("theme", document.body.classList.contains("dark") ? "dark" : "light");
}

function toggleMode() {
  vsAI = !vsAI;
  document.getElementById("modeStatus").textContent = vsAI ? "vs AI" : "2 Player";
  restartGame();
}

function logMatch(result) {
  const history = document.getElementById("history");
  const li = document.createElement("li");
  li.textContent = result;
  history.prepend(li);
}

if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark");
}

createBoard();
statusText.textContent = `Current Turn: ${currentPlayer}`;
updateScores();
