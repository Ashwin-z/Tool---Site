"use client";

import WordCounterTool from "@/components/word-counter-tool";

export default function Home() {
  return (
    <div className="noise">
      <main className="mx-auto max-w-6xl px-6 pb-16 pt-14">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#6c63ff]/30 bg-[#6c63ff]/12 px-3 py-1 text-xs text-[#b6b2ff]">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#6c63ff]" />
          100% Free · No signup · No watermark · No limits
        </div>

        <h1 className="font-display max-w-4xl text-4xl font-bold leading-[1.08] tracking-[-0.02em] md:text-6xl">
          Every online tool you <br />
          need, <span className="bg-gradient-to-r from-[#7c6fff] via-[#ff6584] to-[#ffa640] bg-clip-text text-transparent">all in one place.</span>
        </h1>

        <p className="mt-4 max-w-xl text-base leading-8 text-[#9b9bb3]">
          Free tools for writers, developers, designers & students. No installs, no sign-up.
        </p>

        <div className="mt-8">
          <WordCounterTool />
        </div>
      </main>
    </div>
  );
}
