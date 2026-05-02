import { FiBell, FiX } from "react-icons/fi";

function NotificationSkeletonCard() {
  return (
    <div className="dashboard-surface animate-pulse rounded-[28px] border p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="h-4 w-40 rounded-full bg-white/[0.08]" />
        <div className="h-3 w-10 rounded-full bg-white/[0.06]" />
      </div>
      <div className="mt-3 h-3 w-full rounded-full bg-white/[0.06]" />
      <div className="mt-2 h-3 w-4/5 rounded-full bg-white/[0.06]" />
      <div className="mt-4 h-3 w-16 rounded-full bg-white/[0.06]" />
    </div>
  );
}

export default function NotificationTray({ isOpen, isLoading = false, notifications, onClose, onNotificationClick }) {
  return (
    <>
      <div
        className={[
          "dashboard-backdrop fixed inset-0 z-40 transition",
          isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        ].join(" ")}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={[
          "dashboard-panel fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l p-5 backdrop-blur-xl transition duration-300",
          isOpen ? "translate-x-0" : "translate-x-full",
        ].join(" ")}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="dashboard-muted text-xs uppercase tracking-[0.28em]">Notifications</p>
            <h3 className="dashboard-title mt-2 text-2xl font-semibold tracking-tight">Activity Queue</h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="dashboard-action flex h-11 w-11 items-center justify-center rounded-2xl border transition"
            aria-label="Close notifications"
          >
            <FiX />
          </button>
        </div>

        <div className="mt-5 flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto pr-1">
          <div className="dashboard-surface rounded-[28px] border p-4">
            <div className="flex items-start gap-3">
              <span className="dashboard-surface-strong dashboard-copy mt-1 flex h-10 w-10 items-center justify-center rounded-2xl border">
                <FiBell />
              </span>
              <div>
                <h4 className="dashboard-title text-sm font-medium">Activity on your posts</h4>
                <p className="dashboard-copy mt-1 text-sm">
                  Likes and comments on your discussion posts will show up here as local notifications.
                </p>
              </div>
            </div>
          </div>

          {isLoading ? (
            <>
              <NotificationSkeletonCard />
              <NotificationSkeletonCard />
              <NotificationSkeletonCard />
            </>
          ) : notifications.length ? (
            notifications.map((notification) => (
              <button
                type="button"
                key={notification.id}
                onClick={() => onNotificationClick(notification)}
                className="dashboard-surface w-full rounded-[28px] border p-4 text-left transition hover:border-white/20 hover:bg-white/[0.07]"
              >
                <div className="flex items-center justify-between gap-3">
                  <h4 className="dashboard-title text-sm font-medium">{notification.title}</h4>
                  <span className="dashboard-muted text-xs">
                    {notification.unread ? "New" : notification.timestamp}
                  </span>
                </div>
                <p className="dashboard-copy mt-2 break-words font-mono text-sm">{notification.detail}</p>
                {notification.postId ? (
                  <p className="dashboard-muted mt-3 text-xs uppercase tracking-[0.2em]">Open post</p>
                ) : null}
              </button>
            ))
          ) : (
            <div className="dashboard-surface rounded-[28px] border border-dashed px-4 py-6 text-sm dashboard-copy">
              No notifications yet.
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
