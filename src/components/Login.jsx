import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginAccount, supabase } from "../../supabase.js";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("login");

  const navigate = useNavigate();

  const handleAction = async () => {
    setError("");
    setMessage("");
    setLoading(true);

    try {
      if (mode === "login") {
        if (!email || !password) {
          setError("Please enter email and password");
          return;
        }

        const user = await loginAccount(email, password);
        onLogin(user);
        navigate("/", { state: { postLoginSplash: true } });

      } else if (mode === "forgot") {
        if (!email) {
          setError("Enter your email");
          return;
        }

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
         redirectTo: "https://your-vercel-app.vercel.app/reset-password",
      });

        if (error) throw error;
        setMessage("Check your email for reset link!");

      } else if (mode === "reset") {
        if (!password) {
          setError("Enter new password");
          return;
        }

        const { error } = await supabase.auth.updateUser({
          password: password,
        });

        if (error) throw error;
        setMessage("Password updated! You can now log in.");
        setMode("login");
      }

    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-neutral-950">

      {/* BACKGROUND */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.14),_transparent_32%),linear-gradient(135deg,rgba(10,10,10,1)_0%,rgba(24,24,27,1)_54%,rgba(9,9,11,1)_100%)] animate-gradient" />
        <div className="absolute -top-32 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-white/8 blur-3xl" />
        <div className="absolute -bottom-40 -left-32 h-96 w-96 rounded-full bg-white/6 blur-3xl" />
        <div className="absolute inset-0 bg-dot-grid opacity-20 animate-grid" />
      </div>

      {/* CARD */}
      <div className="relative w-full max-w-md rounded-[32px] border border-white/10 bg-neutral-950/72 p-8 shadow-[0_30px_80px_rgba(0,0,0,0.4)] backdrop-blur-2xl">

        {/* TITLE */}
        <div className="mb-10 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">LearnSmart</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-white">
            {mode === "login" && "LearnSmart"}
            {mode === "forgot" && "Forgot Password"}
            {mode === "reset" && "Reset Password"}
          </h1>
          <p className="mt-2 text-sm text-neutral-400">
            {mode === "login" && "AI chat workspace for focused learning."}
            {mode === "forgot" && "Enter your email to reset password"}
            {mode === "reset" && "Enter your new password"}
          </p>
        </div>

        {/* INPUTS */}
        <div className="space-y-6">

          {/* EMAIL */}
          {mode !== "reset" && (
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAction()}
                placeholder="Email"
                className="peer w-full rounded-[24px] border border-white/10 bg-white/[0.04] px-4 pb-3 pt-6 text-white placeholder-transparent focus:border-white/18 focus:outline-none focus:ring-2 focus:ring-white/12"
              />
              <label className="absolute left-4 top-3 text-sm text-neutral-500 transition-all duration-300 peer-focus:-translate-y-2 peer-focus:scale-90 peer-focus:text-neutral-300 peer-not-placeholder-shown:-translate-y-3 peer-not-placeholder-shown:scale-90">
                Email
              </label>
            </div>
          )}

          {/* PASSWORD */}
          {mode !== "forgot" && (
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAction()}
                placeholder={mode === "reset" ? "New Password" : "Password"}
                className="peer w-full rounded-[24px] border border-white/10 bg-white/[0.04] px-4 pb-3 pt-6 text-white placeholder-transparent focus:border-white/18 focus:outline-none focus:ring-2 focus:ring-white/12"
              />
              <label className="absolute left-4 top-2 text-sm text-neutral-500 transition-all duration-300 peer-focus:-translate-y-1 peer-focus:scale-90 peer-focus:text-neutral-300 peer-not-placeholder-shown:-translate-y-3 peer-not-placeholder-shown:scale-90">
                {mode === "reset" ? "New Password" : "Password"}
              </label>
            </div>
          )}

          {/* ERROR / MESSAGE */}
          {error && <p className="text-red-500 text-sm">{error}</p>}
          {message && <p className="text-emerald-400 text-sm">{message}</p>}

          {/* BUTTON */}
          <button
            onClick={handleAction}
            disabled={loading}
            className="w-full rounded-[24px] border border-white/12 bg-white py-3 font-semibold text-black transition hover:bg-neutral-200 disabled:opacity-60"
          >
            {loading
              ? "Processing..."
              : mode === "login"
              ? "Continue"
              : mode === "forgot"
              ? "Send Reset Link"
              : "Update Password"}
          </button>
      </div>

      {/* LINKS */}
      <div className="mt-4 text-center text-sm text-neutral-400">

          {mode === "login" && (
            <>
              <p
                className="cursor-pointer text-neutral-200 transition hover:text-white"
                onClick={() => setMode("forgot")}
              >
                Forgot Password?
              </p>

              <p className="mt-2">
                Don't have an account?{" "}
                <span
                  className="cursor-pointer text-neutral-200 transition hover:text-white"
                  onClick={() => navigate("/signup")}
                >
                  Sign Up
                </span>
              </p>
            </>
          )}

          {mode !== "login" && (
            <p
              className="cursor-pointer text-neutral-200 transition hover:text-white"
              onClick={() => setMode("login")}
            >
              Back to Login
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
