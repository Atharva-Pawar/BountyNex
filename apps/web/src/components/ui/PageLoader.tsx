export function PageLoader({ label = "Loading workspace" }: { label?: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-bg animate-fade-in">
      <div className="flex flex-col items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-sm border border-graphite bg-surface shadow-[0_0_0_1px_rgba(0,0,0,0.05)]">
          <BugMark />
        </span>
        <p className="text-[15px] font-medium tracking-tight text-paper">BountyNex</p>
      </div>
      <div className="relative h-px w-40 overflow-hidden rounded-full bg-graphite">
        <div className="absolute inset-y-0 w-1/3 animate-[loader-slide_1.1s_ease-in-out_infinite] bg-acid-lime motion-reduce:animate-none" />
      </div>
      <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-ash">{label}&hellip;</p>
    </div>
  );
}

function BugMark() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5 text-acid-lime"
      aria-hidden="true"
    >
      <path d="M8 2l1.88 1.88" />
      <path d="M14.12 3.88L16 2" />
      <path d="M9 7.13v-1a3.003 3.003 0 1 1 6 0v1" />
      <path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6" />
      <path d="M12 20v-9" />
      <path d="M6.53 9C4.6 8.8 3 7.1 3 5" />
      <path d="M6 13H2" />
      <path d="M3 21c0-2.1 1.7-3.9 3.8-4" />
      <path d="M20.97 5c0 2.1-1.6 3.8-3.5 4" />
      <path d="M22 13h-4" />
      <path d="M17.2 17c2.1.1 3.8 1.9 3.8 4" />
    </svg>
  );
}