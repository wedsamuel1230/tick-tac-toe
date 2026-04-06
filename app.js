import { AI_MODES, createSession } from './game.js';

const session = createSession({ aiMode: 'perfect' });

const boardEl = document.getElementById('board');
const bannerMessageEl = document.getElementById('bannerMessage');
const statusPillEl = document.getElementById('statusPill');
const winnerValueEl = document.getElementById('winnerValue');
const turnValueEl = document.getElementById('turnValue');
const humanValueEl = document.getElementById('humanValue');
const aiValueEl = document.getElementById('aiValue');
const noticeEl = document.getElementById('notice');
const moveLogEl = document.getElementById('moveLog');
const resetButton = document.getElementById('resetButton');
const hintButton = document.getElementById('hintButton');
const modeSelect = document.getElementById('aiMode');
const modeDescriptionEl = document.getElementById('modeDescription');
const modeBadgeEl = document.getElementById('modeBadge');

let state = session.snapshot();

function markLabel(value) {
  if (value === 1) return 'X';
  if (value === -1) return 'O';
  return '';
}

function friendlyStatus(rawStatus) {
  return rawStatus.replaceAll('_', ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

function setBusy(isBusy) {
  resetButton.disabled = isBusy;
  hintButton.disabled = isBusy;
  modeSelect.disabled = isBusy;

  boardEl.querySelectorAll('button').forEach((button) => {
    button.disabled = isBusy || state.status !== 'in_progress' || button.dataset.mark !== '0';
  });
}

function renderModePicker() {
  if (modeSelect.options.length === 0) {
    for (const [mode, info] of Object.entries(AI_MODES)) {
      const option = document.createElement('option');
      option.value = mode;
      option.textContent = info.label;
      modeSelect.appendChild(option);
    }
  }

  modeSelect.value = state.aiMode;
  modeDescriptionEl.textContent = AI_MODES[state.aiMode]?.description || '';
  modeBadgeEl.textContent = AI_MODES[state.aiMode]?.label || 'Perfect minimax';
}

function renderBoard() {
  boardEl.innerHTML = '';

  for (let index = 0; index < 9; index += 1) {
    const position = index + 1;
    const value = state.board[index];
    const cell = document.createElement('button');
    cell.type = 'button';
    cell.className = 'cell cell-fade-in';
    cell.dataset.position = String(position);
    cell.dataset.mark = String(value);
    cell.setAttribute('aria-label', value === 0 ? `Square ${position}, empty` : `Square ${position}, occupied by ${markLabel(value)}`);
    cell.disabled = value !== 0 || state.status !== 'in_progress';

    if (value === 0) {
      cell.innerHTML = `<span class="cell-empty">${position}</span>`;
      cell.addEventListener('click', () => handleMove(position));
    } else {
      cell.innerHTML = `<span class="cell-mark">${markLabel(value)}</span>`;
      cell.dataset.player = value === 1 ? 'human' : 'ai';
    }

    boardEl.appendChild(cell);
  }
}

function renderSidebar() {
  bannerMessageEl.textContent = state.message;
  statusPillEl.textContent = friendlyStatus(state.status);
  winnerValueEl.textContent = state.winner === 0 ? '-' : markLabel(state.winner);
  turnValueEl.textContent = state.status === 'in_progress' ? 'Human' : 'Finished';
  humanValueEl.textContent = state.lastHumanMove === null ? '-' : String(state.lastHumanMove);
  aiValueEl.textContent = state.lastAiMove === null ? '-' : String(state.lastAiMove);

  moveLogEl.innerHTML = '';
  for (const entry of state.log) {
    const item = document.createElement('li');
    item.textContent = entry;
    moveLogEl.appendChild(item);
  }

  noticeEl.textContent = '';
}

function render() {
  renderModePicker();
  renderBoard();
  renderSidebar();
}

function updateState(nextState, extraNotice = '') {
  state = nextState;
  render();
  noticeEl.textContent = extraNotice;
}

function handleMove(position) {
  if (state.status !== 'in_progress') return;

  setBusy(true);
  noticeEl.textContent = 'Thinking...';

  window.requestAnimationFrame(() => {
    try {
      updateState(session.playHumanMove(position));
    } catch (error) {
      noticeEl.textContent = error.message;
    } finally {
      setBusy(false);
    }
  });
}

function handleModeChange() {
  setBusy(true);
  try {
    updateState(session.setAiMode(modeSelect.value), `Mode switched to ${AI_MODES[session.aiMode].label}.`);
  } catch (error) {
    noticeEl.textContent = error.message;
  } finally {
    setBusy(false);
  }
}

function resetBoard() {
  setBusy(true);
  try {
    updateState(session.reset(), 'New round started.');
  } finally {
    setBusy(false);
  }
}

resetButton.addEventListener('click', resetBoard);
hintButton.addEventListener('click', () => {
  noticeEl.textContent = state.status === 'in_progress'
    ? `The ${AI_MODES[state.aiMode].label.toLowerCase()} mode is waiting for your next move.`
    : 'Reset the board to play another round.';
});
modeSelect.addEventListener('change', handleModeChange);

document.addEventListener('DOMContentLoaded', () => {
  render();
});
