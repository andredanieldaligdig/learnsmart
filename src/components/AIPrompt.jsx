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
      <div className="flex-1 overflow-y-auto bg-[#0b1f1f]/80 p-6 rounded-2xl shadow-lg border border-white/10 space-y-4">
        {messages.length === 0 && (
          <p className="text-emerald-300/50 text-center mt-10">Start by asking a question...</p>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`p-4 rounded-xl max-w-[70%] ${
              msg.from === "ai"
                ? "bg-emerald-800/50 self-start text-white"
                : "bg-emerald-400/40 self-end text-black"
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
          className="flex-1 rounded-xl px-4 py-3 bg-black/30 border border-white/10 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-400"
          placeholder="Ask a question..."
        />
        <button
          onClick={handleSend}
          className="bg-emerald-500 hover:bg-emerald-600 px-6 py-3 rounded-xl font-semibold shadow-lg transition"
        >
          Send
        </button>
      </div>
    </div>
  );
}
