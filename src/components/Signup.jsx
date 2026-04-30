import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createAccount } from "../../supabase.js";

export default function Signup() {
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!displayName || !email || !password || !gender) {
      setError("Please fill in all fields");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await createAccount(email, password, displayName.trim(), gender, dob);
      navigate("/login");
    } catch (err) {
      console.error(err);
      setError(err.message || "Sign up failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-neutral-950 px-4">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.14),_transparent_32%),linear-gradient(135deg,rgba(10,10,10,1)_0%,rgba(24,24,27,1)_54%,rgba(9,9,11,1)_100%)] animate-gradient" />
        <div className="absolute -top-32 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-white/8 blur-3xl" />
        <div className="absolute -bottom-40 -left-32 h-96 w-96 rounded-full bg-white/6 blur-3xl" />
        <div className="absolute inset-0 bg-dot-grid opacity-20 animate-grid" />
      </div>

      <div className="relative w-full max-w-md rounded-[32px] border border-white/10 bg-neutral-950/72 p-8 shadow-[0_30px_80px_rgba(0,0,0,0.4)] backdrop-blur-2xl">
        <div className="mb-8 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">LearnSmart</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-white">Create account</h1>
          <p className="mt-2 text-sm text-neutral-400">Use your name so LearnSmart can greet you properly.</p>
        </div>

        <div className="space-y-4">
          <input
            type="text"
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            placeholder="Name"
            className="w-full rounded-[24px] border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none placeholder:text-neutral-500"
          />
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Email"
            className="w-full rounded-[24px] border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none placeholder:text-neutral-500"
          />
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Password"
            className="w-full rounded-[24px] border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none placeholder:text-neutral-500"
          />
          <input
            type="date"
            value={dob}
            onChange={(event) => setDob(event.target.value)}
            className="w-full rounded-[24px] border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none"
          />
          <select
            value={gender}
            onChange={(event) => setGender(event.target.value)}
            className="w-full rounded-[24px] border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none"
          >
            <option value="" className="bg-neutral-900 text-neutral-400">
              Gender
            </option>
            <option value="male" className="bg-neutral-900">
              Male
            </option>
            <option value="female" className="bg-neutral-900">
              Female
            </option>
            <option value="other" className="bg-neutral-900">
              Other
            </option>
          </select>

          {error ? <p className="text-sm text-red-400">{error}</p> : null}

          <button
            onClick={handleSignUp}
            disabled={loading}
            className="w-full rounded-[24px] border border-white/12 bg-white py-3 font-semibold text-black transition hover:bg-neutral-200 disabled:opacity-60"
          >
            {loading ? "Signing up..." : "Continue"}
          </button>

          <p className="text-center text-sm text-neutral-400">
            Already have an account?{" "}
            <span
              className="cursor-pointer text-neutral-200 transition hover:text-white"
              onClick={() => navigate("/login")}
            >
              Sign In
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
