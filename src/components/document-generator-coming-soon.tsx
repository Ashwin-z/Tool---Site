type DocumentGeneratorComingSoonProps = {
  icon: string;
  title: string;
  description: string;
};

export default function DocumentGeneratorComingSoon({
  icon,
  title,
  description,
}: DocumentGeneratorComingSoonProps) {
  return (
    <div className="mt-10 flex flex-col items-center justify-center rounded-2xl border border-border bg-surface px-6 py-20 text-center shadow-[0_20px_60px_rgba(0,0,0,.55)]">
      <div className="mb-4 text-6xl">{icon}</div>
      <h2 className="font-display text-2xl font-bold text-white">Coming Soon</h2>
      <p className="mt-3 max-w-md text-sm leading-7 text-muted">{description}</p>
      <div className="mt-6 flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-2 text-xs font-semibold text-violet-300">
        <span className="h-2 w-2 animate-pulse rounded-full bg-violet-400" />
        {title} In Development
      </div>
    </div>
  );
}