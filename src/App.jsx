import { useEffect, useRef, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import Login from "./components/Login.jsx";
import Signup from "./components/Signup.jsx";
import ForgotPassword from "./components/forgot-password.jsx";
import ResetPassword from "./components/reset-password.jsx";
import Dashboard from "./components/Dashboard.jsx";
import { DASHBOARD_VIEWS } from "./components/dashboard/dashboardConfig.js";
import { supabase, supabaseConfigError, logout } from "../supabase.js";
import PostLoginSplash from "./components/PostLoginSplash.jsx";

const DASHBOARD_VIEW_STORAGE_KEY = "learnsmart-dashboard-view";

function DashboardGate({ user, onLogout, initialView }) {
  const location = useLocation();
  const navigate = useNavigate();
  const shouldShowSplash = Boolean(location.state?.postLoginSplash);
  const resolvedInitialView = location.state?.initialView || initialView;
  const [showSplash, setShowSplash] = useState(shouldShowSplash);
  const hasClearedRef = useRef(false);

  useEffect(() => {
    if (!shouldShowSplash) return;
    const t = setTimeout(() => setShowSplash(false), 1850);
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
  return <Dashboard user={user} onLogout={onLogout} initialView={resolvedInitialView} />;
}

function SkeletonBlock({ className = "" }) {
  return <div className={`animate-pulse rounded-2xl bg-white/[0.08] ${className}`.trim()} />;
}

function AuthPageSkeleton() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-neutral-950 px-4">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.14),_transparent_32%),linear-gradient(135deg,rgba(10,10,10,1)_0%,rgba(24,24,27,1)_54%,rgba(9,9,11,1)_100%)] animate-gradient" />
        <div className="absolute -top-32 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-white/8 blur-3xl" />
        <div className="absolute -bottom-40 -left-32 h-96 w-96 rounded-full bg-white/6 blur-3xl" />
        <div className="absolute inset-0 bg-dot-grid opacity-20 animate-grid" />
      </div>

      <div className="w-full max-w-md rounded-[32px] border border-white/10 bg-neutral-950/72 p-8 shadow-[0_30px_80px_rgba(0,0,0,0.4)] backdrop-blur-2xl">
        <SkeletonBlock className="h-3 w-24 rounded-full" />
        <SkeletonBlock className="mt-6 h-8 w-40" />
        <SkeletonBlock className="mt-3 h-4 w-52" />
        <div className="mt-10 space-y-5">
          <SkeletonBlock className="h-14 w-full rounded-[24px]" />
          <SkeletonBlock className="h-14 w-full rounded-[24px]" />
          <SkeletonBlock className="h-12 w-full rounded-[24px]" />
        </div>
      </div>
    </div>
  );
}

function DeploymentErrorScreen() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-neutral-950 px-4 text-neutral-100">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.12),_transparent_32%),linear-gradient(135deg,rgba(10,10,10,1)_0%,rgba(24,24,27,1)_54%,rgba(9,9,11,1)_100%)]" />
        <div className="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-white/8 blur-3xl" />
      </div>

      <div className="w-full max-w-xl rounded-[32px] border border-white/10 bg-neutral-950/80 p-8 shadow-[0_30px_80px_rgba(0,0,0,0.42)] backdrop-blur-2xl">
        <div className="text-[11px] uppercase tracking-[0.28em] text-white/35">Deployment Error</div>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white">This Vercel build is missing environment variables.</h1>
        <p className="mt-4 text-sm leading-7 text-neutral-300">
          Add these in Vercel Project Settings under Environment Variables, then redeploy the project.
        </p>
        <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4 font-mono text-sm text-neutral-200">
          <div>VITE_SUPABASE_URL</div>
          <div>VITE_SUPABASE_ANON_KEY</div>
          <div>OPENROUTER_API_KEY</div>
          <div>OPENROUTER_MODEL</div>
          <div>PUBLIC_APP_URL</div>
        </div>
        <p className="mt-4 text-xs leading-6 text-neutral-500">
          Root directory should be <span className="font-mono text-neutral-300">frontend</span>. Current startup error: {supabaseConfigError || "unknown"}.
        </p>
      </div>
    </div>
  );
}

function DashboardPageSkeleton({ view }) {
  const isMySpace = view === DASHBOARD_VIEWS.MY_SPACE;
  const isDiscussion = view === DASHBOARD_VIEWS.DISCUSSIONS;

  return (
    <div className="relative min-h-screen overflow-hidden bg-neutral-950 text-neutral-100">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.14),_transparent_32%),linear-gradient(135deg,rgba(10,10,10,1)_0%,rgba(24,24,27,1)_54%,rgba(9,9,11,1)_100%)]" />
        <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-white/8 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-white/6 blur-3xl" />
        <div className="absolute inset-0 bg-dot-grid opacity-20 animate-grid" />
      </div>

      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-white/10 bg-neutral-900/96 px-4 py-4 shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:flex sm:flex-col">
        <SkeletonBlock className="h-3 w-20 rounded-full" />
        <SkeletonBlock className="mt-2 h-5 w-16" />
        <div className="mt-6 space-y-2">
          <SkeletonBlock className="h-12 w-full" />
          <SkeletonBlock className="h-12 w-full" />
          <SkeletonBlock className="h-12 w-full" />
        </div>
        <div className="mt-8 space-y-2">
          <SkeletonBlock className="h-4 w-24 rounded-full" />
          <SkeletonBlock className="h-10 w-full" />
          <SkeletonBlock className="h-10 w-full" />
        </div>
        <div className="mt-auto">
          <SkeletonBlock className="h-20 w-full" />
        </div>
      </aside>

      <button
        type="button"
        className="fixed left-4 top-4 z-40 flex h-10 w-10 items-center justify-center rounded-lg bg-white/[0.06] text-neutral-300 sm:hidden"
        aria-hidden="true"
      />

      <div className="relative flex min-h-screen flex-col">
        <header className="sticky top-0 z-20 bg-neutral-950/85 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-end px-16 py-3 sm:px-20">
            <div className="flex items-center gap-3">
              {isMySpace ? <SkeletonBlock className="h-11 w-36 rounded-2xl" /> : null}
              <SkeletonBlock className="h-11 w-11 rounded-2xl" />
              <SkeletonBlock className="h-3 w-24 rounded-full" />
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 pb-4 pt-2 sm:px-6">
          <div
            className={[
              "mx-auto w-full",
              isMySpace ? "max-w-6xl" : isDiscussion ? "max-w-6xl" : "max-w-6xl",
            ].join(" ")}
          >
            {isMySpace ? (
              <div className="grid gap-5 xl:grid-cols-[320px,minmax(0,1fr)]">
                <div className="space-y-4">
                  <SkeletonBlock className="h-44 w-full rounded-[28px]" />
                  <SkeletonBlock className="h-52 w-full rounded-[28px]" />
                </div>
                <div className="space-y-4">
                  <SkeletonBlock className="h-64 w-full rounded-[28px]" />
                  <SkeletonBlock className="h-48 w-full rounded-[28px]" />
                  <SkeletonBlock className="h-56 w-full rounded-[28px]" />
                </div>
              </div>
            ) : isDiscussion ? (
              <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr),300px]">
                <div className="space-y-4">
                  <SkeletonBlock className="h-72 w-full rounded-[28px]" />
                  <SkeletonBlock className="h-72 w-full rounded-[28px]" />
                </div>
                <SkeletonBlock className="h-80 w-full rounded-[28px]" />
              </div>
            ) : (
              <div className="space-y-4">
                <SkeletonBlock className="h-20 w-full rounded-[28px]" />
                <SkeletonBlock className="h-[calc(100vh-220px)] w-full rounded-[32px]" />
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

function LoadingScreen() {
  if (typeof window === "undefined") {
    return <AuthPageSkeleton />;
  }

  const pathname = window.location.pathname;
  const storedView = window.localStorage.getItem(DASHBOARD_VIEW_STORAGE_KEY);

  if (pathname === "/login" || pathname === "/signup" || pathname === "/forgot-password" || pathname === "/reset-password") {
    return <AuthPageSkeleton />;
  }

  if (pathname === "/saved") {
    return <DashboardPageSkeleton view={DASHBOARD_VIEWS.MY_SPACE} />;
  }

  if (pathname === "/post" || pathname === "/topics" || pathname === "/trending-topics") {
    return <DashboardPageSkeleton view={DASHBOARD_VIEWS.DISCUSSIONS} />;
  }

  return <DashboardPageSkeleton view={storedView || DASHBOARD_VIEWS.NEW_CHAT} />;
}

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (supabaseConfigError || !supabase) {
      setLoading(false);
      return;
    }

    let active = true;

    async function bootstrapSession() {
      const [{ data }] = await Promise.all([
        supabase.auth.getSession(),
        new Promise((resolve) => window.setTimeout(resolve, 450)),
      ]);

      if (!active) return;
      setUser(data.session?.user || null);
      setLoading(false);
    }

    bootstrapSession();

    // listen to auth changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    setUser(null);
  };

  if (supabaseConfigError || !supabase) {
    return <DeploymentErrorScreen />;
  }

  return loading ? (
    <LoadingScreen />
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
            <Route
              path="/"
              element={
                <DashboardGate
                  user={user}
                  onLogout={handleLogout}
                />
              }
            />
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
