const PLAYER_HUMAN = 1;
const PLAYER_AI = -1;
const WIN_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];
const PERFECT_ORDER = [5, 1, 3, 7, 9, 2, 4, 6, 8];
const CORNERS = [1, 3, 7, 9];
const EDGES = [2, 4, 6, 8];

export const AI_MODES = {
  perfect: {
    label: 'Perfect minimax',
    description: 'Unbeatable play powered by alpha-beta search. It is precise, patient, and ruthless.',
  },
  tactical: {
    label: 'Tactical blocker',
    description: 'Looks for wins, blocks threats, and then prefers the center and strong squares.',
  },
  mirror: {
    label: 'Mirror AI',
    description: 'Answers with the opposite square across the board center whenever it can.',
  },
  random: {
    label: 'Random rookie',
    description: 'Chooses a legal move at random. Chaotic, fast, and occasionally surprising.',
  },
};

function createEmptyBoard() {
  return Array(9).fill(0);
}

function cloneBoard(board) {
  return board.slice();
}

export function positionToIndex(position) {
  if (!Number.isInteger(position) || position < 1 || position > 9) {
    throw new RangeError('position must be an integer between 1 and 9');
  }
  return position - 1;
}

export function indexToPosition(index) {
  if (!Number.isInteger(index) || index < 0 || index > 8) {
    throw new RangeError('index must be an integer between 0 and 8');
  }
  return index + 1;
}

function availablePositions(board) {
  const moves = [];
  for (let index = 0; index < board.length; index += 1) {
    if (board[index] === 0) {
      moves.push(indexToPosition(index));
    }
  }
  return moves;
}

function preferredMoveOrder(board) {
  return PERFECT_ORDER.filter((position) => board[positionToIndex(position)] === 0);
}

function checkWinner(board) {
  for (const [a, b, c] of WIN_LINES) {
    const sum = board[a] + board[b] + board[c];
    if (sum === 3) return PLAYER_HUMAN;
    if (sum === -3) return PLAYER_AI;
  }
  return 0;
}

function isDraw(board) {
  return board.every((cell) => cell !== 0);
}

function scoreTerminal(board, depth, aiPlayer) {
  const winner = checkWinner(board);
  if (winner === aiPlayer) {
    return 10 - depth;
  }
  if (winner === -aiPlayer) {
    return depth - 10;
  }
  return 0;
}

function minimax(board, depth, currentPlayer, aiPlayer, alpha, beta) {
  const winner = checkWinner(board);
  if (winner !== 0 || isDraw(board)) {
    return scoreTerminal(board, depth, aiPlayer);
  }

  const moves = preferredMoveOrder(board);
  if (currentPlayer === aiPlayer) {
    let bestScore = Number.NEGATIVE_INFINITY;
    for (const position of moves) {
      const index = positionToIndex(position);
      board[index] = currentPlayer;
      const score = minimax(board, depth + 1, -currentPlayer, aiPlayer, alpha, beta);
      board[index] = 0;
      if (score > bestScore) bestScore = score;
      alpha = Math.max(alpha, score);
      if (beta <= alpha) break;
    }
    return bestScore;
  }

  let bestScore = Number.POSITIVE_INFINITY;
  for (const position of moves) {
    const index = positionToIndex(position);
    board[index] = currentPlayer;
    const score = minimax(board, depth + 1, -currentPlayer, aiPlayer, alpha, beta);
    board[index] = 0;
    if (score < bestScore) bestScore = score;
    beta = Math.min(beta, score);
    if (beta <= alpha) break;
  }
  return bestScore;
}

function choosePerfectMove(board, aiPlayer) {
  const moves = preferredMoveOrder(board);
  let bestMove = moves[0] ?? null;
  let bestScore = Number.NEGATIVE_INFINITY;

  for (const position of moves) {
    const index = positionToIndex(position);
    board[index] = aiPlayer;
    const score = minimax(board, 1, -aiPlayer, aiPlayer, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY);
    board[index] = 0;
    if (score > bestScore) {
      bestScore = score;
      bestMove = position;
    }
  }

  return bestMove;
}

function findImmediateMove(board, player) {
  for (const position of availablePositions(board)) {
    const index = positionToIndex(position);
    board[index] = player;
    const winner = checkWinner(board);
    board[index] = 0;
    if (winner === player) {
      return position;
    }
  }
  return null;
}

function chooseTacticalMove(board, aiPlayer) {
  const humanPlayer = -aiPlayer;
  const winningMove = findImmediateMove(board, aiPlayer);
  if (winningMove !== null) return winningMove;

  const blockingMove = findImmediateMove(board, humanPlayer);
  if (blockingMove !== null) return blockingMove;

  if (board[positionToIndex(5)] === 0) return 5;

  for (const position of CORNERS) {
    if (board[positionToIndex(position)] === 0) return position;
  }

  for (const position of EDGES) {
    if (board[positionToIndex(position)] === 0) return position;
  }

  return availablePositions(board)[0] ?? null;
}

function chooseMirrorMove(board, lastHumanMove, aiPlayer) {
  if (Number.isInteger(lastHumanMove)) {
    const mirroredPosition = 10 - lastHumanMove;
    const mirroredIndex = positionToIndex(mirroredPosition);
    if (board[mirroredIndex] === 0) {
      return mirroredPosition;
    }
  }

  const tacticalMove = chooseTacticalMove(board, aiPlayer);
  if (tacticalMove !== null) return tacticalMove;

  return choosePerfectMove(board, aiPlayer);
}

function chooseRandomMove(board) {
  const moves = availablePositions(board);
  if (moves.length === 0) return null;
  const index = Math.floor(Math.random() * moves.length);
  return moves[index];
}

function getAiModeInfo(mode) {
  return AI_MODES[mode] ?? AI_MODES.perfect;
}

function resolveAiMove({ mode, board, lastHumanMove, aiPlayer }) {
  switch (mode) {
    case 'random':
      return chooseRandomMove(board);
    case 'mirror':
      return chooseMirrorMove(board, lastHumanMove, aiPlayer);
    case 'tactical':
      return chooseTacticalMove(board, aiPlayer);
    case 'perfect':
    default:
      return choosePerfectMove(board, aiPlayer);
  }
}

export class MinimaxSession {
  constructor({ aiMode = 'perfect' } = {}) {
    this.board = createEmptyBoard();
    this.humanPlayer = PLAYER_HUMAN;
    this.aiPlayer = PLAYER_AI;
    this.aiMode = this.normalizeMode(aiMode);
    this.status = 'in_progress';
    this.message = 'Click any empty square to begin.';
    this.winner = 0;
    this.lastHumanMove = null;
    this.lastAiMove = null;
    this.log = ['Fresh board. You are X and minimax is O.'];
  }

  normalizeMode(mode) {
    return Object.hasOwn(AI_MODES, mode) ? mode : 'perfect';
  }

  setAiMode(mode) {
    this.aiMode = this.normalizeMode(mode);
    const info = getAiModeInfo(this.aiMode);
    const message = `AI mode set to ${info.label}.`;
    this.log.push(message);
    this.message = message;
    return this.snapshot();
  }

  reset() {
    this.board = createEmptyBoard();
    this.status = 'in_progress';
    this.message = 'Click any empty square to begin.';
    this.winner = 0;
    this.lastHumanMove = null;
    this.lastAiMove = null;
    this.log = ['Fresh board. You are X and minimax is O.'];
    return this.snapshot();
  }

  snapshot() {
    const info = getAiModeInfo(this.aiMode);
    return {
      board: cloneBoard(this.board),
      positions: [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
      ],
      availablePositions: availablePositions(this.board),
      status: this.status,
      winner: this.winner,
      message: this.message,
      lastHumanMove: this.lastHumanMove,
      lastAiMove: this.lastAiMove,
      canPlay: this.status === 'in_progress',
      aiMode: this.aiMode,
      aiLabel: info.label,
      aiDescription: info.description,
      log: this.log.slice(-6),
    };
  }

  playHumanMove(position) {
    const movePosition = typeof position === 'string' ? Number(position) : position;
    const index = positionToIndex(movePosition);

    if (this.status !== 'in_progress') {
      throw new Error('Game is over. Reset to play again.');
    }
    if (this.board[index] !== 0) {
      throw new Error('That square is already occupied.');
    }

    this.board[index] = this.humanPlayer;
    this.lastHumanMove = movePosition;
    this.log.push(`You played ${movePosition}.`);

    const humanWinner = checkWinner(this.board);
    if (humanWinner === this.humanPlayer) {
      this.status = 'human_won';
      this.winner = humanWinner;
      this.message = `You played ${movePosition} and won the game.`;
      this.log.push('Human victory detected.');
      return this.snapshot();
    }

    if (isDraw(this.board)) {
      this.status = 'draw';
      this.winner = 0;
      this.message = 'The board is full. It is a draw.';
      this.log.push('Board filled before the AI could move.');
      return this.snapshot();
    }

    const aiMove = resolveAiMove({
      mode: this.aiMode,
      board: this.board,
      lastHumanMove: movePosition,
      aiPlayer: this.aiPlayer,
    });

    if (aiMove === null || aiMove === undefined) {
      this.status = 'draw';
      this.winner = 0;
      this.message = 'No legal AI move remains. It is a draw.';
      this.log.push('AI had no legal move.');
      return this.snapshot();
    }

    const aiIndex = positionToIndex(aiMove);
    this.board[aiIndex] = this.aiPlayer;
    this.lastAiMove = aiMove;
    const info = getAiModeInfo(this.aiMode);
    this.log.push(`${info.label} answered with ${aiMove}.`);

    const aiWinner = checkWinner(this.board);
    if (aiWinner === this.aiPlayer) {
      this.status = 'ai_won';
      this.winner = aiWinner;
      this.message = `${info.label} answered with ${aiMove} and won.`;
      this.log.push('AI victory detected.');
      return this.snapshot();
    }

    if (isDraw(this.board)) {
      this.status = 'draw';
      this.winner = 0;
      this.message = `${info.label} answered with ${aiMove}. The game is a draw.`;
      this.log.push('Board filled after the AI move.');
      return this.snapshot();
    }

    this.status = 'in_progress';
    this.winner = 0;
    this.message = `${info.label} answered with ${aiMove}. Your move.`;
    return this.snapshot();
  }
}

export function createSession(options = {}) {
  return new MinimaxSession(options);
}
