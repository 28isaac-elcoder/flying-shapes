import React, { useState, useEffect, useRef } from "react";

const MathGame = ({ onNavigate }) => {
  const [gameStarted, setGameStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [currentRule, setCurrentRule] = useState(1);
  const [highScore, setHighScore] = useState(0);
  const [animationInProgress, setAnimationInProgress] = useState(false);
  const [ruleChangeInProgress, setRuleChangeInProgress] = useState(false);
  const [currentEquation, setCurrentEquation] = useState("");
  const [gameHasBeenPlayed, setGameHasBeenPlayed] = useState(false);

  const gameContainerRef = useRef(null);
  const shapesRef = useRef([]);
  const animationIdRef = useRef(null);
  const startTimeRef = useRef(null);
  const correctClickStreakRef = useRef(0);
  const pitchOffsetRef = useRef(0);
  const currentGroupCorrectIndexRef = useRef(-1);

  // Game configuration
  const allRules = Array.from({ length: 100 }, (_, i) => i); // 0-99
  const colors = [
    "rgb(236, 152, 55)",
    "rgb(186, 161, 230)",
    "rgb(231, 240, 115)",
    "rgb(79, 230, 87)",
  ];
  const correctRatio = 4; // Every group of 4 numboxes will have exactly 1 correct

  // Load high score on component mount
  useEffect(() => {
    const savedHighScore = localStorage.getItem("mathgameHighScore") || 0;
    setHighScore(parseInt(savedHighScore));
  }, []);

  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, []);

  const generateEquation = (targetNumber) => {
    const operations = ["+", "-"];
    const operation = operations[Math.floor(Math.random() * operations.length)];

    let firstNumber, secondNumber, equation;

    if (operation === "+") {
      firstNumber = Math.floor(Math.random() * targetNumber);
      secondNumber = targetNumber - firstNumber;
      equation = `${firstNumber} + ${secondNumber} = ?`;
    } else {
      firstNumber = targetNumber + Math.floor(Math.random() * 20);
      secondNumber = firstNumber - targetNumber;
      equation = `${firstNumber} - ${secondNumber} = ?`;
    }

    return { equation, answer: targetNumber };
  };

  const changeRule = () => {
    if (ruleChangeInProgress) return;

    setRuleChangeInProgress(true);

    setTimeout(() => {
      const remainingRules = allRules.filter((rule) => rule !== currentRule);
      const randomIndex = Math.floor(Math.random() * remainingRules.length);
      setCurrentRule(remainingRules[randomIndex]);

      // Generate new equation for the new rule
      const { equation } = generateEquation(remainingRules[randomIndex]);
      setCurrentEquation(equation);

      setTimeout(() => {
        setRuleChangeInProgress(false);
      }, 300);
    }, 300);
  };

  const playCorrectSound = () => {
    const audio = new Audio("../sounds/correct1.wav");
    audio.volume = 0.3;
    audio.play().catch((e) => console.log("Audio play failed:", e));
  };

  const playIncorrectSound = () => {
    const audio = new Audio("../sounds/incorrect1.wav");
    audio.volume = 0.3;
    audio.play().catch((e) => console.log("Audio play failed:", e));
  };

  const handleNumberClick = (number, numberElement) => {
    if (!animationInProgress || numberElement.isDead || numberElement.isDying)
      return;

    if (number === currentRule) {
      // Correct number clicked
      setScore((prev) => prev + 1);
      correctClickStreakRef.current++;
      numberElement.classList.add("clicked");
      numberElement.isDead = true;

      playCorrectSound();
      changeRule();

      // Update high score if needed
      const newScore = score + 1;
      if (newScore > highScore) {
        setHighScore(newScore);
        localStorage.setItem("mathgameHighScore", newScore.toString());
      }
    } else {
      // Incorrect number clicked
      correctClickStreakRef.current = 0;
      playIncorrectSound();
    }
  };

  const createNumberBox = () => {
    if (!gameContainerRef.current) return;

    const numberBox = document.createElement("div");
    numberBox.className = "numbox";

    // Determine if this should be the correct number
    const shouldBeCorrect = currentGroupCorrectIndexRef.current === -1;
    const number = shouldBeCorrect
      ? currentRule
      : Math.floor(Math.random() * 100);

    numberBox.textContent = number;
    numberBox.style.backgroundColor =
      colors[Math.floor(Math.random() * colors.length)];
    numberBox.style.left = Math.random() * (window.innerWidth - 50) + "px";
    numberBox.style.top = "100vh";
    numberBox.isDead = false;
    numberBox.isDying = false;

    numberBox.addEventListener("click", () =>
      handleNumberClick(number, numberBox)
    );

    gameContainerRef.current.appendChild(numberBox);
    shapesRef.current.push(numberBox);

    // Update group correct index
    if (shouldBeCorrect) {
      currentGroupCorrectIndexRef.current = 0;
    } else {
      currentGroupCorrectIndexRef.current =
        (currentGroupCorrectIndexRef.current + 1) % correctRatio;
    }

    // Animate number box
    const startTime = Date.now();
    const duration = 3000;
    const startY = window.innerHeight;
    const endY = -100;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const currentY = startY + (endY - startY) * progress;
      numberBox.style.top = currentY + "px";

      if (progress < 1 && !numberBox.isDead) {
        animationIdRef.current = requestAnimationFrame(animate);
      } else {
        // Remove number box when animation completes or is dead
        if (numberBox.parentNode) {
          numberBox.parentNode.removeChild(numberBox);
        }
        const index = shapesRef.current.indexOf(numberBox);
        if (index > -1) {
          shapesRef.current.splice(index, 1);
        }
      }
    };

    animate();
  };

  const startGame = () => {
    setGameStarted(true);
    setAnimationInProgress(true);
    setScore(0);
    correctClickStreakRef.current = 0;
    currentGroupCorrectIndexRef.current = -1;
    startTimeRef.current = Date.now();
    setGameHasBeenPlayed(true);

    // Clear any existing shapes
    if (gameContainerRef.current) {
      gameContainerRef.current.innerHTML = "";
    }
    shapesRef.current = [];

    // Generate initial equation
    const { equation } = generateEquation(currentRule);
    setCurrentEquation(equation);

    // Create number boxes periodically
    const shapeInterval = setInterval(() => {
      if (animationInProgress) {
        createNumberBox();
      }
    }, 1000);

    // Stop creating shapes after 18 seconds
    setTimeout(() => {
      clearInterval(shapeInterval);
      setAnimationInProgress(false);
    }, 18000);
  };

  const goHome = () => {
    setGameStarted(false);
    setAnimationInProgress(false);
    setScore(0);
    setCurrentEquation("");

    // Clear any existing shapes
    if (gameContainerRef.current) {
      gameContainerRef.current.innerHTML = "";
    }
    shapesRef.current = [];

    onNavigate("home");
  };

  return (
    <div>
      <div ref={gameContainerRef} id="game-container"></div>

      {/* Equation Display */}
      {animationInProgress && currentEquation && (
        <div id="equation-display" style={{ display: "block" }}>
          {currentEquation}
        </div>
      )}

      {/* Score Display */}
      <div id="score-display">
        <span>Score: </span>
        <span id="score-value">{score}</span>
      </div>

      {/* Controls */}
      <div id="controls">
        <button id="home-btn" onClick={goHome}>
          Home
        </button>
        <button
          id="start-btn"
          onClick={startGame}
          disabled={animationInProgress}
        >
          {animationInProgress ? "Playing..." : "Start"}
        </button>
      </div>
    </div>
  );
};

export default MathGame;
