import React, { useState } from 'react';

function GoalTracker() {
  const [goals, setGoals] = useState([]);

  const handleAddGoal = (e) => {
    e.preventDefault();
    const goal = e.target.goal.value;
    setGoals((prevGoals) => [...prevGoals, goal]);
    e.target.reset();
  };

  const handleDeleteGoal = (index) => {
    setGoals((prevGoals) => prevGoals.filter((_, i) => i !== index));
  };

  return (
    <div className="goal-tracker">
      <h2>Goal Tracker</h2>
      <form onSubmit={handleAddGoal}>
        <input type="text" name="goal" placeholder="Enter your goal" required />
        <button type="submit">Add Goal</button>
      </form>
      <ul>
        {goals.map((goal, index) => (
          <li key={index} className="goal-entry">
            {goal}
            <button className="delete-btn" onClick={() => handleDeleteGoal(index)}>X</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default GoalTracker;
