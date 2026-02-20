import { useState } from "react";
import { supabase } from "../supabase.js";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleReset = async () => {
    const redirectUrl = `${window.location.origin}/reset-password`;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });

    if (error) setMessage(error.message);
    else setMessage("Check your email for reset link!");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleReset();
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-300 via-rose-300 to-orange-300 animate-gradient" />
        <div className="absolute inset-0 bg-dot-grid opacity-40 animate-grid" />
      </div>

      <div className="relative w-full max-w-md bg-white/20 backdrop-blur-2xl border border-white/30 rounded-3xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 text-center mb-4">Forgot Password</h1>
        <p className="text-center text-gray-700 mb-6">Enter your email to reset your password</p>

        <div className="relative mb-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Email"
            className="peer w-full bg-white/40 border border-white/50 rounded-xl px-4 pt-6 pb-2 text-gray-900 placeholder-transparent focus:outline-none focus:ring-2 focus:ring-rose-400"
          />
          <label className="absolute left-4 top-2 text-gray-600 text-sm transition-all duration-300 peer-focus:-translate-y-2 peer-focus:scale-90 peer-focus:text-rose-600 peer-not-placeholder-shown:-translate-y-3 peer-not-placeholder-shown:scale-90">
            Email
          </label>
        </div>

        {message && <p className="text-sm text-center text-gray-700 mb-4">{message}</p>}

        <button
          onClick={handleReset}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-400 to-orange-400 text-white font-semibold shadow-lg hover:opacity-90 transition"
        >
          Send Reset Link
        </button>
      </div>
    </div>
  );
}