import { useNavigate } from "react-router-dom";

export default function Sidebar({ user }) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center w-full">
      
      {/* Logo / User Info */}
      <div className="mb-6 text-center">
        <h1 className="text-lg font-bold text-emerald-300">LearnSmart</h1>
        <p className="text-sm text-emerald-200 mt-1">{user.name || user.email}</p>
      </div>

      {/* Buttons / Options */}
      <button
        onClick={() => navigate("/create-post")}
        className="w-full mb-4 px-3 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg text-sm font-semibold transition shadow"
      >
        Share a Post
      </button>

      <button
        className="w-full mb-4 px-3 py-2 bg-[#071616]/70 hover:bg-[#0a2424] rounded-lg text-sm transition shadow text-emerald-100"
      >
        Trending
      </button>

      <button
        className="w-full mb-4 px-3 py-2 bg-[#071616]/70 hover:bg-[#0a2424] rounded-lg text-sm transition shadow text-emerald-100"
      >
        Topics
      </button>

      {/* Optional: Logout */}
      <button
        className="w-full mt-auto px-3 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-semibold transition shadow"
      >
        Logout
      </button>
    </div>
  );
}
