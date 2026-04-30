import { useEffect, useRef, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import Login from "./components/Login.jsx";
import Signup from "./components/Signup.jsx";
import ForgotPassword from "./components/forgot-password.jsx";
import ResetPassword from "./components/reset-password.jsx";
import Dashboard from "./components/Dashboard.jsx";
import { supabase, logout } from "../supabase.js";
import PostLoginSplash from "./components/PostLoginSplash.jsx";

function DashboardGate({ user, onLogout, initialView }) {
  const location = useLocation();
  const navigate = useNavigate();
  const shouldShowSplash = Boolean(location.state?.postLoginSplash);
  const [showSplash, setShowSplash] = useState(shouldShowSplash);
  const hasClearedRef = useRef(false);

  useEffect(() => {
    if (!shouldShowSplash) return;
    const t = setTimeout(() => setShowSplash(false), 1200);
    return () => clearTimeout(t);
  }, [shouldShowSplash]);

  useEffect(() => {
    if (!shouldShowSplash) return;
    if (showSplash) return;
    if (hasClearedRef.current) return;
    hasClearedRef.current = true;
    // Clear splash state so refresh/back doesn't replay it.
    navigate(location.pathname + location.search, { replace: true, state: {} });
  }, [location.pathname, location.search, navigate, shouldShowSplash, showSplash]);

  if (showSplash) return <PostLoginSplash />;
  return <Dashboard user={user} onLogout={onLogout} initialView={initialView} />;
}

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // get session on load
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user || null);
      setLoading(false);
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

  return loading ? (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-neutral-950">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.14),_transparent_32%),linear-gradient(135deg,rgba(10,10,10,1)_0%,rgba(24,24,27,1)_54%,rgba(9,9,11,1)_100%)] animate-gradient" />
        <div className="absolute -top-32 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-white/8 blur-3xl" />
        <div className="absolute -bottom-40 -left-32 h-96 w-96 rounded-full bg-white/6 blur-3xl" />
        <div className="absolute inset-0 bg-dot-grid opacity-20 animate-grid" />
      </div>
      <p className="text-lg text-neutral-200">Loading LearnSmart...</p>
    </div>
  ) : (
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
            <Route path="/" element={<DashboardGate user={user} onLogout={handleLogout} />} />
            {/* Backward-compatible routes: map old pages into the new dashboard views. */}
            <Route path="/post" element={<DashboardGate user={user} onLogout={handleLogout} initialView="discussions" />} />
            <Route
              path="/trending-topics"
              element={<DashboardGate user={user} onLogout={handleLogout} initialView="discussions" />}
            />
            <Route path="/saved" element={<DashboardGate user={user} onLogout={handleLogout} initialView="my_space" />} />
            <Route path="/topics" element={<DashboardGate user={user} onLogout={handleLogout} initialView="discussions" />} />
            <Route path="*" element={<Navigate to="/" />} />
          </>
        )}
      </Routes>
    </Router>
  );
}
