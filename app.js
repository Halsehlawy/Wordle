/*-------------- Constants -------------*/
const keyMap = {}; // Maps letter to its corresponding key button

/*---------- Variables (State) ---------*/
let currentGuess;      // Current guess being typed
let currentRow;        // Current row number (0–5)
let targetWord;        // Word to be guessed
let gameOver;          // Game over flag
let wordGrid;          // 2D array storing all guesses

/*----- Cached DOM Elements -----------*/
const gridRowEls = document.querySelectorAll('.grid-row');
const tileEls = document.querySelectorAll('.wordle-box');
const messageEl = document.querySelector('#msg');
const keyboardEls = document.querySelectorAll('.key');
const nextWordEl = document.querySelector('#next-word');
const cheatEl = document.querySelector('#cheat')
// Fill keyMap with letter → key element mapping
keyboardEls.forEach(key => {
  const letter = key.getAttribute('data-key');
  keyMap[letter] = key;
});

/*-------------- Functions -------------*/

// Selects a random word from the word list
const getRandomWord = () => {
  return wordList[Math.floor(Math.random() * wordList.length)];
};

// Applies color feedback to tiles and keys
const applyColors = (rowIndex, guessLetters, colors) => {
  const rowStart = rowIndex * 5;

  for (let i = 0; i < 5; i++) {
    const tile = tileEls[rowStart + i];
    const key = keyMap[guessLetters[i]];

    if (colors[i] === "green") {
      tile.style.backgroundColor = "#6aaa64";
      key.classList.remove('btn-outline-warning', 'btn-outline-light');
      key.classList.add('btn-outline-success');
    } else if (colors[i] === "yellow") {
      tile.style.backgroundColor = "#c9b458";
      key.classList.remove('btn-outline-light');
      key.classList.add('btn-outline-warning');
    } else {
      tile.style.backgroundColor = "#3a3a3c";
      key.classList.remove('btn-outline-light');
      key.classList.add('btn-outline-secondary');
    }
  }
};

// Compares guess to target word, determines color feedback
const checkWord = () => {
  const guess = currentGuess.toLowerCase().split('');
  const target = targetWord.toLowerCase().split('');
  const colors = Array(5).fill("gray");
  const targetCopy = [...target];

  // Green pass (correct letter and position)
  for (let i = 0; i < 5; i++) {
    if (guess[i] === target[i]) {
      colors[i] = "green";
      targetCopy[i] = null; // Prevents double coloring
    }
  }

  // Yellow pass (correct letter, wrong position)
  for (let i = 0; i < 5; i++) {
    if (colors[i] !== "green" && targetCopy.includes(guess[i])) {
      colors[i] = "yellow";
      // Remove the matched letter to prevent reuse
      targetCopy[targetCopy.indexOf(guess[i])] = null;
    }
  }

  applyColors(currentRow, guess, colors);
};

// Updates grid tiles with current guess
const updateTiles = () => {
  const rowStart = currentRow * 5;
  for (let i = 0; i < 5; i++) {
    const tile = tileEls[rowStart + i];
    tile.textContent = currentGuess[i] || '';
  }
};

// Clears both grid and keyboard colors
const clearGrid = () => {
  wordGrid = Array.from({ length: 6 }, () => Array(5).fill(''));

  tileEls.forEach(tile => {
    tile.textContent = '';
    tile.style.backgroundColor = "#1e1e1e";
    tile.style.borderColor = "#555";
  });

  keyboardEls.forEach(key => {
    key.classList.remove(
      'btn-outline-warning',
      'btn-outline-success',
      'btn-outline-secondary'
    );
    key.classList.add('btn-outline-light');
  });
};

// Handles key inputs from physical keyboard
const handleKeyInput = (key) => {
  if (gameOver) return;
  
  if (key === 'Backspace') {
    currentGuess = currentGuess.slice(0, -1);

  } else if (key === 'Enter') {
    if (currentGuess.length === 5 && wordList.includes(currentGuess)) {
      wordGrid[currentRow] = currentGuess.split('');
      checkWord();

      if (currentGuess === targetWord) {
        showMessage("You win!");
        gameOver = true;
      } else if (currentRow === 5) {
        showMessage(`Game Over! Word was ${targetWord}`);
        gameOver = true;
      } else {
        showMessage("Wrong guess.");
        currentRow++;
        currentGuess = "";
      }
    } else if (currentGuess.length === 5) {
      showMessage("Not in word list.");
    } else {
      showMessage("Not enough letters.");
    }
  } else if (/^[a-zA-Z]$/.test(key) && currentGuess.length < 5) {
    currentGuess += key.toLowerCase();
  }

  updateTiles();
};

// Displays a status message to the player
const showMessage = (message) => {
  messageEl.textContent = message;
};

// Initializes or resets the game
const startGame = () => {
  showMessage('Guess the word');
  clearGrid();
  targetWord = getRandomWord();
  currentGuess = '';
  currentRow = 0;
  gameOver = false;
  cheatEl.textContent=targetWord;
};

// Start the first game on load
startGame();

/*----------- Event Listeners ----------*/

// Keyboard key press
document.addEventListener('keydown', (e) => {
  handleKeyInput(e.key);
});

// "Next Word" button click
nextWordEl.addEventListener('click', startGame);

