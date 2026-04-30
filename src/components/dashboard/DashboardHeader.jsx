import { FiBell } from "react-icons/fi";

export default function DashboardHeader({
  activeMeta,
  displayName,
  hasUnreadNotifications,
  notificationCount,
  onNotificationsClick,
}) {
  return (
    <header className="sticky top-0 z-20 bg-neutral-950/85 backdrop-blur">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-16 py-3 sm:px-20">
        <div>
          <div className="text-sm font-medium text-white">{activeMeta.title}</div>
          <div className="text-xs text-neutral-500">{activeMeta.description}</div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onNotificationsClick}
            className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-black/60 bg-white text-black transition hover:bg-neutral-100"
            aria-label="Open notifications"
          >
            <FiBell className="text-lg" />
            {hasUnreadNotifications ? (
              <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-red-500 shadow-[0_0_0_2px_rgba(255,255,255,0.95)]" />
            ) : null}
            {notificationCount ? (
              <span
                className={[
                  "absolute -right-1 -top-1 flex min-h-[20px] min-w-[20px] items-center justify-center rounded-full border text-[10px] font-semibold",
                  hasUnreadNotifications
                    ? "border-white bg-black text-white"
                    : "border-black/10 bg-neutral-200 text-black",
                ].join(" ")}
              >
                {notificationCount > 9 ? "9+" : notificationCount}
              </span>
            ) : null}
          </button>

          <div className="truncate text-xs text-neutral-500">{displayName}</div>
        </div>
      </div>
    </header>
  );
}
