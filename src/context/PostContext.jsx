import { createContext, useContext, useState, useEffect } from "react";
import {
  getPosts as sbGetPosts,
  addPost as sbAddPost,
  updatePost as sbUpdatePost,
  savePostForUser,
  removeSavedPostForUser,
  getSavedPostIdsByUser,
} from "../../supabase.js";

const PostContext = createContext();

export const usePosts = () => useContext(PostContext);

export function PostProvider({ children }) {
  const [posts, setPosts] = useState([]);
  const [fetchError, setFetchError] = useState(null);

  // LOAD POSTS + SAVED STATE
  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const data = await sbGetPosts();

        // ✅ GET USER
        const user = JSON.parse(localStorage.getItem("user"));

        let savedIds = [];

        if (user?.id) {
          savedIds = await getSavedPostIdsByUser(user.id);
        }

        if (!mounted) return;

        const normalized = data.map((r) => ({
          id: r.id,
          author: r.author || r.user_id || "Anonymous",
          content: r.content || r.title || "",
          likes: r.likes || 0,
          liked: !!r.liked,

          // 🔥 FIX: check if post is saved
          saved: savedIds.includes(r.id),

          comments: (r.comments || []).map((c) =>
            typeof c === "string"
              ? { text: c, user: r.author || "Anonymous" }
              : c
          ),
          raw: r,
        }));

        setPosts(normalized);
      } catch (err) {
        console.error("Failed to load posts:", err);
        setFetchError(err.message || "Error loading posts");
      }
    }

    load();
    return () => (mounted = false);
  }, []);

  // ADD POST
  const addPost = async ({ content, user, author }) => {
    if (!content?.trim()) return;

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

    try {
      const added = await sbAddPost(user || null, null, content);
      const inserted = added?.[0];

      if (!inserted) throw new Error("Insert failed");

      const mapped = {
        id: inserted.id,
        author:
          inserted.author ||
          author ||
          inserted.user_id ||
          user ||
          "Anonymous",
        content: inserted.content || content,
        likes: inserted.likes || 0,
        liked: !!inserted.liked,
        saved: false,
        comments: (inserted.comments || []).map((c) =>
          typeof c === "string"
            ? { text: c, user: inserted.author || "Anonymous" }
            : c
        ),
        raw: inserted,
      };

      setPosts((prev) =>
        prev.map((p) => (p.id === tempId ? mapped : p))
      );
    } catch (err) {
      console.error("Add post failed:", err);
    }
  };

  // LIKE
  const toggleLike = async (id) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;

        const newLiked = !p.liked;
        const newLikes = newLiked
          ? (p.likes || 0) + 1
          : (p.likes || 0) - 1;

        return { ...p, liked: newLiked, likes: newLikes };
      })
    );

    const post = posts.find((p) => p.id === id);
    if (!post) return;

    try {
      await sbUpdatePost(id, {
        liked: !post.liked,
        likes: !post.liked ? post.likes + 1 : post.likes - 1,
      });
    } catch (err) {
      console.error("Like failed:", err);
    }
  };

  // SAVE (FIXED + SAFE)
  const toggleSave = async (id, userId) => {
    if (!userId) {
      console.error("No user ID provided");
      return;
    }

    const post = posts.find((p) => p.id === id);
    if (!post) return;

    const isSaved = post.saved;

    // optimistic UI
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, saved: !isSaved } : p
      )
    );

    try {
      if (isSaved) {
        await removeSavedPostForUser(userId, id);
      } else {
        await savePostForUser(userId, id);
      }
    } catch (err) {
      console.error("Save toggle failed:", err);

      // ❗ revert if failed
      setPosts((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, saved: isSaved } : p
        )
      );
    }
  };

  // COMMENT
  const addComment = async (id, text, userEmail = "Anonymous") => {
    if (!text?.trim()) return;

    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;

        const updatedComments = [
          ...(p.comments || []),
          { text: text.trim(), user: userEmail },
        ];

        return { ...p, comments: updatedComments };
      })
    );

    const post = posts.find((p) => p.id === id);
    if (!post) return;

    try {
      const updatedComments = [
        ...(post.comments || []),
        { text: text.trim(), user: userEmail },
      ];

      await sbUpdatePost(id, { comments: updatedComments });
    } catch (err) {
      console.error("Comment failed:", err);
    }
  };

  return (
    <PostContext.Provider
      value={{
        posts,
        addPost,
        toggleLike,
        toggleSave,
        addComment,
        fetchError,
      }}
    >
      {children}
    </PostContext.Provider>
  );
}