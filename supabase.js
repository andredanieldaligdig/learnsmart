import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const supabaseConfigError =
  !supabaseUrl || !supabaseAnonKey
    ? "Missing Supabase environment variables."
    : "";

export const supabase = supabaseConfigError
  ? null
  : createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: localStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    });


// ======================================================
// AUTH
// ======================================================

export async function createAccount(email, password, displayName, gender, dob) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name: displayName,
        full_name: displayName,
        username: displayName,
      },
    },
  });

  if (error) throw error;
  const user = data.user;

  if (user) {
  // Wait briefly for the trigger to create the row first
  await new Promise((resolve) => setTimeout(resolve, 800));
  const { error: profileError } = await supabase
    .from('accounts')
    .update({ username: displayName, gender, dob })
    .eq('id', user.id);
  if (profileError) throw profileError;
}

  return {
    user,
    session: data.session || null,
  };
}

export async function uploadAvatar(userId, file) {
  // Ensure account exists before uploading avatar
  if (userId) {
    await ensureAccountExists(userId, "User");
  }

  const fileExt = file.name.split(".").pop();
  const filePath = `${userId}/avatar.${fileExt}`;

  await supabase.storage.from("avatars").remove([filePath]);

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(filePath, file, { upsert: true });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);

  const { error: updateError } = await supabase
  .from("accounts")
  .update({ avatar_url: data.publicUrl })
  .eq("id", userId);

if (updateError) {
  console.error("Avatar URL update error:", updateError);
  throw updateError;
}

console.log("Avatar saved to DB:", data.publicUrl);
return data.publicUrl;
}

// ✅ Now fetches username, avatar_url AND bio
export async function getAccountProfile(userId) {
  const { data, error } = await supabase
    .from("accounts")
    .select("username, avatar_url, bio")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getAccountProfilesByIds(userIds) {
  const uniqueIds = [...new Set((userIds || []).filter(Boolean))];

  if (!uniqueIds.length) return [];

  const { data, error } = await supabase
    .from("accounts")
    .select("id, username, avatar_url, bio")
    .in("id", uniqueIds);

  if (error) throw error;
  return data || [];
}

// ✅ Now saves bio and avatar_url too
export async function updateAccountProfile(userId, { displayName, bio, avatarUrl }) {
  const trimmedDisplayName = displayName?.trim();

  if (!userId) throw new Error("A valid user id is required.");

  // Ensure account exists before updating profile
  await ensureAccountExists(userId, trimmedDisplayName || "User");

  // Update auth metadata if display name changed
  if (trimmedDisplayName) {
    const { error: authError } = await supabase.auth.updateUser({
      data: {
        name: trimmedDisplayName,
        full_name: trimmedDisplayName,
        username: trimmedDisplayName,
      },
    });
    if (authError) throw authError;
  }

  // Build the update object
  const updates = {};
if (trimmedDisplayName) updates.username = trimmedDisplayName;
if (bio !== undefined && bio !== null) updates.bio = bio ?? "";
if (avatarUrl !== undefined && avatarUrl !== null) updates.avatar_url = avatarUrl ?? "";

  if (Object.keys(updates).length > 0) {
  console.log("Sending to Supabase:", { userId, updates });
  const { data, error: profileError } = await supabase
    .from("accounts")
    .update(updates)
    .eq("id", userId)
    .select();
  console.log("Supabase response:", { data, profileError });
  if (profileError) {
    console.error("Profile update error:", profileError);
    throw profileError;
  }
}

  return null;
}

export async function loginAccount(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.user;
}

export async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
export async function sendPasswordReset(email) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: "https://learnsmart-wfmv.vercel.app/reset-password",
  });
  
  if (error) throw error;
}
export async function getCurrentUser() {
  const { data } = await supabase.auth.getUser();
  return data.user;
}


// ======================================================
// POSTS — wired to Supabase
// ======================================================

// ✅ Ensure account exists (creates if missing)
async function ensureAccountExists(userId, displayName) {
  if (!userId) return;
  
  try {
    const { data: existing } = await supabase
      .from("accounts")
      .select("id")
      .eq("id", userId)
      .maybeSingle();
    
    if (!existing) {
      // Get user email from auth
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      // Account doesn't exist, create it
      const { error: createError } = await supabase
        .from("accounts")
        .insert([{ 
          id: userId, 
          username: displayName || "Anonymous",
          email: authUser?.email || "" // Include email - required field
        }]);
      
      if (createError && createError.code !== '23505') { // 23505 = unique violation (already exists)
        console.error("Failed to ensure account exists:", createError);
      }
    }
  } catch (err) {
    console.error("Error ensuring account exists:", err);
  }
}

// ✅ Create a post with author display name (not email)
export async function addPost(userId, displayName, content) {
  // Ensure account exists before posting
  if (userId) {
    await ensureAccountExists(userId, displayName);
  }

  const payload = {
  title: "",
  content: content || "",
  likes: 0,
  saves: 0,
  comments: [],
  user_id: userId || null,
  author: displayName || "Anonymous",
};

  const { data, error } = await supabase
    .from('posts')
    .insert([payload])
    .select();

  if (error) {
  console.error("addPost error:", error);
  throw error;
}
console.log("addPost success:", data);
return data;
}

export async function updatePost(id, changes) {
  const { data, error } = await supabase
    .from('posts')
    .update(changes)
    .eq('id', id)
    .select();

  if (error) throw error;
  return data?.[0];
}

export async function getPosts() {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getPostsByUser(user_id) {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('user_id', user_id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function deletePost(userId, postId) {
  if (!userId) throw new Error("A valid user id is required.");

  const { error: savedPostsError } = await supabase
    .from('saved_posts')
    .delete()
    .eq('post_id', postId);

  if (savedPostsError) throw savedPostsError;

  const { error: postLikesError } = await supabase
    .from('post_likes')
    .delete()
    .eq('post_id', postId);

  if (postLikesError) throw postLikesError;

  const { error: postError } = await supabase
    .from('posts')
    .delete()
    .match({ id: postId, user_id: userId });

  if (postError) throw postError;
}


// ======================================================
// LIKES — stored in Supabase
// ======================================================

export async function getLikedPostIdsByUser(userId) {
  const { data, error } = await supabase
    .from('post_likes')
    .select('post_id')
    .eq('user_id', userId);

  if (error) return [];
  return data.map((r) => r.post_id);
}

export async function likePost(userId, postId) {
  const { error: likeError } = await supabase
    .from('post_likes')
    .upsert([{ user_id: userId, post_id: postId }]);

  if (likeError) throw likeError;

  await supabase.rpc('increment_likes', { post_id: postId });
}

export async function unlikePost(userId, postId) {
  const { error } = await supabase
    .from('post_likes')
    .delete()
    .match({ user_id: userId, post_id: postId });

  if (error) throw error;

  const { data: post } = await supabase
    .from('posts')
    .select('likes')
    .eq('id', postId)
    .maybeSingle();

  await supabase
    .from('posts')
    .update({ likes: Math.max(0, (post?.likes || 1) - 1) })
    .eq('id', postId);
}


// ======================================================
// SAVED POSTS
// ======================================================

export async function getSavedPostIdsByUser(user_id) {
  const { data, error } = await supabase
    .from('saved_posts')
    .select('post_id')
    .eq('user_id', user_id);

  if (error) return [];
  return data.map((r) => r.post_id);
}

export async function getSavedPostsByUser(user_id) {
  const ids = await getSavedPostIdsByUser(user_id);
  if (!ids.length) return [];

  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .in('id', ids);

  if (error) throw error;
  return data;
}

export async function savePostForUser(user_id, post_id) {
  const { data, error } = await supabase
    .from('saved_posts')
    .upsert([{ user_id, post_id }]);

  if (error) throw error;

  await supabase.rpc('increment_saves', { post_id: post_id });

  return data;
}

export async function removeSavedPostForUser(user_id, post_id) {
  const { data, error } = await supabase
    .from('saved_posts')
    .delete()
    .match({ user_id, post_id });

  if (error) throw error;
  return data;
}


// ======================================================
// COMMENTS — stored in the posts.comments JSONB column
// ======================================================

export async function addComment(postId, comment) {
  // Fetch current comments
  const { data: post, error: fetchError } = await supabase
    .from('posts')
    .select('comments')
    .eq('id', postId)
    .maybeSingle();

  if (fetchError) throw fetchError;

  const updatedComments = [...(post?.comments || []), comment];

  const { error } = await supabase
    .from('posts')
    .update({ comments: updatedComments })
    .eq('id', postId);

  if (error) throw error;
}


// ======================================================
// MESSAGES
// ======================================================

export async function sendMessage(sender_id, receiver_id, message) {
  const { data, error } = await supabase
    .from('messages')
    .insert([{ sender_id, receiver_id, message }])
    .select();

  if (error) throw error;
  return data;
}

export async function getMessages(user1_id, user2_id) {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .or(
      `and(sender_id.eq.${user1_id},receiver_id.eq.${user2_id}),and(sender_id.eq.${user2_id},receiver_id.eq.${user1_id})`
    )
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data;
}

export async function getMessagesForUser(user_id) {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .or(`sender_id.eq.${user_id},receiver_id.eq.${user_id}`)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data;
}

// ======================================================
// CHAT SESSIONS
// ======================================================

export async function saveChatSession(userId, session) {
  const payload = {
    id: session.id,
    user_id: userId,
    title: session.title,
    messages: Array.isArray(session.messages) ? session.messages : [],
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('chat_sessions')
    .upsert([payload])
    .select()
    .single();

  if (error) {
    console.error("Save chat error:", error, payload);
    throw error;
  }

  return data;
}

export async function getChatSessions(userId) {
  const { data, error } = await supabase
    .from('chat_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error("Load chat sessions error:", error);
    throw error;
  }

  return data || [];
}

export async function deleteChatSession(userId, sessionId) {
  const { error } = await supabase
    .from("chat_sessions")
    .delete()
    .match({ user_id: userId, id: sessionId });

  if (error) throw error;
}
