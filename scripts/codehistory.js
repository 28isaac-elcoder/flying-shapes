/* Mathgame.js as of 2025-09-09 */

// Both of these exist in html already and mus be referenced here so that js script can edit them if need be
const gameContainer = document.getElementById("game-container");
const startBtn = document.getElementById("start-btn");

// Create and add the equation display (formerly click counter)
const equationDisplay = document.createElement("div");
equationDisplay.id = "equation-display";
equationDisplay.style.display = "none"; // Hidden initially
gameContainer.appendChild(equationDisplay);

// NEW: Rule system variables
const scoreDisplay = document.getElementById("score-display");
const scoreText = document.getElementById("score-value");
let currentRule = 1; // Start with number 1 rule
let score = 0; // Replace circlesClicked with a general score
let ruleChangeInProgress = false;

// Add a variable to track if the game has been played
let gameHasBeenPlayed = false;

// NEW: Array of all possible rules (numbers 0-99)
const allRules = Array.from({ length: 100 }, (_, i) => i); // Creates array [0, 1, 2, ..., 99]

const colors = [
  "rgb(236, 152, 55)",
  "rgb(186, 161, 230)",
  "rgb(231, 240, 115)",
  "rgb(79, 230, 87)",
];

const animationSeconds = 18; // how long will the shapes be flying (in seconds)
const shapesPerSecond = 1.3; // how many shapes (of each type) will there be per second?
const animationTime = animationSeconds * 1000;
const numNumboxes = Math.floor(animationSeconds * shapesPerSecond);

// Store numboxes in an array
const numboxes = [];

// Add this function near the top with other functions
function generateEquation(targetNumber) {
  const operations = ["+", "-"];
  const operation = operations[Math.floor(Math.random() * operations.length)];

  let firstNumber, secondNumber, equation;

  if (operation === "+") {
    // For addition: firstNumber + secondNumber = targetNumber
    // Ensure firstNumber is 0-99 and secondNumber will also be 0-99
    firstNumber = Math.floor(Math.random() * Math.min(targetNumber + 1, 100)); // 0 to min(targetNumber, 99)
    secondNumber = targetNumber - firstNumber;

    // If secondNumber would be negative, adjust firstNumber
    if (secondNumber < 0) {
      firstNumber = targetNumber;
      secondNumber = 0;
    }

    equation = `${firstNumber} + ${secondNumber}`;
  } else {
    // For subtraction: firstNumber - secondNumber = targetNumber
    // Ensure firstNumber is 0-99, so secondNumber = firstNumber - targetNumber
    firstNumber = Math.floor(Math.random() * 100); // 0-99
    secondNumber = firstNumber - targetNumber;

    // If secondNumber would be negative, adjust firstNumber
    if (secondNumber < 0) {
      firstNumber = targetNumber;
      secondNumber = 0;
    }

    equation = `${firstNumber} - ${secondNumber}`;
  }

  return {
    equation: equation,
    firstNumber: firstNumber,
    operation: operation,
    secondNumber: secondNumber,
  };
}

// New function to generate chained equation
function generateChainedEquation(targetNumber) {
  const operations = ["+", "-"];
  const operation = operations[Math.floor(Math.random() * operations.length)];

  let firstNumber, secondNumber, equation;

  if (operation === "+") {
    // For addition: previousNumber + secondNumber = targetNumber
    firstNumber = previousCorrectNumber;
    secondNumber = targetNumber - firstNumber;

    // Ensure secondNumber is 0-99
    if (secondNumber < 0 || secondNumber > 99) {
      // If we can't make it work with addition, switch to subtraction
      firstNumber = Math.min(previousCorrectNumber, 99); // Ensure firstNumber is 0-99
      secondNumber = firstNumber - targetNumber;

      /*if (secondNumber < 0) {
        // If still can't work, generate a new equation
        return generateEquation(targetNumber);
      }*/

      equation = `${firstNumber} - ${secondNumber}`;
      return {
        equation: equation,
        firstNumber: firstNumber,
        operation: "-",
        secondNumber: secondNumber,
      };
    } else {
      equation = `${firstNumber} + ${secondNumber}`;
      return {
        equation: equation,
        firstNumber: firstNumber,
        operation: "+",
        secondNumber: secondNumber,
      };
    }
  } else {
    // For subtraction: previousNumber - secondNumber = targetNumber
    firstNumber = Math.min(previousCorrectNumber, 99); // Ensure firstNumber is 0-99
    secondNumber = firstNumber - targetNumber;

    // Ensure secondNumber is 0-99
    if (secondNumber < 0 || secondNumber > 99) {
      // If we can't make it work with subtraction, switch to addition
      secondNumber = targetNumber - firstNumber;
      if (secondNumber < 0 || secondNumber > 99) {
        // If still can't work, generate a new equation
        return generateEquation(targetNumber);
      }
      equation = `${firstNumber} + ${secondNumber}`;
      return {
        equation: equation,
        firstNumber: firstNumber,
        operation: "+",
        secondNumber: secondNumber,
      };
    } else {
      equation = `${firstNumber} - ${secondNumber}`;
      return {
        equation: equation,
        firstNumber: firstNumber,
        operation: "-",
        secondNumber: secondNumber,
      };
    }
  }
}

// Add a function to calculate and set font sizes for equation parts
function setEquationFontSizes() {
  const equationDisplay = document.getElementById("equation-display");
  const firstNumberSpan = equationDisplay.querySelector(
    ".equation-part:nth-child(1)"
  );
  const operationSpan = equationDisplay.querySelector(
    ".equation-part:nth-child(2)"
  );
  const secondNumberSpan = equationDisplay.querySelector(
    ".equation-part:nth-child(3)"
  );

  if (!firstNumberSpan || !operationSpan || !secondNumberSpan) {
    console.log("Equation parts not found");
    return;
  }

  const containerRect = equationDisplay.getBoundingClientRect();
  const isMobile = window.innerWidth <= 768;

  if (isMobile) {
    // Mobile: vertical layout - use height for sizing
    const containerHeight = containerRect.height;

    // Simple font size calculation like numboxes
    const numberFontSize = containerHeight * 0.4; // 40% of container height
    const operationFontSize = containerHeight * 0.2; // 20% of container height

    firstNumberSpan.style.fontSize = `${numberFontSize}px`;
    operationSpan.style.fontSize = `${operationFontSize}px`;
    secondNumberSpan.style.fontSize = `${numberFontSize}px`;
  } else {
    // Desktop: horizontal layout - use width for sizing
    const containerWidth = containerRect.width;

    // Simple font size calculation like numboxes
    const numberFontSize = containerWidth * 0.35; // 40% of container width
    const operationFontSize = containerWidth * 0.3; // 20% of container width

    firstNumberSpan.style.fontSize = `${numberFontSize}px`;
    operationSpan.style.fontSize = `${operationFontSize}px`;
    secondNumberSpan.style.fontSize = `${numberFontSize}px`;
  }
}

// Add a function to create the equation display with separate elements
function createEquationDisplay(equationData) {
  // Fade out current content
  equationDisplay.style.opacity = "0";

  setTimeout(() => {
    // Clear existing content
    equationDisplay.innerHTML = "";

    // Remove any existing operation classes
    equationDisplay.classList.remove("positive", "negative");

    // Add the appropriate class based on operation
    if (equationData.operation === "+") {
      equationDisplay.classList.add("positive");
    } else {
      equationDisplay.classList.add("negative");
    }

    // Create separate elements for each part
    const firstNumberSpan = document.createElement("span");
    firstNumberSpan.textContent = equationData.firstNumber;
    firstNumberSpan.className = "equation-part first-number";

    const operationSpan = document.createElement("span");
    operationSpan.textContent = ` ${equationData.operation} `;
    operationSpan.className = "equation-part operation";

    const secondNumberSpan = document.createElement("span");
    secondNumberSpan.textContent = equationData.secondNumber;
    secondNumberSpan.className = "equation-part second-number";

    // Append all parts
    equationDisplay.appendChild(firstNumberSpan);
    equationDisplay.appendChild(operationSpan);
    equationDisplay.appendChild(secondNumberSpan);

    // Set high z-index for the transition period
    equationDisplay.style.zIndex = "999";

    // Fade in new content
    equationDisplay.style.opacity = "1";

    // Set font sizes after elements are added to DOM
    setTimeout(() => {
      setEquationFontSizes();
    }, 0);

    // Return z-index to normal after 0.3 seconds
    setTimeout(() => {
      equationDisplay.style.zIndex = "0";
    }, 300);
  }, 100); // Half of the transition duration
}

// Function to change the rule with fade effect (now random selection)
function changeRule() {
  if (ruleChangeInProgress) return; // Prevent multiple rule changes at once

  ruleChangeInProgress = true;

  // Fade out current rule
  scoreText.style.transition = "opacity 0.3s ease-out";
  scoreText.style.opacity = "0";

  setTimeout(() => {
    // Generate new target number between 0-99
    let newTarget;
    do {
      newTarget = Math.floor(Math.random() * 100);
    } while (newTarget === currentRule); // Ensure it's different from current

    currentRule = newTarget;

    // Generate equation (chained if we have a previous number)
    let equationData;
    if (previousCorrectNumber !== null) {
      equationData = generateChainedEquation(currentRule);
    } else {
      equationData = generateEquation(currentRule);
    }

    // Create the equation display with separate elements
    createEquationDisplay(equationData);

    // Update all animating numboxes with the new correct number
    updateAnimatingNumboxes(newTarget);

    // Fade in new rule
    scoreText.style.transition = "opacity 0.3s ease-in";
    scoreText.style.opacity = "1";

    // Reset flag after animation completes
    setTimeout(() => {
      ruleChangeInProgress = false;
    }, 300);
  }, 300);
}

// Function to update the score display
function updateScoreDisplay() {
  if (animationInProgress) {
    // Show current score during gameplay
    scoreDisplay.querySelector("span:first-child").textContent = "Score: ";
    scoreText.textContent = score;
  } else {
    // Show high score only if game has never been played, otherwise show current score
    if (!gameHasBeenPlayed) {
      scoreDisplay.querySelector("span:first-child").textContent =
        "High Score: ";
      scoreText.textContent = currentHighScore;
    } else {
      scoreDisplay.querySelector("span:first-child").textContent = "Score: ";
      scoreText.textContent = score;
    }
  }
}

// Function to update the equation display
function updateEquationDisplay() {
  if (animationInProgress) {
    // Show the current equation in the large center display
    let equationData;
    if (previousCorrectNumber !== null) {
      equationData = generateChainedEquation(currentRule);
    } else {
      equationData = generateEquation(currentRule);
    }
    createEquationDisplay(equationData);
    equationDisplay.style.display = "block";
  } else {
    // Hide the equation display when game is not active
    equationDisplay.style.display = "none";
  }
}

// Add this function to update animating numboxes with smooth transition
function updateAnimatingNumboxes(newCorrectNumber) {
  numboxes.forEach((numbox) => {
    // Only update numboxes that are currently visible and animating
    if (numbox.style.opacity === "1" && !numbox.isDead && !numbox.isDying) {
      // Add transition effect
      numbox.style.transition = "opacity 0.2s ease";
      numbox.style.opacity = "0.5";

      setTimeout(() => {
        // 25% chance to show the new correct number
        if (Math.random() < 0.25) {
          numbox.textContent = newCorrectNumber;
        } else {
          numbox.textContent = Math.floor(Math.random() * 100); // 0-99
        }

        // Fade back in
        numbox.style.opacity = "1";
      }, 100); // Half of the transition duration
    }
  });
}

// Function to handle shape clicks based on current rule
function handleShapeClick(shape, shapeType) {
  if (!animationInProgress || shape.isDead || shape.isDying) {
    return;
  }

  // Get the number displayed on the clicked numbox
  const clickedNumber = parseInt(shape.textContent);

  // Check if the clicked number matches the current rule
  if (clickedNumber === currentRule) {
    // Correct number clicked - increase score and streak
    score++;
    correctClickStreak++;
    shape.classList.add("clicked");
    shape.isDead = true;

    // Update previous correct number
    previousCorrectNumber = currentRule;

    // Play correct sound based on streak
    playCorrectSound();

    // Update displays
    updateScoreDisplay(); // This will show the new score

    // Change the rule after correct click
    changeRule();

    //console.log(`✅ Correct! Clicked ${clickedNumber} when rule was ${currentRule}. Score: ${score}, Streak: ${correctClickStreak}, Pitch Offset: ${pitchOffset}`);
  } else {
    // Wrong number clicked - reset streak and pitch offset
    correctClickStreak = 0; // Reset streak to 0
    pitchOffset = 0; // Reset pitch offset to 0
    if (score > 0) {
      score--;
      //console.log(`❌ Wrong! Clicked ${clickedNumber} when rule was ${currentRule}. Score: ${score}, Streak reset to 0, Pitch reset to 0`);
    }

    // Play incorrect sound
    playIncorrectSound();

    // For incorrect shapes, add deadclicked class instead of clicked class
    shape.classList.add("deadclicked");

    // For incorrect shapes, trigger death animation regardless of type
    shape.isDying = true; // Mark as dying to stop original animation
    animateDeadShape(shape); // Single function for any shape type

    // Update displays - but DON'T change the equation
    updateScoreDisplay(); // This will show the updated score
    // DON'T call updateEquationDisplay() here - this prevents equation from changing
  }
}

// Add this at the top with your other variables
let activeAnimations = new Map(); // Track active animations for each shape

// Modify the animate function to store animation frame IDs
function animate(shape) {
  // Check if this shape is dead or dying
  if (shape.isDead || shape.isDying) {
    // Don't animate shapes that are dead or dying
    return;
  }

  // For all other shapes, proceed with normal animation
  const flightTime = Math.random() * (5500 - 3500) + 3500;
  const peakHeightPercent = Math.random() * 25 + 70;
  const peakHeightPx = (peakHeightPercent / 100) * gameContainer.offsetHeight;

  const maxStartX = gameContainer.offsetWidth - shape.offsetWidth;
  let startx = Math.random() * maxStartX;

  const widthMovement = Math.random() * 65 + 15;
  let direction = Math.random() < 0.5 ? -1 : 1;
  let xMovepx = (widthMovement / 100) * gameContainer.offsetWidth;

  let endx = startx + xMovepx * direction;

  // Fix endx to stay inside extended bounds
  let totalAttempts = 0;
  const maxAttempts = 6;
  const buffer = gameContainer.offsetWidth * 0.25;

  while (
    endx < -buffer ||
    endx + shape.offsetWidth > gameContainer.offsetWidth + buffer
  ) {
    if (endx < -buffer) {
      direction = 1;
      startx = Math.max(0, startx - xMovepx * 0.5);
    } else if (endx + shape.offsetWidth > gameContainer.offsetWidth + buffer) {
      direction = -1;
      startx = Math.min(maxStartX, startx + xMovepx * 0.5);
    }

    totalAttempts++;
    xMovepx *= 0.85;

    if (totalAttempts > maxAttempts) {
      console.log(
        `Safe landing forced after ${maxAttempts} attempts. Final position: ${endx.toFixed(2)}px`
      );
      endx = Math.max(
        -buffer,
        Math.min(gameContainer.offsetWidth + buffer - shape.offsetWidth, startx)
      );
      break;
    }

    endx = startx + xMovepx * direction;
  }

  const peakWidthChange = endx - startx;
  const shapeHeight = shape.offsetHeight;
  const startOffset = -(shapeHeight + gameContainer.offsetHeight * 0.05);

  const startTime = Date.now();

  function frame() {
    const elapsed = Date.now() - startTime;
    const progress = elapsed / flightTime;

    if (progress < 1) {
      const y = -4 * progress * (progress - 1) * peakHeightPx + startOffset;
      shape.style.bottom = `${y}px`;

      const x = startx + progress * peakWidthChange;
      shape.style.left = `${x}px`;

      const frameId = requestAnimationFrame(frame);
      activeAnimations.set(shape, frameId); // Store the frame ID
    } else {
      // Animation finished - hide the shape and make it unclickable
      shape.style.opacity = "0";
      shape.style.pointerEvents = "none";

      animationsFinished++;

      // If all numboxes have finished, reset button state
      if (animationsFinished === numNumboxes) {
        handleAllAnimationsComplete();
      }
    }
  }

  const frameId = requestAnimationFrame(frame);
  activeAnimations.set(shape, frameId); // Store the initial frame ID
}

// Modify the animateDeadShape function to cancel the original animation
function animateDeadShape(shape) {
  console.log(`💀 ANIMATE_DEAD_SHAPE called for:`, shape);

  // CRITICAL: Cancel the original animation immediately
  const frameId = activeAnimations.get(shape);
  if (frameId) {
    cancelAnimationFrame(frameId);
    activeAnimations.delete(shape);
    console.log(`🚫 Cancelled animation frame for shape`);
  }

  // Get current position
  const currentX = parseFloat(shape.style.left) || 0;
  const currentY = parseFloat(shape.style.bottom) || 0;

  //console.log(` Current position - X: ${currentX}px, Y: ${currentY}px`);

  // Freeze for 300ms
  setTimeout(() => {
    // Start dropping animation
    const dropStartTime = Date.now();
    const dropDuration = 1000; // 1 second to drop

    function dropFrame() {
      const elapsed = Date.now() - dropStartTime;
      const progress = elapsed / dropDuration;

      if (progress < 1) {
        // Drop straight down (decrease y, keep x the same)
        const newY = currentY - progress * gameContainer.offsetHeight * 0.8; // Drop 80% of container height
        shape.style.bottom = `${newY}px`;

        requestAnimationFrame(dropFrame);
      } else {
        // Drop animation finished - hide the shape
        shape.style.opacity = "0";
        shape.style.pointerEvents = "none";

        // Count this animation as finished
        animationsFinished++;
        console.log(
          ` animationsFinished incremented to: ${animationsFinished}`
        );

        // Check if all animations are done
        if (animationsFinished === numNumboxes) {
          handleAllAnimationsComplete();
        }
      }
    }

    requestAnimationFrame(dropFrame);
  }, 300); // 300ms freeze
}

for (let i = 0; i < numNumboxes; i++) {
  const numbox = document.createElement("div");
  numbox.classList.add("numbox");
  numbox.style.backgroundColor = colors[i % colors.length];

  // Add random number from 0-99
  const randomNumber = Math.floor(Math.random() * 100); // 0-99
  numbox.textContent = randomNumber;

  numbox.style.opacity = "0"; // Start invisible
  numbox.style.pointerEvents = "none"; // Start unclickable
  numbox.isDying = false;

  // Function to set font size to 90% of numbox height
  const updateFontSize = () => {
    const height = numbox.offsetHeight;
    if (height > 0) {
      // Only update if element has a height
      numbox.style.fontSize = `${height * 0.8}px`;
    }
  };

  // Add click event listeners to numboxes
  numbox.addEventListener("mousedown", (event) => {
    event.stopPropagation();
    handleShapeClick(numbox, "numbox");
  });

  // Add touch support for numboxes
  numbox.addEventListener(
    "touchstart",
    (event) => {
      event.stopPropagation();
      handleShapeClick(numbox, "numbox");
    },
    { passive: true }
  );

  // Optional: Handle touch end to prevent multiple triggers
  numbox.addEventListener("touchend", (event) => {
    event.preventDefault();
    event.stopPropagation();
  });

  gameContainer.appendChild(numbox);
  numboxes.push(numbox);

  // Update font size after element is added to DOM
  setTimeout(updateFontSize, 0);
}

let animationInProgress = false; // track if animation is running
let animationsFinished = 0; // count how many are done

// Add a counter for correct shapes launched (add this near the top with other variables)
let correctShapesLaunched = 0;

// Add streak counter for consecutive correct clicks (add this near the top with other variables)
let correctClickStreak = 0;

// Add pitch offset variable (add this near the top with other variables)
let pitchOffset = 0; // 0 = original pitch, 1 = one key lower, 2 = two keys lower, etc.

// Add this variable near the top with other variables
let previousCorrectNumber = null; // Track the previous correct number

// Add this variable near the top with other variables
let lastNumboxWasCorrect = false; // Track if the last launched numbox was correct

// Add correct sound files array
const correctSounds = [
  "../sounds/correct1.wav",
  "../sounds/correct2.wav",
  "../sounds/correct3.wav",
];

// Function to play correct sound based on streak with pitch adjustment
function playCorrectSound() {
  let soundIndex;

  if (correctClickStreak <= 1) {
    soundIndex = 0; // correct1.wav
  } else if (correctClickStreak === 2) {
    soundIndex = 1; // correct2.wav
  } else {
    soundIndex = 2; // correct3.wav (for streak 3 and beyond)
  }

  const audio = new Audio(correctSounds[soundIndex]);
  audio.volume = 0.7;

  // Apply pitch adjustment (3 semitones per streak)
  const semitoneRatio = Math.pow(2, -pitchOffset / 12);
  audio.playbackRate = semitoneRatio;

  audio.play().catch((error) => {
    console.log("Could not play correct sound:", error);
  });

  // Reset streak to 0 after playing correct3.wav (streak 3)
  if (correctClickStreak >= 3) {
    correctClickStreak = 0;
    pitchOffset++; // Increase pitch offset for next streak
  }
}

// Add incorrect sound file
const incorrectSound = "../sounds/incorrect1.wav";

// Function to play incorrect sound
function playIncorrectSound() {
  const audio = new Audio(incorrectSound);
  audio.volume = 0.7;
  audio.play().catch((error) => {
    console.log("Could not play incorrect sound:", error);
  });
}

// Create a single function to handle completion (add this near your other functions)
function handleAllAnimationsComplete() {
  if (animationsFinished === numNumboxes) {
    animationInProgress = false;
    startBtn.disabled = false;

    // Check for new high score when round ends
    checkHighScore();

    // Mark that a game has been played
    gameHasBeenPlayed = true;

    // Update the display to show final score (not high score)
    updateScoreDisplay();

    console.log("animations completed");
  }
}

// Next three portions of code surround setting, checking, and updating the highscore from local storage
// Add high score functionality at the top of your file
let currentHighScore = parseInt(localStorage.getItem("mathgameHighScore")) || 0;

// Function to update high score display
function updateHighScoreDisplay() {
  const highScoreElement = document.getElementById("high-score-value");
  if (highScoreElement) {
    highScoreElement.textContent = currentHighScore;
  }
}

// Function to check and update high score
function checkHighScore() {
  console.log(
    "🔍 CHECKING HIGH SCORE - Current score:",
    score,
    "vs High score:",
    currentHighScore
  );

  if (score > currentHighScore) {
    console.log(" NEW HIGH SCORE ACHIEVED!");
    currentHighScore = score;

    console.log(" SAVING TO LOCAL STORAGE...");
    localStorage.setItem("mathgameHighScore", currentHighScore);

    const savedScore = localStorage.getItem("mathgameHighScore");
    console.log("   Saved value:", savedScore);
    updateHighScoreDisplay();

    console.log("🎉 HIGH SCORE SYSTEM COMPLETE!");
  } else {
    console.log(
      " No new high score. Current:",
      score,
      "High:",
      currentHighScore
    );
  }
}

// Trigger animation sequence when button is clicked
startBtn.addEventListener("click", () => {
  if (!animationInProgress) {
    console.log(" START BUTTON CLICKED - Starting new animation round");
    animationInProgress = true;
    animationsFinished = 0;
    startBtn.disabled = true;

    // Reset score, streak, pitch offset, and rule for new game
    score = 0;
    correctClickStreak = 0; // Reset the streak counter for new game
    pitchOffset = 0; // Reset pitch offset for new game
    correctShapesLaunched = 0; // Reset the counter for new game
    previousCorrectNumber = null; // Reset previous correct number
    lastNumboxWasCorrect = false; // Reset the buffer flag for new game
    currentRule = allRules[Math.floor(Math.random() * allRules.length)];

    // Generate initial equation
    const initialEquationData = generateEquation(currentRule);
    createEquationDisplay(initialEquationData); // Show equation in center

    updateScoreDisplay(); // This will show "Score: 0" (since game is now in progress)
    updateEquationDisplay(); // This will show the equation in center
    equationDisplay.style.display = "block"; // Make sure it's visible

    // Remove clicked class from all numboxes and reset dead state
    numboxes.forEach((numbox) => {
      numbox.classList.remove("clicked");
      numbox.classList.remove("deadclicked"); // Remove deadclicked class too
      numbox.isDead = false; // Reset dead state
      numbox.isDying = false; // Reset dying state

      // Don't set numbers here - they'll be set when launched
    });

    // Randomize colors for this round
    const shuffledColors = shuffleArray([...colors]);

    // Update all numboxes with new random colors
    numboxes.forEach((numbox, i) => {
      numbox.style.backgroundColor = shuffledColors[i % shuffledColors.length];
    });

    // Launch all numboxes in random order with random timing
    const allShapesToLaunch = [...numboxes];
    shuffleArray(allShapesToLaunch);

    allShapesToLaunch.forEach((shape, index) => {
      // Base timing spread across animationTime, plus some randomness
      const baseDelay = (index * animationTime) / allShapesToLaunch.length;
      const randomOffset = (Math.random() - 0.5) * 1000; // ±500ms randomness
      const finalDelay = Math.max(0, baseDelay + randomOffset);

      setTimeout(() => {
        // Determine number right when launching this specific numbox
        let numberToDisplay;

        // If the last numbox was correct, this one must be incorrect
        if (lastNumboxWasCorrect) {
          numberToDisplay = Math.floor(Math.random() * 100); // 0-99
          lastNumboxWasCorrect = false;
          //console.log(`🔄 Numbox ${index + 1} launching with random number: ${numberToDisplay} (forced incorrect after correct)`);
        } else {
          // Normal
          if (Math.random() < 0.4) {
            // XX% chance to display the current rule number
            numberToDisplay = currentRule;
            lastNumboxWasCorrect = true;
            //console.log(`🔄 Numbox ${index + 1} launching with CORRECT number: ${numberToDisplay} (rule: ${currentRule})`);
          } else {
            numberToDisplay = Math.floor(Math.random() * 100); // 0-99
            lastNumboxWasCorrect = false;
            //console.log(`🔄 Numbox ${index + 1} launching with random number: ${numberToDisplay} (rule: ${currentRule})`);
          }
        }

        shape.textContent = numberToDisplay;

        shape.style.opacity = "0";
        shape.style.pointerEvents = "auto";
        shape.style.transition = "opacity 0.2s ease-in";

        setTimeout(() => {
          shape.style.opacity = "1";
        }, 10);

        // Check if this shape matches the current rule and play whoosh sound every 4th correct shape
        const clickedNumber = parseInt(shape.textContent);
        if (clickedNumber === currentRule) {
          correctShapesLaunched++;
          if (correctShapesLaunched % 4 === 0) {
            playWhooshSound();
          }
        }

        animate(shape);
      }, finalDelay);
    });

    // Cancel any remaining animations
    activeAnimations.forEach((frameId) => {
      cancelAnimationFrame(frameId);
    });
    activeAnimations.clear();
  }
});

// Simplified sound function - no need for random selection or array
function playWhooshSound() {
  const audio = new Audio("../sounds/whoosh3.wav");
  audio.volume = 0.7;
  audio.play().catch((error) => {
    console.log("Could not play sound:", error);
  });
}

// Initialize score display when page loads
document.addEventListener("DOMContentLoaded", function () {
  console.log("🌐 PAGE LOADED - Initializing high score system");
  console.log("   Current high score from storage:", currentHighScore);
  updateScoreDisplay(); // Changed from updateRuleDisplay to updateScoreDisplay
});

// Add this function near the top with your other functions
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Add resize listener to update font sizes when window resizes
window.addEventListener("resize", () => {
  setEquationFontSizes();
});
