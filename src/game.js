const PLAYER_MARK = "X";
const CPU_MARK = "O";
const WINNING_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

const boardElement = document.querySelector("#board");
const playerScoreElement = document.querySelector("#player-score");
const cpuScoreElement = document.querySelector("#cpu-score");
const drawScoreElement = document.querySelector("#draw-score");
const turnBadgeElement = document.querySelector("#turn-badge");
const statusElement = document.querySelector("#status");
const newRoundButton = document.querySelector("#new-round-button");
const resetButton = document.querySelector("#reset-button");

let gameState = createInitialState();
let score = {
  player: 0,
  cpu: 0,
  draws: 0,
};
let cpuTurnTimeoutId = null;

buildBoard();
render();

newRoundButton.addEventListener("click", startNewRound);
resetButton.addEventListener("click", () => {
  score = { player: 0, cpu: 0, draws: 0 };
  startNewRound();
});

function buildBoard() {
  const fragment = document.createDocumentFragment();

  for (let index = 0; index < 9; index += 1) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "cell";
    button.dataset.index = String(index);
    button.setAttribute("role", "gridcell");
    button.setAttribute("aria-label", `Cell ${index + 1}`);
    button.addEventListener("click", () => handlePlayerMove(index));
    fragment.appendChild(button);
  }

  boardElement.appendChild(fragment);
}

function handlePlayerMove(index) {
  if (gameState.currentPlayer !== PLAYER_MARK || gameState.winner || gameState.isDraw || gameState.isLocked) {
    return;
  }

  const nextState = makeMove(gameState, index, PLAYER_MARK);
  if (nextState === gameState) {
    return;
  }

  gameState = nextState;
  render();

  if (finishRoundIfNeeded()) {
    return;
  }

  gameState = { ...gameState, isLocked: true };
  render();

  cpuTurnTimeoutId = window.setTimeout(() => {
    const cpuMove = chooseCpuMove(gameState.board, CPU_MARK, PLAYER_MARK);
    if (cpuMove === -1) {
      gameState = { ...gameState, isLocked: false };
      finishRoundIfNeeded();
      render();
      cpuTurnTimeoutId = null;
      return;
    }

    gameState = makeMove({ ...gameState, isLocked: false }, cpuMove, CPU_MARK);
    render();
    finishRoundIfNeeded();
    cpuTurnTimeoutId = null;
  }, 360);
}

function finishRoundIfNeeded() {
  if (gameState.winner === PLAYER_MARK) {
    score.player += 1;
    render();
    return true;
  }

  if (gameState.winner === CPU_MARK) {
    score.cpu += 1;
    render();
    return true;
  }

  if (gameState.isDraw) {
    score.draws += 1;
    render();
    return true;
  }

  return false;
}

function startNewRound() {
  if (cpuTurnTimeoutId !== null) {
    window.clearTimeout(cpuTurnTimeoutId);
    cpuTurnTimeoutId = null;
  }

  gameState = createInitialState();
  render();
}

function render() {
  const cells = boardElement.children;

  gameState.board.forEach((mark, index) => {
    const cell = cells[index];
    const isWinningCell = gameState.winningLine.includes(index);
    cell.textContent = mark ?? "";
    cell.className = "cell";
    cell.disabled = Boolean(mark) || gameState.winner !== null || gameState.isDraw || gameState.isLocked;

    if (mark === PLAYER_MARK) {
      cell.classList.add("player");
    }

    if (mark === CPU_MARK) {
      cell.classList.add("cpu");
    }

    if (isWinningCell) {
      cell.classList.add("win");
    }
  });

  playerScoreElement.textContent = String(score.player);
  cpuScoreElement.textContent = String(score.cpu);
  drawScoreElement.textContent = String(score.draws);

  if (gameState.winner === PLAYER_MARK) {
    turnBadgeElement.textContent = "Round won";
    statusElement.textContent = "You connected the stars. That was clean.";
  } else if (gameState.winner === CPU_MARK) {
    turnBadgeElement.textContent = "Star-Bot wins";
    statusElement.textContent = "The bot outplayed you this round. Run it back.";
  } else if (gameState.isDraw) {
    turnBadgeElement.textContent = "Cosmic draw";
    statusElement.textContent = "Nobody blinked. Start a new round and break the tie.";
  } else if (gameState.isLocked) {
    turnBadgeElement.textContent = "Star-Bot thinking";
    statusElement.textContent = "The bot is plotting its next move...";
  } else {
    turnBadgeElement.textContent = gameState.currentPlayer === PLAYER_MARK ? "Your turn" : "Star-Bot turn";
    statusElement.textContent = gameState.currentPlayer === PLAYER_MARK
      ? "Pick a square and go for a line of three."
      : "Watch the board. The bot is about to move.";
  }
}

function createInitialState() {
  return {
    board: Array(9).fill(null),
    currentPlayer: PLAYER_MARK,
    winner: null,
    winningLine: [],
    isDraw: false,
    isLocked: false,
  };
}

function makeMove(state, index, mark) {
  const nextMark = mark ?? state.currentPlayer;
  if (index < 0 || index > 8 || state.board[index] || state.winner || state.isDraw) {
    return state;
  }

  const board = [...state.board];
  board[index] = nextMark;
  const winningLine = getWinningLine(board);
  const winner = winningLine ? nextMark : null;
  const isDraw = !winner && board.every(Boolean);

  return {
    ...state,
    board,
    currentPlayer: nextMark === PLAYER_MARK ? CPU_MARK : PLAYER_MARK,
    winner,
    winningLine: winningLine ?? [],
    isDraw,
  };
}

function chooseCpuMove(board, cpuMark = CPU_MARK, playerMark = PLAYER_MARK) {
  const availableMoves = getAvailableMoves(board);
  if (availableMoves.length === 0) {
    return -1;
  }

  const winningMove = findCriticalMove(board, cpuMark);
  if (winningMove !== null) {
    return winningMove;
  }

  const blockingMove = findCriticalMove(board, playerMark);
  if (blockingMove !== null) {
    return blockingMove;
  }

  if (board[4] === null) {
    return 4;
  }

  const corners = [0, 2, 6, 8].filter((index) => board[index] === null);
  if (corners.length > 0) {
    return corners[0];
  }

  return availableMoves[0];
}

function getWinningLine(board) {
  return WINNING_LINES.find(([a, b, c]) => (
    board[a] !== null
    && board[a] === board[b]
    && board[a] === board[c]
  )) ?? null;
}

function getAvailableMoves(board) {
  return board.reduce((moves, mark, index) => {
    if (mark === null) {
      moves.push(index);
    }
    return moves;
  }, []);
}

function findCriticalMove(board, mark) {
  for (const line of WINNING_LINES) {
    const values = line.map((index) => board[index]);
    const matchingCount = values.filter((value) => value === mark).length;
    const emptySlot = line.find((index) => board[index] === null);

    if (matchingCount === 2 && emptySlot !== undefined) {
      return emptySlot;
    }
  }

  return null;
}
