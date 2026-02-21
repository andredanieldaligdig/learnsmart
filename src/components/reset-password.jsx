import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase.js";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.replace("#", ""));

    const access_token = params.get("access_token");

    if (!access_token) {
      setError("Invalid or expired reset link.");
      return;
    }

    // 🔥 Set session using only access_token
    supabase.auth.setSession({ access_token })
      .then(({ error }) => {
        if (error) {
          setError("Session expired. Please request a new reset link.");
        } else {
          setReady(true);
        }
      });
  }, []);

  const handleReset = async () => {
    setError("");
    setMessage("");

    if (!password || !confirmPassword) {
      setError("Fill both fields");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      setMessage("Password updated! Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleReset();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-300 via-rose-300 to-orange-300">
      <div className="w-full max-w-md bg-white/20 backdrop-blur-2xl border border-white/30 rounded-3xl p-8 shadow-lg">
        <h1 className="text-3xl font-bold text-gray-900 text-center mb-4">Reset Password</h1>
        <p className="text-center text-gray-700 mb-6">Enter your new password below</p>

        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
        {message && <p className="text-green-600 text-sm mb-2">{message}</p>}

        {!ready ? (
          <p className="text-center text-gray-700">Validating reset link...</p>
        ) : (
          <div className="space-y-4">
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="New Password"
                className="peer w-full bg-white/40 border border-white/50 rounded-xl px-4 pt-6 pb-2 text-gray-900 placeholder-transparent focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
              <label className="absolute left-4 top-2 text-sm text-gray-600 transition-all peer-focus:-translate-y-3 peer-focus:scale-90 peer-focus:text-orange-600">
                New Password
              </label>
            </div>

            <div className="relative">
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Confirm Password"
                className="peer w-full bg-white/40 border border-white/50 rounded-xl px-4 pt-6 pb-2 text-gray-900 placeholder-transparent focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
              <label className="absolute left-4 top-2 text-sm text-gray-600 transition-all peer-focus:-translate-y-3 peer-focus:scale-90 peer-focus:text-orange-600">
                Confirm Password
              </label>
            </div>

            <button
              onClick={handleReset}
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-400 to-orange-400 text-white font-semibold shadow-lg hover:opacity-90 transition"
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}