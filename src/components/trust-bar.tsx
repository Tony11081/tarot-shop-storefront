type TrustBarProps = {
  accent?: "dark" | "light";
  items: string[];
};

export function TrustBar({ accent = "light", items }: TrustBarProps) {
  const isDark = accent === "dark";

  return (
    <div
      className={`grid gap-3 sm:grid-cols-3 ${
        isDark ? "text-[color:var(--background)]" : "text-[color:var(--foreground)]"
      }`}
    >
      {items.map((item) => (
        <div
          key={item}
          className={`rounded-[1.4rem] border px-4 py-3 text-sm leading-7 ${
            isDark
              ? "border-white/12 bg-white/8 text-[color:rgba(243,234,216,0.82)]"
              : "border-[color:var(--border)] bg-white/68"
          }`}
        >
          {item}
        </div>
      ))}
    </div>
  );
}
