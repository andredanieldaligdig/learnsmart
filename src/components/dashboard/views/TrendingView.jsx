import { useEffect, useState } from "react";
import { FiHeart, FiMessageCircle, FiSave } from "react-icons/fi";
import PlaceholderBlock from "../PlaceholderBlock.jsx";
import { TRENDING_SORT_OPTIONS } from "../dashboardConfig.js";

function ActionButton({ icon: Icon, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm text-neutral-300 transition hover:border-white/18 hover:bg-white/[0.08] hover:text-white"
    >
      <Icon />
      {label}
    </button>
  );
}

function FeedRequestCard({ currentSort, page }) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-4">
      <div className="text-xs uppercase tracking-[0.28em] text-neutral-500">Infinite scroll page {page}</div>
      <div className="mt-3 rounded-2xl border border-white/8 bg-black/20 px-4 py-3 font-mono text-sm text-neutral-300">
        {`<FETCH POSTS FROM DATABASE>?page=${page}&sort=${currentSort}`}
      </div>
    </div>
  );
}

export default function TrendingView({
  currentPageCount,
  currentSort,
  onAction,
  onLoadMore,
  onSortChange,
}) {
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    if (!isLoadingMore) return undefined;

    const timeoutId = window.setTimeout(() => {
      setIsLoadingMore(false);
    }, 320);

    return () => window.clearTimeout(timeoutId);
  }, [isLoadingMore]);

  function handleFeedScroll(event) {
    const node = event.currentTarget;
    const remainingSpace = node.scrollHeight - node.scrollTop - node.clientHeight;

    if (remainingSpace > 140 || isLoadingMore) return;

    setIsLoadingMore(true);
    onLoadMore();
  }

  return (
    <section className="space-y-5">
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">Trending feed</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">Reddit-style posts with infinite scroll placeholders.</h2>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-neutral-400">
                Sorting and action wiring are active on the frontend. Replace each placeholder card with real post data sorted by likes or saves.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {TRENDING_SORT_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => onSortChange(option.id)}
                  className={[
                    "rounded-full border px-4 py-2 text-sm transition",
                    currentSort === option.id
                      ? "border-white/16 bg-white text-black"
                      : "border-white/10 bg-black/20 text-neutral-300 hover:border-white/18 hover:bg-white/[0.08] hover:text-white",
                  ].join(" ")}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div
            className="mt-6 max-h-[720px] space-y-4 overflow-y-auto pr-1"
            onScroll={handleFeedScroll}
          >
            <article className="rounded-[28px] border border-white/10 bg-black/20 p-5">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-[22px] border border-white/10 bg-white/[0.06] font-mono text-xs text-neutral-300">
                  {"<USER_PROFILE_IMAGE>"}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-mono text-sm text-neutral-300">{"<USERNAME>"}</div>
                  <div className="mt-3 rounded-2xl border border-white/8 bg-white/[0.04] px-4 py-4 font-mono text-sm text-neutral-300">
                    {"<POST_CONTENT>"}
                  </div>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <ActionButton icon={FiHeart} label="Like" onClick={() => onAction("like")} />
                <ActionButton icon={FiSave} label="Save" onClick={() => onAction("save")} />
                <ActionButton icon={FiMessageCircle} label="Comment" onClick={() => onAction("comment")} />
              </div>
            </article>

            {Array.from({ length: currentPageCount }, (_, index) => (
              <FeedRequestCard key={`feed-page-${index + 1}`} currentSort={currentSort} page={index + 1} />
            ))}

            <div className="rounded-[28px] border border-dashed border-white/12 bg-white/[0.03] p-4 text-sm text-neutral-400">
              {isLoadingMore
                ? "Queueing the next backend page..."
                : "Scroll to the bottom to queue the next placeholder page for infinite loading."}
            </div>
          </div>
        </div>

        <PlaceholderBlock
          label="Trending actions"
          lines={["<ON_LIKE_API_CALL>", "<ON_SAVE_API_CALL>", "<ON_COMMENT_API_CALL>"]}
          note="Each action already adds a local notification placeholder that you can swap for a real endpoint response."
        />
      </div>
    </section>
  );
}
