import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/login";
import Signup from "./components/Signup";
import Dashboard from "./components/Dashboard";
import Post from "./pages/Post";
import TrendingTopics from "./pages/TrendingTopics";
import Saved from "./pages/Saved";
import Topics from "./pages/Topics";
import { supabase, logout } from "./supabase.js";

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check session on load
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setUser(data.session.user);
    });

    // Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await logout();
    setUser(null);
  };

  return (
    <Router>
      <Routes>
        {!user ? (
          <>
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/login" element={<Login onLogin={setUser} />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </>
        ) : (
          <>
            {/* Dashboard main route */}
            <Route path="/" element={<Dashboard user={user} onLogout={handleLogout} />} />

            {/* Pages accessible from Sidebar */}
            <Route path="/post" element={<Post user={user} />} />
            <Route path="/trending-topics" element={<TrendingTopics user={user} />} />
            <Route path="/saved" element={<Saved user={user} />} />
            <Route path="/topics" element={<Topics user={user} />} />

            <Route path="*" element={<Navigate to="/" />} />
          </>
        )}
      </Routes>
    </Router>
  );
}
