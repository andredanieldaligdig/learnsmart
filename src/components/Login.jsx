import { useState } from "react";
import { useNavigate } from "react-router-dom"; // ← add this
import { loginAccount } from "../supabase.js"; // adjust path if needed

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate(); // ← initialize navigate

  const handleLogin = async () => {
    if (!email || !password) return setError("Please enter email and password");
    setError("");
    setLoading(true);

    try {
      // --- Supabase Auth login ---
      const user = await loginAccount(email, password);

      // Pass logged-in user to parent
      onLogin(user);
    } catch (err) {
      console.error(err);
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden flex items-center justify-center">

      {/* ===== BACKGROUND ===== */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-300 via-rose-300 to-orange-300 animate-gradient" />
        <div className="absolute inset-0 bg-dot-grid opacity-40 animate-grid" />
      </div>

      {/* ===== LOGIN CARD ===== */}
      <div className="relative w-full max-w-md bg-white/20 backdrop-blur-2xl border border-white/30 rounded-3xl shadow-[0_30px_80px_rgba(0,0,0,0.25)] p-8">

        {/* Title */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            LearnSmart
          </h1>
          <p className="text-sm text-gray-700/70 mt-2">
            Smart study. Elevated.
          </p>
        </div>

        {/* Inputs */}
        <div className="space-y-6">
          <div className="relative">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="peer w-full bg-white/40 border border-white/50 rounded-xl px-4 pt-6 pb-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-400 placeholder-transparent"
            />
            <label className="
              absolute left-4 top-2 text-gray-600 text-sm
              transition-all duration-300
              peer-focus:-translate-y-2 peer-focus:scale-90 peer-focus:text-rose-600
              peer-not-placeholder-shown:-translate-y-3 peer-not-placeholder-shown:scale-90
            ">
              Email
            </label>
          </div>

          <div className="relative">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="peer w-full bg-white/40 border border-white/50 rounded-xl px-4 pt-6 pb-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-400 placeholder-transparent"
            />
            <label className="
              absolute left-4 top-2 text-gray-600 text-sm
              transition-all duration-300
              peer-focus:-translate-y-3 peer-focus:scale-90 peer-focus:text-orange-600
              peer-not-placeholder-shown:-translate-y-3 peer-not-placeholder-shown:scale-90
            ">
              Password
            </label>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          {/* Continue button */}
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-400 to-orange-400 text-white font-semibold shadow-lg hover:opacity-90 transition"
          >
            {loading ? "Logging in..." : "Continue"}
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-grow h-px bg-white/40" />
          <span className="px-3 text-xs text-gray-600">OR</span>
          <div className="flex-grow h-px bg-white/40" />
        </div>

        {/* Sign Up Link */}
        <p className="mt-4 text-sm text-gray-500 text-center">
          Don't have an account?{" "}
          <span
            className="text-blue-500 cursor-pointer"
            onClick={() => navigate("/signup")}
          >
            Sign Up
          </span>
        </p>
      </div>

      {/* ===== CATS ===== */}
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

      {/* ===== INLINE ANIMATIONS ===== */}
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

        @keyframes cat-right {
          0% { transform: translateX(0); }
          50% { transform: translateX(-20px); }
          100% { transform: translateX(0); }
        }

        .animate-cat-left {
          animation: cat-left 6s ease-in-out infinite;
        }

        .animate-cat-right {
          animation: cat-right 7s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
    