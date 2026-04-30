import React, { useState } from "react";

const SearchBar = () => {
  const [query, setQuery] = useState("");

  const handleSearch = () => {
    alert(`Searching for "${query}" ...`);
  };

  return (
    <div className="flex justify-center my-6">
      <input
        className="w-2/3 p-3 bg-slate-800/60 border border-slate-700/60 text-slate-100 placeholder-slate-400 rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-400"
        placeholder="Looking for something?"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button
        className="bg-blue-500 text-white p-3 rounded-r shadow-lg shadow-blue-500/20 hover:bg-blue-600 transition"
        onClick={handleSearch}
      >
        Search
      </button>
    </div>
  );
};

export default SearchBar;
