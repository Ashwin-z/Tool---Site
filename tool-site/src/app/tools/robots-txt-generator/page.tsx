import type { Metadata } from "next";
import Link from "next/link";
import RobotsTxtGeneratorTool from "@/components/robots-txt-generator-tool";

export const metadata: Metadata = {
  title: "Robots.txt Generator — Free Robots File Builder",
  description:
    "Free Robots.txt Generator tool. Create a valid robots.txt file with user-agent rules, allow and disallow paths, crawl delay, host, and sitemap settings.",
};

export default function RobotsTxtGeneratorPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-12">
      <Link href="/" className="mb-5 inline-block text-sm text-muted transition hover:text-foreground">
        ← Back to home
      </Link>

      <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-white md:text-5xl">
        Robots.txt Generator
      </h1>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
        Generate a clean robots.txt file for your website in seconds. Add user-agent rules,
        allow and disallow paths, crawl delay, host, and sitemap settings, then copy or
        download a ready-to-use robots.txt file.
      </p>

      <div className="mt-8">
        <RobotsTxtGeneratorTool />
      </div>
    </main>
  );
}