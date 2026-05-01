import { FiBell, FiX } from "react-icons/fi";

function NotificationSkeletonCard() {
  return (
    <div className="animate-pulse rounded-[28px] border border-white/10 bg-white/[0.04] p-4">
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
          "fixed inset-0 z-40 bg-black/40 transition",
          isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        ].join(" ")}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={[
          "fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-white/10 bg-neutral-950/96 p-5 backdrop-blur-xl transition duration-300",
          isOpen ? "translate-x-0" : "translate-x-full",
        ].join(" ")}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-neutral-500">Notifications</p>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight text-white">Activity Queue</h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-neutral-300 transition hover:bg-white/[0.08] hover:text-white"
            aria-label="Close notifications"
          >
            <FiX />
          </button>
        </div>

        <div className="mt-5 flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto pr-1">
          <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-4">
            <div className="flex items-start gap-3">
              <span className="mt-1 flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-black/25 text-neutral-300">
                <FiBell />
              </span>
              <div>
                <h4 className="text-sm font-medium text-white">Activity on your posts</h4>
                <p className="mt-1 text-sm text-neutral-400">
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
                className="w-full rounded-[28px] border border-white/10 bg-white/[0.04] p-4 text-left transition hover:border-white/20 hover:bg-white/[0.07]"
              >
                <div className="flex items-center justify-between gap-3">
                  <h4 className="text-sm font-medium text-white">{notification.title}</h4>
                  <span className="text-xs text-neutral-500">
                    {notification.unread ? "New" : notification.timestamp}
                  </span>
                </div>
                <p className="mt-2 break-words font-mono text-sm text-neutral-300">{notification.detail}</p>
                {notification.postId ? (
                  <p className="mt-3 text-xs uppercase tracking-[0.2em] text-neutral-500">Open post</p>
                ) : null}
              </button>
            ))
          ) : (
            <div className="rounded-[28px] border border-dashed border-white/10 bg-white/[0.03] px-4 py-6 text-sm text-neutral-400">
              No notifications yet.
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
