const choices = document.querySelectorAll(".choice");
const userChoiceDisplay = document.querySelector("#user-choice span");
const computerChoiceDisplay = document.querySelector("#computer-choice span");
const winnerDisplay = document.querySelector("#winner span");
const userWinsDisplay = document.querySelector("#user-wins");
const computerWinsDisplay = document.querySelector("#computer-wins");
const finalResultDisplay = document.querySelector("#final-result");
const roundSelector = document.querySelector("#rounds");
const resetBtn = document.querySelector("#reset-btn");
const timerDisplay = document.getElementById("timer-display");
const totalGamesDisplay = document.getElementById("total-games");
const leaderboardDisplay = document.getElementById("leaderboard");
const shareBtn = document.getElementById("share-btn");
const musicToggleImg = document.getElementById("music-toggle-img");
const popup = document.getElementById("popup");
const losePopup = document.getElementById("lose-popup");
const gameModeSelector = document.getElementById("game-mode");

const titleSound = new Audio("assets/music/title_sound.mp3");
const winSound = new Audio("assets/music/win_sound.mp3");
const loseSound = new Audio("assets/music/lose_sound.mp3");
const selectSound = new Audio("assets/music/select_sound.mp3");

const gameChoices = ["stone", "paper", "scissors"];
let userWins = 0;
let computerWins = 0;
let roundsPlayed = 0;
let totalRounds = parseInt(roundSelector.value);
let totalGames = 0;
let timer;
let gameMode = "standard"; // Default game mode
let musicMuted = false;
const TIMER_DURATION = 10; // Define a constant for timer duration

titleSound.loop = true;
titleSound.play();

initializeEventListeners();

function initializeEventListeners() {
  roundSelector.addEventListener("change", () => {
    totalRounds = parseInt(roundSelector.value);
    resetGame();
  });

  gameModeSelector.addEventListener("change", (e) => {
    gameMode = e.target.value; // Update game mode
    resetGame(); // Reset the game if the mode is changed
  });

  choices.forEach((choice) =>
    choice.addEventListener("click", handleChoiceClick)
  );
  resetBtn.addEventListener("click", resetGame);
  shareBtn.addEventListener("click", shareResults);
  musicToggleImg.addEventListener("click", toggleMusic);
  document
    .getElementById("clear-leaderboard-btn")
    .addEventListener("click", clearLeaderboard);
}

function handleChoiceClick(e) {
  selectSound.play();
  if (roundsPlayed < totalRounds) {
    const userChoice = e.currentTarget.getAttribute("data-choice");
    const computerChoice = getComputerChoice();
    const winner = getWinner(userChoice, computerChoice);

    displayChoices(userChoice, computerChoice);
    displayWinner(winner);
    updateScore(winner);
    roundsPlayed++;
    checkFinalWinner();

    if (gameMode === "timed" && roundsPlayed === 1) {
      startTimer(); // Start timer only on the first choice in timed mode
    }
  }
}

function getComputerChoice() {
  const randomIndex = Math.floor(Math.random() * gameChoices.length);
  return gameChoices[randomIndex];
}

function getWinner(userChoice, computerChoice) {
  if (userChoice === computerChoice) return "Tie";
  if (
    (userChoice === "stone" && computerChoice === "scissors") ||
    (userChoice === "paper" && computerChoice === "stone") ||
    (userChoice === "scissors" && computerChoice === "paper")
  ) {
    return "User";
  }
  return "Computer";
}

function displayChoices(userChoice, computerChoice) {
  userChoiceDisplay.textContent = userChoice;
  computerChoiceDisplay.textContent = computerChoice;
}

function displayWinner(winner) {
  winnerDisplay.textContent =
    winner === "Tie" ? "It's a tie!" : `${winner} wins!`;
}

function updateScore(winner) {
  if (winner === "User") {
    userWins++;
    userWinsDisplay.textContent = userWins;
  } else if (winner === "Computer") {
    computerWins++;
    computerWinsDisplay.textContent = computerWins;
  }
}

function checkFinalWinner() {
  if (roundsPlayed === totalRounds) {
    titleSound.pause();
    totalGames++;
    totalGamesDisplay.textContent = totalGames;

    if (userWins > computerWins) {
      finalResultDisplay.textContent = "User is the overall winner!";
      winSound.play();
      showPopup(popup);
    } else if (computerWins > userWins) {
      finalResultDisplay.textContent = "Computer is the overall winner!";
      loseSound.play();
      showPopup(losePopup);
    } else {
      finalResultDisplay.textContent = "It's a tie!";
    }

    saveScore();
    displayLeaderboard();
  }
}

function showPopup(popupElement) {
  popupElement.style.display = "block";
  setTimeout(() => {
    popupElement.style.display = "none";
  }, 2000);
}

function startTimer() {
  let timeLeft = TIMER_DURATION;
  timerDisplay.textContent = timeLeft;
  console.log("Timer started:", timeLeft); // Debugging line
  clearInterval(timer);
  timer = setInterval(() => {
    timeLeft--;
    timerDisplay.textContent = timeLeft;
    console.log("Timer ticking:", timeLeft); // Debugging line
    if (timeLeft <= 0) {
      clearInterval(timer);
      displayChoices("Time Up!", "Time Up!");
      displayWinner("Tie");
      roundsPlayed++;
      checkFinalWinner();
    }
  }, 1000);
}

function resetGame() {
  userWins = 0;
  computerWins = 0;
  roundsPlayed = 0;
  userWinsDisplay.textContent = 0;
  computerWinsDisplay.textContent = 0;
  finalResultDisplay.textContent = "";
  userChoiceDisplay.textContent = "";
  computerChoiceDisplay.textContent = "";
  winnerDisplay.textContent = "";
  timerDisplay.textContent = TIMER_DURATION; // Reset the timer display to the initial duration
  clearInterval(timer); // Clear any ongoing timer
  titleSound.currentTime = 0;
  titleSound.play();
}

function saveScore() {
  const scores = JSON.parse(localStorage.getItem("scores")) || [];
  console.log("Current Scores:", scores); // Debugging line
  if (scores.length >= 10) scores.shift(); // Limit to last 10 scores
  scores.push({ userWins, computerWins });
  localStorage.setItem("scores", JSON.stringify(scores));
}

function displayLeaderboard() {
  const scores = JSON.parse(localStorage.getItem("scores")) || [];
  leaderboardDisplay.innerHTML = scores
    .map((score) => `User: ${score.userWins}, Computer: ${score.computerWins}`)
    .join("<br>");
}

function shareResults() {
  const shareText = `I won ${userWins} times and lost ${computerWins} times!`;
  if (navigator.share) {
    navigator
      .share({ title: "Stone Paper Scissors", text: shareText })
      .catch((err) => console.error("Error sharing:", err));
  } else {
    alert("Sharing is not supported in this browser.");
  }
}

function toggleMusic() {
  musicMuted = !musicMuted;
  if (musicMuted) {
    titleSound.pause();
    musicToggleImg.src = "assets/mute.png";
  } else {
    titleSound.play();
    musicToggleImg.src = "assets/unmute.png";
  }
}

function clearLeaderboard() {
  localStorage.removeItem("scores");
  leaderboardDisplay.innerHTML = "";
  alert("Leaderboard cleared!");
}

// Theme Selector
const themeSelector = document.getElementById("theme-selector");

// Set light mode as default
document.body.classList.add("light-mode");

themeSelector.addEventListener("change", () => {
  const selectedTheme = themeSelector.value;

  document.body.classList.remove("dark-mode", "colorful-mode", "light-mode"); // Remove all themes

  if (selectedTheme === "dark") {
    document.body.classList.add("dark-mode");
  } else if (selectedTheme === "colorful") {
    document.body.classList.add("colorful-mode");
  } else {
    document.body.classList.add("light-mode"); // Default or no theme
  }
});
