import { getProductStory } from "@/lib/site";

type ProductVisualProps = {
  handle: string;
  title: string;
  category?: string;
  size?: "card" | "detail";
};

export function ProductVisual({
  handle,
  title,
  category = "Tarot deck",
  size = "card",
}: ProductVisualProps) {
  const story = getProductStory(handle);
  const isDetail = size === "detail";

  return (
    <div
      className={`relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br ${story.gradient} ${
        isDetail ? "aspect-[4/5] p-8 md:p-10" : "aspect-[4/5] p-5"
      }`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.32),transparent_32%),linear-gradient(180deg,transparent,rgba(17,24,39,0.2))]" />
      <div className="absolute inset-6 rounded-[1.5rem] border border-white/20" />
      <div className="absolute inset-x-10 top-10 h-px bg-white/20" />
      <div className="absolute inset-x-10 bottom-10 h-px bg-white/12" />
      <div
        className={`absolute border border-white/14 bg-[color:rgba(255,255,255,0.12)] shadow-[0_18px_34px_rgba(0,0,0,0.16)] ${
          isDetail
            ? "bottom-10 right-10 h-32 w-24 rotate-[14deg] rounded-[1.35rem]"
            : "bottom-8 right-8 h-24 w-[4.5rem] rotate-[14deg] rounded-[1.15rem]"
        }`}
      />
      <div
        className={`absolute border border-white/16 bg-[color:rgba(255,255,255,0.22)] shadow-[0_18px_34px_rgba(0,0,0,0.18)] ${
          isDetail
            ? "bottom-12 right-14 h-32 w-24 rotate-[5deg] rounded-[1.35rem]"
            : "bottom-9 right-11 h-24 w-[4.5rem] rotate-[5deg] rounded-[1.15rem]"
        }`}
      />
      {isDetail ? (
        <div className="absolute bottom-14 right-20 flex h-36 w-28 flex-col justify-between rounded-[1.35rem] border border-white/18 bg-[color:rgba(255,255,255,0.28)] p-4 shadow-[0_24px_44px_rgba(0,0,0,0.18)]">
          <div className="font-mono text-[0.58rem] uppercase tracking-[0.32em] text-white/78">Deck box</div>
          <div className="font-display text-2xl leading-none text-white">{title}</div>
          <div className="font-mono text-[0.58rem] uppercase tracking-[0.28em] text-white/72">78 cards</div>
        </div>
      ) : null}

      <div className="relative flex h-full flex-col justify-between">
        <div className="flex items-start justify-between gap-3">
          <div className="rounded-full border border-white/20 bg-black/15 px-4 py-2 font-mono text-[0.66rem] uppercase tracking-[0.34em] text-white/78">
            {story.eyebrow}
          </div>
          <div className="rounded-full border border-white/16 bg-black/10 px-3 py-2 font-mono text-[0.62rem] uppercase tracking-[0.3em] text-white/65">
            {category}
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-white/16 bg-[color:rgba(255,255,255,0.12)] p-5 backdrop-blur-sm">
          <div className="font-mono text-[0.64rem] uppercase tracking-[0.38em] text-white/68">
            tarotdeck.online
          </div>
          <h3
            className={`font-display mt-3 leading-none text-white ${
              isDetail ? "text-5xl md:text-6xl" : "text-3xl"
            }`}
          >
            {title}
          </h3>
          <p className={`mt-3 max-w-[28rem] text-white/78 ${isDetail ? "text-base leading-7" : "text-sm leading-6"}`}>
            {story.note}
          </p>
        </div>
      </div>
    </div>
  );
}
