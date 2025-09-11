# Flying Shapes - React Version

A web-based game featuring flying shapes with multiple game modes, now built with React!

## Features

- **Shape Game**: Click on the correct shapes based on changing rules (shape type or color)
- **Math Game**: Solve math problems by clicking on the correct numbers
- **High Score Tracking**: Persistent high scores using localStorage
- **Sound Effects**: Audio feedback for correct and incorrect clicks
- **Responsive Design**: Works on desktop and mobile devices

## Technologies Used

- **React 18** - Component-based UI library
- **JavaScript (ES6+)** - Modern JavaScript features
- **HTML5** - Semantic markup
- **CSS3** - Styling and animations
- **Web Audio API** - Sound effects

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/28isaac-elcoder/flying-shapes.git
   cd flying-shapes
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm start
   ```

4. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### Building for Production

To create a production build:

```bash
npm run build
```

This builds the app for production to the `build` folder.

## Project Structure

```
src/
├── components/
│   ├── HomePage.js      # Main landing page component
│   ├── ShapeGame.js     # Shape game component
│   └── MathGame.js      # Math game component
├── App.js               # Main app component with routing
└── index.js             # React entry point

public/
└── index.html           # HTML template

styles/
└── styles.css           # Global styles

sounds/                  # Audio files for game effects
images/                  # Game assets
```

## Game Modes

### Shape Game

- Click on shapes that match the current rule
- Rules change between shape types (square, circle, triangle) and colors
- Score increases with each correct click
- Game lasts 18 seconds

### Math Game

- Click on numbers that solve the displayed equation
- Equations change dynamically
- Numbers appear as flying boxes
- Score increases with each correct answer

## Development

### Available Scripts

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run eject` - Ejects from Create React App (one-way operation)

### Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Author

28isaac-elcoder (28isaac.edwards@gmail.com)
