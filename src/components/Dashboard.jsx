import { useState, useRef, useEffect } from "react";

export default function Dashboard({ user, onLogout }) {
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi 👋 What would you like to study today?" },
  ]);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);

  const sendPrompt = () => {
    if (!prompt.trim()) return;

    setMessages([
      ...messages,
      { role: "user", content: prompt },
      { role: "assistant", content: "AI is thinking..." },
    ]);

    setPrompt("");
  };

  // Close sidebar if clicked outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target)) {
        setSidebarOpen(false);
      }
    };
    if (sidebarOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [sidebarOpen]);

  return (
    <div className="relative min-h-screen flex overflow-hidden">

      {/* ===== BACKGROUND ===== */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-300 via-rose-300 to-orange-300 animate-gradient" />
        <div className="absolute inset-0 bg-dot-grid opacity-40 animate-grid" />
      </div>

      {/* ===== SIDEBAR ===== */}
      <aside
        ref={sidebarRef}
        className={`fixed top-0 left-0 z-20 h-full w-64 bg-white/20 backdrop-blur-xl border-r border-white/30 flex flex-col p-4 gap-6 transform transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <h2 className="text-xl font-bold text-gray-900">LearnSmart</h2>

        <button className="sidebar-btn">New Prompt</button>
        <button className="sidebar-btn">Trending Topics</button>
        <button className="sidebar-btn">Post a Question</button>
        <button className="sidebar-btn">Saved</button>

        {/* ===== LOGOUT BUTTON (ONLY ADDITION) ===== */}
        <button
          onClick={onLogout}
          className="sidebar-btn mt-auto bg-red-600 text-white hover:bg-red-700"
        >
          Logout
        </button>

        <div className="text-xs text-gray-600">
          Logged in as
          <div className="font-semibold truncate">{user.email}</div>
        </div>

        {/* ===== MINIMAL TOGGLE ARROW INSIDE SIDEBAR ===== */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="absolute top-1/2 -right-4 w-8 h-12 bg-white/30 backdrop-blur rounded-l-lg flex items-center justify-center hover:bg-white/50 transition"
        >
          ❮
        </button>
      </aside>

      {/* ===== TOGGLE ARROW WHEN SIDEBAR CLOSED ===== */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed top-1/2 left-0 z-30 w-8 h-12 bg-white/30 backdrop-blur rounded-r-lg flex items-center justify-center hover:bg-white/50 transition"
        >
          ❯
        </button>
      )}

      {/* ===== MAIN AREA ===== */}
      <main className="flex-1 flex flex-col ml-0 md:ml-0">
        {/* Search bar */}
        <div className="p-4 flex justify-center">
          <input
            placeholder="Looking for something?"
            className="flex-1 max-w-xl px-6 py-3 rounded-full bg-white/40 backdrop-blur border border-white/50 focus:outline-none focus:ring-2 focus:ring-rose-400"
          />
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 space-y-6">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`max-w-3xl ${msg.role === "user" ? "ml-auto text-right" : ""}`}
            >
              <div
                className={`inline-block px-5 py-3 rounded-2xl shadow ${
                  msg.role === "user"
                    ? "bg-gradient-to-r from-rose-400 to-orange-400 text-white"
                    : "bg-white/40 backdrop-blur text-gray-900"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
        </div>

        {/* Prompt Input */}
        <div className="p-6">
          <div className="max-w-3xl mx-auto flex gap-3">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={1}
              placeholder="Ask anything about your studies..."
              className="flex-1 resize-none rounded-xl px-4 py-3 bg-white/40 backdrop-blur border border-white/50 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
            <button
              onClick={sendPrompt}
              className="px-6 rounded-xl bg-gradient-to-r from-rose-400 to-orange-400 text-white font-semibold hover:opacity-90 transition"
            >
              Send
            </button>
          </div>
        </div>
      </main>

      {/* ===== STYLES ===== */}
      <style>{`
        .bg-dot-grid {
          background-image: radial-gradient(rgba(255,255,255,0.45) 1px, transparent 1px);
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
          100% { background-position: 0% 50%; }
        }
        
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 18s ease infinite;
        }

        .sidebar-btn {
          padding: 0.75rem;
          border-radius: 0.75rem;
          background: rgba(255,255,255,0.4);
          transition: all 0.2s;
          font-weight: 500;
        }

        .sidebar-btn:hover {
          background: rgba(255,255,255,0.7);
        }
      `}</style>
    </div>
  );
}
