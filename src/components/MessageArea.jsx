import React, { useState } from "react";

const MessageArea = ({ user }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (!input) return;
    const newMsg = { id: messages.length + 1, user, content: input };
    setMessages([...messages, newMsg]);
    setInput("");
  };

  return (
    <div className="message-area">
      <h3>Messages</h3>
      <div className="messages">
        {messages.map((msg) => (
          <div key={msg.id}>
            <strong>{msg.user}</strong>: {msg.content}
          </div>
        ))}
      </div>
      <input
        placeholder="Type a message..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

export default MessageArea;
