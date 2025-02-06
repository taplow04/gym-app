import React, { useState } from 'react';

function ExerciseLog() {
  const [log, setLog] = useState({ Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [] , Saturday:[], });
  const [exercise, setExercise] = useState('');
  const [day, setDay] = useState('Monday');

  const handleAddExercise = () => {
    setLog((prevLog) => ({
      ...prevLog,
      [day]: [...prevLog[day], exercise],
    }));
    setExercise('');
  };

  const handleDeleteExercise = (day, index) => {
    setLog((prevLog) => ({
      ...prevLog,
      [day]: prevLog[day].filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="exercise-log">
      <h2>Exercise Log</h2>
      <select onChange={(e) => setDay(e.target.value)} value={day}>
        {Object.keys(log).map((d) => (
          <option key={d} value={d}>
            {d}
          </option>
        ))}
      </select>
      <input
        type="text"
        placeholder="Enter exercise"
        value={exercise}
        onChange={(e) => setExercise(e.target.value)}
      />
      <button onClick={handleAddExercise}>Add Exercise</button>

      <div className="log-list">
        {Object.keys(log).map((day) => (
          <div key={day}>
            <h3>{day}</h3>
            <ul>
              {log[day].map((ex, index) => (
                <li key={index} className="log-entry">
                  {ex}
                  <button className="delete-btn" onClick={() => handleDeleteExercise(day, index)}>X</button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ExerciseLog;
