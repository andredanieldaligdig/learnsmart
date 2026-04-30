import { useState } from "react";
import { supabase } from "../../supabase.js";

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
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-white">Forgot password</h1>
          <p className="mt-2 text-sm text-neutral-400">Enter your email to reset your password.</p>
        </div>

        <div className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") handleReset();
            }}
            placeholder="Email"
            className="w-full rounded-[24px] border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none placeholder:text-neutral-500"
          />

          {message ? <p className="text-sm text-neutral-300">{message}</p> : null}

          <button
            onClick={handleReset}
            className="w-full rounded-[24px] border border-white/12 bg-white py-3 font-semibold text-black transition hover:bg-neutral-200"
          >
            Send Reset Link
          </button>
        </div>
      </div>
    </div>
  );
}
