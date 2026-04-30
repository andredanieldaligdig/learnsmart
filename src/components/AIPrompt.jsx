import { useState, useRef, useEffect } from "react";

export default function AIPrompt({ user }) {
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState([]);
  const chatEndRef = useRef(null);

  const handleSend = () => {
    if (!prompt.trim()) return;

    const userMsg = { from: "user", text: prompt };
    const aiMsg = { from: "ai", text: "AI is thinking..." };

    setMessages((prev) => [...prev, userMsg, aiMsg]);
    setPrompt("");
  };

  // Scroll to bottom on new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-screen">
      
      {/* Chat area */}
      <div className="flex-1 overflow-y-auto bg-slate-800/60 backdrop-blur p-6 rounded-2xl shadow-lg border border-slate-700/60 space-y-4">
        {messages.length === 0 && (
          <p className="text-slate-300/60 text-center mt-10">Start by asking a question...</p>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`p-4 rounded-xl max-w-[70%] ${
              msg.from === "ai"
                ? "bg-slate-900/40 border border-slate-700/60 self-start text-slate-100"
                : "bg-blue-500 self-end text-white"
            }`}
          >
            {msg.text}
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Input bar */}
      <div className="mt-4 flex gap-2">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="flex-1 rounded-xl px-4 py-3 bg-slate-900/40 border border-slate-700/60 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-400"
          placeholder="Ask a question..."
        />
        <button
          onClick={handleSend}
          className="bg-blue-500 hover:bg-blue-600 px-6 py-3 rounded-xl font-semibold shadow-lg shadow-blue-500/20 text-white transition"
        >
          Send
        </button>
      </div>
    </div>
  );
}
