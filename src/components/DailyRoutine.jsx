import React from "react";

const routines = {
  Monday: ["Chest", "Push-ups"],
  Tuesday: ["Back", "Pull-Ups"],
  Wednesday: ["Shoulders", "Abs", "Plank"],
  Thursday: ["Legs", "Squats", "Lunges"],
  Friday: ["Biceps", "Triceps", "Forearms"],
  Saturday:["Full-Body","Abs","Plank"],
};

function DailyRoutine() {
  return (
    <div className="routine">
      <h2>Daily Exercise Routine</h2>
      {Object.keys(routines).map((day) => (
        <div key={day} className="routine-day">
          <h3>{day}</h3>
          <ul>
            {routines[day].map((exercise) => (
              <li key={exercise}>{exercise}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export default DailyRoutine;
