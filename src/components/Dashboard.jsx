import { useEffect, useState } from "react";
import { FiMenu } from "react-icons/fi";
import { getAccountProfile, updateAccountProfile } from "../../supabase.js";
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

function createComment({ authorName, content }) {
  return {
    id: createId("comment"),
    authorName,
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
      if (metadataName) {
        if (cancelled) return;
        setProfile((currentProfile) => ({ ...currentProfile, displayName: metadataName }));
        return;
      }
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
          displayName: accountProfile?.username || getDisplayName(user),
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
      const remainingSessions = currentSessions.filter((s) => s.id !== targetId);
      return [nextSession, ...remainingSessions];
    });

    setChatInput("");
  }

  // Called by ChatModule as tokens stream in
  function handleStreamingUpdate(messageId, content, streaming) {
    setChatSessions((currentSessions) =>
      currentSessions.map((session) => {
        if (!session.messages.some((m) => m.id === messageId)) return session;
        return {
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
      })
    );
  }

  function handleRecentChatSelect(chatId) {
    if (isLoggingOut) return;
    setHighlightedPostId(null);
    setActiveChatId(chatId);
    setActiveView(DASHBOARD_VIEWS.NEW_CHAT);
    closeSidebar();
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
    return nextPost;
  }

  function handleLikePost(postId) {
    if (isLoggingOut) return;
    if (likedPostIds.includes(postId)) return;
    setLikedPostIds((ids) => [...ids, postId]);
    setDiscussionPosts((currentPosts) =>
      currentPosts.map((post) =>
        post.id === postId ? { ...post, likes: post.likes + 1 } : post
      )
    );
    setNotifications((currentNotifications) => [
      createNotification({
        title: "New like on your post",
        detail: `${displayName} liked one of your discussion posts.`,
        postId,
      }),
      ...currentNotifications,
    ]);
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
    return true;
  }

  async function handleCommentPost(postId, content) {
    if (isLoggingOut) return false;
    const trimmedContent = content.trim();
    if (!trimmedContent) return false;
    await waitForUiFeedback();
    const nextComment = createComment({ authorName: displayName, content: trimmedContent });
    setDiscussionPosts((currentPosts) =>
      currentPosts.map((post) =>
        post.id === postId
          ? { ...post, comments: [...post.comments, nextComment] }
          : post
      )
    );
    setNotifications((currentNotifications) => [
      createNotification({
        title: "New comment on your post",
        detail: `${displayName} replied: ${trimmedContent}`,
        postId,
      }),
      ...currentNotifications,
    ]);
    return true;
  }

  
  async function handleProfileSave(nextProfile) {
    if (isLoggingOut) return;
    const trimmedDisplayName = nextProfile.displayName?.trim();

    if (user?.id && trimmedDisplayName) {
      await updateAccountProfile(user.id, { displayName: trimmedDisplayName });
    }

    await waitForUiFeedback();
    setProfile((currentProfile) => ({
      ...currentProfile,
      ...nextProfile,
      bio: nextProfile.bio || "",
      displayName: trimmedDisplayName || currentProfile.displayName,
      imageAlt: nextProfile.imageAlt || currentProfile.imageAlt,
      // ✅ Only update imageSrc if a new one was actually provided — never wipe it
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
          focusedPostId={highlightedPostId}
          likedPostIds={likedPostIds}
          posts={discussionPosts}
          savedPostIds={savedPostIds}
          onCommentPost={handleCommentPost}
          onLikePost={handleLikePost}
          onSavePost={handleSavePost}
        />
      );
    }

    return (
      <MySpaceView
        activeTab={mySpaceTab}
        displayName={displayName}
        likedPostIds={likedPostIds}
        posts={discussionPosts}
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
                  : "mx-auto w-full max-w-5xl",
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