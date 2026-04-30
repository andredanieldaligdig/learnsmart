import PlaceholderBlock from "../PlaceholderBlock.jsx";

export default function SavedTopicsView({ onOpenMySpace }) {
  return (
    <section className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.9fr)]">
        <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">SavedTopics</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">A dedicated surface for stored learning themes.</h2>
          <p className="mt-3 text-sm leading-7 text-neutral-400">
            This view exists separately in the sidebar, while the same data can still appear inside My Space. Use whichever surface fits your backend model best.
          </p>
          <button
            type="button"
            onClick={onOpenMySpace}
            className="mt-5 rounded-[24px] border border-white/12 bg-white px-4 py-3 text-sm font-medium text-black transition hover:bg-neutral-200"
          >
            Open My Space collections
          </button>
        </div>

        <PlaceholderBlock
          label="Saved topics"
          lines={["<FETCH_SAVED_TOPICS>", "<TOPIC_TITLE>", "<TOPIC_SUMMARY>"]}
          note="Map this view to saved topic entities or aggregate them from the user profile."
        />
      </div>
    </section>
  );
}
