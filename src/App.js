import React, { useState } from "react";
import HomePage from "./components/HomePage";
import ShapeGame from "./components/ShapeGame";
import MathGame from "./components/MathGame";

function App() {
  const [currentPage, setCurrentPage] = useState("home");

  const renderPage = () => {
    switch (currentPage) {
      case "home":
        return <HomePage onNavigate={setCurrentPage} />;
      case "shapegame":
        return <ShapeGame onNavigate={setCurrentPage} />;
      case "mathgame":
        return <MathGame onNavigate={setCurrentPage} />;
      default:
        return <HomePage onNavigate={setCurrentPage} />;
    }
  };

  return <div className="App">{renderPage()}</div>;
}

export default App;
