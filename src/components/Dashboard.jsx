import { useEffect, useState } from "react";
import { FiMenu } from "react-icons/fi";
import {
  addPost,
  deleteChatSession,
  deletePost,
  getAccountProfile,
  getAccountProfilesByIds,
  getChatSessions,
  getLikedPostIdsByUser,
  getPosts,
  getSavedPostIdsByUser,
  likePost,
  saveChatSession,
  savePostForUser,
  updateAccountProfile,
  updatePost as supabaseUpdatePost,
} from "../../supabase.js";
import DashboardHeader from "./dashboard/DashboardHeader.jsx";
import NotificationTray from "./dashboard/NotificationTray.jsx";
import DashboardSidebar from "./dashboard/DashboardSidebar.jsx";
import {
  DASHBOARD_VIEWS,
  MY_SPACE_TABS,
  normalizeInitialView,
} from "./dashboard/dashboardConfig.js";
import DiscussionsView from "./dashboard/views/DiscussionsView.jsx";
import MySpaceView from "./dashboard/views/MySpaceView.jsx";
import NewChatView from "./dashboard/views/NewChatView.jsx";

function createId(prefix) {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function getDisplayName(user) {
  const metadataName =
    user?.user_metadata?.username ||
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name;
  if (metadataName) return metadataName;
  if (user?.email) return user.email.split("@")[0];
  return "<USER_NAME>";
}

function getMetadataName(user) {
  return (
    user?.user_metadata?.username ||
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    ""
  );
}

function createAssistantPlaceholder() {
  return {
    id: createId("assistant"),
    role: "assistant",
    content: "ai is thinking...",
    streaming: false,
  };
}

function createEmptyChatSession() {
  return {
    id: createId("chat"),
    title: "New chat",
    updatedAt: Date.now(),
    messages: [],
  };
}

function createDiscussionPost({ authorBio, authorImageAlt, authorImageSrc, authorName, authorUserId, content }) {
  const trimmedContent = content.trim();
  return {
    id: createId("post"),
    authorBio: authorBio?.trim() || "",
    authorImageAlt,
    authorImageSrc,
    authorName,
    authorUserId: authorUserId || null,
    content: trimmedContent,
    createdAt: Date.now(),
    likes: 0,
    comments: [],
    saves: 0,
  };
}

function normalizeTimestamp(value) {
  if (typeof value === "number" && Number.isFinite(value)) return value;

  if (typeof value === "string") {
    const parsedValue = new Date(value).getTime();
    if (Number.isFinite(parsedValue)) return parsedValue;
  }

  return Date.now();
}

function normalizeStoredComment(comment) {
  if (typeof comment === "string") {
    return {
      id: createId("comment"),
      authorName: "Anonymous",
      authorUserId: null,
      content: comment,
      createdAt: Date.now(),
    };
  }

  return {
    id: comment?.id || createId("comment"),
    authorName: comment?.user || comment?.authorName || "Anonymous",
    authorUserId: comment?.user_id || comment?.authorUserId || null,
    content: comment?.text || comment?.content || "",
    createdAt: normalizeTimestamp(comment?.createdAt || comment?.created_at),
  };
}

function createComment({ authorName, authorUserId, content }) {
  return {
    id: createId("comment"),
    authorName,
    authorUserId: authorUserId || null,
    content: content.trim(),
    createdAt: Date.now(),
  };
}

function createNotification({ detail, postId, title }) {
  return {
    id: createId("notification"),
    title,
    detail,
    postId,
    timestamp: "Just now",
    unread: true,
  };
}

function waitForUiFeedback(duration = 700) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, duration);
  });
}

const EMPTY_CHAT_MESSAGES = [];

const DASHBOARD_VIEW_STORAGE_KEY = "learnsmart-dashboard-view";
const MY_SPACE_TAB_STORAGE_KEY = "learnsmart-my-space-tab";

export default function Dashboard({ user, onLogout, initialView }) {
  const [activeView, setActiveView] = useState(() => {
    const storedView =
      typeof window !== "undefined"
        ? window.localStorage.getItem(DASHBOARD_VIEW_STORAGE_KEY)
        : null;
    return normalizeInitialView(initialView || storedView);
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatSessions, setChatSessions] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [discussionPosts, setDiscussionPosts] = useState([]);
  const [likedPostIds, setLikedPostIds] = useState([]);
  const [savedPostIds, setSavedPostIds] = useState([]);
  const [isNotificationTrayOpen, setIsNotificationTrayOpen] = useState(false);
  const [isNotificationsLoading, setIsNotificationsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [highlightedPostId, setHighlightedPostId] = useState(null);
  const [mySpaceTab, setMySpaceTab] = useState(() => {
    const storedTab =
      typeof window !== "undefined"
        ? window.localStorage.getItem(MY_SPACE_TAB_STORAGE_KEY)
        : null;
    return MY_SPACE_TABS.some((tab) => tab.id === storedTab) ? storedTab : MY_SPACE_TABS[0].id;
  });
  const [profile, setProfile] = useState(() => ({
    displayName: getDisplayName(user),
    bio: "",
    imageSrc: "",
    imageAlt: "<INSERT PROFILE IMAGE HERE>",
  }));
  // Load posts + liked/saved IDs from Supabase on mount
useEffect(() => {
  if (!user?.id) return;
  let cancelled = false;
  async function loadData() {
    try {
      const [rawPosts, likedIds, savedIds] = await Promise.all([
        getPosts(),
        getLikedPostIdsByUser(user.id),
        getSavedPostIdsByUser(user.id),
      ]);
      if (cancelled) return;
      const authorProfiles = await getAccountProfilesByIds(
        rawPosts.map((post) => post.user_id).filter(Boolean)
      );
      if (cancelled) return;
      const authorProfilesById = new Map(authorProfiles.map((profile) => [profile.id, profile]));
      const normalized = rawPosts.map((r) => ({
        ...(authorProfilesById.get(r.user_id || "") || {}),
        id: r.id,
        authorName: authorProfilesById.get(r.user_id || "")?.username || r.author || "Anonymous",
        authorUserId: r.user_id || null,
        authorBio: authorProfilesById.get(r.user_id || "")?.bio || "",
        authorImageAlt: authorProfilesById.get(r.user_id || "")?.avatar_url ? "Profile image" : "",
        authorImageSrc: authorProfilesById.get(r.user_id || "")?.avatar_url || "",
        content: r.content || "",
        createdAt: new Date(r.created_at).getTime(),
        likes: r.likes || 0,
        saves: r.saves || 0,
        comments: (r.comments || []).map(normalizeStoredComment),
      }));
      setDiscussionPosts(normalized);
      setLikedPostIds(likedIds);
      setSavedPostIds(savedIds);
    } catch (err) {
      console.error("Failed to load data:", err);
    }
  }
  loadData();
  return () => { cancelled = true; };
}, [user?.id]);

// Load chats from Supabase on mount
useEffect(() => {
  if (!user?.id) return;
  let cancelled = false;
  async function loadChats() {
    const sessions = await getChatSessions(user.id);
    if (cancelled) return;
    setChatSessions(sessions.map((s) => ({
      id: s.id,
      title: s.title,
      updatedAt: new Date(s.updated_at).getTime(),
      messages: s.messages || [],
    })));
  }
  loadChats();
  return () => { cancelled = true; };
}, [user?.id]);

  useEffect(() => {
    if (!initialView) return;
    setActiveView(normalizeInitialView(initialView));
  }, [initialView]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(DASHBOARD_VIEW_STORAGE_KEY, activeView);
  }, [activeView]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(MY_SPACE_TAB_STORAGE_KEY, mySpaceTab);
  }, [mySpaceTab]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setIsNotificationsLoading(false);
    }, 450);
    return () => window.clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    if (!highlightedPostId) return;
    const timeoutId = window.setTimeout(() => {
      setHighlightedPostId((currentPostId) =>
        currentPostId === highlightedPostId ? null : currentPostId
      );
    }, 2200);
    return () => window.clearTimeout(timeoutId);
  }, [highlightedPostId]);

  useEffect(() => {
    let cancelled = false;

    async function syncDisplayName() {
  const metadataName = getMetadataName(user);
  if (!user?.id) {
    if (cancelled) return;
    setProfile((currentProfile) => ({ ...currentProfile, displayName: getDisplayName(user) }));
    return;
  }
  try {
    const accountProfile = await getAccountProfile(user.id);
    if (cancelled) return;
    setProfile((currentProfile) => ({
      ...currentProfile,
      displayName: accountProfile?.username || metadataName || getDisplayName(user),
      bio: accountProfile?.bio || "",
      imageSrc: accountProfile?.avatar_url || currentProfile.imageSrc,
      imageAlt: accountProfile?.avatar_url ? "Profile image" : currentProfile.imageAlt,
    }));
    return;
  } catch {
      if (!user?.id) {
        if (cancelled) return;
        setProfile((currentProfile) => ({ ...currentProfile, displayName: getDisplayName(user) }));
        return;
      }
    }
      try {
      const accountProfile = await getAccountProfile(user.id);
      if (cancelled) return;
      setProfile((currentProfile) => ({
        ...currentProfile,
        displayName: accountProfile?.username || getDisplayName(user),
        bio: accountProfile?.bio || currentProfile.bio,
        imageSrc: accountProfile?.avatar_url || currentProfile.imageSrc,
        imageAlt: accountProfile?.avatar_url ? "Profile image" : currentProfile.imageAlt,
      }));
        } catch {
          if (cancelled) return;
          setProfile((currentProfile) => ({ ...currentProfile, displayName: getDisplayName(user) }));
      }
    }

    syncDisplayName();
    return () => { cancelled = true; };
  }, [user]);

  useEffect(() => {
    if (!user?.id) return;
    setDiscussionPosts((currentPosts) =>
      currentPosts.map((post) =>
        post.authorUserId === user.id
          ? {
              ...post,
              authorBio: profile.bio?.trim() || "",
              authorImageAlt: profile.imageAlt,
              authorImageSrc: profile.imageSrc,
              authorName: profile.displayName?.trim() || getDisplayName(user),
            }
          : post
      )
    );
  }, [profile.bio, profile.displayName, profile.imageAlt, profile.imageSrc, user]);

  const activeChat = chatSessions.find((chat) => chat.id === activeChatId) || null;
  const currentMessages = activeChat?.messages?.length ? activeChat.messages : EMPTY_CHAT_MESSAGES;
  const recentChats = [...chatSessions].sort((left, right) => right.updatedAt - left.updatedAt);
  const displayName = profile.displayName?.trim() || "<USER_NAME>";
  const isChatView = activeView === DASHBOARD_VIEWS.NEW_CHAT;
  const isEmptyDraftChat = isChatView && (!activeChat || activeChat.messages.length === 0);
  const unreadNotificationCount = notifications.filter((n) => n.unread).length;

  function closeSidebar() {
    if (isLoggingOut) return;
    setIsSidebarOpen(false);
  }

  function openNotifications() {
    if (isLoggingOut) return;
    setIsNotificationTrayOpen(true);
    setNotifications((currentNotifications) =>
      currentNotifications.map((n) => ({ ...n, unread: false }))
    );
  }

  function closeNotifications() {
    if (isLoggingOut) return;
    setIsNotificationTrayOpen(false);
  }

  function handleNotificationSelect(notification) {
    if (isLoggingOut) return;
    setIsNotificationTrayOpen(false);
    setNotifications((currentNotifications) =>
      currentNotifications.map((n) =>
        n.id === notification.id ? { ...n, unread: false } : n
      )
    );
    if (!notification.postId) return;
    setActiveView(DASHBOARD_VIEWS.DISCUSSIONS);
    setHighlightedPostId(notification.postId);
  }

  function openView(viewId) {
    if (isLoggingOut) return;
    setHighlightedPostId(null);
    setActiveView(viewId);
    closeSidebar();
  }

  function handleNewChat() {
    if (isLoggingOut) return;
    setHighlightedPostId(null);
    if (activeChat && activeChat.messages.length === 0) {
      setActiveView(DASHBOARD_VIEWS.NEW_CHAT);
      setChatInput("");
      closeSidebar();
      return;
    }
    const nextChat = createEmptyChatSession();
    setActiveChatId(nextChat.id);
    setChatSessions((currentSessions) => [nextChat, ...currentSessions]);
    setChatInput("");
    setActiveView(DASHBOARD_VIEWS.NEW_CHAT);
    closeSidebar();
  }

  async function persistChatSession(session) {
    if (!user?.id) return;

    try {
      await saveChatSession(user.id, session);
    } catch (err) {
      console.error("Save chat error:", err);
    }
  }

  function handleChatSubmit() {
    if (isLoggingOut) return;
    const trimmedInput = chatInput.trim();
    if (!trimmedInput) return;

    const targetId = activeChatId || createId("chat");
    const userMessage = {
      id: createId("message"),
      role: "user",
      content: trimmedInput,
      
    };

    setActiveChatId(targetId);
    let nextSessionToPersist = null;
    setChatSessions((currentSessions) => {
      const existingSession = currentSessions.find((s) => s.id === targetId);
      const nextMessages = existingSession
        ? [...existingSession.messages, userMessage, createAssistantPlaceholder()]
        : [userMessage, createAssistantPlaceholder()];
      const nextSession = {
        id: targetId,
        title:
          !existingSession?.title || existingSession.title === "New chat"
            ? trimmedInput
            : existingSession.title,
        updatedAt: Date.now(),
        messages: nextMessages,
      };
      nextSessionToPersist = nextSession;
      const remainingSessions = currentSessions.filter((s) => s.id !== targetId);
      return [nextSession, ...remainingSessions];
    });

    setChatInput("");

    if (nextSessionToPersist) {
      persistChatSession(nextSessionToPersist);
    }
}

  // Called by ChatModule as tokens stream in
  function handleStreamingUpdate(messageId, content, streaming) {
    let nextSessionToPersist = null;
    setChatSessions((currentSessions) =>
      currentSessions.map((session) => {
        if (!session.messages.some((m) => m.id === messageId)) return session;
        const nextSession = {
          ...session,
          messages: session.messages.map((m) => {
            if (m.id !== messageId) return m;
            // null content means the stream was aborted — keep whatever was accumulated
            return {
              ...m,
              content: content !== null ? content : m.content,
              streaming,
            };
          }),
        };
        nextSessionToPersist = nextSession;
        return nextSession;
      })
    );

    if (!streaming && nextSessionToPersist) {
      persistChatSession(nextSessionToPersist);
    }
  }

  function handleRecentChatSelect(chatId) {
    if (isLoggingOut) return;
    setHighlightedPostId(null);
    setActiveChatId(chatId);
    setActiveView(DASHBOARD_VIEWS.NEW_CHAT);
    closeSidebar();
  }

  async function handleDeleteChat(chatId) {
    if (isLoggingOut) return;

    const nextActiveChatId = activeChatId === chatId ? null : activeChatId;
    setChatSessions((currentSessions) => currentSessions.filter((session) => session.id !== chatId));
    setActiveChatId(nextActiveChatId);

    if (activeChatId === chatId) {
      setChatInput("");
      setActiveView(DASHBOARD_VIEWS.NEW_CHAT);
    }

    if (!user?.id) return;

    try {
      await deleteChatSession(user.id, chatId);
    } catch (err) {
      console.error("Delete chat failed:", err);
    }
  }

  async function handleCreatePost(content) {
  if (isLoggingOut) return null;
  await waitForUiFeedback();
  const nextPost = createDiscussionPost({
    authorBio: profile.bio,
    authorImageAlt: profile.imageAlt,
    authorImageSrc: profile.imageSrc,
    authorName: displayName,
    authorUserId: user?.id,
    content,
  });
  setDiscussionPosts((currentPosts) => [nextPost, ...currentPosts]);
  // Persist to Supabase
  try {
    const saved = await addPost(user?.id, displayName, content);
    const inserted = saved?.[0];
    if (inserted) {
      setDiscussionPosts((currentPosts) =>
        currentPosts.map((p) => p.id === nextPost.id ? { ...nextPost, id: inserted.id } : p)
      );
    }
  } catch (err) {
    console.error("Failed to save post:", err);
  }
  return nextPost;
}

  async function handleLikePost(postId) {
  if (isLoggingOut) return;
  if (likedPostIds.includes(postId)) return;
  setLikedPostIds((ids) => [...ids, postId]);
  setDiscussionPosts((currentPosts) =>
    currentPosts.map((post) =>
      post.id === postId ? { ...post, likes: post.likes + 1 } : post
    )
  );
  try {
    await likePost(user.id, postId);
  } catch (err) {
    console.error("Like failed:", err);
  }
  }
  async function handleSavePost(postId) {
  if (isLoggingOut) return false;
  if (savedPostIds.includes(postId)) return false;
  await waitForUiFeedback();
  setSavedPostIds((ids) => [...ids, postId]);
  setDiscussionPosts((currentPosts) =>
    currentPosts.map((post) =>
      post.id === postId ? { ...post, saves: post.saves + 1 } : post
    )
  );
  try {
    await savePostForUser(user.id, postId);
  } catch (err) {
    console.error("Save failed:", err);
  }
  return true;
}

  async function handleCommentPost(postId, content) {
    if (isLoggingOut) return false;
    const trimmedContent = content.trim();
    if (!trimmedContent) return false;
    await waitForUiFeedback();
    const nextComment = createComment({
      authorName: displayName,
      authorUserId: user?.id,
      content: trimmedContent,
    });
try {
  const post = discussionPosts.find((p) => p.id === postId);
  const updatedComments = [
    ...(post?.comments || []),
    {
      id: nextComment.id,
      text: trimmedContent,
      user: displayName,
      user_id: user?.id || null,
      createdAt: nextComment.createdAt,
    },
  ];
  await supabaseUpdatePost(postId, { comments: updatedComments });
  // Only update local state after Supabase confirms
  setDiscussionPosts((currentPosts) =>
    currentPosts.map((p) =>
      p.id === postId
        ? { ...p, comments: [...p.comments, nextComment] }
        : p
    )
  );
} catch (err) {
  console.error("Comment save failed:", err);
  return false;
}

    return true;
  }

  async function handleUpdatePost(postId, content) {
    if (isLoggingOut) return false;

    const trimmedContent = content.trim();
    if (!trimmedContent) return false;

    try {
      await supabaseUpdatePost(postId, { content: trimmedContent });
      setDiscussionPosts((currentPosts) =>
        currentPosts.map((post) =>
          post.id === postId ? { ...post, content: trimmedContent } : post
        )
      );
      return true;
    } catch (err) {
      console.error("Update post failed:", err);
      return false;
    }
  }

  async function handleDeletePost(postId) {
    if (isLoggingOut) return false;

    try {
      await deletePost(postId);
      setDiscussionPosts((currentPosts) => currentPosts.filter((post) => post.id !== postId));
      setLikedPostIds((currentIds) => currentIds.filter((id) => id !== postId));
      setSavedPostIds((currentIds) => currentIds.filter((id) => id !== postId));
      setNotifications((currentNotifications) =>
        currentNotifications.filter((notification) => notification.postId !== postId)
      );
      if (highlightedPostId === postId) {
        setHighlightedPostId(null);
      }
      return true;
    } catch (err) {
      console.error("Delete post failed:", err);
      return false;
    }
  }

  
  async function handleProfileSave(nextProfile) {
  if (isLoggingOut) return;
  const trimmedDisplayName = nextProfile.displayName?.trim();
  if (user?.id) {
  console.log("Saving profile:", { 
    userId: user.id, 
    displayName: trimmedDisplayName, 
    bio: nextProfile.bio,
    avatarUrl: nextProfile.imageSrc,
  });
  await updateAccountProfile(user.id, {
    displayName: trimmedDisplayName,
    bio: nextProfile.bio ?? "",
    avatarUrl: nextProfile.imageSrc,
  });
}
  await waitForUiFeedback();
  setProfile((currentProfile) => ({
    ...currentProfile,
    ...nextProfile,
    bio: nextProfile.bio || "",
    displayName: trimmedDisplayName || currentProfile.displayName,
    imageAlt: nextProfile.imageAlt || currentProfile.imageAlt,
    imageSrc: nextProfile.imageSrc !== undefined ? nextProfile.imageSrc : currentProfile.imageSrc,
  }));
}

async function handleLogoutRequest() {
  if (isLoggingOut) return;
  setIsLoggingOut(true);
  closeSidebar();
  closeNotifications();
  await waitForUiFeedback(850);
  await onLogout();
}

  function renderView() {
    if (activeView === DASHBOARD_VIEWS.NEW_CHAT) {
      return (
        <NewChatView
          chatInput={chatInput}
          displayName={displayName}
          messages={currentMessages}
          onChatInputChange={setChatInput}
          onSubmit={handleChatSubmit}
          onStreamingUpdate={handleStreamingUpdate}
        />
      );
    }

    if (activeView === DASHBOARD_VIEWS.DISCUSSIONS) {
      return (
        <DiscussionsView
          currentUserId={user?.id || null}
          focusedPostId={highlightedPostId}
          likedPostIds={likedPostIds}
          posts={discussionPosts}
          savedPostIds={savedPostIds}
          onCommentPost={handleCommentPost}
          onDeletePost={handleDeletePost}
          onLikePost={handleLikePost}
          onSavePost={handleSavePost}
          onUpdatePost={handleUpdatePost}
        />
      );
    }

  const myPosts = discussionPosts.filter((p) => p.authorUserId === user?.id);
return (
  <MySpaceView
    activeTab={mySpaceTab}
    displayName={displayName}
    likedPostIds={likedPostIds}
    posts={myPosts}
    allPosts={discussionPosts}
    profile={profile}
    savedPostIds={savedPostIds}
    userEmail={user?.email || "<USER_EMAIL>"}
    onCreatePost={handleCreatePost}
    onTabChange={setMySpaceTab}
  />
);
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-neutral-950 text-neutral-100">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.14),_transparent_32%),linear-gradient(135deg,rgba(10,10,10,1)_0%,rgba(24,24,27,1)_54%,rgba(9,9,11,1)_100%)]" />
        <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-white/8 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-white/6 blur-3xl" />
        <div className="absolute inset-0 bg-dot-grid opacity-20 animate-grid" />
      </div>

      <div
        className={[
          "fixed inset-0 z-30 bg-black/50 transition",
          isSidebarOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        ].join(" ")}
        onClick={closeSidebar}
        aria-hidden="true"
      />

      <DashboardSidebar
        activeChatId={activeChatId}
        activeView={activeView}
        isEmptyDraftChat={isEmptyDraftChat}
        isOpen={isSidebarOpen}
        profile={profile}
        recentChats={recentChats}
        user={user}
        isLoggingOut={isLoggingOut}
        onClose={closeSidebar}
        onLogout={handleLogoutRequest}
        onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat}
        onSelectChat={handleRecentChatSelect}
        onSelectView={openView}
      />

      <NotificationTray
        isOpen={isNotificationTrayOpen}
        isLoading={isNotificationsLoading}
        notifications={notifications}
        onClose={closeNotifications}
        onNotificationClick={handleNotificationSelect}
      />

      <button
        type="button"
        onClick={() => setIsSidebarOpen(true)}
        className={[
          "fixed left-4 top-4 z-40 flex h-10 w-10 items-center justify-center rounded-lg bg-white/[0.06] text-neutral-300 transition hover:bg-white/[0.1] hover:text-white",
          isSidebarOpen ? "pointer-events-none opacity-0" : "opacity-100",
        ].join(" ")}
        aria-label="Open sidebar"
      >
        <FiMenu />
      </button>

      <div className="relative flex min-h-screen flex-col">
        <DashboardHeader
          activeView={activeView}
          displayName={displayName}
          hasUnreadNotifications={unreadNotificationCount > 0}
          notificationCount={unreadNotificationCount}
          onNotificationsClick={openNotifications}
          onSaveProfile={handleProfileSave}
          profile={profile}
        />

        <main className="flex-1 px-4 pb-4 pt-2 sm:px-6">
          <div
            className={[
              isChatView
                ? "w-full"
                : activeView === DASHBOARD_VIEWS.MY_SPACE
                  ? "mx-auto w-full max-w-6xl"
                  : "mx-auto w-full max-w-6xl",
            ].join(" ")}
          >
            {renderView()}
          </div>
        </main>
      </div>

      {isLoggingOut ? (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-neutral-950/84 backdrop-blur-xl">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.14),_transparent_32%),linear-gradient(135deg,rgba(10,10,10,0.98)_0%,rgba(24,24,27,0.99)_54%,rgba(9,9,11,1)_100%)] animate-gradient" />
            <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-white/8 blur-3xl" />
            <div className="absolute -bottom-40 -left-32 h-96 w-96 rounded-full bg-white/6 blur-3xl" />
            <div className="absolute inset-0 bg-dot-grid opacity-15 animate-grid" />
          </div>
          <div className="relative flex flex-col items-center gap-4 px-6 text-center">
            <div className="h-12 w-12 animate-spin rounded-full border-2 border-white/15 border-t-white" />
            <div className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">Logging out</div>
            <div className="text-sm text-white/70">Securing your session and returning to login.</div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
