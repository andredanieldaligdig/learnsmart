import PlaceholderBlock from "../PlaceholderBlock.jsx";
import { DASHBOARD_VIEWS } from "../dashboardConfig.js";

function QuickRouteCard({ description, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5 text-left transition hover:border-white/18 hover:bg-white/[0.08]"
    >
      <div className="text-sm font-medium text-white">{label}</div>
      <div className="mt-2 text-sm leading-6 text-neutral-400">{description}</div>
    </button>
  );
}

export default function NavigationView({ lastSearch, onOpenView }) {
  return (
    <section className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.9fr)]">
        <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">Navigation</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">Move through the product without leaving the dashboard.</h2>
          <p className="mt-3 text-sm leading-7 text-neutral-400">
            This view is designed as a routing hub for future discovery APIs, saved topics, and search results.
          </p>
          <div className="mt-4 rounded-[24px] border border-white/10 bg-black/20 px-4 py-3 text-sm text-neutral-300">
            {lastSearch ? `Last search: ${lastSearch}` : "Search to populate this space with real navigation results."}
          </div>
        </div>

        <PlaceholderBlock
          label="Navigation backend"
          lines={["<FETCH_NAVIGATION_RESULTS>", "<FETCH_LEARNING_PATHS>", "<FETCH_SAVED_TOPICS>"]}
          note="Use the search query and current user context to hydrate this navigation hub."
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <QuickRouteCard
          label="Return to New Chat"
          description="Open the AI chat surface and continue the current session."
          onClick={() => onOpenView(DASHBOARD_VIEWS.NEW_CHAT)}
        />
        <QuickRouteCard
          label="Browse Discussions"
          description="Jump into forum threads and long-form community replies."
          onClick={() => onOpenView(DASHBOARD_VIEWS.DISCUSSIONS)}
        />
        <QuickRouteCard
          label="Open Trending"
          description="Inspect the infinite feed sorted by likes or saved activity."
          onClick={() => onOpenView(DASHBOARD_VIEWS.TRENDING)}
        />
        <QuickRouteCard
          label="Go to My Space"
          description="Manage profile details, saved items, and bookmarks."
          onClick={() => onOpenView(DASHBOARD_VIEWS.MY_SPACE)}
        />
      </div>
    </section>
  );
}
