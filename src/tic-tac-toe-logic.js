export const PLAYER_MARK = "X";
export const CPU_MARK = "O";
export const WINNING_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

export function createInitialState() {
  return {
    board: Array(9).fill(null),
    currentPlayer: PLAYER_MARK,
    winner: null,
    winningLine: [],
    isDraw: false,
    isLocked: false,
  };
}

export function makeMove(state, index, mark = state.currentPlayer) {
  if (index < 0 || index > 8 || state.board[index] || state.winner || state.isDraw) {
    return state;
  }

  const board = [...state.board];
  board[index] = mark;
  const winningLine = getWinningLine(board);
  const winner = winningLine ? mark : null;
  const isDraw = !winner && board.every(Boolean);

  return {
    ...state,
    board,
    currentPlayer: mark === PLAYER_MARK ? CPU_MARK : PLAYER_MARK,
    winner,
    winningLine: winningLine ?? [],
    isDraw,
  };
}

export function chooseCpuMove(board, cpuMark = CPU_MARK, playerMark = PLAYER_MARK) {
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

export function getWinningLine(board) {
  return WINNING_LINES.find(([a, b, c]) => (
    board[a] !== null
    && board[a] === board[b]
    && board[a] === board[c]
  )) ?? null;
}

export function getAvailableMoves(board) {
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
