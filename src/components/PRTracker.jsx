import React, { useState } from 'react';

function PRTracker() {
  const [prs, setPrs] = useState([]);

  const handleAddPR = (e) => {
    e.preventDefault();
    const date = e.target.date.value;
    const lift = e.target.lift.value;
    const weight = e.target.weight.value;

    setPrs((prevPrs) => [...prevPrs, { date, lift, weight }]);
    e.target.reset();
  };

  const handleDeletePR = (index) => {
    setPrs((prevPrs) => prevPrs.filter((_, i) => i !== index));
  };

  return (
    <div className="pr-tracker">
      <h2>PR Tracker</h2>
      <form onSubmit={handleAddPR}>
        <input type="date" name="date" required />
        <input type="text" name="lift" placeholder="Lift (e.g., Deadlift)" required />
        <input type="number" name="weight" placeholder="Weight (kg)" required />
        <button type="submit">Add PR</button>
      </form>

      <ul>
        {prs.map((pr, index) => (
          <li key={index} className="pr-entry">
            {pr.date}: {pr.lift} - {pr.weight}kg
            <button className="delete-btn" onClick={() => handleDeletePR(index)}>X</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default PRTracker;
