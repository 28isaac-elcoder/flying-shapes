// Check if high scores exist and display them
function displayHighScores() {
  const shapegameHighScore = localStorage.getItem("shapegameHighScore") || 0;
  const mathgameHighScore = localStorage.getItem("mathgameHighScore") || 0;

  console.log("Current shape game high score:", shapegameHighScore);
  console.log("Current math game high score:", mathgameHighScore);

  // Update the display elements
  const shapegameElement = document.getElementById("shapegame-high-score");
  const mathgameElement = document.getElementById("mathgame-high-score");

  if (shapegameElement) {
    shapegameElement.textContent = shapegameHighScore;
  }
  if (mathgameElement) {
    mathgameElement.textContent = mathgameHighScore;
  }
}

// Reset shape game high score function
function resetShapegameHighScore() {
  if (
    confirm(
      "Are you sure you want to reset your Shape Game high score? This cannot be undone."
    )
  ) {
    localStorage.removeItem("shapegameHighScore");
    alert("Shape Game high score has been reset!");
    displayHighScores(); // Refresh display
  }
}

// Reset math game high score function
function resetMathgameHighScore() {
  if (
    confirm(
      "Are you sure you want to reset your Math Game high score? This cannot be undone."
    )
  ) {
    localStorage.removeItem("mathgameHighScore");
    alert("Math Game high score has been reset!");
    displayHighScores(); // Refresh display
  }
}

// Add event listeners to reset buttons
document.addEventListener("DOMContentLoaded", function () {
  const resetShapegameBtn = document.getElementById(
    "reset-shapegame-high-score-btn"
  );
  const resetMathgameBtn = document.getElementById(
    "reset-mathgame-high-score-btn"
  );

  if (resetShapegameBtn) {
    resetShapegameBtn.addEventListener("click", resetShapegameHighScore);
  }

  if (resetMathgameBtn) {
    resetMathgameBtn.addEventListener("click", resetMathgameHighScore);
  }

  // Display current high scores on page load
  displayHighScores();
});
