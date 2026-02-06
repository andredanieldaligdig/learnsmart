import React, { useState } from "react";
import Reply from "./reply";

const Post = ({ post, user }) => {
  const [replyContent, setReplyContent] = useState("");
  const [replies, setReplies] = useState(post.replies || []);

  const handleReply = async () => {
    if (!replyContent) return;
    const res = await fetch(`http://localhost:3000/posts/${post.id}/reply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: user, content: replyContent }),
    });
    const data = await res.json();
    setReplies([...replies, data]);
    setReplyContent("");
  };

  return (
    <div className="post">
      <p><strong>{post.username}</strong>: {post.content}</p>
      <div className="replies">
        {replies.map((r) => <Reply key={r.id} reply={r} />)}
      </div>
      <input
        placeholder="Reply..."
        value={replyContent}
        onChange={(e) => setReplyContent(e.target.value)}
      />
      <button onClick={handleReply}>Reply</button>
    </div>
  );
};

export default Post;
