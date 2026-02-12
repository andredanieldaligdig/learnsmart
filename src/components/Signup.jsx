import { useState } from "react";
import { createAccount } from "../supabase.js"; // adjust path if needed
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!email || !password || !dob || !gender)
      return setError("Please fill in all fields");
    setError("");
    setLoading(true);

    try {
      const user = await createAccount(email, password);
      // Here you can optionally store dob and gender in your user profile table
      navigate("/login");
    } catch (err) {
      console.error(err);
      setError(err.message || "Sign up failed");
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

      {/* ===== SIGNUP CARD ===== */}
      <div className="relative w-full max-w-md bg-white/20 backdrop-blur-2xl border border-white/30 rounded-3xl shadow-[0_30px_80px_rgba(0,0,0,0.25)] p-8">

        {/* Title */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            LearnSmart
          </h1>
          <p className="text-sm text-gray-700/70 mt-2">
            Create your account
          </p>
        </div>

        {/* Inputs */}
        <div className="space-y-6">

          {/* Email */}
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
              peer-focus:-translate-y-1 peer-focus:scale-90 peer-focus:text-rose-600
              peer-not-placeholder-shown:-translate-y-3 peer-not-placeholder-shown:scale-90
            ">
              Email
            </label>
          </div>

          {/* Password */}
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
              peer-focus:-translate-y-1 peer-focus:scale-90 peer-focus:text-orange-600
              peer-not-placeholder-shown:-translate-y-3 peer-not-placeholder-shown:scale-90
            ">
              Password
            </label>
          </div>

          {/* Date of Birth */}
          <div className="relative">
            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              placeholder="Date of Birth"
              className="peer w-full bg-white/40 border border-white/50 rounded-xl px-4 pt-6 pb-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-400 placeholder-transparent"
            />
            <label className="
              absolute left-4 top-2 text-gray-600 text-xs
              transition-all duration-300
              peer-focus:-translate-y-1 peer-focus:scale-90 peer-focus:text-rose-600
              peer-not-placeholder-shown:-translate-y-3 peer-not-placeholder-shown:scale-90
            ">
              Date of Birth
            </label>
          </div>

          {/* Gender */}
          <div className="relative">
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="peer w-full bg-white/40 border border-white/50 rounded-xl px-4 pt-6 pb-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-400 appearance-none"
            >
              <option value="" hidden></option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
            <label className="
               absolute left-4 top-2 text-gray-600 text-xs
               transition-all duration-300
               peer-focus:-translate-y-1 peer-focus:scale-90 peer-focus:text-orange-600
               peer-not-placeholder-shown:-translate-y-4 peer-not-placeholder-shown:scale-90
            ">
              Gender
            </label>
          </div>

          {/* Error */}
          {error && <p className="text-red-500 text-sm">{error}</p>}

          {/* Continue button */}
          <button
            onClick={handleSignUp}
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-400 to-orange-400 text-white font-semibold shadow-lg hover:opacity-90 transition"
          >
            {loading ? "Signing up..." : "Continue"}
          </button>

          {/* Already have account */}
          <p className="mt-4 text-sm text-gray-500 text-center">
            Already have an account?{" "}
            <span
              className="text-blue-500 cursor-pointer"
              onClick={() => navigate("/login")}
            >
              Sign In
            </span>
          </p>

        </div>
      </div>

      {/* Cats */}
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

      {/* Animations */}
      <style>{`
        .bg-dot-grid {
          background-image: radial-gradient(rgba(255,255,255,0.45) 1px, transparent 1px);
          background-size: 26px 26px;
        }
        @keyframes grid-float {0%{transform:translate(0,0);}50%{transform:translate(-12px,-12px);}100%{transform:translate(0,0);}}
        .animate-grid {animation:grid-float 40s ease-in-out infinite;}
        @keyframes gradient {0%{background-position:0% 50%;}50%{background-position:100% 50%;}100%{background-position:0 50%;}}
        .animate-gradient {background-size:200% 200%;animation:gradient 18s ease infinite;}
        @keyframes cat-left {0%{transform:translateX(0);}50%{transform:translateX(20px);}100%{transform:translateX(0);}}
        .animate-cat-left {animation:cat-left 6s ease-in-out infinite;}
        @keyframes cat-right {0%{transform:translateX(0);}50%{transform:translateX(-20px);}100%{transform:translateX(0);}}
        .animate-cat-right {animation:cat-right 7s ease-in-out infinite;}
      `}</style>
    </div>
  );
}
