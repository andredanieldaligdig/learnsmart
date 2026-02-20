import { useState } from "react";
import { supabase } from "../supabaseClient";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleReset = async () => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "http://localhost:3000/reset-password",
    });

    if (error) setMessage(error.message);
    else setMessage("Check your email for reset link!");
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

        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900">Forgot Password</h1>
          <p className="text-sm text-gray-700/70 mt-2">
            Enter your email to reset your password
          </p>
        </div>

        <div className="space-y-6">
          <div className="relative">
            <input
              type="email"
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="peer w-full bg-white/40 border border-white/50 rounded-xl px-4 pt-6 pb-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-400 placeholder-transparent"
            />
            <label className="absolute left-4 top-2 text-gray-600 text-sm transition-all duration-300 peer-focus:-translate-y-2 peer-focus:scale-90 peer-focus:text-rose-600 peer-not-placeholder-shown:-translate-y-3 peer-not-placeholder-shown:scale-90">
              Email
            </label>
          </div>

          {message && <p className="text-sm text-center text-gray-700">{message}</p>}

          <button
            onClick={handleReset}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-400 to-orange-400 text-white font-semibold shadow-lg hover:opacity-90 transition"
          >
            Send Reset Link
          </button>
        </div>
      </div>
    </div>
  );
}