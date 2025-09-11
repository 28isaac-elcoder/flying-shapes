// Both of these exist in html already and mus be referenced here so that js script can edit them if need be
const gameContainer = document.getElementById("game-container");
const startBtn = document.getElementById("start-btn");

// Create and add the click counter display
const clickCounter = document.createElement("div");
clickCounter.id = "click-counter";
clickCounter.style.display = "none"; // Hidden initially
gameContainer.appendChild(clickCounter);

// NEW: Rule system variables
const ruleDisplay = document.getElementById("high-score-display");
const ruleText = document.getElementById("high-score-value");
let currentRule = "square"; // Start with square rule
let score = 0; // Replace circlesClicked with a general score
let ruleChangeInProgress = false;

// NEW: Array of all possible rules (shapes + colors)
const allRules = [
  // Shape rules
  "square",
  "circle",
  "triangle",
  // Color rules
  "orange",
  "purple",
  "yellow",
  "green",
];

//const allShapes = ["square", "circle", "triangle", "hexagon"];
const allShapes = ["square", "circle", "triangle"];

// Function to change the rule with fade effect (now random selection)
function changeRule() {
  if (ruleChangeInProgress) return; // Prevent multiple rule changes at once

  ruleChangeInProgress = true;

  // Fade out current rule
  ruleText.style.transition = "opacity 0.3s ease-out";
  ruleText.style.opacity = "0";

  setTimeout(() => {
    // NEW: Randomly select from all rules (shapes + colors)
    const remainingRules = allRules.filter((rule) => rule !== currentRule);
    const randomIndex = Math.floor(Math.random() * remainingRules.length);
    currentRule = remainingRules[randomIndex];

    // Update the display text
    ruleText.textContent = currentRule;

    // Fade in new rule
    ruleText.style.transition = "opacity 0.3s ease-in";
    ruleText.style.opacity = "1";

    // Reset flag after animation completes
    setTimeout(() => {
      ruleChangeInProgress = false;
    }, 300);
  }, 300);
}

// Function to update the rule display
function updateRuleDisplay() {
  if (animationInProgress) {
    // Show rule during gameplay
    ruleDisplay.querySelector("span:first-child").textContent = "Rule: ";
    ruleText.textContent = currentRule;
  } else {
    // Show high score when game is not active
    ruleDisplay.querySelector("span:first-child").textContent = "High Score: ";
    ruleText.textContent = currentHighScore;
  }
}

// Function to handle shape clicks based on current rule
function handleShapeClick(shape, shapeType) {
  if (!animationInProgress || shape.isDead || shape.isDying) {
    return;
  }

  // Check if the clicked shape matches the current rule (shape OR color)
  const shapeMatchesRule = shapeType === currentRule;
  const colorMatchesRule = getShapeColor(shape) === currentRule;

  if (shapeMatchesRule || colorMatchesRule) {
    // Correct shape/color clicked - increase score and streak
    score++;
    correctClickStreak++;
    shape.classList.add("clicked");
    shape.isDead = true;

    // Play correct sound based on streak
    playCorrectSound();

    // Change the rule after correct click
    changeRule();

    //console.log(`✅ Correct! Clicked ${shapeType} when rule was ${currentRule}. Score: ${score}, Streak: ${correctClickStreak}, Pitch Offset: ${pitchOffset}`);
  } else {
    // Wrong shape clicked - reset streak and pitch offset
    correctClickStreak = 0; // Reset streak to 0
    pitchOffset = 0; // Reset pitch offset to 0
    if (score > 0) {
      score--;
      //console.log(`❌ Wrong! Clicked ${shapeType} when rule was ${currentRule}. Score: ${score}, Streak reset to 0, Pitch reset to 0`);
    }

    // Play incorrect sound
    playIncorrectSound();

    // For incorrect shapes, add deadclicked class instead of clicked class
    shape.classList.add("deadclicked");

    // For incorrect shapes, trigger death animation regardless of type
    shape.isDying = true; // Mark as dying to stop original animation
    animateDeadShape(shape); // Single function for any shape type
  }

  // Update the click counter display
  updateClickCounter();
}

// Helper function to get the color name from a shape
function getShapeColor(shape) {
  const bgColor = shape.style.backgroundColor;

  // Map RGB values to color names
  if (bgColor === "rgb(236, 152, 55)") return "orange";
  if (bgColor === "rgb(186, 161, 230)") return "purple";
  if (bgColor === "rgb(231, 240, 115)") return "yellow";
  if (bgColor === "rgb(79, 230, 87)") return "green";

  return null; // Unknown color
}

// Helper function to get the shape type from a shape element
function getShapeType(shape) {
  if (shape.classList.contains("square")) return "square";
  if (shape.classList.contains("circle")) return "circle";
  if (shape.classList.contains("triangle")) return "triangle";
  return null; // Unknown shape type
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
  const flightTime = Math.random() * (4500 - 2000) + 2000;
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

      // If all squares have finished, reset button state
      if (
        animationsFinished ===
        //numSquares + numCircles + numTriangles + numHexagons
        numSquares + numCircles + numTriangles
      ) {
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
        if (
          animationsFinished ===
          //numSquares + numCircles + numTriangles + numHexagons
          numSquares + numCircles + numTriangles
        ) {
          handleAllAnimationsComplete();
        }
      }
    }

    requestAnimationFrame(dropFrame);
  }, 300); // 300ms freeze
}

/*
// Creating one square and reuse it
const square = document.createElement("div"); // creates a new div element dynamically, referenced as "square"
square.classList.add("square"); //This adds the class of "square" to the newly created square div element
gameContainer.appendChild(square); //This establishes the newly created square element as a child of the game-container element which helps with css and such
*/
/*bbe
const colors = [
  "#FF69B4",
  "#FFB6C1",
  "#F9D7E2",
  "#BA55D3",
  "#DAB1DA",
  "#C8A2C8",
  "#C45AEC",
];
bbs*/

const colors = [
  "rgb(236, 152, 55)",
  "rgb(186, 161, 230)",
  "rgb(231, 240, 115)",
  "rgb(79, 230, 87)",
];

const animationSeconds = 12; // how long will the shapes be flying (in seconds)
const shapesPerSecond = 0.8; // how many shapes (of each type) will there be per second?
const animationTime = animationSeconds * 1000;
const numShapes = Math.floor(animationSeconds * shapesPerSecond);

// Create squares and store them in an array
const numSquares = numShapes;
const squares = [];

// Create circles and store them in an array
const numCircles = numShapes; // Now equal to numSquares
const circles = [];

//Create triangles and store them in an array
const numTriangles = numShapes; // Same number as squares
const triangles = [];

//Create hexagons and store them in an array
//const numHexagons = numShapes; // Same number as squares
//const hexagons = [];

// Add image paths at the top after the existing constants (COMMENTED OUT - using colored shapes instead)
/*
const circleImage = "../images/mj_bad.png";
const squareImages = [
  "../images/squares_test/mj_forevermichael.png",
  "../images/squares_test/mj_gottobethere.png",
  "../images/squares_test/mj_thriller.png",
  "../images/squares_test/mj_offthewall.png",
];
*/

for (let i = 0; i < numSquares; i++) {
  //const sq = document.createElement("img"); // Use this when clicking images (COMMENTED OUT)
  const sq = document.createElement("div"); // Use this when clicking colored shapes
  sq.classList.add("square");
  sq.style.backgroundColor = colors[i % colors.length]; // Utilize this line when cycling through colors for shapes when utilizing div shapes

  //Utilize the following 3 lines to randomly select a square image (COMMENTED OUT)
  /*
  const randomImageIndex = Math.floor(Math.random() * squareImages.length);
  sq.setAttribute("src", squareImages[randomImageIndex]); // Changed from sq.src to setAttribute
  sq.alt = "square"; // Accessibility
  */

  sq.style.opacity = "0"; // Start invisible
  sq.style.pointerEvents = "none"; // Start unclickable
  sq.isDying = false; // Add this line in the square creation loop

  // Add click event listeners to squares
  sq.addEventListener("mousedown", (event) => {
    event.stopPropagation();
    handleShapeClick(sq, "square");
  });

  // Add touch support for squares
  sq.addEventListener(
    "touchstart",
    (event) => {
      event.stopPropagation();
      handleShapeClick(sq, "square");
    },
    { passive: true }
  );

  // Optional: Handle touch end to prevent multiple triggers
  sq.addEventListener("touchend", (event) => {
    event.preventDefault();
    event.stopPropagation();
  });

  gameContainer.appendChild(sq);
  squares.push(sq);
}

for (let i = 0; i < numCircles; i++) {
  //console.log(`  Creating circle ${i + 1}/${numCircles}`);

  //Utilize the following 3 lines when using colored shapes
  const c = document.createElement("div");
  c.classList.add("circle"); // CSS will make them round
  c.style.backgroundColor = colors[i % colors.length];

  /*
  //Utilize the following 4 lines when using images that a user clicks (COMMENTED OUT)
  const c = document.createElement("img"); // Changed from div to img
  c.classList.add("circle"); // For CSS labeling
  c.setAttribute("src", circleImage); // Changed from c.src to setAttribute
  c.alt = "circle"; // Accessibility
  */

  c.style.opacity = "0"; // Start invisible
  c.style.pointerEvents = "none"; // Start unclickable
  c.isDying = false; // Add this line in the circle creation loop

  gameContainer.appendChild(c);
  circles.push(c);

  //console.log(`  Circle ${i + 1} created and added to DOM`);

  // Alternative: Use mousedown instead of click for more reliable detection
  c.addEventListener("mousedown", (event) => {
    event.stopPropagation();
    handleShapeClick(c, "circle");
  });

  // Comprehensive touch support for mobile devices
  c.addEventListener(
    "touchstart",
    (event) => {
      event.stopPropagation();
      handleShapeClick(c, "circle");
    },
    { passive: true }
  );

  // Optional: Handle touch end to prevent multiple triggers
  c.addEventListener("touchend", (event) => {
    event.preventDefault();
    event.stopPropagation();
  });
}

// Create triangles
for (let i = 0; i < numTriangles; i++) {
  const tri = document.createElement("div");
  tri.classList.add("triangle"); // CSS will make them triangular
  tri.style.backgroundColor = colors[i % colors.length];
  //tri.style.borderBottomColor = colors[i % colors.length];

  tri.style.opacity = "0"; // Start invisible
  tri.style.pointerEvents = "none"; // Start unclickable
  tri.isDying = false; // Add dying state

  gameContainer.appendChild(tri);
  triangles.push(tri);

  // Add click event listeners to triangles
  tri.addEventListener("mousedown", (event) => {
    event.stopPropagation();
    handleShapeClick(tri, "triangle");
  });

  // Add touch support for triangles
  tri.addEventListener(
    "touchstart",
    (event) => {
      event.stopPropagation();
      handleShapeClick(tri, "triangle");
    },
    { passive: true }
  );

  // Optional: Handle touch end to prevent multiple triggers
  tri.addEventListener("touchend", (event) => {
    event.preventDefault();
    event.stopPropagation();
  });
}

/*
// Create hexagons
for (let i = 0; i < numHexagons; i++) {
  const hex = document.createElement("div");
  hex.classList.add("hexagon"); // CSS will make them hexagonal
  hex.style.backgroundColor = colors[i % colors.length];

  hex.style.opacity = "0"; // Start invisible
  hex.style.pointerEvents = "none"; // Start unclickable
  hex.isDying = false; // Add dying state

  gameContainer.appendChild(hex);
  hexagons.push(hex);

  // Add click event listeners to hexagons
  hex.addEventListener("mousedown", (event) => {
    event.stopPropagation();
    handleShapeClick(hex, "hexagon");
  });

  // Add touch support for hexagons
  hex.addEventListener(
    "touchstart",
    (event) => {
      event.stopPropagation();
      handleShapeClick(hex, "hexagon");
    },
    { passive: true }
  );

  // Optional: Handle touch end to prevent multiple triggers
  hex.addEventListener("touchend", (event) => {
    event.preventDefault();
    event.stopPropagation();
  });
}
*/

/*
// Fixed animation settings
const flightTime = 3000; // total time (ms)
const peakHeightPercent = 80; // % of container height for arc peak
*/

let animationInProgress = false; // track if animation is running
let animationsFinished = 0; // count how many are done

//let circleClickedDuringAnimation = false; // track if any circle was clicked during animation

// Add a counter for correct shapes launched (add this near the top with other variables)
let correctShapesLaunched = 0;

// Add streak counter for consecutive correct clicks (add this near the top with other variables)
let correctClickStreak = 0;

// Add pitch offset variable (add this near the top with other variables)
let pitchOffset = 0; // 0 = original pitch, 1 = one key lower, 2 = two keys lower, etc.

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
  if (
    animationsFinished ===
    //numSquares + numCircles + numTriangles + numHexagons
    numSquares + numCircles + numTriangles
  ) {
    animationInProgress = false;
    startBtn.disabled = false;

    // Check for new high score when round ends
    checkHighScore();

    // Update the display to show high score instead of rule
    updateRuleDisplay();

    console.log("animations completed");
  }
}

// Next three portions of code surround setting, checking, and updating the highscore from local storage
// Add high score functionality at the top of your file
let currentHighScore =
  parseInt(localStorage.getItem("shapegameHighScore")) || 0;

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
    localStorage.setItem("shapegameHighScore", currentHighScore);

    const savedScore = localStorage.getItem("shapegameHighScore");
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
    currentRule = allRules[Math.floor(Math.random() * allRules.length)];
    updateRuleDisplay();
    updateClickCounter();
    clickCounter.style.display = "none"; // Hide counter initially

    // Remove clicked class from all shapes when starting new animation
    circles.forEach((c) => {
      c.classList.remove("clicked");
      c.classList.remove("deadclicked"); // Remove deadclicked class too
      c.isDead = false; // Reset dead state for circles too
      c.isDying = false; // Reset dying state for circles
    });

    // Also remove clicked class from squares and reset dead state
    squares.forEach((sq) => {
      sq.classList.remove("clicked");
      sq.classList.remove("deadclicked"); // Remove deadclicked class too
      sq.isDead = false; // Reset dead state
      sq.isDying = false; // Reset dying state
    });

    // Reset triangles
    triangles.forEach((tri) => {
      tri.classList.remove("clicked");
      tri.classList.remove("deadclicked");
      tri.isDead = false;
      tri.isDying = false;
    });

    /*
    // Reset hexagons
    hexagons.forEach((hex) => {
      hex.classList.remove("clicked");
      hex.classList.remove("deadclicked");
      hex.isDead = false;
      hex.isDying = false;
    });
    */

    // Randomize colors for this round
    const shuffledColors = shuffleArray([...colors]);

    // Update all shapes with new random colors
    squares.forEach((sq, i) => {
      sq.style.backgroundColor = shuffledColors[i % shuffledColors.length];
    });
    circles.forEach((c, i) => {
      c.style.backgroundColor = shuffledColors[i % shuffledColors.length];
    });
    triangles.forEach((tri, i) => {
      tri.style.backgroundColor = shuffledColors[i % shuffledColors.length];
    });

    // Launch all shapes in random order with random timing
    const allShapesToLaunch = [...squares, ...circles, ...triangles];
    shuffleArray(allShapesToLaunch);

    allShapesToLaunch.forEach((shape, index) => {
      // Base timing spread across animationTime, plus some randomness
      const baseDelay = (index * animationTime) / allShapesToLaunch.length;
      const randomOffset = (Math.random() - 0.5) * 1000; // ±500ms randomness
      const finalDelay = Math.max(0, baseDelay + randomOffset);

      setTimeout(() => {
        shape.style.opacity = "0";
        shape.style.pointerEvents = "auto";
        shape.style.transition = "opacity 0.2s ease-in";

        setTimeout(() => {
          shape.style.opacity = "1";
        }, 10);

        // Check if this shape matches the current rule and play whoosh sound every 4th correct shape
        const shapeType = getShapeType(shape);
        const shapeMatchesRule = shapeType === currentRule;
        const colorMatchesRule = getShapeColor(shape) === currentRule;

        if (shapeMatchesRule || colorMatchesRule) {
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

// Function to update the click counter display
function updateClickCounter() {
  if (score > 0) {
    clickCounter.style.display = "block"; // Show counter after first click
    clickCounter.textContent = `${score}`; // This controls click counter actually displaying
  } else {
    clickCounter.style.display = "none"; // Hide counter when score is 0
  }
}

// Simplified sound function - no need for random selection or array
function playWhooshSound() {
  const audio = new Audio("../sounds/whoosh3.wav");
  audio.volume = 0.7;
  audio.play().catch((error) => {
    console.log("Could not play sound:", error);
  });
}

// Initialize high score display when page loads
document.addEventListener("DOMContentLoaded", function () {
  console.log("🌐 PAGE LOADED - Initializing high score system");
  console.log("   Current high score from storage:", currentHighScore);
  updateRuleDisplay(); // Changed from updateHighScoreDisplay to updateRuleDisplay
});

// Add this function near the top with your other functions
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
