import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/login.jsx";
import Signup from "./components/Signup.jsx";
import ResetPassword from "./components/ResetPassword";
import Dashboard from "./components/Dashboard.jsx";
import Post from "./pages/Post.jsx";
import TrendingTopics from "./pages/TrendingTopics.jsx";
import Saved from "./pages/Saved.jsx";
import Topics from "./pages/Topics.jsx";
import { supabase, logout } from "./supabase.js";

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check session on loaddd
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
        {/* Routes for logged-out users */}
        {!user ? (
          <>
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/login" element={<Login onLogin={setUser} />} />
            <Route path="/signup" element={<Signup />} />

            {/* Password reset route */}
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Catch all redirects to login */}
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