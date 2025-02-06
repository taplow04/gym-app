import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from "react-router-dom";
import DailyRoutine from "./components/DailyRoutine";
import ExerciseLog from "./components/ExerciseLog";
import PRTracker from "./components/PRTracker";
import GoalTracker from "./components/GoalTracker";
import Register from "./components/Register";
import "./App.css";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false); // To manage authentication state
  const [userData, setUserData] = useState(null); // Store user-specific data

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserData(null);
    localStorage.removeItem("token"); // Clear token or session storage
  };

  return (
    <div className="app">
      <Router>
        <header>
          <h1>Gym Management</h1>
          <nav>
            <Link to="/">Daily Routine</Link>
            <Link to="/log">Exercise Log</Link>
            <Link to="/pr">PR Tracker</Link>
            <Link to="/goals">Goal Tracker</Link>
            {!isLoggedIn && <Link to="/register">Register/Login</Link>}
            {isLoggedIn && <button onClick={handleLogout}>Logout</button>}
          </nav>
        </header>

        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<DailyRoutine />} />
          <Route path="/log" element={<ExerciseLog />} />
          <Route path="/pr" element={<PRTracker />} />
          <Route path="/goals" element={<GoalTracker />} />

          {/* Registration/Login Route */}
          <Route
            path="/register"
            element={
              isLoggedIn ? (
                <Navigate to="/" />
              ) : (
                <Register
                  onLoginSuccess={(userData) => {
                    setIsLoggedIn(true);
                    setUserData(userData);
                  }}
                />
              )
            }
          />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
