import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginAccount, supabase } from "../supabase.js";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("login"); // login | forgot | reset

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

      } else if (mode === "forgot") {
        if (!email) {
          setError("Enter your email");
          return;
        }

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: "http://localhost:3000/login",
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
    <div className="relative min-h-screen overflow-hidden flex items-center justify-center">

      {/* BACKGROUND */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-300 via-rose-300 to-orange-300 animate-gradient" />
        <div className="absolute inset-0 bg-dot-grid opacity-40 animate-grid" />
      </div>

      {/* CARD */}
      <div className="relative w-full max-w-md bg-white/20 backdrop-blur-2xl border border-white/30 rounded-3xl shadow-[0_30px_80px_rgba(0,0,0,0.25)] p-8">

        {/* TITLE */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            {mode === "login" && "LearnSmart"}
            {mode === "forgot" && "Forgot Password"}
            {mode === "reset" && "Reset Password"}
          </h1>
          <p className="text-sm text-gray-700/70 mt-2">
            {mode === "login" && "Smart study. Elevated."}
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
                placeholder="Email"
                className="peer w-full bg-white/40 border border-white/50 rounded-xl px-4 pt-6 pb-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-400 placeholder-transparent"
              />
              <label className="absolute left-4 top-2 text-gray-600 text-sm transition-all duration-300 peer-focus:-translate-y-2 peer-focus:scale-90 peer-focus:text-rose-600 peer-not-placeholder-shown:-translate-y-3 peer-not-placeholder-shown:scale-90">
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
                placeholder={mode === "reset" ? "New Password" : "Password"}
                className="peer w-full bg-white/40 border border-white/50 rounded-xl px-4 pt-6 pb-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-400 placeholder-transparent"
              />
              <label className="absolute left-4 top-2 text-gray-600 text-sm transition-all duration-300 peer-focus:-translate-y-3 peer-focus:scale-90 peer-focus:text-orange-600 peer-not-placeholder-shown:-translate-y-3 peer-not-placeholder-shown:scale-90">
                {mode === "reset" ? "New Password" : "Password"}
              </label>
            </div>
          )}

          {/* ERROR / MESSAGE */}
          {error && <p className="text-red-500 text-sm">{error}</p>}
          {message && <p className="text-green-600 text-sm">{message}</p>}

          {/* BUTTON */}
          <button
            onClick={handleAction}
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-400 to-orange-400 text-white font-semibold shadow-lg hover:opacity-90 transition"
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
        <div className="mt-4 text-center text-sm text-gray-500">

          {mode === "login" && (
            <>
              <p
                className="text-blue-500 cursor-pointer"
                onClick={() => setMode("forgot")}
              >
                Forgot Password?
              </p>

              <p className="mt-2">
                Don't have an account?{" "}
                <span
                  className="text-blue-500 cursor-pointer"
                  onClick={() => navigate("/signup")}
                >
                  Sign Up
                </span>
              </p>
            </>
          )}

          {mode !== "login" && (
            <p
              className="text-blue-500 cursor-pointer"
              onClick={() => setMode("login")}
            >
              Back to Login
            </p>
          )}
        </div>
      </div>

      {/* CATS */}
      <img
        src="https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif"
        alt="cat"
        className="absolute bottom-4 left-6 w-24 animate-cat-left"
      />
      <img
        src="https://media.giphy.com/media/mlvseq9yvZhba/giphy.gif"
        alt="cat"
        className="absolute bottom-6 right-6 w-24 animate-cat-right"
      />

      {/* ANIMATIONS */}
      <style>{`
        .bg-dot-grid {
          background-image: radial-gradient(
            rgba(255,255,255,0.45) 1px,
            transparent 1px
          );
          background-size: 26px 26px;
        }

        @keyframes grid-float {
          0% { transform: translate(0,0); }
          50% { transform: translate(-12px,-12px); }
          100% { transform: translate(0,0); }
        }

        .animate-grid {
          animation: grid-float 40s ease-in-out infinite;
        }

        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0 50%; }
        }

        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 18s ease infinite;
        }

        @keyframes cat-left {
          0% { transform: translateX(0); }
          50% { transform: translateX(20px); }
          100% { transform: translateX(0); }
        }

        .animate-cat-left {
          animation: cat-left 6s ease-in-out infinite;
        }

        @keyframes cat-right {
          0% { transform: translateX(0); }
          50% { transform: translateX(-20px); }
          100% { transform: translateX(0); }
        }

        .animate-cat-right {
          animation: cat-right 7s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}