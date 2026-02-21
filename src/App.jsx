import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login.jsx";
import Signup from "./components/Signup.jsx";
import ForgotPassword from "./components/forgot-password.jsx";
import ResetPassword from "./components/reset-password.jsx";
import Dashboard from "./components/Dashboard.jsx";
import Post from "./pages/Post.jsx";
import TrendingTopics from "./pages/TrendingTopics.jsx";
import Saved from "./pages/Saved.jsx";
import Topics from "./pages/Topics.jsx";
import { supabase, logout } from "./supabase.js";

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // get session on load
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user || null);
    });

    // listen to auth changes
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
        {/* ✅ ALWAYS ACCESSIBLE */}
        <Route path="/login" element={<Login onLogin={setUser} />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* ✅ CONDITIONAL */}
        {!user ? (
          <>
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </>
        ) : (
          <>
            <Route path="/" element={<Dashboard user={user} onLogout={handleLogout} />} />
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