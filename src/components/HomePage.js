import React, { useState, useEffect } from "react";

const HomePage = ({ onNavigate }) => {
  const [shapegameHighScore, setShapegameHighScore] = useState(0);
  const [mathgameHighScore, setMathgameHighScore] = useState(0);

  // Load high scores from localStorage on component mount
  useEffect(() => {
    displayHighScores();
  }, []);

  const displayHighScores = () => {
    const shapegameScore = localStorage.getItem("shapegameHighScore") || 0;
    const mathgameScore = localStorage.getItem("mathgameHighScore") || 0;

    setShapegameHighScore(shapegameScore);
    setMathgameHighScore(mathgameScore);
  };

  const resetShapegameHighScore = () => {
    if (
      confirm(
        "Are you sure you want to reset your Shape Game high score? This cannot be undone."
      )
    ) {
      localStorage.removeItem("shapegameHighScore");
      alert("Shape Game high score has been reset!");
      displayHighScores();
    }
  };

  const resetMathgameHighScore = () => {
    if (
      confirm(
        "Are you sure you want to reset your Math Game high score? This cannot be undone."
      )
    ) {
      localStorage.removeItem("mathgameHighScore");
      alert("Math Game high score has been reset!");
      displayHighScores();
    }
  };

  return (
    <div className="landing-container">
      <h1 className="game-title">Flying Shapes</h1>
      <p className="game-subtitle">Choose your game mode below</p>

      <div className="landing-controls">
        <button className="proceed-btn" onClick={() => onNavigate("shapegame")}>
          Shape Game
        </button>
        <button className="proceed-btn" onClick={() => onNavigate("mathgame")}>
          Math Game
        </button>
      </div>

      <div className="high-scores-section">
        <div className="high-score-item">
          <span className="high-score-label">Shape Game High Score:</span>
          <span className="high-score-value">{shapegameHighScore}</span>
          <button className="reset-btn" onClick={resetShapegameHighScore}>
            Reset
          </button>
        </div>

        <div className="high-score-item">
          <span className="high-score-label">Math Game High Score:</span>
          <span className="high-score-value">{mathgameHighScore}</span>
          <button className="reset-btn" onClick={resetMathgameHighScore}>
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
