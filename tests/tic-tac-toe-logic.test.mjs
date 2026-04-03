import assert from "node:assert/strict";
import {
  CPU_MARK,
  PLAYER_MARK,
  chooseCpuMove,
  createInitialState,
  getWinningLine,
  makeMove,
} from "../src/tic-tac-toe-logic.js";

function run() {
  testInitialState();
  testPlayerMoveUpdatesBoard();
  testWinnerIsDetected();
  testDrawIsDetected();
  testCpuTakesWinningMove();
  testCpuBlocksPlayer();
  console.log("All tic-tac-toe logic tests passed.");
}

function testInitialState() {
  const state = createInitialState();
  assert.equal(state.board.length, 9);
  assert.equal(state.currentPlayer, PLAYER_MARK);
  assert.equal(state.winner, null);
}

function testPlayerMoveUpdatesBoard() {
  const state = createInitialState();
  const next = makeMove(state, 0, PLAYER_MARK);
  assert.equal(next.board[0], PLAYER_MARK);
  assert.equal(next.currentPlayer, CPU_MARK);
}

function testWinnerIsDetected() {
  const state = {
    ...createInitialState(),
    board: [PLAYER_MARK, PLAYER_MARK, null, null, CPU_MARK, null, null, null, CPU_MARK],
    currentPlayer: PLAYER_MARK,
  };
  const next = makeMove(state, 2, PLAYER_MARK);
  assert.equal(next.winner, PLAYER_MARK);
  assert.deepEqual(next.winningLine, [0, 1, 2]);
  assert.deepEqual(getWinningLine(next.board), [0, 1, 2]);
}

function testDrawIsDetected() {
  const state = {
    ...createInitialState(),
    board: [
      PLAYER_MARK, CPU_MARK, PLAYER_MARK,
      PLAYER_MARK, CPU_MARK, CPU_MARK,
      CPU_MARK, PLAYER_MARK, null,
    ],
    currentPlayer: PLAYER_MARK,
  };
  const next = makeMove(state, 8, PLAYER_MARK);
  assert.equal(next.isDraw, true);
  assert.equal(next.winner, null);
}

function testCpuTakesWinningMove() {
  const board = [
    CPU_MARK, CPU_MARK, null,
    PLAYER_MARK, PLAYER_MARK, null,
    null, null, null,
  ];
  assert.equal(chooseCpuMove(board), 2);
}

function testCpuBlocksPlayer() {
  const board = [
    PLAYER_MARK, PLAYER_MARK, null,
    null, CPU_MARK, null,
    null, null, null,
  ];
  assert.equal(chooseCpuMove(board), 2);
}

run();
