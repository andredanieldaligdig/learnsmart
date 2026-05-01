import { FiLogOut, FiX } from "react-icons/fi";
import ProfileAvatar from "./ProfileAvatar.jsx";
import { DASHBOARD_VIEWS, SIDEBAR_ITEMS } from "./dashboardConfig.js";

function SidebarNavItem({ active, icon: Icon, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition duration-200",
        active
          ? "bg-white/[0.1] text-white"
          : "text-neutral-300 hover:bg-white/[0.06] hover:text-white",
      ].join(" ")}
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.04]">
        <Icon className="text-base" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-medium">{label}</span>
      </span>
    </button>
  );
}

export default function DashboardSidebar({
  activeChatId,
  activeView,
  isEmptyDraftChat,
  isOpen,
  profile,
  recentChats,
  user,
  onClose,
  onLogout,
  onNewChat,
  onSelectChat,
  onSelectView,
}) {
  return (
    <aside
      className={[
        "fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-neutral-900/96 px-4 py-4 shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl transition duration-300 sm:w-72",
        isOpen ? "translate-x-0" : "-translate-x-full",
      ].join(" ")}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-neutral-500">LearnSmart</p>
          <h1 className="mt-1 text-base font-medium text-white">Menu</h1>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.06] text-neutral-300 transition hover:bg-white/[0.1] hover:text-white"
          aria-label="Close sidebar"
        >
          <FiX />
        </button>
      </div>

      <div className="mt-4 space-y-1">
        {SIDEBAR_ITEMS.map((item) => (
          <SidebarNavItem
            key={item.id}
            active={
              item.id === DASHBOARD_VIEWS.NEW_CHAT
                ? isEmptyDraftChat
                : activeView === item.id
            }
            icon={item.icon}
            label={item.label}
            onClick={
              item.id === DASHBOARD_VIEWS.NEW_CHAT
                ? onNewChat
                : () => onSelectView(item.id)
            }
          />
        ))}
      </div>

      <div className="mt-5 min-h-0 flex-1 overflow-y-auto pr-1">
        {recentChats.length ? (
          <>
            <div className="text-xs uppercase tracking-[0.24em] text-neutral-500">Recent Chats</div>

            <div className="mt-3 space-y-1">
              {recentChats.slice(0, 8).map((chat) => (
                <button
                  key={chat.id}
                  type="button"
                  onClick={() => onSelectChat(chat.id)}
                  className={[
                    "w-full rounded-xl px-3 py-2 text-left text-sm transition",
                    activeChatId === chat.id && activeView === DASHBOARD_VIEWS.NEW_CHAT
                      ? "bg-white/[0.08] text-white"
                      : "text-neutral-400 hover:bg-white/[0.05] hover:text-white",
                  ].join(" ")}
                >
                  <div className="truncate">{chat.title}</div>
                </button>
              ))}
            </div>
          </>
        ) : null}
      </div>

      <div className="mt-4 bg-white/[0.04] p-3 rounded-xl">
        <div className="flex items-center gap-3">
          <ProfileAvatar
            displayName={profile.displayName}
            imageAlt={profile.imageAlt}
            imageSrc={profile.imageSrc}
            size="sm"
          />
          <div className="min-w-0">
            <div className="truncate text-sm text-white">{profile.displayName || "<USER_NAME>"}</div>
            <div className="truncate text-xs text-neutral-500">{user?.email || "<USER_EMAIL>"}</div>
          </div>
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-white/[0.06] px-4 py-2 text-sm text-neutral-300 transition hover:bg-white/[0.1] hover:text-white"
        >
          <FiLogOut />
          Logout
        </button>
      </div>
    </aside>
  );
}
