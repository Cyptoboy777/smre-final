import { Panel } from "@/components/ui/Panel";

const scaffoldItems = [
  "News feed route will sit behind /api/groq/briefing and /api/groq/summarize.",
  "Client fetches will use SWR, not ad hoc useEffect calls.",
  "Signal enrichment remains server-side until Groq prompt design is approved.",
];

export function NewsStreamScaffold() {
  return (
    <Panel title="News Stream" eyebrow="Widget / Data Pipeline" className="flex-1">
      <div className="space-y-3 text-sm leading-6 text-white/70">
        {scaffoldItems.map((item) => (
          <div key={item} className="rounded-2xl border border-white/8 bg-white/[0.02] px-3 py-3">
            {item}
          </div>
        ))}
      </div>
    </Panel>
  );
}
