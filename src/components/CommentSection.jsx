import { useState } from "react";
import { usePosts } from "../context/PostContext";

export default function CommentSection({ post }) {
  const [text, setText] = useState("");
  const { addComment } = usePosts();

  return (
    <div className="space-y-2">
      {post.comments.map((c, i) => (
        <div key={i} className="text-sm bg-slate-800/60 border border-slate-700/60 text-slate-100 p-2 rounded-lg">
          {c}
        </div>
      ))}

      <div className="flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a comment..."
          className="flex-1 bg-slate-900/40 border border-slate-700/60 text-slate-100 placeholder-slate-400 rounded-lg px-3 py-1 outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-400"
        />
        <button
          onClick={() => {
            addComment(post.id, text);
            setText("");
          }}
          className="text-sm bg-blue-500 text-white px-3 rounded-lg shadow-lg shadow-blue-500/20 hover:bg-blue-600 transition"
        >
          Post
        </button>
      </div>
    </div>
  );
}
