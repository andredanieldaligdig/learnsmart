import { useEffect, useState } from "react";
import { FiMenu } from "react-icons/fi";
import { getAccountProfile } from "../../supabase.js";
import DashboardHeader from "./dashboard/DashboardHeader.jsx";
import NotificationTray from "./dashboard/NotificationTray.jsx";
import DashboardSidebar from "./dashboard/DashboardSidebar.jsx";
import {
  DASHBOARD_VIEWS,
  MY_SPACE_TABS,
  VIEW_META,
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

function createDiscussionPost({ authorImageAlt, authorImageSrc, authorName, content }) {
  const trimmedContent = content.trim();

  return {
    id: createId("post"),
    authorImageAlt,
    authorImageSrc,
    authorName,
    content: trimmedContent,
    createdAt: Date.now(),
    likes: 0,
    comments: 0,
    saves: 0,
  };
}

function createNotification({ detail, title }) {
  return {
    id: createId("notification"),
    title,
    detail,
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
  const [commentedPostIds, setCommentedPostIds] = useState([]);
  const [isNotificationTrayOpen, setIsNotificationTrayOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
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
    let cancelled = false;

    async function syncDisplayName() {
      const metadataName = getMetadataName(user);

      if (metadataName) {
        if (cancelled) return;
        setProfile((currentProfile) => ({
          ...currentProfile,
          displayName: metadataName,
        }));
        return;
      }

      if (!user?.id) {
        if (cancelled) return;
        setProfile((currentProfile) => ({
          ...currentProfile,
          displayName: getDisplayName(user),
        }));
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
        setProfile((currentProfile) => ({
          ...currentProfile,
          displayName: getDisplayName(user),
        }));
      }
    }

    syncDisplayName();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const activeChat = chatSessions.find((chat) => chat.id === activeChatId) || null;
  const currentMessages = activeChat?.messages?.length ? activeChat.messages : EMPTY_CHAT_MESSAGES;
  const recentChats = [...chatSessions].sort((left, right) => right.updatedAt - left.updatedAt);
  const activeMeta = VIEW_META[activeView] || VIEW_META[DASHBOARD_VIEWS.NEW_CHAT];
  const displayName = profile.displayName?.trim() || "<USER_NAME>";
  const isChatView = activeView === DASHBOARD_VIEWS.NEW_CHAT;
  const isEmptyDraftChat = isChatView && (!activeChat || activeChat.messages.length === 0);
  const unreadNotificationCount = notifications.filter((notification) => notification.unread).length;

  function closeSidebar() {
    setIsSidebarOpen(false);
  }

  function openNotifications() {
    setIsNotificationTrayOpen(true);
    setNotifications((currentNotifications) =>
      currentNotifications.map((notification) => ({
        ...notification,
        unread: false,
      })),
    );
  }

  function closeNotifications() {
    setIsNotificationTrayOpen(false);
  }

  function openView(viewId) {
    setActiveView(viewId);
    closeSidebar();
  }

  function handleNewChat() {
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
      const existingSession = currentSessions.find((session) => session.id === targetId);
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
      const remainingSessions = currentSessions.filter((session) => session.id !== targetId);

      return [nextSession, ...remainingSessions];
    });

    setChatInput("");
  }

  function handleRecentChatSelect(chatId) {
    setActiveChatId(chatId);
    setActiveView(DASHBOARD_VIEWS.NEW_CHAT);
    closeSidebar();
  }

  async function handleCreatePost(content) {
    await waitForUiFeedback();

    const nextPost = createDiscussionPost({
      authorImageAlt: profile.imageAlt,
      authorImageSrc: profile.imageSrc,
      authorName: displayName,
      content,
    });

    setDiscussionPosts((currentPosts) => [nextPost, ...currentPosts]);
    return nextPost;
  }

  function handleLikePost(postId) {
    if (likedPostIds.includes(postId)) return;

    setLikedPostIds((currentLikedPostIds) => [...currentLikedPostIds, postId]);
    setDiscussionPosts((currentPosts) =>
      currentPosts.map((post) =>
        post.id === postId
          ? {
              ...post,
              likes: post.likes + 1,
            }
          : post,
      ),
    );
    setNotifications((currentNotifications) => [
      createNotification({
        title: "New like on your post",
        detail: `${displayName} liked one of your discussion posts.`,
      }),
      ...currentNotifications,
    ]);
  }

  async function handleSavePost(postId) {
    if (savedPostIds.includes(postId)) return false;

    await waitForUiFeedback();
    setSavedPostIds((currentSavedPostIds) => [...currentSavedPostIds, postId]);
    setDiscussionPosts((currentPosts) =>
      currentPosts.map((post) =>
        post.id === postId
          ? {
              ...post,
              saves: post.saves + 1,
            }
          : post,
      ),
    );

    return true;
  }

  async function handleCommentPost(postId) {
    if (commentedPostIds.includes(postId)) return false;

    await waitForUiFeedback();
    setCommentedPostIds((currentCommentedPostIds) => [...currentCommentedPostIds, postId]);
    setDiscussionPosts((currentPosts) =>
      currentPosts.map((post) =>
        post.id === postId
          ? {
              ...post,
              comments: post.comments + 1,
            }
          : post,
      ),
    );
    setNotifications((currentNotifications) => [
      createNotification({
        title: "New comment on your post",
        detail: `${displayName} commented on one of your discussion posts.`,
      }),
      ...currentNotifications,
    ]);

    return true;
  }

  function handleProfileFieldChange(field, value) {
    setProfile((currentProfile) => ({
      ...currentProfile,
      [field]: value,
    }));
  }

  function handleProfileImageUpload(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      const imageResult = typeof reader.result === "string" ? reader.result : "";

      setProfile((currentProfile) => ({
        ...currentProfile,
        imageSrc: imageResult,
        imageAlt: file.name || "<INSERT PROFILE IMAGE HERE>",
      }));
    };

    reader.readAsDataURL(file);
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
        />
      );
    }

    if (activeView === DASHBOARD_VIEWS.DISCUSSIONS) {
      return (
        <DiscussionsView
          commentedPostIds={commentedPostIds}
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
        onProfileFieldChange={handleProfileFieldChange}
        onProfileImageUpload={handleProfileImageUpload}
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
        onClose={closeSidebar}
        onLogout={onLogout}
        onNewChat={handleNewChat}
        onSelectChat={handleRecentChatSelect}
        onSelectView={openView}
      />

      <NotificationTray
        isOpen={isNotificationTrayOpen}
        notifications={notifications}
        onClose={closeNotifications}
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
          activeMeta={activeMeta}
          displayName={displayName}
          hasUnreadNotifications={unreadNotificationCount > 0}
          notificationCount={notifications.length}
          onNotificationsClick={openNotifications}
        />

        <main className="flex-1 px-4 pb-4 pt-2 sm:px-6">
          <div className={isChatView ? "w-full" : "mx-auto w-full max-w-4xl"}>{renderView()}</div>
        </main>
      </div>
    </div>
  );
}
