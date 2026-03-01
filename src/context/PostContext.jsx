import { createContext, useContext, useState, useEffect } from "react";
import { getPosts as sbGetPosts, addPost as sbAddPost, updatePost as sbUpdatePost } from "../../supabase.js";

const PostContext = createContext();

export const usePosts = () => useContext(PostContext);

export function PostProvider({ children }) {
  const [posts, setPosts] = useState([]);

  // load posts from Supabase on mount
  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const data = await sbGetPosts();
        if (!mounted) return;
        // normalize records
        setPosts(
          data.map((r) => ({
            id: r.id,
            author: r.author || r.user_id || "Anonymous",
            content: r.content || r.title || "",
            likes: r.likes || 0,
            liked: !!r.liked,
            saved: !!r.saved,
            comments: (r.comments || []).map((c) =>
              typeof c === "string" ? { text: c, user: r.author || r.user_id || "Anonymous" } : c
            ),
            raw: r,
          }))
        );
      } catch (err) {
        console.error("Failed to load posts from Supabase:", err);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  // contentObj should have { content, user } where user is email or id
  const addPost = async (contentObj) => {
    const { content, user, author } = contentObj;
    try {
      // Optimistically add a local post so UI updates immediately
      const tempId = Date.now() * -1;
      const optimistic = {
        id: tempId,
        author: author || user || "Anonymous",
        content,
        likes: 0,
        liked: false,
        saved: false,
        comments: [],
        raw: null,
      };
      setPosts((prev) => [optimistic, ...prev]);

      // attempt to persist to Supabase
      const added = await sbAddPost(user || null, null, content);
      const inserted = added && added[0];
      if (!inserted) throw new Error("No record returned from Supabase");

      const mapped = {
        id: inserted.id,
        author: inserted.author || author || inserted.user_id || user || "Anonymous",
        content: inserted.content || inserted.title || content,
        likes: inserted.likes || 0,
        liked: !!inserted.liked,
        saved: !!inserted.saved,
        comments: (inserted.comments || []).map((c) => (typeof c === "string" ? { text: c, user: inserted.author || author || inserted.user_id || user || "Anonymous" } : c)),
        raw: inserted,
      };

      // replace optimistic item with real inserted post
      setPosts((prev) => [mapped, ...prev.filter((p) => p.id !== tempId)]);
    } catch (err) {
      console.error("Failed to add post to Supabase:", err);
      // on error, remove optimistic post
      setPosts((prev) => prev.filter((p) => p.content !== content || p.author !== (user || "Anonymous")));
    }
  };

  const toggleLike = async (id) => {
    const post = posts.find((p) => p.id === id);
    if (!post) return;
    const newLiked = !post.liked;
    const newLikes = newLiked ? (post.likes || 0) + 1 : (post.likes || 0) - 1;
    try {
      await sbUpdatePost(id, { liked: newLiked, likes: newLikes });
      setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, liked: newLiked, likes: newLikes } : p)));
    } catch (err) {
      console.error("Failed to update like in Supabase:", err);
    }
  };

  const toggleSave = async (id) => {
    const post = posts.find((p) => p.id === id);
    if (!post) return;
    const newSaved = !post.saved;
    try {
      await sbUpdatePost(id, { saved: newSaved });
      setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, saved: newSaved } : p)));
    } catch (err) {
      console.error("Failed to update save in Supabase:", err);
    }
  };

  // userEmail optional — if provided, comment object will include user
  const addComment = async (id, text, userEmail = "Anonymous") => {
    if (!text || !text.trim()) return;
    const post = posts.find((p) => p.id === id);
    if (!post) return;
    const newComments = [...(post.comments || []), { text: text.trim(), user: userEmail }];
    try {
      await sbUpdatePost(id, { comments: newComments });
      setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, comments: newComments } : p)));
    } catch (err) {
      console.error("Failed to add comment in Supabase:", err);
    }
  };

  return (
    <PostContext.Provider value={{ posts, addPost, toggleLike, toggleSave, addComment }}>
      {children}
    </PostContext.Provider>
  );
}
