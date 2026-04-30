// src/pages/Topics.jsx
import { useState } from "react";

export default function Topics() {
  const [topics] = useState([
    "Math",
    "Science",
    "History",
    "Programming",
    "English",
  ]);

  const handleClick = (topic) => {
    alert(`You clicked ${topic} topic!`);
    // In real app: navigate to posts filtered by topic
  };

  return (
    <div className="flex-1 p-6 max-w-3xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-slate-100 mb-4">
        Topics
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {topics.map((t, i) => (
          <button
            key={i}
            onClick={() => handleClick(t)}
            className="bg-slate-800/60 backdrop-blur rounded-xl px-4 py-3 font-semibold text-slate-100 border border-slate-700/60 hover:bg-slate-700/50 transition shadow"
          >
            {t}
          </button>
        ))}
      </div>
    </div>
  );
}
