import React, { useState, useEffect, useRef } from "react";

const ShapeGame = ({ onNavigate }) => {
  const [gameStarted, setGameStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [currentRule, setCurrentRule] = useState("square");
  const [highScore, setHighScore] = useState(0);
  const [animationInProgress, setAnimationInProgress] = useState(false);
  const [ruleChangeInProgress, setRuleChangeInProgress] = useState(false);

  const gameContainerRef = useRef(null);
  const shapesRef = useRef([]);
  const animationIdRef = useRef(null);
  const startTimeRef = useRef(null);
  const correctClickStreakRef = useRef(0);
  const pitchOffsetRef = useRef(0);

  // Game configuration
  const allRules = [
    "square",
    "circle",
    "triangle",
    "orange",
    "purple",
    "yellow",
    "green",
  ];
  const allShapes = ["square", "circle", "triangle"];
  const colors = [
    "rgb(236, 152, 55)",
    "rgb(186, 161, 230)",
    "rgb(231, 240, 115)",
    "rgb(79, 230, 87)",
  ];

  // Load high score on component mount
  useEffect(() => {
    const savedHighScore = localStorage.getItem("shapegameHighScore") || 0;
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

  const changeRule = () => {
    if (ruleChangeInProgress) return;

    setRuleChangeInProgress(true);

    setTimeout(() => {
      const remainingRules = allRules.filter((rule) => rule !== currentRule);
      const randomIndex = Math.floor(Math.random() * remainingRules.length);
      setCurrentRule(remainingRules[randomIndex]);

      setTimeout(() => {
        setRuleChangeInProgress(false);
      }, 300);
    }, 300);
  };

  const getShapeColor = (shape) => {
    const colorMap = {
      "rgb(236, 152, 55)": "orange",
      "rgb(186, 161, 230)": "purple",
      "rgb(231, 240, 115)": "yellow",
      "rgb(79, 230, 87)": "green",
    };
    return colorMap[shape.style.backgroundColor] || "unknown";
  };

  const playCorrectSound = () => {
    // Sound logic would go here - keeping the original sound system
    const audio = new Audio("../sounds/correct1.wav");
    audio.volume = 0.3;
    audio.play().catch((e) => console.log("Audio play failed:", e));
  };

  const playIncorrectSound = () => {
    const audio = new Audio("../sounds/incorrect1.wav");
    audio.volume = 0.3;
    audio.play().catch((e) => console.log("Audio play failed:", e));
  };

  const handleShapeClick = (shape, shapeType) => {
    if (!animationInProgress || shape.isDead || shape.isDying) return;

    const shapeMatchesRule = shapeType === currentRule;
    const colorMatchesRule = getShapeColor(shape) === currentRule;

    if (shapeMatchesRule || colorMatchesRule) {
      // Correct click
      setScore((prev) => prev + 1);
      correctClickStreakRef.current++;
      shape.classList.add("clicked");
      shape.isDead = true;

      playCorrectSound();
      changeRule();

      // Update high score if needed
      const newScore = score + 1;
      if (newScore > highScore) {
        setHighScore(newScore);
        localStorage.setItem("shapegameHighScore", newScore.toString());
      }
    } else {
      // Incorrect click
      correctClickStreakRef.current = 0;
      playIncorrectSound();
    }
  };

  const createShape = () => {
    if (!gameContainerRef.current) return;

    const shape = document.createElement("div");
    const shapeType = allShapes[Math.floor(Math.random() * allShapes.length)];
    const color = colors[Math.floor(Math.random() * colors.length)];

    shape.className = `shape ${shapeType}`;
    shape.style.backgroundColor = color;
    shape.style.left = Math.random() * (window.innerWidth - 50) + "px";
    shape.style.top = "100vh";
    shape.isDead = false;
    shape.isDying = false;

    shape.addEventListener("click", () => handleShapeClick(shape, shapeType));

    gameContainerRef.current.appendChild(shape);
    shapesRef.current.push(shape);

    // Animate shape
    const startTime = Date.now();
    const duration = 3000;
    const startY = window.innerHeight;
    const endY = -100;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const currentY = startY + (endY - startY) * progress;
      shape.style.top = currentY + "px";

      if (progress < 1 && !shape.isDead) {
        animationIdRef.current = requestAnimationFrame(animate);
      } else {
        // Remove shape when animation completes or shape is dead
        if (shape.parentNode) {
          shape.parentNode.removeChild(shape);
        }
        const index = shapesRef.current.indexOf(shape);
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
    startTimeRef.current = Date.now();

    // Clear any existing shapes
    if (gameContainerRef.current) {
      gameContainerRef.current.innerHTML = "";
    }
    shapesRef.current = [];

    // Create shapes periodically
    const shapeInterval = setInterval(() => {
      if (animationInProgress) {
        createShape();
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

      {/* High Score Display */}
      <div id="high-score-display">
        <span>{animationInProgress ? "Rule: " : "High Score: "}</span>
        <span id="high-score-value">
          {animationInProgress ? currentRule : highScore}
        </span>
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

      {/* Score Display */}
      {animationInProgress && (
        <div id="click-counter" style={{ display: "block" }}>
          Score: {score}
        </div>
      )}
    </div>
  );
};

export default ShapeGame;
