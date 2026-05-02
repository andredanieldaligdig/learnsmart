import { FiLogOut, FiMoon, FiSun, FiTrash2, FiX } from "react-icons/fi";
import ProfileAvatar from "./ProfileAvatar.jsx";
import { DASHBOARD_VIEWS, SIDEBAR_ITEMS } from "./dashboardConfig.js";

function SidebarNavItem({ active, icon: Icon, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "flex w-full items-center gap-3 rounded-xl border px-3 py-2 text-left text-sm transition duration-200",
        active
          ? "dashboard-theme-toggle dashboard-title"
          : "dashboard-action",
      ].join(" ")}
    >
      <span className="dashboard-surface flex h-8 w-8 items-center justify-center rounded-lg border">
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
  isLoggingOut,
  isEmptyDraftChat,
  isOpen,
  profile,
  recentChats,
  theme,
  user,
  onClose,
  onDeleteChat,
  onLogout,
  onNewChat,
  onSelectChat,
  onSelectView,
  onToggleTheme,
}) {
  const nextThemeLabel = theme === "dark" ? "Light mode" : "Dark mode";

  return (
    <aside
      className={[
        "dashboard-panel fixed inset-y-0 left-0 z-40 flex w-64 flex-col px-4 py-4 backdrop-blur-xl transition duration-300 sm:w-72",
        isOpen ? "translate-x-0" : "-translate-x-full",
      ].join(" ")}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="dashboard-muted text-xs uppercase tracking-[0.28em]">LearnSmart</p>
          <h1 className="dashboard-title mt-1 text-base font-medium">Menu</h1>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="dashboard-action flex h-9 w-9 items-center justify-center rounded-lg border transition"
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
              isLoggingOut
                ? () => {}
                : item.id === DASHBOARD_VIEWS.NEW_CHAT
                  ? onNewChat
                  : () => onSelectView(item.id)
            }
          />
        ))}
      </div>

      <div className="mt-5 min-h-0 flex-1 overflow-y-auto pr-1">
        {recentChats.length ? (
          <>
            <div className="dashboard-muted text-xs uppercase tracking-[0.24em]">Recent Chats</div>
            <div className="mt-3 space-y-1">
              {recentChats.slice(0, 8).map((chat) => (
                <div
                  key={chat.id}
                  className={[
                    "flex items-center gap-2 rounded-xl border px-2 py-1 text-sm transition",
                    activeChatId === chat.id && activeView === DASHBOARD_VIEWS.NEW_CHAT
                      ? "dashboard-theme-toggle dashboard-title"
                      : "dashboard-action",
                  ].join(" ")}
                >
                  <button
                    type="button"
                    onClick={() => onSelectChat(chat.id)}
                    className="min-w-0 flex-1 rounded-lg px-2 py-1 text-left"
                    disabled={isLoggingOut}
                  >
                    <div className="truncate">{chat.title}</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteChat(chat.id)}
                    disabled={isLoggingOut}
                    className="dashboard-muted flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition hover:bg-white/[0.08] hover:text-rose-200 disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label={`Delete ${chat.title}`}
                  >
                    <FiTrash2 className="text-sm" />
                  </button>
                </div>
              ))}
            </div>
          </>
        ) : null}
      </div>

      <div className="dashboard-surface mt-4 rounded-xl border p-3">
        <div className="dashboard-muted text-[11px] uppercase tracking-[0.22em]">Appearance</div>
        <button
          type="button"
          onClick={onToggleTheme}
          disabled={isLoggingOut}
          className="dashboard-theme-toggle mt-3 flex w-full items-center justify-between rounded-xl border px-3 py-3 text-left transition disabled:cursor-not-allowed disabled:opacity-60"
        >
          <div className="flex items-center gap-3">
            <span className="dashboard-theme-toggle-indicator flex h-9 w-9 items-center justify-center rounded-full">
              {theme === "dark" ? <FiSun /> : <FiMoon />}
            </span>
            <div>
              <div className="dashboard-title text-sm font-medium">{nextThemeLabel}</div>
              <div className="dashboard-muted mt-0.5 text-xs">
                Switch the dashboard palette instantly.
              </div>
            </div>
          </div>
          <span className="dashboard-muted text-xs uppercase tracking-[0.18em]">
            {theme === "dark" ? "Dark" : "Light"}
          </span>
        </button>
      </div>

      <div className="dashboard-surface mt-4 rounded-xl border p-3">
        <div className="flex items-center gap-3">
          <ProfileAvatar
            displayName={profile.displayName}
            imageAlt={profile.imageAlt}
            imageSrc={profile.imageSrc}
            size="sm"
          />
          <div className="min-w-0">
            <div className="dashboard-title truncate text-sm">{profile.displayName || "User"}</div>
            <div className="dashboard-muted truncate text-xs">{user?.email || ""}</div>
          </div>
        </div>
        <button
          type="button"
          onClick={onLogout}
          disabled={isLoggingOut}
          className={[
            "mt-3 flex w-full items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm transition",
            isLoggingOut
              ? "dashboard-action-strong cursor-wait"
              : "dashboard-action",
          ].join(" ")}
        >
          <FiLogOut />
          {isLoggingOut ? "Logging out..." : "Logout"}
        </button>
      </div>
    </aside>
  );
}
