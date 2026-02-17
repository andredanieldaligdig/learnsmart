import { useState } from "react";
import { usePosts } from "../context/PostContext";

export default function CommentSection({ post }) {
  const [text, setText] = useState("");
  const { addComment } = usePosts();

  return (
    <div className="space-y-2">
      {post.comments.map((c, i) => (
        <div key={i} className="text-sm bg-white/30 p-2 rounded-lg">
          {c}
        </div>
      ))}

      <div className="flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a comment..."
          className="flex-1 bg-white/30 rounded-lg px-3 py-1 outline-none"
        />
        <button
          onClick={() => {
            addComment(post.id, text);
            setText("");
          }}
          className="text-sm bg-gradient-to-r from-rose-400 to-orange-400 text-white px-3 rounded-lg"
        >
          Post
        </button>
      </div>
    </div>
  );
}
