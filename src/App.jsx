import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";

export default function App() {
  const [user, setUser] = useState(null);

  return (
    <Router>
      {!user ? (
        <Login onLogin={setUser} />
      ) : (
        <Routes>
          <Route path="/*" element={<Dashboard user={user} />} />
        </Routes>
      )}
    </Router>
  );
}
